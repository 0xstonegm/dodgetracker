import DodgeList from "@/src/components/DodgeList";
import DodgeStats from "@/src/components/DodgeStats";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import ProfileCard from "@/src/components/ProfileCard";
import { getSummoner } from "@/src/data";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MdErrorOutline } from "react-icons/md";

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

    const summoner = await getSummoner(gameName, tagLine);
    if (summoner === null) {
        return (
            <>
                <main className="flex h-[70vh] items-center justify-center text-center">
                    <div className="m-2 flex flex-col items-center justify-center rounded-lg bg-zinc-800 px-2">
                        <h1 className="flex items-center py-4 text-xl font-bold md:text-3xl">
                            <MdErrorOutline className="mr-1 size-6 md:mr-2 md:size-10" />
                            Not found in database
                        </h1>
                        <p className="px-4 md:text-xl">
                            The account{" "}
                            <b>
                                {gameName}#{tagLine}
                            </b>{" "}
                            in region <b>{region.toUpperCase()}</b> was not
                            found in the database. Make sure that:
                        </p>
                        <ul className="text-md list-inside list-decimal px-8 py-4 text-left md:text-lg">
                            <li>
                                The account has at least one dodge in master+
                                since tracking began.
                            </li>
                            <li>
                                The RiotID is spelled correctly and exists in{" "}
                                {region.toUpperCase()}.
                            </li>
                        </ul>
                    </div>
                </main>
            </>
        );
    }

    return (
        <main>
            <section className="flex min-h-[20vh] flex-wrap items-center justify-center border-b-4 border-zinc-900 bg-zinc-600">
                <Suspense
                    fallback={
                        <div className="size-16">
                            <LoadingSpinner />
                        </div>
                    }
                >
                    <div className="m-2 md:mx-14">
                        <ProfileCard summoner={summoner} />
                    </div>
                    <div className="m-2 md:mx-14">
                        <DodgeStats
                            gameName={summoner.gameName}
                            tagLine={summoner.tagLine}
                        />
                    </div>
                </Suspense>
            </section>

            <Suspense
                fallback={
                    <div className="flex h-[70vh] items-center justify-center">
                        <div className="size-16">
                            <LoadingSpinner />
                        </div>
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
