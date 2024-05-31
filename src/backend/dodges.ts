import { type ExtractTablesWithRelations } from "drizzle-orm";
import { type MySqlTransaction } from "drizzle-orm/mysql-core";
import {
  type MySql2PreparedQueryHKT,
  type MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import { type Regions } from "twisted/dist/constants";
import { dodges } from "../db/schema";
import logger from "./logger";
import { type PlayersFromApiMap, type PlayersFromDbMap } from "./players";
import { type Tier } from "./types";

export interface Dodge {
  summonerId: string;
  lpBefore: number;
  lpAfter: number;
  region: Regions;
  rankTier: Tier;
  atWins: number;
  atLosses: number;
}

const DECAY_LP_LOSS = 75;

export async function getDodges(
  playersFromDb: PlayersFromDbMap,
  playersFromApi: PlayersFromApiMap,
): Promise<Dodge[]> {
  logger.info("Getting dodges...");
  const dodges: Dodge[] = [];
  let notFound = 0;
  playersFromApi.forEach((newData, summonerIdAndRegionKey) => {
    const oldData = playersFromDb.get(summonerIdAndRegionKey);
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
          lpBefore: oldData.lp,
          lpAfter: newData.leaguePoints,
          region: newData.region,
          rankTier: newData.rankTier as Tier,
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
  dodgesToInsert: Dodge[],
  transaction: MySqlTransaction<
    MySql2QueryResultHKT,
    MySql2PreparedQueryHKT,
    Record<string, unknown>,
    ExtractTablesWithRelations<Record<string, unknown>>
  >,
): Promise<void> {
  await transaction.insert(dodges).values(dodgesToInsert);
}
