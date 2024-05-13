ALTER TABLE `apex_tier_players` MODIFY COLUMN `rank_tier` enum('MASTER','GRANDMASTER','CHALLENGER') NOT NULL;--> statement-breakpoint
ALTER TABLE `apex_tier_players` MODIFY COLUMN `current_lp` int NOT NULL;--> statement-breakpoint
ALTER TABLE `apex_tier_players` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `apex_tier_players` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `demotions` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `demotions` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `dodges` MODIFY COLUMN `lp_before` int NOT NULL;--> statement-breakpoint
ALTER TABLE `dodges` MODIFY COLUMN `lp_after` int NOT NULL;--> statement-breakpoint
ALTER TABLE `dodges` MODIFY COLUMN `rank_tier` enum('MASTER','GRANDMASTER','CHALLENGER') NOT NULL;--> statement-breakpoint
ALTER TABLE `dodges` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `dodges` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `promotions` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `promotions` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `riot_ids` MODIFY COLUMN `game_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `riot_ids` MODIFY COLUMN `tag_line` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `riot_ids` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `riot_ids` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `summoners` MODIFY COLUMN `summoner_level` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `summoners` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `summoners` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;