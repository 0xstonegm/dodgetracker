use std::{collections::HashMap, time::Instant};

use anyhow::Result;
use riven::models::league_v4::LeagueItem;
use sea_orm::{ActiveValue, DatabaseTransaction, EntityTrait};
use tracing::info;
use tracing::instrument;

use crate::entities::{apex_tier_players, dodges, sea_orm_active_enums::RankTier};

const DECAY_LP_LOSS: i32 = 75;

#[instrument(skip_all, fields(db_players = db_players.len(), api_players = api_players.len()))]
pub async fn find_dodges(
    db_players: &HashMap<String, apex_tier_players::Model>,
    api_players: &HashMap<String, (LeagueItem, RankTier)>,
) -> Vec<dodges::ActiveModel> {
    let t1 = Instant::now();

    info!("Finding dodges...");

    let dodges: Vec<dodges::ActiveModel> = api_players
        .values()
        .filter_map(|(new_data, _)| {
            db_players.get(&new_data.summoner_id).and_then(|old_data| {
                let old_games_played = old_data.wins + old_data.losses;
                let new_games_played = new_data.wins + new_data.losses;

                if new_data.league_points < old_data.current_lp
                    && new_games_played == old_games_played
                    && old_data.current_lp - new_data.league_points != DECAY_LP_LOSS
                {
                    Some(dodges::ActiveModel {
                        summoner_id: ActiveValue::Set(old_data.summoner_id.clone()),
                        region: ActiveValue::Set(old_data.region.clone()),
                        lp_before: ActiveValue::Set(old_data.current_lp),
                        lp_after: ActiveValue::Set(new_data.league_points),
                        rank_tier: ActiveValue::Set(old_data.rank_tier.clone()),
                        at_wins: ActiveValue::Set(old_data.wins),
                        at_losses: ActiveValue::Set(old_data.losses),
                        ..Default::default()
                    })
                } else {
                    None
                }
            })
        })
        .collect();

    info!(
        perf = t1.elapsed().as_millis(),
        dodges = dodges.len(),
        metric = "dodge_detection",
        "Found dodges."
    );

    dodges
}

#[instrument(skip_all, fields(dodges = dodges.len()))]
pub async fn insert_dodges(
    dodges: &[dodges::ActiveModel],
    txn: &DatabaseTransaction,
) -> Result<()> {
    if dodges.is_empty() {
        return Ok(());
    }

    let t1 = Instant::now();
    info!("Inserting dodges...");

    dodges::Entity::insert_many(dodges.to_owned())
        .exec(txn)
        .await?;

    info!(
        perf = t1.elapsed().as_millis(),
        dodges = dodges.len(),
        metric = "dodges_inserted",
        "Inserted dodges into DB."
    );

    Ok(())
}

// ----------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use chrono::Utc;
    use riven::{consts::Division, models::league_v4::LeagueItem};

    use super::*;
    use crate::entities::{apex_tier_players, sea_orm_active_enums::RankTier};

    #[tokio::test]
    async fn can_find_dodge() {
        let mut db_players = HashMap::new();
        let mut api_players = HashMap::new();

        let summoner_id_a = "summoner1".to_string();
        let region = "EUW1".to_string();
        let rank_tier = RankTier::Challenger;

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: Some("summoner1".to_string()),
                region: region.clone(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: rank_tier.clone(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        );

        api_players.insert(
            summoner_id_a.clone(),
            (
                LeagueItem {
                    summoner_id: summoner_id_a.clone(),
                    league_points: 95,
                    wins: 10,
                    losses: 5,
                    fresh_blood: false,
                    mini_series: None,
                    inactive: false,
                    veteran: false,
                    hot_streak: false,
                    rank: Division::I,
                },
                rank_tier.clone(),
            ),
        );

        let dodges = find_dodges(&db_players, &api_players).await;
        assert_eq!(dodges.len(), 1);
        let dodge = &dodges[0];
        assert_eq!(dodge.summoner_id.as_ref(), &summoner_id_a);
    }

    #[tokio::test]
    async fn discards_decay() {
        let mut db_players = HashMap::new();
        let mut api_players = HashMap::new();

        let summoner_id_a = "summoner1".to_string();
        let region = "EUW1".to_string();
        let rank_tier = RankTier::Challenger;

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: Some("summoner1".to_string()),
                region: region.clone(),
                current_lp: 200,
                wins: 10,
                losses: 5,
                rank_tier: rank_tier.clone(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        );

        api_players.insert(
            summoner_id_a.clone(),
            (
                LeagueItem {
                    summoner_id: summoner_id_a.clone(),
                    league_points: 50,
                    wins: 10,
                    losses: 5,
                    fresh_blood: false,
                    mini_series: None,
                    inactive: false,
                    veteran: false,
                    hot_streak: false,
                    rank: Division::I,
                },
                rank_tier.clone(),
            ),
        );

        let dodges = find_dodges(&db_players, &api_players).await;
        assert_eq!(dodges.len(), 0);
    }

    #[tokio::test]
    async fn higher_lp() {
        let mut db_players = HashMap::new();
        let mut api_players = HashMap::new();

        let summoner_id_a = "summoner1".to_string();
        let region = "EUW1".to_string();
        let rank_tier = RankTier::Challenger;

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: Some("summoner1".to_string()),
                region: region.clone(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: rank_tier.clone(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        );

        api_players.insert(
            summoner_id_a.clone(),
            (
                LeagueItem {
                    summoner_id: summoner_id_a.clone(),
                    league_points: 105,
                    wins: 10,
                    losses: 5,
                    fresh_blood: false,
                    mini_series: None,
                    inactive: false,
                    veteran: false,
                    hot_streak: false,
                    rank: Division::I,
                },
                rank_tier.clone(),
            ),
        );

        let dodges = find_dodges(&db_players, &api_players).await;
        assert_eq!(dodges.len(), 0);
    }

    #[tokio::test]
    async fn handles_different_games_played() {
        let mut db_players = HashMap::new();
        let mut api_players = HashMap::new();

        let summoner_id_a = "summoner1".to_string();
        let region = "EUW1".to_string();
        let rank_tier = RankTier::Challenger;

        db_players.insert(
            summoner_id_a.clone(),
            apex_tier_players::Model {
                summoner_id: summoner_id_a.clone(),
                summoner_name: Some("summoner1".to_string()),
                region: region.clone(),
                current_lp: 100,
                wins: 10,
                losses: 5,
                rank_tier: rank_tier.clone(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
        );

        api_players.insert(
            summoner_id_a.clone(),
            (
                LeagueItem {
                    summoner_id: summoner_id_a.clone(),
                    league_points: 95,
                    wins: 11,
                    losses: 5,
                    fresh_blood: false,
                    mini_series: None,
                    inactive: false,
                    veteran: false,
                    hot_streak: false,
                    rank: Division::I,
                },
                rank_tier.clone(),
            ),
        );

        let dodges = find_dodges(&db_players, &api_players).await;
        assert_eq!(dodges.len(), 0);
    }
}
