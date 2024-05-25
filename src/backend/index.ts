import { Handler } from "aws-lambda";
import * as dotenv from "dotenv";
import { ExtractTablesWithRelations, count } from "drizzle-orm";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import {
  MySql2PreparedQueryHKT,
  MySql2QueryResultHKT,
} from "drizzle-orm/mysql2";
import { db } from "../db";
import { riotIds, summoners } from "../db/schema";
import { getDodges, insertDodges } from "./dodges";
import logger from "./logger";
import {
  fetchCurrentPlayers,
  getPlayers,
  registerDemotions,
  registerPromotions,
  updateAccountsData,
  upsertPlayers,
} from "./players";

dotenv.config();

async function checkAccountsAndSummonersCount(
  transaction: MySqlTransaction<
    MySql2QueryResultHKT,
    MySql2PreparedQueryHKT,
    Record<string, unknown>,
    ExtractTablesWithRelations<Record<string, unknown>>
  >,
) {
  let summonersResult = await transaction
    .select({ count: count() })
    .from(summoners);

  let accountsResult = await transaction
    .select({ count: count() })
    .from(riotIds);

  const summonersCount = summonersResult[0].count;
  const accountsCount = accountsResult[0].count;

  if (summonersResult[0].count !== accountsResult[0].count) {
    logger.warn(
      `Summoners count (${summonersCount}) and accounts count (${accountsCount}) do not match!`,
    );
  }
}

export async function run(
  transaction: MySqlTransaction<
    MySql2QueryResultHKT,
    MySql2PreparedQueryHKT,
    Record<string, unknown>,
    ExtractTablesWithRelations<Record<string, unknown>>
  >,
) {
  let { playersFromApiMap: newData, erroredRegions } =
    await getPlayers(transaction);
  let oldData = await fetchCurrentPlayers(transaction);

  logger.info(
    `Fetched ${newData.size} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.size})`,
  );

  let dodges = await getDodges(oldData, newData);

  if (dodges.length > 0) {
    await updateAccountsData(dodges, transaction);
    await insertDodges(dodges, transaction);
  }
  if (newData.size > 0) {
    await upsertPlayers(newData, transaction);
  }

  await registerPromotions(oldData, newData, transaction);
  await registerDemotions(oldData, newData, erroredRegions, transaction);

  await checkAccountsAndSummonersCount(transaction);
}

export const handler: Handler = async () => {
  logger.info("Trying to start transaction...");

  return await db.transaction(async (tx) => {
    try {
      logger.info("Transaction started...");

      await run(tx);

      logger.info("Database updated successfully, transaction committed.");

      return {
        statusCode: 200,
        body: "Database updated successfully",
      };
    } catch (error) {
      logger.error("Database update failed, transaction rolled back:", error);

      return {
        statusCode: 500,
        body: "Database update failed",
      };
    }
  });
};
