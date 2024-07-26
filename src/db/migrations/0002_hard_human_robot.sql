DO $$ BEGIN
 CREATE TYPE "dodgetracker"."position_enum" AS ENUM('TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dodgetracker"."lol_pros" (
	"slug" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(5) NOT NULL,
	"position" "dodgetracker"."position_enum" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
