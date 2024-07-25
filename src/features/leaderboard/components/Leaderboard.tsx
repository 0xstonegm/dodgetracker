import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import PaginationControls from "../../../components/PaginationControls";
import { getLeaderboard } from "../../../data";
import { userRegionToRiotRegion } from "../../../regions";
import { isCurrentSeason } from "../../../seasons";
import LeaderboardEntry from "./LeaderboardEntry";

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
        <LeaderboardEntry
          key={index}
          entry={entry}
          index={index}
          userRegion={userRegion}
          pageNumber={pageNumber}
          pageSize={pageSize}
          includeRankInfo={currentSeason ?? false}
        />
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
