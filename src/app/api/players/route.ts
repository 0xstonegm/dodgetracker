import { db } from "@/src/db";
import { apexTierPlayers, riotIds, summoners } from "@/src/db/schema";
import { and, eq, like, or } from "drizzle-orm";
import { distance } from "fastest-levenshtein";
import { type NextRequest } from "next/server";

type Player = {
  gameName: string;
  tagLine: string;
  rankTier: "MASTER" | "GRANDMASTER" | "CHALLENGER";
  lp: number;
  summonerLevel: number;
  profileIconId: number;
  lastUpdatedAt: Date;
  lolprosSlug: string | null;
};

function sortPlayers(players: Player[], query: string) {
  return players.sort((a, b) => {
    const aExactMatch = a.lolprosSlug === query;
    const bExactMatch = b.lolprosSlug === query;

    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;

    // If both or neither are exact matches, fall back to the old sorting logic
    const aTime = a.lastUpdatedAt.getTime();
    const bTime = b.lastUpdatedAt.getTime();

    // Check if the two dates are within 24 hours of each other
    const within24Hours = Math.abs(aTime - bTime) < 24 * 60 * 60 * 1000;

    if (within24Hours) {
      const aScore = distance(query, a.gameName);
      const bScore = distance(query, b.gameName);
      return aScore - bScore; // Closer matches (smaller distance) should come first
    }

    return bTime - aTime; // More recently updated entries should come first
  });
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get("search");
  const region = searchParams.get("region");

  if (!search) {
    return Response.json(
      {},
      { status: 400, statusText: "Missing query parameter `search`" },
    );
  }
  if (!region) {
    return Response.json(
      {},
      { status: 400, statusText: "Missing query parameter `region`" },
    );
  }

  const [gameName, tagLine] = search.includes("#")
    ? search.split("#")
    : [search, ""];

  const players = await db
    .select({
      gameName: riotIds.gameName,
      tagLine: riotIds.tagLine,
      rankTier: apexTierPlayers.rankTier,
      lp: apexTierPlayers.currentLp,
      summonerLevel: summoners.summonerLevel,
      profileIconId: summoners.profileIconId,
      lastUpdatedAt: apexTierPlayers.updatedAt,
      lolprosSlug: riotIds.lolprosSlug,
    })
    .from(riotIds)
    .innerJoin(summoners, eq(riotIds.puuid, summoners.puuid))
    .innerJoin(
      apexTierPlayers,
      and(
        eq(apexTierPlayers.summonerId, summoners.summonerId),
        eq(apexTierPlayers.region, region.toUpperCase()),
      ),
    )
    .where(
      or(
        and(
          eq(summoners.region, region.toUpperCase()),
          like(riotIds.gameName, gameName + "%"),
          like(riotIds.tagLine, tagLine + "%"),
        ),
        like(riotIds.lolprosSlug, gameName + "%"),
      ),
    )
    .limit(25);

  const sortedPlayers = sortPlayers(players, search);

  return Response.json({ players: sortedPlayers });
}
