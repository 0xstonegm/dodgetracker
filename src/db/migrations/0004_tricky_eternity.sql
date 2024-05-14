CREATE TABLE `player_counts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(10) NOT NULL,
	`player_count` int NOT NULL,
	`rank_tier` enum('MASTER','GRANDMASTER','CHALLENGER') NOT NULL,
	`at_time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_counts_player_count_id` PRIMARY KEY(`id`)
);
