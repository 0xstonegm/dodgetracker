import React from "react";
import { getDodges } from "../data";
import { format } from "date-fns";
import PaginationControls from "./PaginationControls";

interface DodgeListProps {
    pageNumber: number;
}

export default async function DodgeList({ pageNumber }: DodgeListProps) {
    const dodges = await getDodges();

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
                        key={dodge.dodgeId}
                        className={`py-2 ${index === dodges.length - 1 ? "" : "border-b border-gray-300"}`}
                    >
                        <div className="grid grid-cols-4">
                            <div className="text-xl font-bold">
                                {dodge.summonerName}
                            </div>
                            <div>
                                {dodge.rankTier} {dodge.lpBeforeDodge}LP
                            </div>
                            <div className="text-right text-xl">
                                -{dodge.lpLost}LP
                            </div>
                            <div className="text-right text-xl">
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
