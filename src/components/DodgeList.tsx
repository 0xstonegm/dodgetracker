import Image from "next/image";
import Link from "next/link";
import {
    getDodges,
    getDodgesByPlayer,
    getRankEmblem,
    profileIconUrl,
} from "../data";
import { userRegionToRiotRegion } from "../regions";
import { getDeeplolUrl, getOpggUrl } from "../statSites";
import { Button } from "./Button";
import PaginationControls from "./PaginationControls";
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
                    <div
                        key={dodge.dodgeID}
                        className="border-b border-zinc-900 py-2"
                    >
                        <div className="grid grid-cols-[3fr,1fr,0.25fr,1.5fr] gap-1 md:gap-5">
                            <div className="md:text-xl">
                                <div className="flex flex-wrap items-center">
                                    <Link
                                        href={`/${userRegion}/${dodge.gameName}-${dodge.tagLine}`}
                                        style={{
                                            pointerEvents: profileLink
                                                ? "auto"
                                                : "none",
                                        }}
                                    >
                                        <div className="flex items-center justify-center sm:justify-start">
                                            <div className="relative size-10 self-center md:size-12">
                                                <Image
                                                    alt="Profile Icon"
                                                    src={profileIconUrl(
                                                        dodge.profileIconID,
                                                    )}
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
                                            <div className="pl-2">
                                                <a
                                                    href={getOpggUrl(
                                                        dodge.riotRegion,
                                                        dodge.gameName,
                                                        dodge.tagLine,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer" // It's a good practice to include this when using target="_blank"
                                                >
                                                    <Button className="text-xs text-zinc-400">
                                                        OP.GG
                                                    </Button>
                                                </a>
                                            </div>
                                            <div className="pl-1">
                                                <a
                                                    href={getDeeplolUrl(
                                                        dodge.riotRegion,
                                                        dodge.gameName,
                                                        dodge.tagLine,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button className="text-xs text-zinc-400">
                                                        DEEPLOL.GG
                                                    </Button>
                                                </a>
                                            </div>
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
                                {dodge.lp}LP
                            </div>
                            <div className="flex items-center justify-center text-left text-sm sm:justify-start md:text-base">
                                -{dodge.lpLost}LP
                            </div>
                            <div className="flex flex-wrap items-center justify-end text-right text-xs md:text-base">
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
