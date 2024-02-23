import React from "react";
import { getRankEmblem, getSummoner, profileIconUrl } from "../data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Tier } from "../types";

export default async function ProfileCard({
    gameName,
    tagLine,
}: {
    gameName: string;
    tagLine: string;
}) {
    // TODO: show more information if summoner not found
    const summoner = (await getSummoner(gameName, tagLine)) ?? notFound();

    return (
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
    );
}
