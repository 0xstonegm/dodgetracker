import {
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const apexTierPlayers = mysqlTable(
  "apex_tier_players",
  {
    summonerId: varchar("summoner_id", { length: 255 }).notNull(),
    summonerName: varchar("summoner_name", { length: 32 }),
    region: varchar("region", { length: 5 }).notNull(),
    rankTier: mysqlEnum("rank_tier", [
      "MASTER",
      "GRANDMASTER",
      "CHALLENGER",
    ]).notNull(),
    currentLp: int("current_lp").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    wins: int("wins").notNull().notNull(),
    losses: int("losses").notNull().notNull(),
  },
  (table) => {
    return {
      apexTierPlayersSummonerIdRegion: primaryKey({
        columns: [table.summonerId, table.region],
        name: "apex_tier_players_summoner_id_region",
      }),
      summonweIdRegion: index("summoner_id_region").on(
        table.summonerId,
        table.region,
      ),
    };
  },
);

export const demotions = mysqlTable(
  "demotions",
  {
    demotionId: int("demotion_id").autoincrement().notNull(),
    summonerId: varchar("summoner_id", { length: 255 }).notNull(),
    region: varchar("region", { length: 5 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    atWins: int("at_wins").notNull(),
    atLosses: int("at_losses").notNull(),
  },
  (table) => {
    return {
      demotionsDemotionId: primaryKey({
        columns: [table.demotionId],
        name: "demotions_demotion_id",
      }),
      summonerIdRegion: index("summoner_id_region").on(
        table.summonerId,
        table.region,
      ),
    };
  },
);

export const dodges = mysqlTable(
  "dodges",
  {
    dodgeId: int("dodge_id").autoincrement().notNull(),
    summonerId: varchar("summoner_id", { length: 255 }).notNull(),
    region: varchar("region", { length: 10 }).notNull(),
    lpBefore: int("lp_before").notNull(),
    lpAfter: int("lp_after").notNull(),
    rankTier: mysqlEnum("rank_tier", [
      "MASTER",
      "GRANDMASTER",
      "CHALLENGER",
    ]).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    atWins: int("at_wins").notNull(),
    atLosses: int("at_losses").notNull(),
  },
  (table) => {
    return {
      summonerId: index("summoner_id").on(table.summonerId, table.region),
      createdAt: index("created_at").on(table.createdAt),
      summonerIdRegionCreatedAt: index("summoner_id_region_created_at").on(
        table.summonerId,
        table.region,
        table.createdAt,
      ),
      dodgesDodgeId: primaryKey({
        columns: [table.dodgeId],
        name: "dodges_dodge_id",
      }),
    };
  },
);

export const promotions = mysqlTable(
  "promotions",
  {
    promotionId: int("promotion_id").autoincrement().notNull(),
    summonerId: varchar("summoner_id", { length: 255 }).notNull(),
    region: varchar("region", { length: 5 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    atWins: int("at_wins").notNull(),
    atLosses: int("at_losses").notNull(),
  },
  (table) => {
    return {
      promotionsPromotionId: primaryKey({
        columns: [table.promotionId],
        name: "promotions_promotion_id",
      }),
      summonerIdRegion: index("summoner_id_region").on(
        table.summonerId,
        table.region,
      ),
    };
  },
);

export const riotIds = mysqlTable(
  "riot_ids",
  {
    puuid: varchar("puuid", { length: 255 }).notNull(),
    gameName: varchar("game_name", { length: 255 }).notNull().default(""),
    tagLine: varchar("tag_line", { length: 255 }).notNull().default(""),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
    lolprosSlug: varchar("lolpros_slug", { length: 255 }),
  },
  (table) => {
    return {
      riotIdsPuuid: primaryKey({
        columns: [table.puuid],
        name: "riot_ids_puuid",
      }),
      puuidGameNameTagLine: index("puuid_game_name_tag_line").on(
        table.puuid,
        table.gameName,
        table.tagLine,
      ),
    };
  },
);

export const summoners = mysqlTable(
  "summoners",
  {
    summonerId: varchar("summoner_id", { length: 255 }),
    region: varchar("region", { length: 10 }).notNull(),
    accountId: varchar("account_id", { length: 255 }),
    profileIconId: int("profile_icon_id").notNull(),
    puuid: varchar("puuid", { length: 255 }).notNull(),
    summonerLevel: bigint("summoner_level", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
  },
  (table) => {
    return {
      summonersPuuid: primaryKey({
        columns: [table.puuid],
        name: "summoners_puuid",
      }),
      summonerId: unique("summoner_id").on(table.summonerId, table.region),
      summonerIdRegion: index("summoner_id_region").on(
        table.summonerId,
        table.region,
      ),
      puuid: index("puuid").on(table.puuid),
    };
  },
);

export const playerCounts = mysqlTable(
  "player_counts",
  {
    playerCountId: int("id").autoincrement().notNull(),
    region: varchar("region", { length: 10 }).notNull(),
    playerCount: int("player_count").notNull(),
    rankTier: mysqlEnum("rank_tier", [
      "MASTER",
      "GRANDMASTER",
      "CHALLENGER",
    ]).notNull(),
    atTime: timestamp("at_time", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => {
    return {
      playerCountsPlayerCountId: primaryKey({
        columns: [table.playerCountId],
        name: "player_counts_player_count_id",
      }),
    };
  },
);
