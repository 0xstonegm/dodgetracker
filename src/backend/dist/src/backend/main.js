"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const index_1 = require("./index");
const logger_1 = __importDefault(require("./logger"));
function timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms));
}
// Seconds to wait before timing out the database update and rolling back the transaction
// This is to prevent the algorithm from getting stuck.
const timeoutSeconds = 30;
async function main() {
    // START TIMING
    const startTime = new Date();
    logger_1.default.info("----------------------------RUNNING DATABASE UPDATE----------------------------");
    logger_1.default.info("Connecting to database...");
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        connectTimeout: 15 * 1000,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    const db = (0, mysql2_1.drizzle)(connection);
    await db.transaction(async (tx) => {
        logger_1.default.info("Transaction started...");
        try {
            await Promise.race([(0, index_1.run)(tx), timeout(timeoutSeconds * 1000)]);
            logger_1.default.info("Database updated successfully, transaction commited...");
        }
        catch (error) {
            logger_1.default.error("Database update failed, rolling back transaction:", error);
            await tx.rollback();
            logger_1.default.info("Transaction rolled back.");
        }
    });
    await db.execute((0, drizzle_orm_1.sql) `FLUSH BINARY LOGS`);
    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    logger_1.default.info(`PERFORMANCE: Database update took ${timeDiff / 1000} seconds`);
    return;
}
main()
    .then(() => {
    logger_1.default.info("Database update completed successfully");
    process.exit(0);
})
    .catch((error) => {
    logger_1.default.error("Database update failed:", error);
    process.exit(1);
});
