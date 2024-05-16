CREATE INDEX `created_at` ON `dodges` (`created_at`);--> statement-breakpoint
CREATE INDEX `summoner_id_region_created_at` ON `dodges` (`summoner_id`,`region`,`created_at`);--> statement-breakpoint
CREATE INDEX `puuid_game_name_tag_line` ON `riot_ids` (`puuid`,`game_name`,`tag_line`);