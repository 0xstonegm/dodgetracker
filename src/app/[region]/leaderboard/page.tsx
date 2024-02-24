import { Button } from "@/src/components/Button";
import { getLeaderboard, getRankEmblem, profileIconUrl } from "@/src/data";
import { supportedUserRegions, userRegionToRiotRegion } from "@/src/regions";
import { getDeeplolUrl, getOpggUrl } from "@/src/statSites";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Leaderboard({
    params,
}: {
    params: {
        region: string;
    };
}) {
    const region = (function () {
        if (!supportedUserRegions.has(params.region)) {
            // TODO: show error message instead ?
            notFound();
        }
        return params.region;
    })();
    const leaderboard = await getLeaderboard(userRegionToRiotRegion(region));

    return (
        <section className="p-2">
            {leaderboard?.entries.slice(0, 10).map((entry, index) => (
                <div key={index}>
                    <div className="flex border-b border-zinc-900 p-2">
                        <p className="flex items-center justify-center pr-3 text-lg font-bold">
                            {index + 1}.
                        </p>
                        <div className="flex flex-grow flex-col">
                            <div className="grid grid-cols-[2.5fr,0.7fr,0.7fr] gap-2">
                                <section className="flex flex-wrap items-center ">
                                    <Link
                                        href={`/euw/${entry.gameName}-${entry.tagLine}`}
                                    >
                                        <div className="flex items-center justify-center sm:justify-start">
                                            <div className="relative size-10 self-center md:size-12">
                                                <Image
                                                    alt="Profile Icon"
                                                    src={profileIconUrl(
                                                        entry.profileIconID,
                                                    )}
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
                                </section>
                                <div className="flex flex-col items-center justify-center">
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
                                    <p className="text-xs">
                                        {entry.currentLP} LP
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <p>{entry.numberOfDodges}</p>
                                    <p className="text-xs">dodges</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center pt-1">
                                <div className="pl-2">
                                    <a
                                        href={getOpggUrl(
                                            entry.riotRegion,
                                            entry.gameName,
                                            entry.tagLine,
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
                                            entry.riotRegion,
                                            entry.gameName,
                                            entry.tagLine,
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
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
