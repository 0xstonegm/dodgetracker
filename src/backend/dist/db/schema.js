"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summoners = exports.riotIds = exports.promotions = exports.dodges = exports.demotions = exports.apexTierPlayers = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.apexTierPlayers = (0, mysql_core_1.mysqlTable)("apex_tier_players", {
    summonerId: (0, mysql_core_1.varchar)("summoner_id", { length: 255 }).notNull(),
    summonerName: (0, mysql_core_1.varchar)("summoner_name", { length: 32 }),
    region: (0, mysql_core_1.varchar)("region", { length: 5 }).notNull(),
    rankTier: (0, mysql_core_1.mysqlEnum)("rank_tier", [
        "MASTER",
        "GRANDMASTER",
        "CHALLENGER",
    ]).notNull(),
    currentLp: (0, mysql_core_1.int)("current_lp").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
    wins: (0, mysql_core_1.int)("wins").notNull().notNull(),
    losses: (0, mysql_core_1.int)("losses").notNull().notNull(),
}, (table) => {
    return {
        apexTierPlayersSummonerIdRegion: (0, mysql_core_1.primaryKey)({
            columns: [table.summonerId, table.region],
            name: "apex_tier_players_summoner_id_region",
        }),
    };
});
exports.demotions = (0, mysql_core_1.mysqlTable)("demotions", {
    demotionId: (0, mysql_core_1.int)("demotion_id").autoincrement().notNull(),
    summonerId: (0, mysql_core_1.varchar)("summoner_id", { length: 255 }).notNull(),
    region: (0, mysql_core_1.varchar)("region", { length: 5 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
    atWins: (0, mysql_core_1.int)("at_wins").notNull(),
    atLosses: (0, mysql_core_1.int)("at_losses").notNull(),
}, (table) => {
    return {
        demotionsDemotionId: (0, mysql_core_1.primaryKey)({
            columns: [table.demotionId],
            name: "demotions_demotion_id",
        }),
    };
});
exports.dodges = (0, mysql_core_1.mysqlTable)("dodges", {
    dodgeId: (0, mysql_core_1.int)("dodge_id").autoincrement().notNull(),
    summonerId: (0, mysql_core_1.varchar)("summoner_id", { length: 255 }).notNull(),
    region: (0, mysql_core_1.varchar)("region", { length: 10 }).notNull(),
    lpBefore: (0, mysql_core_1.int)("lp_before").notNull(),
    lpAfter: (0, mysql_core_1.int)("lp_after").notNull(),
    rankTier: (0, mysql_core_1.mysqlEnum)("rank_tier", [
        "MASTER",
        "GRANDMASTER",
        "CHALLENGER",
    ]).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
    atWins: (0, mysql_core_1.int)("at_wins").notNull(),
    atLosses: (0, mysql_core_1.int)("at_losses").notNull(),
}, (table) => {
    return {
        summonerId: (0, mysql_core_1.index)("summoner_id").on(table.summonerId, table.region),
        dodgesDodgeId: (0, mysql_core_1.primaryKey)({
            columns: [table.dodgeId],
            name: "dodges_dodge_id",
        }),
    };
});
exports.promotions = (0, mysql_core_1.mysqlTable)("promotions", {
    promotionId: (0, mysql_core_1.int)("promotion_id").autoincrement().notNull(),
    summonerId: (0, mysql_core_1.varchar)("summoner_id", { length: 255 }).notNull(),
    region: (0, mysql_core_1.varchar)("region", { length: 5 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
    atWins: (0, mysql_core_1.int)("at_wins").notNull(),
    atLosses: (0, mysql_core_1.int)("at_losses").notNull(),
}, (table) => {
    return {
        promotionsPromotionId: (0, mysql_core_1.primaryKey)({
            columns: [table.promotionId],
            name: "promotions_promotion_id",
        }),
    };
});
exports.riotIds = (0, mysql_core_1.mysqlTable)("riot_ids", {
    puuid: (0, mysql_core_1.varchar)("puuid", { length: 255 }).notNull(),
    gameName: (0, mysql_core_1.varchar)("game_name", { length: 255 }).notNull().default(""),
    tagLine: (0, mysql_core_1.varchar)("tag_line", { length: 255 }).notNull().default(""),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
    lolprosSlug: (0, mysql_core_1.varchar)("lolpros_slug", { length: 255 }),
}, (table) => {
    return {
        riotIdsPuuid: (0, mysql_core_1.primaryKey)({
            columns: [table.puuid],
            name: "riot_ids_puuid",
        }),
    };
});
exports.summoners = (0, mysql_core_1.mysqlTable)("summoners", {
    summonerId: (0, mysql_core_1.varchar)("summoner_id", { length: 255 }),
    region: (0, mysql_core_1.varchar)("region", { length: 10 }).notNull(),
    accountId: (0, mysql_core_1.varchar)("account_id", { length: 255 }),
    profileIconId: (0, mysql_core_1.int)("profile_icon_id").notNull(),
    puuid: (0, mysql_core_1.varchar)("puuid", { length: 255 }).notNull(),
    summonerLevel: (0, mysql_core_1.bigint)("summoner_level", { mode: "number" }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at", { mode: "date" })
        .defaultNow()
        .onUpdateNow()
        .notNull(),
}, (table) => {
    return {
        summonersPuuid: (0, mysql_core_1.primaryKey)({
            columns: [table.puuid],
            name: "summoners_puuid",
        }),
        summonerId: (0, mysql_core_1.unique)("summoner_id").on(table.summonerId, table.region),
    };
});
