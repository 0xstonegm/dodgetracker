import pool from "./db";
import { run } from "./index";
import logger from "./logger";

function timeout(ms: number) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
    );
}

async function main() {
    const connection = await pool.getConnection();

    while (true) {
        // START TIMING
        const startTime = new Date();
        logger.info(
            "----------------------------RUNNING DATABASE UPDATE----------------------------",
        );

        await connection.beginTransaction();
        logger.info("Transaction started...");

        try {
            await Promise.race([run(connection), timeout(30 * 1000)]);
            connection.commit();
            logger.info(
                "Database updated successfully, transaction committed.",
            );
        } catch (error) {
            logger.error(
                "Database update failed, transaction rolled back:",
                error,
            );
            connection.rollback();
        }

        if (global.gc) {
            logger.info("Garbage collecting");
            global.gc();
        }

        const endTime = new Date();
        const timeDiff = endTime.getTime() - startTime.getTime();
        logger.info(`PERFORMANCE: Database update took ${timeDiff} ms\n`);

        // TODO: handle SIGINT and SIGTERM
    }
}

main();
