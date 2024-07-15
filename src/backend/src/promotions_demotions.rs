use std::{collections::HashMap, time::Instant};

use anyhow::Result;
use riven::{consts::PlatformRoute, models::league_v4::LeagueItem};
use sea_orm::{
    prelude::{ChronoDateTimeUtc, DateTimeUtc},
    ActiveValue::Set,
    ColumnTrait, DatabaseTransaction, EntityTrait, QueryFilter,
};
use tracing::{info, instrument};

use crate::{
    config::INSERT_CHUNK_SIZE,
    entities::{apex_tier_players, demotions, promotions, sea_orm_active_enums::RankTier},
};

fn has_promoted(
    summoner_id: &String,
    db_players: &HashMap<String, apex_tier_players::Model>,
    demotions: &HashMap<String, Vec<ChronoDateTimeUtc>>,
) -> bool {
    match db_players.get(summoner_id) {
        None => true,
        Some(db_player) => match demotions.get(summoner_id) {
            Some(demotions) => demotions
                .iter()
                .any(|demotion| demotion > &db_player.updated_at),
            None => false,
        },
    }
}

fn has_demoted(
    player_only_in_db: &apex_tier_players::Model,
    demotions: &HashMap<String, Vec<ChronoDateTimeUtc>>,
) -> bool {
    match demotions.get(&player_only_in_db.summoner_id) {
        None => true,
        Some(demotions) => demotions
            .iter()
            .all(|demotion| demotion <= &player_only_in_db.updated_at),
    }
}

// TODO: only execute this once and pass it down
#[instrument(skip_all)]
async fn get_demotions(
    region: PlatformRoute,
    txn: &DatabaseTransaction,
) -> Result<HashMap<String, Vec<ChronoDateTimeUtc>>> {
    let t1 = Instant::now();

    info!("Getting demotions from DB...");
    let demotions: Vec<demotions::Model> = demotions::Entity::find()
        .filter(demotions::Column::Region.eq(region.to_string()))
        .all(txn)
        .await?;

    let result = demotions.into_iter().fold(
        HashMap::new(),
        |mut acc: HashMap<String, Vec<DateTimeUtc>>, demotion| {
            acc.entry(demotion.summoner_id)
                .or_default()
                .push(demotion.created_at);
            acc
        },
    );

    info!(
        perf = t1.elapsed().as_millis(),
        demotions = result.len(),
        metric = "demotion_db_query",
        "Got demotions from DB."
    );

    Ok(result)
}

#[instrument(skip_all, fields(api_players = api_players.len(), db_players = db_players.len()))]
pub async fn insert_promotions(
    api_players: &HashMap<String, (LeagueItem, RankTier)>,
    db_players: &HashMap<String, apex_tier_players::Model>,
    region: PlatformRoute,
    txn: &DatabaseTransaction,
) -> Result<()> {
    let demotions = get_demotions(region, txn).await?;

    let t1 = Instant::now();
    info!("Finding promotions...");

    let promotions_models: Vec<promotions::ActiveModel> = api_players
        .iter()
        .filter_map(|(summoner_id, (stats, _))| {
            if has_promoted(summoner_id, db_players, &demotions) {
                Some(promotions::ActiveModel {
                    summoner_id: Set(summoner_id.clone()),
                    region: Set(region.to_string()),
                    at_wins: Set(stats.wins),
                    at_losses: Set(stats.losses),
                    ..Default::default()
                })
            } else {
                None
            }
        })
        .collect();

    info!(
        perf = t1.elapsed().as_millis(),
        promotions = promotions_models.len(),
        metric = "promotion_detection",
        "Found promotions."
    );

    for chunk in promotions_models.chunks(INSERT_CHUNK_SIZE) {
        promotions::Entity::insert_many(chunk.to_vec())
            .exec(txn)
            .await?;
    }
    Ok(())
}

#[instrument(skip_all, fields(api_players = api_players.len(), db_players = db_players.len()))]
pub async fn insert_demotions(
    api_players: &HashMap<String, (LeagueItem, RankTier)>,
    db_players: &HashMap<String, apex_tier_players::Model>,
    region: PlatformRoute,
    txn: &DatabaseTransaction,
) -> Result<()> {
    let t1 = Instant::now();
    info!("Finding players not in API...");

    let players_not_in_api: HashMap<String, apex_tier_players::Model> = db_players
        .iter()
        .filter(|(summoner_id, _)| !api_players.contains_key(*summoner_id))
        .map(|(summoner_id, player)| (summoner_id.clone(), player.clone()))
        .collect();

    info!(
        perf = t1.elapsed().as_millis(),
        players = players_not_in_api.len(),
        metric = "players_not_in_api",
        "Found players not in API."
    );

    let demotions = get_demotions(region, txn).await?;
    info!("Detecting demotions...");

    let t2 = Instant::now();
    let demotion_models: Vec<demotions::ActiveModel> = players_not_in_api
        .iter()
        .filter_map(|(summoner_id, player)| {
            if has_demoted(player, &demotions) {
                Some(demotions::ActiveModel {
                    summoner_id: Set(summoner_id.clone()),
                    region: Set(region.to_string()),
                    at_wins: Set(player.wins),
                    at_losses: Set(player.losses),
                    ..Default::default()
                })
            } else {
                None
            }
        })
        .collect();

    info!(
        perf = t2.elapsed().as_millis(),
        demotions = demotion_models.len(),
        metric = "demotion_detection",
        "Detected demotions."
    );

    for chunk in demotion_models.chunks(INSERT_CHUNK_SIZE) {
        demotions::Entity::insert_many(chunk.to_vec())
            .exec(txn)
            .await?;
    }

    Ok(())
}

