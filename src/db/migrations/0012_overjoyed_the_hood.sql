ALTER TABLE `summoners` DROP INDEX `summoner_id`;--> statement-breakpoint
ALTER TABLE `summoners` ADD CONSTRAINT `summoner_id_region` UNIQUE(`summoner_id`,`region`);