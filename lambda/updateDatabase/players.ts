import { Constants } from "twisted";
import { lolApi, riotApi } from "./api";
import { Regions, regionToRegionGroup } from "twisted/dist/constants/regions";
import { LeagueItemDTO } from "twisted/dist/models-dto";
import { Dodge } from "./dodges";
import { RowDataPacket, PoolConnection } from "mysql2/promise";
import logger from "./logger";

const supportedRegions = [
    Constants.Regions.EU_WEST,
    Constants.Regions.AMERICA_NORTH,
    Constants.Regions.EU_EAST,
    Constants.Regions.OCEANIA,
    Constants.Regions.KOREA,
];

export interface LeagueItemDTOWithRegionAndTier extends LeagueItemDTO {
    region: Regions;
    rankTier: string;
}

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
): string {
    return `${summonerId}-${region.toUpperCase()}`;
}

export async function fetchCurrentPlayers(connection: PoolConnection): Promise<
    Map<
        string,
        {
            lp: number;
            wins: number;
            losses: number;
        }
    >
> {
    const [rows] = await connection.execute<RowDataPacket[]>(
        "SELECT summoner_id, current_lp, wins, losses, region FROM apex_tier_players",
    );

    let currentPlayersData = new Map<
        string,
        {
            lp: number;
            wins: number;
            losses: number;
        }
    >();

    rows.forEach((row: any) => {
        const key = constructSummonerAndRegionKey(row.summoner_id, row.region);
        currentPlayersData.set(key, {
            lp: row.current_lp,
            wins: row.wins,
            losses: row.losses,
        });
    });

    return currentPlayersData;
}

export async function getPlayers(): Promise<LeagueItemDTOWithRegionAndTier[]> {
    const promises = supportedRegions.map((region) =>
        getPlayersForRegion(region),
    );

    const players = await Promise.all(promises);

    return players.flat();
}

export async function upsertPlayers(
    players: LeagueItemDTOWithRegionAndTier[],
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

    const playersToUpsert = players.map((player) => {
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
