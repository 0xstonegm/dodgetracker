import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { Constants } from "twisted";
import { Regions, regionToRegionGroup } from "twisted/dist/constants/regions";
import { LeagueItemDTO } from "twisted/dist/models-dto";
import { lolApi, riotApi } from "./api";
import { Dodge } from "./dodges";
import logger from "./logger";

const supportedRegions = [
    Constants.Regions.EU_WEST,
    Constants.Regions.AMERICA_NORTH,
    Constants.Regions.EU_EAST,
    Constants.Regions.OCEANIA,
    Constants.Regions.KOREA,
];

interface LeagueItemDTOWithRegionAndTier extends LeagueItemDTO {
    region: Regions;
    rankTier: string;
}

export type SummonerIdAndRegionKey = string;

export type PlayersFromApiMap = Map<
    SummonerIdAndRegionKey,
    LeagueItemDTOWithRegionAndTier
>;

export type PlayersFromDbMap = Map<
    SummonerIdAndRegionKey,
    {
        lp: number;
        wins: number;
        losses: number;
        updatedAt: Date;
    }
>;

async function getPlayersForRegion(
    region: Regions,
): Promise<LeagueItemDTOWithRegionAndTier[]> {
    const promises = [
        lolApi.League.getMasterLeagueByQueue(
            Constants.Queues.RANKED_SOLO_5x5,
            region,
        ),
        lolApi.League.getGrandMasterLeagueByQueue(
            Constants.Queues.RANKED_SOLO_5x5,
            region,
        ),
        lolApi.League.getChallengerLeaguesByQueue(
            Constants.Queues.RANKED_SOLO_5x5,
            region,
        ),
    ];

    const [master, grandmaster, challenger] = await Promise.all(promises);

    const mapEntriesWithRegion = (
        entries: LeagueItemDTO[],
        region: Regions,
        rankTier: string,
    ): LeagueItemDTOWithRegionAndTier[] =>
        entries.map((entry) => ({
            ...entry,
            region,
            rankTier,
        }));

    // Simplify the check for responses and entries
    const entries = [master, grandmaster, challenger].reduce((acc, league) => {
        if (league.response?.entries) {
            acc.push(
                ...mapEntriesWithRegion(
                    league.response.entries,
                    region,
                    league.response.tier,
                ),
            );
        }
        return acc;
    }, [] as LeagueItemDTOWithRegionAndTier[]);

    return entries;
}

export function constructSummonerAndRegionKey(
    summonerId: string,
    region: string,
): SummonerIdAndRegionKey {
    return `${summonerId}-${region.toUpperCase()}`;
}

export async function fetchCurrentPlayers(
    connection: PoolConnection,
): Promise<PlayersFromDbMap> {
    const [rows] = await connection.execute<RowDataPacket[]>(
        "SELECT summoner_id, current_lp, wins, losses, region, updated_at FROM apex_tier_players",
    );

    let currentPlayersData = new Map<
        SummonerIdAndRegionKey,
        {
            lp: number;
            wins: number;
            losses: number;
            updatedAt: Date;
        }
    >();

    rows.forEach((row: any) => {
        const key = constructSummonerAndRegionKey(row.summoner_id, row.region);
        currentPlayersData.set(key, {
            lp: row.current_lp,
            wins: row.wins,
            losses: row.losses,
            updatedAt: row.updated_at,
        });
    });

    return currentPlayersData;
}

export async function getPlayers(): Promise<PlayersFromApiMap> {
    const promises = supportedRegions.map((region) =>
        getPlayersForRegion(region),
    );

    const players = await Promise.all(promises);

    const playersMap = new Map<
        SummonerIdAndRegionKey,
        LeagueItemDTOWithRegionAndTier
    >();

    players.forEach((regionPlayers) => {
        regionPlayers.forEach((player) => {
            playersMap.set(
                constructSummonerAndRegionKey(player.summonerId, player.region),
                player,
            );
        });
    });

    return playersMap;
}

