-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `apex_tier_players` (
	`summoner_id` varchar(255) NOT NULL,
	`summoner_name` varchar(32),
	`region` varchar(5) NOT NULL,
	`rank_tier` enum('MASTER','GRANDMASTER','CHALLENGER'),
	`current_lp` int,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`wins` int NOT NULL,
	`losses` int NOT NULL,
	CONSTRAINT `apex_tier_players_summoner_id_region` PRIMARY KEY(`summoner_id`,`region`)
);
--> statement-breakpoint
CREATE TABLE `demotions` (
	`demotion_id` int AUTO_INCREMENT NOT NULL,
	`summoner_id` varchar(255) NOT NULL,
	`region` varchar(5) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`at_wins` int NOT NULL,
	`at_losses` int NOT NULL,
	CONSTRAINT `demotions_demotion_id` PRIMARY KEY(`demotion_id`)
);
--> statement-breakpoint
CREATE TABLE `dodges` (
	`dodge_id` int AUTO_INCREMENT NOT NULL,
	`summoner_id` varchar(255) NOT NULL,
	`region` varchar(10) NOT NULL,
	`lp_before` int,
	`lp_after` int,
	`rank_tier` enum('MASTER','GRANDMASTER','CHALLENGER'),
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`at_wins` int NOT NULL,
	`at_losses` int NOT NULL,
	CONSTRAINT `dodges_dodge_id` PRIMARY KEY(`dodge_id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`promotion_id` int AUTO_INCREMENT NOT NULL,
	`summoner_id` varchar(255) NOT NULL,
	`region` varchar(5) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`at_wins` int NOT NULL,
	`at_losses` int NOT NULL,
	CONSTRAINT `promotions_promotion_id` PRIMARY KEY(`promotion_id`)
);
--> statement-breakpoint
CREATE TABLE `riot_ids` (
	`puuid` varchar(255) NOT NULL,
	`game_name` varchar(255),
	`tag_line` varchar(255),
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	`lolpros_slug` varchar(255),
	CONSTRAINT `riot_ids_puuid` PRIMARY KEY(`puuid`)
);
--> statement-breakpoint
CREATE TABLE `summoners` (
	`summoner_id` varchar(255),
	`region` varchar(10) NOT NULL,
	`account_id` varchar(255),
	`profile_icon_id` int,
	`puuid` varchar(255) NOT NULL,
	`summoner_level` bigint,
	`created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `summoners_puuid` PRIMARY KEY(`puuid`),
	CONSTRAINT `summoner_id` UNIQUE(`summoner_id`,`region`)
);
--> statement-breakpoint
CREATE INDEX `summoner_id` ON `dodges` (`summoner_id`,`region`);
*/