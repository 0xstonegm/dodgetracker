import { Handler } from "aws-lambda";
import * as dotenv from "dotenv";
import { PoolConnection } from "mysql2/promise";
import {
    fetchCurrentPlayers,
    getPlayers as getPlayers,
    updateAccountsData,
    upsertPlayers,
} from "./players";
import { pool } from "./db";
import { getDodges, insertDodges } from "./dodges";

dotenv.config();

export const handler: Handler = async () => {
    let connection: PoolConnection | null = null;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let newData = await getPlayers();
        let oldData = await fetchCurrentPlayers();

        console.log(
            `Fetched ${newData.length} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.length})`,
        );

        let dodges = await getDodges(oldData, newData);

        if (dodges.length > 0) {
            await updateAccountsData(dodges);
            await insertDodges(dodges);
        }
        if (newData.length > 0) {
            await upsertPlayers(newData);
            console.log(`Upserted ${newData.length} players`);
        }

        await connection.commit();
        console.log("Transaction successfully committed");
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
            await connection.release();
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Database updated successfully.",
        }),
    };
};
