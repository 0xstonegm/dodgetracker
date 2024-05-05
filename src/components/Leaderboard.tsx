import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeaderboard, getRankEmblem, profileIconUrl } from "../data";
import { riotRegionToUserRegion, userRegionToRiotRegion } from "../regions";
import { getDeeplolUrl, getOpggUrl } from "../statSites";
import { Button } from "./Button";
import PaginationControls from "./PaginationControls";

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
            <p className="flex w-8 items-center justify-center pr-3 font-bold md:text-lg">
              {(pageNumber - 1) * entriesPerPage + index + 1}.
            </p>
            <div className="flex flex-grow flex-col">
              <div className="grid grid-cols-[2.5fr,0.7fr,0.7fr] gap-2">
                <section className="flex flex-wrap items-center md:text-xl">
                  <Link
                    href={`/${riotRegionToUserRegion(entry.riotRegion)}/${entry.gameName}-${entry.tagLine}`}
                  >
                    <div className="mr-2 flex items-center justify-center sm:justify-start">
                      <div className="relative size-10 self-center md:size-12">
                        <Image
                          alt="Profile Icon"
                          src={profileIconUrl(entry.profileIconID)}
                          fill
                          objectFit="contain"
                          quality={100}
                          unoptimized // save vercel bandwidth
                        ></Image>
                      </div>
                      <div className="break-all pl-2 font-bold underline-offset-4 hover:underline">
                        {entry.gameName}#{entry.tagLine}
                      </div>
                    </div>
                  </Link>
                  <div className="hidden md:flex md:items-center md:justify-center">
                    {entry.lolprosSlug && (
                      <div className="mr-1">
                        <Link
                          href={`https://lolpros.gg/player/${entry.lolprosSlug}`}
                          target="_blank"
                          rel="noopener noreferrer" // It's a good practice to include this when using target="_blank"
                        >
                          <button className="rounded-md bg-yellow-800 p-1 align-middle text-xs font-medium text-zinc-200 shadow-sm shadow-zinc-800 hover:bg-yellow-700">
                            LOLPROS.GG
                          </button>
                        </Link>
                      </div>
                    )}
                    <div>
                      <a
                        href={getOpggUrl(
                          entry.riotRegion,
                          entry.gameName,
                          entry.tagLine,
                        )}
                        target="_blank"
                        rel="noopener noreferrer" // It's a good practice to include this when using target="_blank"
                      >
                        <Button className="text-xs text-zinc-400">OP.GG</Button>
                      </a>
                    </div>
                    <div className="pl-1">
                      <a
                        href={getDeeplolUrl(
                          entry.riotRegion,
                          entry.gameName,
                          entry.tagLine,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="text-xs text-zinc-400">
                          DEEPLOL.GG
                        </Button>
                      </a>
                    </div>
                  </div>
                </section>
                <div className="flex flex-col items-center justify-center md:flex-row md:justify-start">
                  <div className="relative mr-1 size-7 md:size-10">
                    <Image
                      src={getRankEmblem(entry.rankTier)}
                      alt={entry.rankTier}
                      fill
                      objectFit="contain"
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
              <div className="flex items-center justify-center md:hidden">
                {entry.lolprosSlug && (
                  <div className="mr-1">
                    <Link
                      href={`https://lolpros.gg/player/${entry.lolprosSlug}`}
                      target="_blank"
                      rel="noopener noreferrer" // It's a good practice to include this when using target="_blank"
                    >
                      <button className="rounded-md bg-yellow-800 p-1 align-middle text-xs font-medium text-zinc-200 shadow-sm shadow-zinc-800 hover:bg-yellow-700">
                        LOLPROS.GG
                      </button>
                    </Link>
                  </div>
                )}
                <div className="mr-1">
                  <a
                    href={getOpggUrl(
                      entry.riotRegion,
                      entry.gameName,
                      entry.tagLine,
                    )}
                    target="_blank"
                    rel="noopener noreferrer" // It's a good practice to include this when using target="_blank"
                  >
                    <Button className="text-xs text-zinc-400">OP.GG</Button>
                  </a>
                </div>
                <div className="mr-1">
                  <a
                    href={getDeeplolUrl(
                      entry.riotRegion,
                      entry.gameName,
                      entry.tagLine,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="text-xs text-zinc-400">
                      DEEPLOL.GG
                    </Button>
                  </a>
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
