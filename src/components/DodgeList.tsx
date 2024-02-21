import React from "react";
import { getDodges, profileIconUrl } from "../data";
import { format } from "date-fns";
import PaginationControls from "./PaginationControls";
import Image from "next/image";
import { userRegionToRiotRegion } from "../regions";
import { Button } from "./Button";
import { getDeeplolUrl, getOpggUrl } from "../statSites";

interface DodgeListProps {
    pageNumber: number;
    userRegion: string;
}

export default async function DodgeList({
    pageNumber,
    userRegion,
}: DodgeListProps) {
    const dodges = await getDodges(userRegionToRiotRegion(userRegion));

    const entriesPerPage = 50;
    const totalPageCount = Math.ceil(dodges.length / entriesPerPage);

    if (isNaN(pageNumber)) {
        // TODO: remove this?
        pageNumber = 1;
    }
    pageNumber = Math.max(pageNumber, 1);
    pageNumber = Math.min(pageNumber, totalPageCount);

    const start = (Number(pageNumber) - 1) * Number(entriesPerPage);
    const end = start + Number(entriesPerPage);
    const entries = dodges.slice(start, end);

    const getRankEmblem = (rankTier: string) => {
        rankTier = rankTier.toLowerCase();
        return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${rankTier}.svg`;
    };

    return (
        <div>
            <div className="p-2">
                {entries.map((dodge, index) => (
                    <div
                        key={dodge.dodgeID}
                        className={`py-2 ${index === dodges.length - 1 ? "" : "border-b border-gray-300"}`}
                    >
                        <div className="grid grid-cols-[3fr,1fr,0.25fr,1.5fr] gap-5">
                            <div className="text-xl font-bold">
                                <div className="flex flex-wrap items-center">
                                    <div className="relative h-12 w-12">
                                        <Image
                                            alt="Profile Icon"
                                            src={profileIconUrl(
                                                dodge.profileIconID,
                                            )}
                                            fill
                                            quality={100}
                                        ></Image>
                                    </div>
                                    <div className="pl-2">
                                        {dodge.gameName}#{dodge.tagLine}
                                    </div>
                                    <div className="pl-2">
                                        <a
                                            href={getOpggUrl(
                                                dodge.riotRegion,
                                                dodge.gameName,
                                                dodge.tagLine,
                                            )}
                                            target="_blank"
                                        >
                                            <Button
                                                label="OP.GG"
                                                className="text-xs text-zinc-400"
                                            ></Button>
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
                                        >
                                            <Button
                                                label="DEEPLOL.GG"
                                                className="text-xs text-zinc-400"
                                            ></Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center">
                                <div className="relative mr-1 h-10 w-10">
                                    <Image
                                        src={getRankEmblem(dodge.rankTier)}
                                        alt={dodge.rankTier}
                                        fill
                                        quality={100}
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
            <div className="flex justify-center">
                <PaginationControls
                    currentPage={pageNumber}
                    hasNextPage={end < dodges.length}
                    hasPrevPage={start > 0}
                    totalPageCount={totalPageCount}
                />
            </div>
        </div>
    );
}
