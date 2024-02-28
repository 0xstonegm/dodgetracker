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
        try {
            await Promise.race([run(), timeout(30 * 1000)]);
            logger.info("Database updated successfully");
        } catch (error) {
            logger.error("Database update failed", error);
        }

        if (global.gc) {
            logger.info("Garbage collecting");
            global.gc();
        }

        const endTime = new Date();
        const timeDiff = endTime.getTime() - startTime.getTime();
        logger.info(`PERFORMANCE: Database update took ${timeDiff} ms\n`);
    }
}

main();