async function getDemotions(
    connection: PoolConnection,
): Promise<Map<SummonerIdAndRegionKey, [Date]>> {
    const [rows] = await connection.execute<RowDataPacket[]>(
        "SELECT summoner_id, region, created_at FROM demotions",
    );
    const demotionsMap = new Map<string, [Date]>();
    rows.forEach((row: any) => {
        const key = constructSummonerAndRegionKey(row.summoner_id, row.region);
        if (!demotionsMap.has(key)) {
            demotionsMap.set(key, [row.created_at]);
        } else {
            demotionsMap.get(key)?.push(row.created_at);
        }
    });

    return demotionsMap;
}

export async function registerPromotions(
    playersFromDb: PlayersFromDbMap,
    playersFromApi: PlayersFromApiMap,
    connection: PoolConnection,
): Promise<void> {
    const demotionsMap = await getDemotions(connection);

    const promotedPlayers: (string | number)[][] = [];

    for (const [key, playerFromApi] of Array.from(playersFromApi.entries())) {
        const playerFromDb = playersFromDb.get(key);

        if (!playerFromDb) {
            // If player exists in the API but not in the DB then it's a promotion
            promotedPlayers.push([
                playerFromApi.summonerId,
                playerFromApi.region,
                playerFromApi.wins,
                playerFromApi.losses,
            ]);
        } else {
            // If a player exists in the DB, check if it's a promotion.
            const demotions = demotionsMap.get(key);
            if (!demotions) continue;

            for (const demotion of demotions) {
                if (demotion.getTime() > playerFromDb.updatedAt.getTime()) {
                    promotedPlayers.push([
                        playerFromApi.summonerId,
                        playerFromApi.region,
                        playerFromApi.wins,
                        playerFromApi.losses,
                    ]);
                }
            }
        }
    }

    if (promotedPlayers.length === 0) {
        logger.info("No promotions to register, skipping...");
    } else {
        logger.info(
            `Registering ${promotedPlayers.length} new players in promotions table...`,
        );
        await connection.query(
            `
                INSERT INTO promotions (summoner_id, region, at_wins, at_losses)
                VALUES ?
            `,
            [promotedPlayers],
        );
    }
}

export async function registerDemotions(
    playersFromDb: PlayersFromDbMap,
    playersFromApi: PlayersFromApiMap,
    connection: PoolConnection,
): Promise<void> {
    const playersNotInApi: Map<
        SummonerIdAndRegionKey,
        { updatedAt: Date; wins: number; losses: number }
    > = new Map();

    playersFromDb.forEach((playerFromDb, key) => {
        const playerFromApi = playersFromApi.get(key);
        if (!playerFromApi) {
            playersNotInApi.set(key, {
                updatedAt: playerFromDb.updatedAt,
                wins: playerFromDb.wins,
                losses: playerFromDb.losses,
            });
        }
    });

    const demotionsMap = await getDemotions(connection);

    const demotedPlayers = Array.from(playersNotInApi)
        .filter(([key, player]) => {
            const demotions = demotionsMap.get(key);
            if (!demotions) return true; // if there are no demotions, then the player is demoted

            for (const demotion of demotions) {
                if (demotion.getTime() > player.updatedAt.getTime()) {
                    // if there exists a demotion with a date after the last update, then a new demotion is not needed
                    return false;
                }
            }
            // if there are no demotions with a date after the last update, then the player is demoted
            return true;
        })
        .map(([key, player]) => {
            const lastDashIndex = key.lastIndexOf("-");
            const summonerId = key.slice(0, lastDashIndex);
            const region = key.slice(lastDashIndex + 1);
            return [summonerId, region, player.wins, player.losses];
        });

    if (demotedPlayers.length === 0) {
        logger.info("No demotions to register, skipping...");
    } else {
        logger.info(
            `Registering ${demotedPlayers.length} players in demotions table...`,
        );
        await connection.query(
            `
                INSERT INTO demotions (summoner_id, region, at_wins, at_losses)
                VALUES ?
            `,
            [demotedPlayers],
        );
    }
}

