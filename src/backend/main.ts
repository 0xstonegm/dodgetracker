import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { type Transaction } from "types";
import { getDodges, insertDodges } from "./dodges";
import logger from "./logger";
import {
  checkAccountsAndSummonersCount,
  fetchCurrentPlayers,
  getPlayers,
  registerDemotions,
  registerPromotions,
  updateAccountsData,
  upsertPlayers,
} from "./players";
import { promiseWithTimeout } from "./util";

// Seconds to wait before timing out the database update and rolling back the transaction
// This is to prevent the algorithm from getting stuck.
const timeoutSeconds = 30;

export async function run(transaction: Transaction) {
  const { playersFromApiMap: newData, erroredRegions } =
    await getPlayers(transaction);
  const oldData = await fetchCurrentPlayers(transaction);

  logger.info(
    `Fetched ${newData.size} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.size})`,
  );

  const dodges = await getDodges(oldData, newData);

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

async function main() {
  // START TIMING
  const startTime = new Date();
  logger.info(
    "----------------------------RUNNING DATABASE UPDATE----------------------------",
  );

  logger.info("Connecting to database...");
  const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 15 * 1000,
    waitForConnections: false,
    connectionLimit: 20,
    queueLimit: 0,
  });
  const db = drizzle(connection);

  await db.transaction(async (tx): Promise<void> => {
    logger.info("Transaction started...");

    try {
      await promiseWithTimeout(run(tx), timeoutSeconds * 1000);
      logger.info("Database updated successfully, transaction commited...");
    } catch (error) {
      logger.error("Database update failed, rolling back transaction:", error);
      tx.rollback();
      logger.info("Transaction rolled back.");
    }
  });

  await db.execute(sql`FLUSH BINARY LOGS`);

  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  logger.info(`PERFORMANCE: Database update took ${timeDiff / 1000} seconds`);
  return;
}

main()
  .then(() => {
    logger.info("Database update completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Database update failed:", error);
    process.exit(1);
  });
