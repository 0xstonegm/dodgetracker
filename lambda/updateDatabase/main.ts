import pool from "./db";
import { run } from "./index";
import logger from "./logger";

function timeout(ms: number) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
    );
}

async function main() {
    while (true) {
        // START TIMING
        const startTime = new Date();
        logger.info(
            "----------------------------RUNNING DATABASE UPDATE----------------------------",
        );

        logger.info("Getting database connection...");
        const connection = await pool.getConnection();
        logger.info("Database connection acquired.");
        await connection.beginTransaction();
        logger.info("Transaction started...");

        try {
            await Promise.race([run(connection), timeout(30 * 1000)]);
            logger.info(
                "Database updated successfully, comitting transaction...",
            );
            connection.commit();
            connection.release();
            logger.info("Transaction committed.");
        } catch (error) {
            logger.error(
                "Database update failed, rolling back transaction:",
                error,
            );
            connection.rollback();
            connection.release();
            logger.info("Transaction rolled back.");
        }

        const endTime = new Date();
        const timeDiff = endTime.getTime() - startTime.getTime();
        logger.info(`PERFORMANCE: Database update took ${timeDiff} ms\n`);
    }
}

main();
