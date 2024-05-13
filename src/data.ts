import { apexTierPlayers, dodges, riotIds, summoners } from "@/src/db/schema";
import "dotenv/config";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { Tier } from "./types"; // Assuming Dodge is properly defined to match the query results

export function profileIconUrl(profileIconID: number): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profileIconID}.jpg`;
}

export async function getDodges(riotRegion: string) {
  return await db
    .select({
      dodgeId: dodges.dodgeId,
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      lolProsSlug: riotIds.lolprosSlug,
      profileIconId: summoners.profileIconId,
      riotRegion: dodges.region,
      rankTier: dodges.rankTier,
      lp: dodges.lpBefore,
      lpLost: sql<number>`${dodges.lpBefore} - ${dodges.lpAfter}`,
      time: dodges.createdAt,
    })
    .from(dodges)
    .innerJoin(
      summoners,
      and(
        eq(dodges.summonerId, summoners.summonerId),
        eq(dodges.region, summoners.region),
      ),
    )
    .innerJoin(riotIds, eq(summoners.puuid, riotIds.puuid))
    .where(eq(dodges.region, riotRegion))
    .orderBy(desc(dodges.createdAt))
    .limit(25000);
}

export async function getDodgesByPlayer(gameName: string, tagLine: string) {
  return await db
    .select({
      dodgeId: dodges.dodgeId,
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      lolProsSlug: riotIds.lolprosSlug,
      profileIconId: summoners.profileIconId,
      riotRegion: dodges.region,
      rankTier: dodges.rankTier,
      lp: dodges.lpBefore,
      lpLost: sql<number>`${dodges.lpBefore} - ${dodges.lpAfter}`,
      time: dodges.createdAt,
    })
    .from(dodges)
    .innerJoin(
      summoners,
      and(
        eq(dodges.summonerId, summoners.summonerId),
        eq(dodges.region, summoners.region),
      ),
    )
    .innerJoin(riotIds, eq(summoners.puuid, riotIds.puuid))
    .where(and(eq(riotIds.gameName, gameName), eq(riotIds.tagLine, tagLine)))
    .orderBy(desc(dodges.createdAt))
    .limit(25000);
}

export interface Summoner {
  gameName: string | null;
  tagLine: string | null;
  summonerLevel: number | null;
  profileIconId: number | null;
  rankTier: Tier | null;
  currentLp: number | null;
  wins: number;
  losses: number;
  lastUpdateTime: Date | null;
  isInLatestUpdate: boolean | null;
}

export async function getSummoner(gameName: string, tagLine: string) {
  return await db
    .select({
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      summonerLevel: summoners.summonerLevel,
      profileIconId: summoners.profileIconId,
      rankTier: apexTierPlayers.rankTier,
      currentLp: apexTierPlayers.currentLp,
      wins: apexTierPlayers.wins,
      losses: apexTierPlayers.losses,
      lastUpdateTime: apexTierPlayers.updatedAt,
      isInLatestUpdate: sql<boolean>`(${apexTierPlayers.updatedAt} = (SELECT MAX(${apexTierPlayers.updatedAt}) FROM ${apexTierPlayers}))`,
    })
    .from(riotIds)
    .innerJoin(summoners, eq(riotIds.puuid, summoners.puuid))
    .innerJoin(
      apexTierPlayers,
      and(
        eq(summoners.summonerId, apexTierPlayers.summonerId),
        eq(summoners.region, apexTierPlayers.region),
      ),
    )
    .where(and(eq(riotIds.gameName, gameName), eq(riotIds.tagLine, tagLine)))
    .limit(1);
}

export async function getDodgeCounts(gameName: string, tagLine: string) {
  let res = await db
    .select({
      last24Hours: sql<number>`COUNT(CASE WHEN ${dodges.createdAt} >= CURRENT_TIMESTAMP - INTERVAL 1 DAY THEN 1 END)`,
      last7Days: sql<number>`COUNT(CASE WHEN ${dodges.createdAt} >= CURRENT_TIMESTAMP - INTERVAL 7 DAY THEN 1 END)`,
      last30Days: sql<number>`COUNT(CASE WHEN ${dodges.createdAt} >= CURRENT_TIMESTAMP - INTERVAL 30 DAY THEN 1 END)`,
    })
    .from(riotIds)
    .innerJoin(summoners, eq(riotIds.puuid, summoners.puuid))
    .innerJoin(dodges, eq(summoners.summonerId, dodges.summonerId))
    .where(and(eq(riotIds.gameName, gameName), eq(riotIds.tagLine, tagLine)))
    .having(sql<number>`COUNT(${dodges.dodgeId}) > 0`);

  switch (res.length) {
    case 0:
      return null;
    case 1:
      return res[0];
    default:
      throw new Error(
        `Expected 0 or 1 dodge counts, but received ${res.length} dodge counts.`,
      );
  }
}

export async function getLeaderboard(riotRegion: string) {
  return await db
    .select({
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      riotRegion: summoners.region,
      lolProsSlug: riotIds.lolprosSlug,
      rankTier: apexTierPlayers.rankTier,
      currentLP: apexTierPlayers.currentLp,
      profileIconId: summoners.profileIconId,
      wins: apexTierPlayers.wins,
      losses: apexTierPlayers.losses,
      numberOfDodges: sql<number>`COUNT(${dodges.dodgeId})`,
      profileIconID: summoners.profileIconId,
    })
    .from(dodges)
    .innerJoin(
      summoners,
      and(
        eq(dodges.summonerId, summoners.summonerId),
        eq(dodges.region, summoners.region),
      ),
    )
    .innerJoin(riotIds, eq(summoners.puuid, riotIds.puuid))
    .innerJoin(
      apexTierPlayers,
      and(
        eq(summoners.summonerId, apexTierPlayers.summonerId),
        eq(summoners.region, apexTierPlayers.region),
      ),
    )
    .where(eq(dodges.region, riotRegion))
    .groupBy(riotIds.gameName, riotIds.tagLine)
    .orderBy(
      desc(sql<number>`COUNT(${dodges.dodgeId})`),
      asc(sql<number>`(${apexTierPlayers.wins} + ${apexTierPlayers.losses})`),
    )
    .limit(5000);
}

export async function getAccounts() {
  return await db
    .select({
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      riotRegion: summoners.region,
      lastDodgeTime: sql<Date>`(SELECT MAX(${dodges.createdAt}) FROM ${dodges} WHERE ${dodges.summonerId} = ${summoners.summonerId} AND ${dodges.region} = ${summoners.region})`,
    })
    .from(riotIds)
    .innerJoin(summoners, eq(riotIds.puuid, summoners.puuid));
}

export function getRankEmblem(rankTier: Tier) {
  const rankTierStr = rankTier.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${rankTierStr}.svg`;
}
