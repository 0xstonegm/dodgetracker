import React from "react";
import { getAllDodges } from "../data";
import { format } from "date-fns";

export default async function DodgeList() {
    const dodges = await getAllDodges();

    return (
        <div>
            <div className="p-2">
                {dodges.map((dodge, index) => (
                    <div
                        key={dodge.dodgeId}
                        className={`py-2 ${index === dodges.length - 1 ? "" : "border-b border-gray-300"}`}
                    >
                        <div className="grid grid-cols-4">
                            <div className="text-2xl font-bold">
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
        </div>
    );
}
