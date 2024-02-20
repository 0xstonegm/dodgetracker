import { Handler } from "aws-lambda";
import * as dotenv from "dotenv";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import {
    fetchCurrentPlayers,
    getPlayers as getPlayers,
    updateAccountsData,
    upsertPlayers,
} from "./players";
import { pool } from "./db";
import { getDodges, insertDodges } from "./dodges";

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
        console.warn(
            `Summoners count (${summonersCount}) and accounts count (${accountsCount}) do not match!`,
        );
    }
}

export const handler: Handler = async () => {
    let connection: PoolConnection | null = null;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let newData = await getPlayers();
        let oldData = await fetchCurrentPlayers(connection);

        console.log(
            `Fetched ${newData.length} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.length})`,
        );

        let dodges = await getDodges(oldData, newData);

        if (dodges.length > 0) {
            await updateAccountsData(dodges, connection);
            await insertDodges(dodges, connection);
        }
        if (newData.length > 0) {
            await upsertPlayers(newData, connection);
        }

        await connection.commit();
        console.log("Transaction successfully committed!");

        await checkAccountsAndSummonersCount(connection);
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Transaction failed and rolled back", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing request",
                error,
            }),
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Database updated successfully.",
        }),
    };
};
