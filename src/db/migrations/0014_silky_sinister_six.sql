DROP INDEX `summoner_id_region` ON ``.`apex_tier_players`;--> statement-breakpoint
CREATE INDEX `summoner_id` ON `apex_tier_players` (`summoner_id`);--> statement-breakpoint
CREATE INDEX `region` ON `apex_tier_players` (`region`);