import { getRankEmblem, getSummoner, profileIconUrl } from "@/src/data";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";
import React from "react";
import Image from "next/image";
import DodgeList from "@/src/components/DodgeList";

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

    // TODO: show more information if summoner not found
    const summoner = (await getSummoner(gameName, tagLine)) ?? notFound();

    return (
        <main>
            <section className="flex min-h-[20vh] items-center justify-center border-b-4 border-zinc-900 bg-zinc-600">
                <section>
                    <section className="flex">
                        <div className="relative size-28">
                            <Image
                                src={profileIconUrl(summoner.profileIconID)}
                                alt="Profile Icon"
                                className="rounded-md"
                                quality={100}
                                fill
                                unoptimized
                            />
                            <div className="absolute bottom-0 flex w-full translate-y-1/3 items-center justify-center">
                                <div className="rounded-xl bg-zinc-900 bg-opacity-90 p-1 px-2 text-xs ">
                                    {summoner.summonerLevel}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center pl-2">
                            <div className="text-xl font-bold">
                                {summoner.gameName}#{summoner.tagLine}
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="relative mr-2 size-12">
                                    <Image
                                        src={getRankEmblem(summoner.rankTier)}
                                        alt={summoner.rankTier}
                                        fill
                                        quality={100}
                                        unoptimized
                                    />
                                </div>
                                {summoner.currentLP}LP
                            </div>
                        </div>
                    </section>
                </section>
            </section>

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
        </main>
    );
}
