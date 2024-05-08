import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeaderboard, getRankEmblem, profileIconUrl } from "../data";
import { riotRegionToUserRegion, userRegionToRiotRegion } from "../regions";
import { StatSite } from "../statSites";
import PaginationControls from "./PaginationControls";
import StatSiteButton from "./StatSiteButton";

export default async function Leaderboard({
  userRegion,
  pageNumber,
}: {
  userRegion: string;
  pageNumber: number;
}) {
  const leaderboard = await getLeaderboard(userRegionToRiotRegion(userRegion));
  if (!leaderboard) {
    notFound();
  }

  const entriesPerPage = 50;
  const totalPageCount = Math.ceil(leaderboard.entries.length / entriesPerPage);

  /* Makes sure the pageNumber variable is valid and inside of bounds */
  pageNumber = (function () {
    if (isNaN(pageNumber)) {
      return 1;
    }
    return Math.min(Math.max(pageNumber, 1), totalPageCount);
  })();

  const startEntryIdx = (Number(pageNumber) - 1) * Number(entriesPerPage);
  const endEntryIdx = startEntryIdx + Number(entriesPerPage);
  const visibleEntries = leaderboard.entries.slice(startEntryIdx, endEntryIdx);

  return (
    <>
      {visibleEntries.map((entry, index) => (
        <div key={index}>
          <div className="flex border-b border-zinc-900 p-2">
            <div className="flex flex-grow flex-col">
              <div className="grid grid-cols-[0.15fr,2.5fr,0.7fr,0.7fr] gap-2">
                <p className="flex items-center justify-center font-bold md:text-lg">
                  {(pageNumber - 1) * entriesPerPage + index + 1}.
                </p>
                <section className="flex flex-wrap items-center md:text-xl">
                  <Link
                    href={`/${riotRegionToUserRegion(entry.riotRegion)}/${entry.gameName}-${entry.tagLine}`}
                  >
                    <div className="mr-2 flex items-center justify-center sm:justify-start">
                      <div className="relative size-8 self-center md:size-12">
                        <Image
                          alt="Profile Icon"
                          src={profileIconUrl(entry.profileIconID)}
                          layout="fill"
                          quality={100}
                          unoptimized // save vercel bandwidth
                        ></Image>
                      </div>
                      <div className="break-all pl-2 font-bold underline-offset-4 hover:underline">
                        {entry.gameName}#{entry.tagLine}
                      </div>
                    </div>
                  </Link>
                  <div className="flex md:items-center md:justify-center">
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
                <div className="flex flex-col items-center justify-center md:flex-row md:justify-start">
                  <div className="relative mr-1 size-7 md:size-10">
                    <Image
                      src={getRankEmblem(entry.rankTier)}
                      alt={entry.rankTier}
                      layout="fill"
                      quality={100}
                      unoptimized // save vercel bandwidth
                    />
                  </div>
                  <p className="text-xs md:text-base">{entry.currentLP} LP</p>
                </div>
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
            hasNextPage={endEntryIdx < leaderboard.entries.length}
            hasPrevPage={startEntryIdx > 0}
            totalPageCount={totalPageCount}
          />
        </div>
      )}
    </>
  );
}
