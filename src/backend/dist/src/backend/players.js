"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountsData = exports.upsertPlayers = exports.registerDemotions = exports.registerPromotions = exports.getPlayers = exports.fetchCurrentPlayers = exports.constructSummonerAndRegionKey = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const twisted_1 = require("twisted");
const regions_1 = require("twisted/dist/constants/regions");
const schema_1 = require("../../db/schema");
const api_1 = require("./api");
const logger_1 = __importDefault(require("./logger"));
const supportedRegions = [
    twisted_1.Constants.Regions.EU_WEST,
    twisted_1.Constants.Regions.AMERICA_NORTH,
    twisted_1.Constants.Regions.EU_EAST,
    twisted_1.Constants.Regions.OCEANIA,
    twisted_1.Constants.Regions.KOREA,
];
async function getPlayersForRegion(region) {
    const promises = [
        api_1.lolApi.League.getMasterLeagueByQueue(twisted_1.Constants.Queues.RANKED_SOLO_5x5, region),
        api_1.lolApi.League.getGrandMasterLeagueByQueue(twisted_1.Constants.Queues.RANKED_SOLO_5x5, region),
        api_1.lolApi.League.getChallengerLeaguesByQueue(twisted_1.Constants.Queues.RANKED_SOLO_5x5, region),
    ];
    const [master, grandmaster, challenger] = await Promise.all(promises);
    const mapEntriesWithRegion = (entries, region, rankTier) => entries.map((entry) => ({
        ...entry,
        region,
        rankTier,
    }));
    // Simplify the check for responses and entries
    const entries = [master, grandmaster, challenger].reduce((acc, league) => {
        if (league.response?.entries) {
            acc.push(...mapEntriesWithRegion(league.response.entries, region, league.response.tier));
        }
        return acc;
    }, []);
    return entries;
}
function constructSummonerAndRegionKey(summonerId, region) {
    return `${summonerId}-${region.toUpperCase()}`;
}
exports.constructSummonerAndRegionKey = constructSummonerAndRegionKey;
async function fetchCurrentPlayers(transaction) {
    const rows = await transaction.select().from(schema_1.apexTierPlayers);
    let currentPlayersData = new Map();
    rows.forEach((row) => {
        const key = constructSummonerAndRegionKey(row.summonerId, row.region);
        currentPlayersData.set(key, {
            lp: row.currentLp,
            wins: row.wins,
            losses: row.losses,
            updatedAt: row.updatedAt,
        });
    });
    return currentPlayersData;
}
exports.fetchCurrentPlayers = fetchCurrentPlayers;
async function getPlayers() {
    const promises = supportedRegions.map((region) => getPlayersForRegion(region));
    const players = await Promise.all(promises);
    const playersMap = new Map();
    players.forEach((regionPlayers) => {
        regionPlayers.forEach((player) => {
            playersMap.set(constructSummonerAndRegionKey(player.summonerId, player.region), player);
        });
    });
    return playersMap;
}
exports.getPlayers = getPlayers;
async function getDemotions(transaction) {
    const rows = await transaction.select().from(schema_1.demotions);
    const demotionsMap = new Map();
    rows.forEach((row) => {
        const key = constructSummonerAndRegionKey(row.summonerId, row.region);
        if (!demotionsMap.has(key)) {
            demotionsMap.set(key, [row.createdAt]);
        }
        else {
            demotionsMap.get(key)?.push(row.createdAt);
        }
    });
    return demotionsMap;
}
async function registerPromotions(playersFromDb, playersFromApi, transaction) {
    const demotionsMap = await getDemotions(transaction);
    const promotedPlayers = [];
    for (const [key, playerFromApi] of Array.from(playersFromApi.entries())) {
        const playerFromDb = playersFromDb.get(key);
        if (!playerFromDb) {
            // If player exists in the API but not in the DB then it's a promotion
            promotedPlayers.push({
                summonerId: playerFromApi.summonerId,
                region: playerFromApi.region,
                atWins: playerFromApi.wins,
                atLosses: playerFromApi.losses,
            });
        }
        else {
            // If a player exists in the DB, check if it's a promotion.
            const demotions = demotionsMap.get(key);
            if (!demotions)
                continue;
            for (const demotion of demotions) {
                if (demotion.getTime() > playerFromDb.updatedAt.getTime()) {
                    promotedPlayers.push({
                        summonerId: playerFromApi.summonerId,
                        region: playerFromApi.region,
                        atWins: playerFromApi.wins,
                        atLosses: playerFromApi.losses,
                    });
                }
            }
        }
    }
    if (promotedPlayers.length === 0) {
        logger_1.default.info("No promotions to register, skipping...");
    }
    else {
        logger_1.default.info(`Registering ${promotedPlayers.length} new players in promotions table...`);
        await transaction.insert(schema_1.promotions).values(promotedPlayers);
    }
}
exports.registerPromotions = registerPromotions;
async function registerDemotions(playersFromDb, playersFromApi, transaction) {
    const playersNotInApi = new Map();
    playersFromDb.forEach((playerFromDb, key) => {
        const playerFromApi = playersFromApi.get(key);
        if (!playerFromApi) {
            playersNotInApi.set(key, {
                updatedAt: playerFromDb.updatedAt,
                wins: playerFromDb.wins,
                losses: playerFromDb.losses,
            });
        }
    });
    const demotionsMap = await getDemotions(transaction);
    const demotedPlayers = Array.from(playersNotInApi)
        .filter(([key, player]) => {
        const demotions = demotionsMap.get(key);
        if (!demotions)
            return true; // if there are no demotions, then the player is demoted
        for (const demotion of demotions) {
            if (demotion.getTime() > player.updatedAt.getTime()) {
                // if there exists a demotion with a date after the last update, then a new demotion is not needed
                return false;
            }
        }
        // if there are no demotions with a date after the last update, then the player is demoted
        return true;
    })
        .map(([key, player]) => {
        const lastDashIndex = key.lastIndexOf("-");
        const summonerId = key.slice(0, lastDashIndex);
        const region = key.slice(lastDashIndex + 1);
        return {
            summonerId,
            region,
            atWins: player.wins,
            atLosses: player.losses,
        };
    });
    if (demotedPlayers.length === 0) {
        logger_1.default.info("No demotions to register, skipping...");
    }
    else {
        logger_1.default.info(`Registering ${demotedPlayers.length} players in demotions table...`);
        await transaction.insert(schema_1.demotions).values(demotedPlayers);
    }
}
exports.registerDemotions = registerDemotions;
async function upsertPlayers(players, transaction) {
    const playersToUpsert = Array.from(players.values()).map((player) => {
        return {
            summonerId: player.summonerId,
            summonerName: player.summonerName,
            region: player.region,
            rankTier: player.rankTier,
            currentLp: player.leaguePoints,
            wins: player.wins,
            losses: player.losses,
        };
    });
    if (playersToUpsert.length > 0) {
        const chunkSize = 20000;
        for (let i = 0; i < playersToUpsert.length; i += chunkSize) {
            logger_1.default.info(`Upserting chunk ${i}...`);
            const chunk = playersToUpsert.slice(i, i + chunkSize);
            await transaction
                .insert(schema_1.apexTierPlayers)
                .values(chunk)
                .onDuplicateKeyUpdate({
                set: {
                    summonerName: (0, drizzle_orm_1.sql) `VALUES(${schema_1.apexTierPlayers.summonerName})`,
                    rankTier: (0, drizzle_orm_1.sql) `VALUES(${schema_1.apexTierPlayers.rankTier})`,
                    currentLp: (0, drizzle_orm_1.sql) `VALUES(${schema_1.apexTierPlayers.currentLp})`,
                    wins: (0, drizzle_orm_1.sql) `VALUES(${schema_1.apexTierPlayers.wins})`,
                    losses: (0, drizzle_orm_1.sql) `VALUES(${schema_1.apexTierPlayers.losses})`,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                },
            });
        }
    }
    else {
        logger_1.default.info("No new players to upsert, skipping...");
    }
}
exports.upsertPlayers = upsertPlayers;
/* TODO: update account information if it is older than X days */
async function updateAccountsData(dodges, transaction) {
    let summonersToFetch = new Map();
    let promises = dodges.map((dodge) => {
        summonersToFetch.set(dodge.summonerId, dodge.region);
        return api_1.lolApi.Summoner.getById(dodge.summonerId, dodge.region);
    });
    logger_1.default.info(`Fetching summoner data for ${summonersToFetch.size} summoners...`);
    const summonerResults = await Promise.all(promises);
    let puuidsAndRegion = [];
    let summonersToInsert = summonerResults.map((result) => {
        if (result && result.response) {
            let summonerData = result.response;
            let region = summonersToFetch.get(summonerData.id)?.toUpperCase();
            if (!region) {
                throw new Error(`Region not found for summoner ${summonerData.id} (should never happen)`);
            }
            puuidsAndRegion.push([summonerData.puuid, region]);
            return {
                puuid: summonerData.puuid,
                summonerId: summonerData.id,
                region: region,
                accountId: summonerData.accountId,
                profileIconId: summonerData.profileIconId,
                summonerLevel: summonerData.summonerLevel,
            };
        }
        else {
            throw new Error("Summoner not found");
        }
    });
    if (summonersToInsert.length > 0) {
        await transaction
            .insert(schema_1.summoners)
            .values(summonersToInsert)
            .onDuplicateKeyUpdate({
            set: {
                summonerId: (0, drizzle_orm_1.sql) `VALUES(${schema_1.summoners.summonerId})`,
                region: (0, drizzle_orm_1.sql) `VALUES(${schema_1.summoners.region})`,
                accountId: (0, drizzle_orm_1.sql) `VALUES(${schema_1.summoners.accountId})`,
                profileIconId: (0, drizzle_orm_1.sql) `VALUES(${schema_1.summoners.profileIconId})`,
                summonerLevel: (0, drizzle_orm_1.sql) `VALUES(${schema_1.summoners.summonerLevel})`,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            },
        });
    }
    else {
        logger_1.default.info("No new summoners to insert into summoners table, skipping...");
    }
    let accountInfoPromises = puuidsAndRegion.map((puuid) => {
        if (!puuid)
            throw new Error("Puuid not found");
        return api_1.riotApi.Account.getByPUUID(puuid[0], (0, regions_1.regionToRegionGroup)(regions_1.Regions.EU_WEST))
            .then((response) => {
            return response;
        })
            .catch((error) => {
            logger_1.default.error(`Error fetching account data for ${puuid[0]}: ${error}`);
            return null;
        });
    });
    logger_1.default.info(`Fetching account data for ${puuidsAndRegion.length} accounts...`);
    let accountResults = await Promise.all(accountInfoPromises);
    let accountsToUpsert = accountResults
        .filter((result) => result !== null && result.response !== null)
        .map((result) => {
        let accountData = result.response;
        return {
            puuid: accountData.puuid,
            gameName: accountData.gameName,
            tagLine: accountData.tagLine,
        };
    });
    let euwAccounts = [];
    accountsToUpsert.forEach((account, index) => {
        if (puuidsAndRegion[index][1] === regions_1.Regions.EU_WEST) {
            euwAccounts.push(account);
        }
    });
    accountsToUpsert = accountsToUpsert.filter((account) => account !== null);
    if (accountsToUpsert.length > 0) {
        await transaction
            .insert(schema_1.riotIds)
            .values(accountsToUpsert)
            .onDuplicateKeyUpdate({
            set: {
                gameName: (0, drizzle_orm_1.sql) `VALUES(${schema_1.riotIds.gameName})`,
                tagLine: (0, drizzle_orm_1.sql) `VALUES(${schema_1.riotIds.tagLine})`,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            },
        });
    }
    else {
        logger_1.default.info("No new accounts to upsert into riot_ids table, skipping...");
    }
    // TODO: break this into a separate function
    const lolprosPromises = euwAccounts.map((account) => getLolprosSlug(account.gameName, account.tagLine));
    const lolProsSlugs = await Promise.all(lolprosPromises);
    const slugsToUpsert = [];
    lolProsSlugs.forEach((slug, index) => {
        if (slug) {
            slugsToUpsert.push({
                puuid: euwAccounts[index].puuid,
                lolprosSlug: slug,
            });
        }
    });
    if (slugsToUpsert.length > 0) {
        logger_1.default.info(`There are ${slugsToUpsert.length} LolPros.gg slugs to upsert into riot_ids table:`, slugsToUpsert.map((slug) => slug.lolprosSlug).join(", "));
        await transaction
            .insert(schema_1.riotIds)
            .values(slugsToUpsert)
            .onDuplicateKeyUpdate({
            set: {
                lolprosSlug: (0, drizzle_orm_1.sql) `VALUES(${schema_1.riotIds.lolprosSlug})`,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            },
        });
        logger_1.default.info(`${slugsToUpsert.length} LolPros.gg slugs upserted into riot_ids table.`);
    }
    else {
        logger_1.default.info("No LolPros.gg slugs to upsert into riot_ids table, skipping...");
    }
    logger_1.default.info("All summoner and account data updated.");
}
exports.updateAccountsData = updateAccountsData;
async function getLolprosSlug(gameName, tagLine) {
    const url = `https://api.lolpros.gg/es/search?query=${encodeURIComponent(`${gameName}#${tagLine}`)}`;
    logger_1.default.info(`Lolpros.gg API request: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("LolPros API request failed!");
    }
    const data = await response.json();
    if (data.length === 0) {
        return null;
    }
    const slug = data[0].slug;
    if (!slug) {
        return null;
    }
    return slug;
}
