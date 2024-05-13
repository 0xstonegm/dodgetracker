"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDodges = exports.getDodges = void 0;
const schema_1 = require("../../db/schema");
const logger_1 = __importDefault(require("./logger"));
const DECAY_LP_LOSS = 75;
async function getDodges(playersFromDb, playersFromApi) {
    logger_1.default.info("Getting dodges...");
    let dodges = [];
    let notFound = 0;
    playersFromApi.forEach((newData, summonerIdAndRegionKey) => {
        const oldData = playersFromDb.get(summonerIdAndRegionKey);
        if (oldData) {
            const newGamesPlayed = newData.wins + newData.losses;
            const oldGamesPlayed = oldData.wins + oldData.losses;
            if (newData.leaguePoints < oldData.lp &&
                newGamesPlayed == oldGamesPlayed &&
                oldData.lp - newData.leaguePoints != DECAY_LP_LOSS) {
                dodges.push({
                    summonerId: newData.summonerId,
                    lpBefore: oldData.lp,
                    lpAfter: newData.leaguePoints,
                    region: newData.region,
                    rankTier: newData.rankTier,
                    atWins: newData.wins,
                    atLosses: newData.losses,
                });
            }
        }
        else {
            notFound++;
        }
    });
    logger_1.default.info(`Old data not found for ${notFound} players`);
    logger_1.default.info(`Found ${dodges.length} dodges`);
    return dodges;
}
exports.getDodges = getDodges;
async function insertDodges(dodgesToInsert, transaction) {
    await transaction.insert(schema_1.dodges).values(dodgesToInsert);
}
exports.insertDodges = insertDodges;
