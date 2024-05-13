import Image from "next/image";
import { notFound } from "next/navigation";
import { getLeaderboard, getRankEmblem, profileIconUrl } from "../data";
import { userRegionToRiotRegion } from "../regions";
import { StatSite } from "../statSites";
import { Tier } from "../types";
import PaginationControls from "./PaginationControls";
import ProfileLink from "./ProfileLink";
import StatSiteButton from "./StatSiteButton";

const pageSize = 50;
const maxPages = 100;

export default async function Leaderboard({
  userRegion,
  pageNumber,
}: {
  userRegion: string;
  pageNumber: number;
}) {
  // FIXME: Get length of leaderboard instead of hardcoding like this
  const totalPageCount = maxPages;
  pageNumber = (function () {
    if (isNaN(pageNumber)) {
      return 1;
    }
    return Math.min(Math.max(pageNumber, 1), totalPageCount);
  })();

  const leaderboard = await getLeaderboard(
    userRegionToRiotRegion(userRegion),
    pageSize,
    pageNumber,
  );
  if (!leaderboard) {
    notFound();
  }

  return (
    <>
      {leaderboard.map((entry, index) => (
        <div key={index}>
          <div className="flex border-b border-zinc-900 p-2">
            <div className="flex flex-grow flex-col">
              <div className="grid grid-cols-[0.15fr,2.5fr,0.7fr,0.7fr] gap-2">
                <p className="flex items-center justify-center font-bold md:text-lg">
                  {(pageNumber - 1) * pageSize + index + 1}.
                </p>
                <section className="flex flex-wrap items-center md:text-xl">
                  <ProfileLink
                    href={`/${userRegion}/${entry.gameName}-${entry.tagLine}`}
                    profileLink={true}
                  >
                    <div className="mr-2 flex items-center justify-center underline-offset-4 sm:justify-start md:hover:underline">
                      <div className="relative size-8 self-center md:size-12">
                        <Image
                          alt="Profile Icon"
                          src={profileIconUrl(entry.profileIconId)}
                          layout="fill"
                          quality={100}
                          unoptimized // save vercel bandwidth
                        ></Image>
                      </div>
                      <div className="break-all pl-2 font-bold underline-offset-4 hover:underline">
                        {entry.gameName}#{entry.tagLine}
                      </div>
                    </div>
                  </ProfileLink>
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
                      src={getRankEmblem(entry.rankTier as Tier)}
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
            hasNextPage={pageNumber < totalPageCount}
            hasPrevPage={pageNumber > 1}
            totalPageCount={totalPageCount}
          />
        </div>
      )}
    </>
  );
}
