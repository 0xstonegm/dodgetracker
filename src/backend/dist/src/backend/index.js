"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.run = void 0;
const dotenv = __importStar(require("dotenv"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const dodges_1 = require("./dodges");
const logger_1 = __importDefault(require("./logger"));
const players_1 = require("./players");
dotenv.config();
async function checkAccountsAndSummonersCount(transaction) {
    let summonersResult = await transaction
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.summoners);
    let accountsResult = await transaction
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(schema_1.riotIds);
    const summonersCount = summonersResult[0].count;
    const accountsCount = accountsResult[0].count;
    if (summonersResult[0].count !== accountsResult[0].count) {
        logger_1.default.warn(`Summoners count (${summonersCount}) and accounts count (${accountsCount}) do not match!`);
    }
}
async function run(transaction) {
    let newData = await (0, players_1.getPlayers)();
    let oldData = await (0, players_1.fetchCurrentPlayers)(transaction);
    logger_1.default.info(`Fetched ${newData.size} players from API and ${oldData.size} from DB. (diff = ${oldData.size - newData.size})`);
    let dodges = await (0, dodges_1.getDodges)(oldData, newData);
    if (dodges.length > 0) {
        await (0, players_1.updateAccountsData)(dodges, transaction);
        await (0, dodges_1.insertDodges)(dodges, transaction);
    }
    if (newData.size > 0) {
        await (0, players_1.upsertPlayers)(newData, transaction);
    }
    await (0, players_1.registerPromotions)(oldData, newData, transaction);
    await (0, players_1.registerDemotions)(oldData, newData, transaction);
    await checkAccountsAndSummonersCount(transaction);
}
exports.run = run;
const handler = async () => {
    logger_1.default.info("Trying to start transaction...");
    return await db_1.db.transaction(async (tx) => {
        try {
            logger_1.default.info("Transaction started...");
            await run(tx);
            logger_1.default.info("Database updated successfully, transaction committed.");
            return {
                statusCode: 200,
                body: "Database updated successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Database update failed, transaction rolled back:", error);
            return {
                statusCode: 500,
                body: "Database update failed",
            };
        }
    });
};
exports.handler = handler;
