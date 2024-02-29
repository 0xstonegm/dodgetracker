import Leaderboard from "@/src/components/Leaderboard";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function page({
    params,
    searchParams,
}: {
    params: {
        region: string;
    };
    searchParams: {
        page?: string;
    };
}) {
    const userRegion = (function () {
        if (!supportedUserRegions.has(params.region)) {
            // TODO: show error message instead ?
            notFound();
        }
        return params.region;
    })();
    const pageNumber = parseInt(searchParams.page ?? "1", 10);

    return (
        <section className="p-2">
            <p className="flex items-center justify-center text-sm md:text-base">
                Leaderboard of the players with the most dodges in{" "}
                {userRegion.toUpperCase()}:
            </p>
            <Suspense
                fallback={
                    <div className="flex h-[75vh] items-center justify-center">
                        <div className="size-16">
                            <LoadingSpinner />
                        </div>
                    </div>
                }
            >
                <div className="mx-auto lg:w-5/6">
                    <Leaderboard
                        userRegion={userRegion}
                        pageNumber={pageNumber}
                    />
                </div>
            </Suspense>
        </section>
    );
}
