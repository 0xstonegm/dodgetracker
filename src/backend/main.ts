import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { run } from "./index";
import logger from "./logger";

function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
  );
}

// Seconds to wait before timing out the database update and rolling back the transaction
// This is to prevent the algorithm from getting stuck.
const timeoutSeconds = 30;

async function main() {
  // START TIMING
  const startTime = new Date();
  logger.info(
    "----------------------------RUNNING DATABASE UPDATE----------------------------",
  );

  logger.info("Connecting to database...");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 15 * 1000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  const db = drizzle(connection);

  await db.transaction(async (tx): Promise<void> => {
    logger.info("Transaction started...");

    try {
      await Promise.race([run(tx), timeout(timeoutSeconds * 1000)]);
      logger.info("Database updated successfully, transaction commited...");
    } catch (error) {
      logger.error("Database update failed, rolling back transaction:", error);
      await tx.rollback();
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
