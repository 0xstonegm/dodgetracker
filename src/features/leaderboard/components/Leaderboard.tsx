import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import PaginationControls from "../../../components/PaginationControls";
import RankInfo from "../../../components/RankInfo";
import { getLeaderboard } from "../../../data";
import { type Tier } from "../../../lib/types";
import { cn } from "../../../lib/utils";
import { userRegionToRiotRegion } from "../../../regions";
import { isCurrentSeason } from "../../../seasons";
import { StatSite } from "../../../statSites";
import SmallProfileCard from "../../player/components/SmallProfileCard";
import StatSiteButton from "../../player/components/StatSiteButton";

const pageSize = 50;
const maxPages = 100;

const getCachedLeaderboard = unstable_cache(getLeaderboard, ["leaderboard"], {
  revalidate: 60 * 60, // 1 hour
});

export default async function Leaderboard({
  userRegion,
  pageNumber,
  seasonValue,
}: {
  userRegion: string;
  pageNumber: number;
  seasonValue: string;
}) {
  pageNumber = (function () {
    return Math.min(Math.max(pageNumber, 1), maxPages);
  })();
  const leaderboard = await getCachedLeaderboard(
    userRegionToRiotRegion(userRegion),
    pageSize,
    pageNumber,
    seasonValue,
  );
  if (!leaderboard) {
    notFound();
  }

  const currentSeason = isCurrentSeason(seasonValue);

  const totalPageCount = Math.min(
    Math.ceil(leaderboard.totalEntries / pageSize),
    maxPages,
  );

  if (leaderboard.data.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="md:text-lg">
          No data available for this region and season yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {leaderboard.data.map((entry, index) => (
        <div key={index}>
          <div className="flex border-b border-zinc-900 p-2">
            <div className="flex flex-grow flex-col">
              <div
                className={cn("grid gap-2", {
                  "grid-cols-[0.15fr,2.5fr,0.7fr,0.7fr]": currentSeason,
                  "grid-cols-[0.15fr,2.5fr,0.7fr]": !currentSeason,
                })}
              >
                <p className="flex items-center justify-center font-bold md:text-lg">
                  {(pageNumber - 1) * pageSize + index + 1}.
                </p>
                <section className="flex flex-wrap items-center md:text-xl">
                  <SmallProfileCard
                    gameName={entry.gameName}
                    tagLine={entry.tagLine}
                    profileIconId={entry.profileIconId}
                    userRegion={userRegion}
                    profileLink={true}
                  />
                  <div className="flex flex-wrap md:items-center md:justify-center">
                    {entry.lolProsSlug && (
                      <div className="mr-1">
                        <StatSiteButton
                          className="text-xs"
                          riotRegion={entry.riotRegion}
                          gameName={entry.gameName}
                          tagLine={entry.tagLine}
                          statSite={StatSite.LOLPROS}
                          lolProsSlug={entry.lolProsSlug}
                        />
                      </div>
                    )}
                    <div>
                      <StatSiteButton
                        statSite={StatSite.OPGG}
                        riotRegion={entry.riotRegion}
                        gameName={entry.gameName}
                        tagLine={entry.tagLine}
                      />
                    </div>
                    <div className="pl-1">
                      <StatSiteButton
                        statSite={StatSite.DEEPLOL}
                        riotRegion={entry.riotRegion}
                        gameName={entry.gameName}
                        tagLine={entry.tagLine}
                      />
                    </div>
                  </div>
                </section>
                {currentSeason && (
                  <RankInfo
                    rankTier={entry.rankTier as Tier}
                    lp={entry.currentLP}
                  />
                )}
                <div className="flex justify-end">
                  <div className="flex w-fit flex-col items-center justify-center">
                    <p>{entry.numberOfDodges}</p>
                    <p className="text-xs">dodges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {totalPageCount > 1 && (
        <div className="flex justify-center pt-2">
          <PaginationControls
            currentPage={pageNumber}
            hasNextPage={pageNumber < totalPageCount}
            hasPrevPage={pageNumber > 1}
            totalPageCount={totalPageCount}
          />
        </div>
      )}
    </>
  );
}
