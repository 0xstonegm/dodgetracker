import { Handler } from "aws-lambda";
import * as dotenv from "dotenv";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "./db";
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

async function checkAccountsAndSummonersCount(connection: PoolConnection) {
  let summonersCount = Number(
    (
      (await connection.query(
        `SELECT COUNT(*) AS count FROM summoners;`,
      )) as RowDataPacket[][]
    )[0][0].count,
  );
  let accountsCount = Number(
    (
      (await connection.query(
        `SELECT COUNT(*) AS count FROM riot_ids;`,
      )) as RowDataPacket[][]
    )[0][0].count,
  );
  if (summonersCount !== accountsCount) {
    logger.warn(
      `Summoners count (${summonersCount}) and accounts count (${accountsCount}) do not match!`,
    );
  }
}

export async function run(connection: PoolConnection) {
  let newData = await getPlayers();
  let oldData = await fetchCurrentPlayers(connection);

  logger.info(
    `Fetched ${newData.size} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.size})`,
  );

  let dodges = await getDodges(oldData, newData);

  if (dodges.length > 0) {
    await updateAccountsData(dodges, connection);
    await insertDodges(dodges, connection);
  }
  if (newData.size > 0) {
    await upsertPlayers(newData, connection);
  }

  await registerPromotions(oldData, newData, connection);
  await registerDemotions(oldData, newData, connection);

  await checkAccountsAndSummonersCount(connection);
}

export const handler: Handler = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    logger.info("Transaction started...");

    await run(connection);

    await connection.commit();
    logger.info("Database updated successfully, transaction committed.");
    connection.release();

    return {
      statusCode: 200,
      body: "Database updated successfully",
    };
  } catch (error) {
    await connection.rollback();
    logger.error("Database update failed, transaction rolled back:", error);

    return {
      statusCode: 500,
      body: "Database update failed",
    };
  }
};
