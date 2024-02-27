import { Regions } from "twisted/dist/constants";
import {
    LeagueItemDTOWithRegionAndTier,
    constructSummonerAndRegionKey,
} from "./players";
import { PoolConnection } from "mysql2/promise";
import logger from "./logger";

export interface Dodge {
    summonerId: string;
    lp_before: number;
    lp_after: number;
    region: Regions;
    rankTier: string;
    atWins: number;
    atLosses: number;
}

const DECAY_LP_LOSS = 75;

export async function getDodges(
    oldPlayersData: Map<
        string,
        {
            lp: number;
            wins: number;
            losses: number;
        }
    >,
    newPlayersData: LeagueItemDTOWithRegionAndTier[],
): Promise<Dodge[]> {
    logger.info("Getting dodges...");
    let dodges: Dodge[] = [];
    let notFound = 0;
    newPlayersData.forEach((newData) => {
        const oldData = oldPlayersData.get(
            constructSummonerAndRegionKey(newData.summonerId, newData.region),
        );
        if (oldData) {
            const newGamesPlayed = newData.wins + newData.losses;
            const oldGamesPlayed = oldData.wins + oldData.losses;
            if (
                newData.leaguePoints < oldData.lp &&
                newGamesPlayed == oldGamesPlayed &&
                oldData.lp - newData.leaguePoints != DECAY_LP_LOSS
            ) {
                dodges.push({
                    summonerId: newData.summonerId,
                    lp_before: oldData.lp,
                    lp_after: newData.leaguePoints,
                    region: newData.region,
                    rankTier: newData.rankTier,
                    atWins: newData.wins,
                    atLosses: newData.losses,
                });
            }
        } else {
            notFound++;
        }
    });
    logger.info(`Old data not found for ${notFound} players`);
    logger.info(`Found ${dodges.length} dodges`);
    return dodges;
}

export async function insertDodges(
    dodges: Dodge[],
    connection: PoolConnection,
): Promise<void> {
    const query = `
        INSERT INTO dodges (summoner_id, lp_before, lp_after, region, rank_tier, at_wins, at_losses)
        VALUES ?
    `;

    await connection.query(query, [
        dodges.map((dodge) => Object.values(dodge)),
    ]);
}
