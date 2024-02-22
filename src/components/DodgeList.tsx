import React from "react";
import {
    getDodges,
    getDodgesByPlayer,
    getRankEmblem,
    profileIconUrl,
} from "../data";
import { format } from "date-fns";
import PaginationControls from "./PaginationControls";
import Image from "next/image";
import { userRegionToRiotRegion } from "../regions";
import { Button } from "./Button";
import { getDeeplolUrl, getOpggUrl } from "../statSites";
import Link from "next/link";

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
                        <div className="grid grid-cols-[3fr,1fr,0.25fr,1.5fr] gap-5">
                            <div className="text-xl font-bold">
                                <div className="flex flex-wrap items-center">
                                    <Link
                                        href={`/${userRegion}/${dodge.gameName}-${dodge.tagLine}`}
                                        style={{
                                            pointerEvents: profileLink
                                                ? "auto"
                                                : "none",
                                        }}
                                    >
                                        <div className="flex flex-wrap items-center">
                                            <div className="relative h-12 w-12">
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
                                            <div className="pl-2 underline-offset-4 hover:underline">
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
                                                    <Button
                                                        label="OP.GG"
                                                        className="text-xs text-zinc-400"
                                                    />
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
                                                    <Button
                                                        label="DEEPLOL.GG"
                                                        className="text-xs text-zinc-400"
                                                    />
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center">
                                <div className="relative mr-1 h-10 w-10">
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
                            <div className="flex items-center text-left text-xl">
                                -{dodge.lpLost}LP
                            </div>
                            <div className="flex items-center justify-end text-right text-xl">
                                {format(new Date(dodge.time), "HH:mm dd/MM")}
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