export async function upsertPlayers(
    players: PlayersFromApiMap,
    connection: PoolConnection,
): Promise<void> {
    const query = `
        INSERT INTO apex_tier_players (summoner_id, region, summoner_name, rank_tier, current_lp, wins, losses)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        summoner_name = VALUES(summoner_name),
        rank_tier = VALUES(rank_tier),
        current_lp = VALUES(current_lp),
        wins = VALUES(wins),
        losses = VALUES(losses),
        updated_at = NOW();
    `;

    const playersToUpsert = Array.from(players.values()).map((player) => {
        return [
            player.summonerId,
            player.region,
            player.summonerName,
            player.rankTier,
            player.leaguePoints,
            player.wins,
            player.losses,
        ];
    });

    if (playersToUpsert.length > 0) {
        await connection.query(query, [playersToUpsert]);
    } else {
        logger.info("No new players to upsert, skipping...");
    }
}

/* TODO: update account information if it is older than X days */
export async function updateAccountsData(
    dodges: Dodge[],
    connection: PoolConnection,
): Promise<void> {
    const [rows] = await connection.execute<RowDataPacket[]>(
        `
            SELECT summoner_id, region FROM summoners;
        `,
    );

    const existingSummonerIds = new Map();
    rows.forEach((row) => {
        existingSummonerIds.set(row.summoner_id, row.region);
    });

    let summonersToFetch = new Map<string, string>();
    let promises = dodges
        .filter((dodge) => {
            return existingSummonerIds.get(dodge.summonerId) != dodge.region;
        })
        .map((dodge) => {
            summonersToFetch.set(dodge.summonerId, dodge.region);
            return lolApi.Summoner.getById(dodge.summonerId, dodge.region);
        });

    logger.info(
        `${dodges.length - summonersToFetch.size}/${dodges.length} of the summoners data already in DB.`,
    );

    logger.info(
        `Fetching summoner data for ${summonersToFetch.size} summoners...`,
    );
    const summonerResults = await Promise.all(promises);

    let puuids: string[] = [];
    let summonersToInsert = summonerResults.map((result) => {
        if (result && result.response) {
            let summonerData = result.response;

            let region = summonersToFetch.get(summonerData.id)?.toUpperCase();
            if (!region) {
                throw new Error(
                    `Region not found for summoner ${summonerData.id} (should never happen)`,
                );
            }

            puuids.push(summonerData.puuid);
            return [
                summonerData.puuid,
                summonerData.id,
                region,
                summonerData.accountId,
                summonerData.profileIconId,
                summonerData.summonerLevel,
            ];
        } else {
            throw new Error("Summoner not found");
        }
    });

    if (summonersToInsert.length > 0) {
        await connection.query(
            `
            INSERT INTO summoners (puuid, summoner_id, region, account_id, profile_icon_id, summoner_level)
            VALUES ? ON DUPLICATE KEY UPDATE
            summoner_id = VALUES(summoner_id),
            region = VALUES(region),
            account_id = VALUES(account_id),
            profile_icon_id = VALUES(profile_icon_id),
            summoner_level = VALUES(summoner_level),
            updated_at = NOW();
        `,
            [summonersToInsert],
        );
    } else {
        logger.info(
            "No new summoners to insert into summoners table, skipping...",
        );
    }

    let accountInfoPromises = puuids.map((puuid) => {
        if (!puuid) throw new Error("Puuid not found");
        return riotApi.Account.getByPUUID(
            puuid,
            regionToRegionGroup(Regions.EU_WEST), // nearest region
        );
    });

    logger.info(`Fetching account data for ${puuids.length} accounts...`);
    let accountResults = await Promise.all(accountInfoPromises);

    let accountsToUpsert = accountResults.map((result) => {
        if (result && result.response) {
            let accountData = result.response;
            return [
                accountData.puuid,
                accountData.gameName,
                accountData.tagLine,
            ];
        } else {
            throw new Error("Account not found");
        }
    });

    if (accountsToUpsert.length > 0) {
        await connection.query(
            `
            INSERT INTO riot_ids (puuid, game_name, tag_line)
            VALUES ? ON DUPLICATE KEY UPDATE
            game_name = VALUES(game_name),
            tag_line = VALUES(tag_line),
            updated_at = NOW();
        `,
            [accountsToUpsert],
        );
    } else {
        logger.info(
            "No new accounts to upsert into riot_ids table, skipping...",
        );
    }
    logger.info("All summoner and account data updated.");
}
