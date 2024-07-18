-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "dodgetracker";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."rank_tier_enum" AS ENUM('CHALLENGER', 'GRANDMASTER', 'MASTER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."demotions" (
	"demotion_id" bigserial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(255) NOT NULL,
	"region" varchar(5) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"at_wins" bigint NOT NULL,
	"at_losses" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."promotions" (
	"promotion_id" bigserial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(255) NOT NULL,
	"region" varchar(5) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"at_wins" bigint NOT NULL,
	"at_losses" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."summoners" (
	"summoner_id" varchar(255) DEFAULT NULL::character varying,
	"region" varchar(10) NOT NULL,
	"account_id" varchar(255) DEFAULT NULL::character varying,
	"profile_icon_id" bigint NOT NULL,
	"puuid" varchar(255) PRIMARY KEY NOT NULL,
	"summoner_level" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."riot_ids" (
	"puuid" varchar(255) PRIMARY KEY NOT NULL,
	"game_name" varchar(255) DEFAULT ''::character varying NOT NULL,
	"tag_line" varchar(255) DEFAULT ''::character varying NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lolpros_slug" varchar(255) DEFAULT NULL::character varying,
	"lower_game_name" varchar(255),
	"lower_tag_line" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."dodges" (
	"dodge_id" bigserial PRIMARY KEY NOT NULL,
	"summoner_id" varchar(255) NOT NULL,
	"region" varchar(10) NOT NULL,
	"lp_before" bigint NOT NULL,
	"lp_after" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"at_wins" bigint NOT NULL,
	"at_losses" bigint NOT NULL,
	"rank_tier" "rank_tier_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."player_counts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"region" varchar(10) NOT NULL,
	"player_count" bigint NOT NULL,
	"at_time" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"rank_tier" "rank_tier_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."apex_tier_players" (
	"summoner_id" varchar(255) NOT NULL,
	"summoner_name" varchar(32) DEFAULT NULL::character varying,
	"region" varchar(5) NOT NULL,
	"current_lp" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"wins" bigint NOT NULL,
	"losses" bigint NOT NULL,
	"rank_tier" "rank_tier_enum" NOT NULL,
	CONSTRAINT "idx_18287_primary" PRIMARY KEY("summoner_id","region")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18293_summoner_id_region" ON "dodgetracker"."demotions" USING btree (summoner_id text_ops,region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18311_summoner_id_region" ON "dodgetracker"."promotions" USING btree (summoner_id text_ops,region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18325_puuid" ON "dodgetracker"."summoners" USING btree (puuid text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18325_puuid_summoner_id_region" ON "dodgetracker"."summoners" USING btree (puuid text_ops,summoner_id text_ops,region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18325_region" ON "dodgetracker"."summoners" USING btree (region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18325_summoner_id" ON "dodgetracker"."summoners" USING btree (summoner_id text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_18325_summoner_id_region" ON "dodgetracker"."summoners" USING btree (summoner_id text_ops,region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18316_puuid_game_name_tag_line" ON "dodgetracker"."riot_ids" USING btree (puuid text_ops,game_name text_ops,tag_line text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lower_game_name_tag_line" ON "dodgetracker"."riot_ids" USING btree (lower_game_name text_ops,lower_tag_line text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18299_created_at" ON "dodgetracker"."dodges" USING btree (created_at timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18299_region_created_at_dodge_id" ON "dodgetracker"."dodges" USING btree (region int8_ops,created_at timestamptz_ops,dodge_id timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18299_summoner_id" ON "dodgetracker"."dodges" USING btree (summoner_id text_ops,region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18299_summoner_id_region_created_at" ON "dodgetracker"."dodges" USING btree (summoner_id timestamptz_ops,region timestamptz_ops,created_at timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18287_region" ON "dodgetracker"."apex_tier_players" USING btree (region text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18287_summoner_id" ON "dodgetracker"."apex_tier_players" USING btree (summoner_id text_ops);
*/