// ----------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use chrono::{DateTime, NaiveDate, TimeZone, Utc};
    use riven::consts::PlatformRoute;

    use crate::{
        entities::{apex_tier_players, sea_orm_active_enums::RankTier},
        promotions_demotions::{has_demoted, has_promoted},
    };

    fn str_to_utc(str: &str) -> DateTime<Utc> {
        Utc.from_utc_datetime(
            &NaiveDate::parse_from_str(str, "%Y-%m-%d")
                .expect("Failed to parse date")
                .and_hms_opt(0, 0, 0)
                .expect("Invalid time"),
        )
    }

    #[test]
    fn does_detect_promotion_new_player() {
        let db_players = HashMap::new();
        let demotions = HashMap::new();

        // This player does not exist in the DB, so it must be a new promotion

        assert!(has_promoted(&"a".to_string(), &db_players, &demotions));
    }

    #[test]
    fn does_detect_promotion_existing_player() {
        let mut db_players = HashMap::new();
        let summoner_id_a = "a".to_string();

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: None,
                region: PlatformRoute::EUW1.to_string(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: RankTier::Challenger,
                created_at: Utc::now(),
                updated_at: str_to_utc("2024-07-01"),
            },
        );

        let mut demotions = HashMap::new();
        demotions.insert(summoner_id_a.clone(), vec![str_to_utc("2024-07-02")]);

        // This player has a demotion that was later than its last update time, so it must be a new
        // promotion

        assert!(has_promoted(
            &summoner_id_a.clone(),
            &db_players,
            &demotions
        ))
    }

    #[test]
    fn does_not_detect_incorrect_promotions() {
        let mut db_players = HashMap::new();
        let summoner_id_a = "a".to_string();

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: None,
                region: PlatformRoute::EUW1.to_string(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: RankTier::Challenger,
                created_at: Utc::now(),
                updated_at: str_to_utc("2024-07-03"),
            },
        );

        let mut demotions = HashMap::new();
        demotions.insert(summoner_id_a.clone(), vec![str_to_utc("2024-07-02")]);

        // This player is updated after its last demotion, meaning that it is not a new promotion

        assert!(!has_promoted(
            &summoner_id_a.clone(),
            &db_players,
            &demotions
        ))
    }

    #[test]
    fn has_promoted_handles_multiple_demotions() {
        let mut db_players = HashMap::new();
        let summoner_id_a = "a".to_string();

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: None,
                region: PlatformRoute::EUW1.to_string(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: RankTier::Challenger,
                created_at: Utc::now(),
                updated_at: str_to_utc("2024-07-10"),
            },
        );

        let mut demotions = HashMap::new();
        demotions.insert(
            summoner_id_a.clone(),
            vec![
                str_to_utc("2024-07-05"),
                str_to_utc("2024-07-02"),
                str_to_utc("2024-07-11"),
                str_to_utc("2024-07-07"),
                str_to_utc("2024-07-20"),
            ],
        );

        // This player has a demotion after its last update time, so it is a promotion

        assert!(has_promoted(
            &summoner_id_a.clone(),
            &db_players,
            &demotions
        ))
    }

    #[test]
    fn does_detect_first_demotion() {
        let demotions = HashMap::new();

        let player = apex_tier_players::Model {
            summoner_id: "a".to_string(),
            summoner_name: None,
            region: PlatformRoute::EUW1.to_string(),
            current_lp: 100,
            wins: 10,
            losses: 5,
            rank_tier: RankTier::Challenger,
            created_at: Utc::now(),
            updated_at: str_to_utc("2024-07-10"),
        };

        // This player does not have any demotions, so it must be a new demotion, because the
        // player is only in the DB

        assert!(has_demoted(&player, &demotions));
    }

    #[test]
    fn does_detect_demotion_with_existing_demotions() {
        let mut demotions = HashMap::new();
        let summoner_id_a = "a".to_string();

        let player = apex_tier_players::Model {
            summoner_id: summoner_id_a.clone(),
            summoner_name: None,
            region: PlatformRoute::EUW1.to_string(),
            current_lp: 100,
            wins: 10,
            losses: 5,
            rank_tier: RankTier::Challenger,
            created_at: Utc::now(),
            updated_at: str_to_utc("2024-07-10"),
        };

        demotions.insert(
            summoner_id_a.clone(),
            vec![str_to_utc("2024-07-05"), str_to_utc("2024-07-02")],
        );

        // This player has no demotion after its last update time, so it is a new demotion

        assert!(has_demoted(&player, &demotions));
    }

    #[test]
    fn does_not_detect_incorrect_demotions() {
        let mut demotions = HashMap::new();
        let summoner_id_a = "a".to_string();

        let player = apex_tier_players::Model {
            summoner_id: summoner_id_a.clone(),
            summoner_name: None,
            region: PlatformRoute::EUW1.to_string(),
            current_lp: 100,
            wins: 10,
            losses: 5,
            rank_tier: RankTier::Challenger,
            created_at: Utc::now(),
            updated_at: str_to_utc("2024-07-10"),
        };

        demotions.insert(
            summoner_id_a.clone(),
            vec![str_to_utc("2024-07-05"), str_to_utc("2024-07-15")],
        );

        // This player already has a demotion after its last update time, so it is not a new demotion

        assert!(!has_demoted(&player, &demotions));
    }
}
