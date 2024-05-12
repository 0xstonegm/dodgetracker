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
    rankTier: mysqlEnum("rank_tier", ["MASTER", "GRANDMASTER", "CHALLENGER"]),
    currentLp: int("current_lp"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
    wins: int("wins").notNull(),
    losses: int("losses").notNull(),
  },
  (table) => {
    return {
      apexTierPlayersSummonerIdRegion: primaryKey({
        columns: [table.summonerId, table.region],
        name: "apex_tier_players_summoner_id_region",
      }),
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
    };
  },
);

export const dodges = mysqlTable(
  "dodges",
  {
    dodgeId: int("dodge_id").autoincrement().notNull(),
    summonerId: varchar("summoner_id", { length: 255 }).notNull(),
    region: varchar("region", { length: 10 }).notNull(),
    lpBefore: int("lp_before"),
    lpAfter: int("lp_after"),
    rankTier: mysqlEnum("rank_tier", ["MASTER", "GRANDMASTER", "CHALLENGER"]),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
    atWins: int("at_wins").notNull(),
    atLosses: int("at_losses").notNull(),
  },
  (table) => {
    return {
      summonerId: index("summoner_id").on(table.summonerId, table.region),
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
    };
  },
);

export const riotIds = mysqlTable(
  "riot_ids",
  {
    puuid: varchar("puuid", { length: 255 }).notNull(),
    gameName: varchar("game_name", { length: 255 }),
    tagLine: varchar("tag_line", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
    lolprosSlug: varchar("lolpros_slug", { length: 255 }),
  },
  (table) => {
    return {
      riotIdsPuuid: primaryKey({
        columns: [table.puuid],
        name: "riot_ids_puuid",
      }),
    };
  },
);

export const summoners = mysqlTable(
  "summoners",
  {
    summonerId: varchar("summoner_id", { length: 255 }),
    region: varchar("region", { length: 10 }).notNull(),
    accountId: varchar("account_id", { length: 255 }),
    profileIconId: int("profile_icon_id"),
    puuid: varchar("puuid", { length: 255 }).notNull(),
    summonerLevel: bigint("summoner_level", { mode: "number" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => {
    return {
      summonersPuuid: primaryKey({
        columns: [table.puuid],
        name: "summoners_puuid",
      }),
      summonerId: unique("summoner_id").on(table.summonerId, table.region),
    };
  },
);
