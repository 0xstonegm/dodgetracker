import Image from "next/image";
import Link from "next/link";
import {
  getDodges,
  getDodgesByPlayer,
  getRankEmblem,
  profileIconUrl,
} from "../data";
import { userRegionToRiotRegion } from "../regions";
import { StatSite } from "../statSites";
import PaginationControls from "./PaginationControls";
import StatSiteButton from "./StatSiteButton";
import TimeString from "./TimeString";

interface DodgeListProps {
  pageNumber: number;
  userRegion: string;
  gameName?: string;
  tagLine?: string;
  statSiteButtons?: boolean;
  profileLink?: boolean;
}

export default async function DodgeList({
  pageNumber,
  userRegion,
  gameName,
  tagLine,
  statSiteButtons = true,
  profileLink = true,
}: DodgeListProps) {
  const dodges = await (async function () {
    if (gameName === undefined || tagLine === undefined) {
      return getDodges(userRegionToRiotRegion(userRegion));
    }
    return getDodgesByPlayer(gameName, tagLine);
  })();

  const entriesPerPage = 50;
  const totalPageCount = Math.ceil(dodges.length / entriesPerPage);

  /* Makes sure the pageNumber variable is valid and inside of bounds */
  pageNumber = (function () {
    if (isNaN(pageNumber)) {
      return 1;
    }
    return Math.min(Math.max(pageNumber, 1), totalPageCount);
  })();

  const startEntryIdx = (Number(pageNumber) - 1) * Number(entriesPerPage);
  const endEntryIdx = startEntryIdx + Number(entriesPerPage);
  const visibleDodgeEntries = dodges.slice(startEntryIdx, endEntryIdx);

  return (
    <div>
      <div className="p-2">
        {visibleDodgeEntries.map((dodge, _) => (
          <div key={dodge.dodgeID} className="border-b border-zinc-900 py-2">
            <div className="grid grid-cols-[3fr,1.2fr,0.9fr,0.8fr] gap-1 md:grid-cols-[2fr,0.8fr,0.3fr,0.6fr] md:gap-2">
              <div className="md:text-xl">
                <div className="flex flex-wrap items-center">
                  <Link
                    href={`/${userRegion}/${dodge.gameName}-${dodge.tagLine}`}
                    style={{
                      pointerEvents: profileLink ? "auto" : "none",
                    }}
                  >
                    <div className="mr-2 flex items-center justify-center sm:justify-start">
                      <div className="relative size-10 self-center md:size-12">
                        <Image
                          alt="Profile Icon"
                          src={profileIconUrl(dodge.profileIconID)}
                          fill
                          quality={100}
                          unoptimized // save vercel bandwidth
                        ></Image>
                      </div>
                      <div className="break-all pl-2 font-bold underline-offset-4 hover:underline">
                        {dodge.gameName}#{dodge.tagLine}
                      </div>
                    </div>
                  </Link>
                  {statSiteButtons && (
                    <>
                      {dodge.lolProsSlug && (
                        <div className="mr-1">
                          <StatSiteButton
                            riotRegion={dodge.riotRegion}
                            gameName={dodge.gameName}
                            tagLine={dodge.tagLine}
                            statSite={StatSite.LOLPROS}
                            lolProsSlug={dodge.lolProsSlug}
                          />
                        </div>
                      )}
                      <div className="mr-1">
                        <StatSiteButton
                          riotRegion={dodge.riotRegion}
                          gameName={dodge.gameName}
                          tagLine={dodge.tagLine}
                          statSite={StatSite.OPGG}
                        />
                      </div>
                      <StatSiteButton
                        riotRegion={dodge.riotRegion}
                        gameName={dodge.gameName}
                        tagLine={dodge.tagLine}
                        statSite={StatSite.DEEPLOL}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center text-sm sm:justify-start md:text-base">
                <div className="relative mr-1 size-7 md:size-10">
                  <Image
                    src={getRankEmblem(dodge.rankTier)}
                    alt={dodge.rankTier}
                    fill
                    quality={100}
                    unoptimized // save vercel bandwidth
                  />
                </div>
                {dodge.lp} LP
              </div>
              <div className="flex items-center justify-center text-left text-sm sm:justify-start md:text-base">
                -{dodge.lpLost} LP
              </div>
              <div className="flex flex-wrap items-center justify-end text-right text-xs md:text-sm">
                <TimeString utcTime={dodge.time} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPageCount > 1 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={pageNumber}
            hasNextPage={endEntryIdx < dodges.length}
            hasPrevPage={startEntryIdx > 0}
            totalPageCount={totalPageCount}
          />
        </div>
      )}
    </div>
  );
}
