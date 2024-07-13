ALTER TABLE `riot_ids` ADD `lower_game_name` varbinary(255) GENERATED ALWAYS AS (LOWER(`riot_ids`.`game_name`)) STORED;--> statement-breakpoint
ALTER TABLE `riot_ids` ADD `lower_tag_line` varbinary(255) GENERATED ALWAYS AS (LOWER(`riot_ids`.`tag_line`)) STORED;--> statement-breakpoint
CREATE INDEX `lower_game_name_tag_line` ON `riot_ids` (`lower_game_name`,`lower_tag_line`);