use core::error;
use std::time::{Duration, Instant};

use anyhow::{anyhow, Context, Result};
use futures::future::join_all;
use sea_orm::{sea_query::OnConflict, ActiveValue::Set, DatabaseTransaction, EntityTrait};
use tracing::{error, info, instrument, warn};
use urlencoding::encode;

use crate::{
    config::INSERT_CHUNK_SIZE,
    entities::{lol_pros, riot_ids, sea_orm_active_enums::PositionEnum},
    util::with_timeout,
};

#[derive(Debug)]
struct LolProsProfile {
    slug: String,
    name: String,
    country: String,
    position: PositionEnum,
}

async fn get_lolpros_slug(
    game_name: String,
    tag_line: String,
) -> Result<Option<lol_pros::ActiveModel>> {
    let query = encode(format!("{}#{}", game_name, tag_line).as_str()).to_string();
    let url = format!("https://api.lolpros.gg/es/search?query={}", query);

    let response: Vec<serde_json::Value> = reqwest::get(&url)
        .await
        .context("Failed to fetch data from API")?
        .json()
        .await
        .context("Failed to parse JSON response")?;

    if let Some(profile) = response.first() {
        let slug = profile
            .get("slug")
            .and_then(|v| v.as_str())
            .context("Missing slug field")?
            .to_string();

        let name = profile
            .get("name")
            .and_then(|v| v.as_str())
            .context("Missing name field")?
            .to_string();

        let country = profile
            .get("country")
            .and_then(|v| v.as_str())
            .context("Missing country field")?
            .to_string();

        let position = match profile
            .get("league_player")
            .and_then(|lp| lp.get("position"))
            .and_then(|v| v.as_str())
            .context("Missing position field")?
        {
            "10_top" => PositionEnum::Top,
            "20_jungle" => PositionEnum::Jungle,
            "30_mid" => PositionEnum::Mid,
            "40_adc" => PositionEnum::Bot,
            "50_support" => PositionEnum::Support,
            pos => {
                error!(position = pos, "Unknown position.");
                return Err(anyhow!("Unknown position for lolpros player"));
            }
        };

        Ok(Some(lol_pros::ActiveModel {
            slug: Set(slug),
            name: Set(name),
            country: Set(country),
            position: Set(position),
            updated_at: Set(chrono::Utc::now().into()),
            ..Default::default()
        }))
    } else {
        Ok(None)
    }
}

#[instrument(skip(accounts, txn), fields(accounts = accounts.len()))]
pub async fn upsert_lolpros_slugs(
    accounts: &[riot_ids::ActiveModel],
    txn: &DatabaseTransaction,
) -> Result<()> {
    let t1 = Instant::now();
    info!("Starting lolpros queries...");

    let results: Vec<_> = join_all(accounts.iter().map(|model| {
        let game_name = model.game_name.clone().unwrap();
        let tag_line = model.tag_line.clone().unwrap();
        with_timeout(
            Duration::from_secs(5),
            get_lolpros_slug(game_name, tag_line),
        )
    }))
    .await;

    info!(
        perf = t1.elapsed().as_millis(),
        queries = results.len(),
        metric = "lolpros_api_query",
        "Lolpros API queries completed."
    );

    let mut riot_ids_to_upsert = vec![];
    let mut slugs_to_upsert = vec![];

    for (model, result) in accounts.iter().zip(results) {
        match result {
            Ok(Ok(Some(profile))) => {
                riot_ids_to_upsert.push(riot_ids::ActiveModel {
                    puuid: Set(model.puuid.clone().unwrap()),
                    lolpros_slug: Set(Some(profile.slug.clone().unwrap())),
                    ..Default::default()
                });
                slugs_to_upsert.push(profile);
            }
            Ok(Err(e)) => {
                warn!(
                    game_name = model.game_name.clone().unwrap(),
                    tag_line = model.game_name.clone().unwrap(),
                    puuid = model.puuid.clone().unwrap(),
                    error = ?e,
                    "Lolpros API query failed. Ignoring.",
                );
            }
            Err(e) => {
                warn!(
                    game_name = model.game_name.clone().unwrap(),
                    tag_line = model.game_name.clone().unwrap(),
                    puuid = model.puuid.clone().unwrap(),
                    error = ?e,
                    "Lolpros API query timed out. Ignoring.",
                );
            }
            _ => {}
        }
    }

    if riot_ids_to_upsert.is_empty() && slugs_to_upsert.is_empty() {
        return Ok(());
    }

    let t2 = Instant::now();
    info!(
        slugs = riot_ids_to_upsert.len(),
        "Upserting lolpros slugs into riot_ids DB...",
    );

    for chunk in riot_ids_to_upsert.chunks(INSERT_CHUNK_SIZE) {
        riot_ids::Entity::insert_many(chunk.to_vec())
            .on_conflict(
                OnConflict::column(riot_ids::Column::Puuid)
                    .update_columns([riot_ids::Column::LolprosSlug, riot_ids::Column::UpdatedAt])
                    .to_owned(),
            )
            .exec(txn)
            .await?;
    }

    info!(
        perf = t2.elapsed().as_millis(),
        slugs = riot_ids_to_upsert.len(),
        metric = "lolpros_db_upsert",
        "Upserted lolpros slugs into DB."
    );

    let t3 = Instant::now();
    info!(
        slugs = slugs_to_upsert.len(),
        "Upserting lolpros profiles into lolpros DB...",
    );

    for chunk in slugs_to_upsert.chunks(INSERT_CHUNK_SIZE) {
        lol_pros::Entity::insert_many(chunk.to_vec())
            .on_conflict(
                OnConflict::column(lol_pros::Column::Slug)
                    .update_columns([
                        lol_pros::Column::Name,
                        lol_pros::Column::Country,
                        lol_pros::Column::Position,
                        lol_pros::Column::UpdatedAt,
                    ])
                    .to_owned(),
            )
            .exec(txn)
            .await?;
    }

    info!(
        perf = t3.elapsed().as_millis(),
        slugs = slugs_to_upsert.len(),
        metric = "lolpros_profiles_db_upsert",
        "Upserted lolpros profiles into DB."
    );

    Ok(())
}
