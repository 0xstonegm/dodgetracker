import { getRankEmblem, getSummoner, profileIconUrl } from "@/src/data";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import Image from "next/image";
import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ProfileCard from "@/src/components/ProfileCard";
import DodgeStats from "@/src/components/DodgeStats";

export default async function Summoner({
    params,
}: {
    params: {
        region: string;
        riotID: string;
    };
}) {
    const [gameName, tagLine] = (function () {
        if (params.riotID.indexOf("-") === -1) {
            return [params.riotID, ""];
        }

        const decodedString = decodeURIComponent(params.riotID);
        const lastDashIdx = decodedString.lastIndexOf("-");
        return [
            decodedString.substring(0, lastDashIdx),
            decodedString.substring(lastDashIdx + 1),
        ];
    })();

    const region = (function () {
        if (!supportedUserRegions.has(params.region)) {
            // TODO: show error message instead ?
            notFound();
        }
        return params.region;
    })();

    return (
        <main>
            <section className="flex min-h-[20vh] flex-wrap items-center justify-center border-b-4 border-zinc-900 bg-zinc-600">
                <Suspense fallback={<LoadingSpinner></LoadingSpinner>}>
                    <ProfileCard gameName={gameName} tagLine={tagLine} />
                    <DodgeStats gameName={gameName} tagLine={tagLine} />
                </Suspense>
            </section>

            <Suspense
                fallback={
                    <div className="flex h-[70vh] items-center justify-center">
                        <LoadingSpinner></LoadingSpinner>
                    </div>
                }
            >
                <div className="mx-auto lg:w-5/6">
                    <DodgeList
                        userRegion={region}
                        pageNumber={1}
                        gameName={gameName}
                        tagLine={tagLine}
                        statSiteButtons={false}
                        profileLink={false}
                    />
                </div>
            </Suspense>
        </main>
    );
}
