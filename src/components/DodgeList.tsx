import React from "react";
import { getDodges, profileIconUrl } from "../data";
import { format } from "date-fns";
import PaginationControls from "./PaginationControls";
import Image from "next/image";
import { riotRegionToUserRegion, userRegionToRiotRegion } from "../regions";

interface DodgeListProps {
    pageNumber: number;
    userRegion: string;
}

export default async function DodgeList({
    pageNumber,
    userRegion,
}: DodgeListProps) {
    console.log("Page number: ", pageNumber);
    const dodges = await getDodges(userRegionToRiotRegion(userRegion));

    const entriesPerPage = 50;
    const totalPageCount = Math.ceil(dodges.length / entriesPerPage);

    if (isNaN(pageNumber)) {
        pageNumber = 1;
    }
    pageNumber = Math.max(pageNumber, 1);
    pageNumber = Math.min(pageNumber, totalPageCount);

    const start = (Number(pageNumber) - 1) * Number(entriesPerPage);
    const end = start + Number(entriesPerPage);
    const entries = dodges.slice(start, end);

    return (
        <div>
            <div className="p-2">
                {entries.map((dodge, index) => (
                    <div
                        key={dodge.dodgeID}
                        className={`py-2 ${index === dodges.length - 1 ? "" : "border-b border-gray-300"}`}
                    >
                        <div className="grid grid-cols-[2fr,1fr,0.5fr,1fr]">
                            <div className="text-xl font-bold">
                                <div className="flex items-center">
                                    <Image
                                        src={profileIconUrl(
                                            dodge.profileIconID,
                                        )}
                                        width={50}
                                        height={50}
                                        alt="Profile Icon"
                                    ></Image>
                                    <div className="pl-2">
                                        {dodge.gameName}#{dodge.tagLine}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {dodge.rankTier} {dodge.lp}LP
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
