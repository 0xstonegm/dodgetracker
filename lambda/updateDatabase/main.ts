import { run } from "./index";
import logger from "./logger";

async function main() {
    while (true) {
        // START TIMING
        const startTime = new Date();

        logger.info(
            "----------------------------RUNNING DATABASE UPDATE----------------------------",
        );
        try {
            await run();
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
