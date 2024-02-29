import AutoFetchSwitch from "@/src/components/AutoFetchSwitch";
import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import RefreshButton from "@/src/components/RefreshButton";
import { supportedUserRegions } from "@/src/regions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface RegionProps {
    params: {
        region: string;
    };
    searchParams: {
        page?: string;
    };
}

export default function Region({ params, searchParams }: RegionProps) {
    const pageNumber = parseInt(searchParams.page ?? "1", 10);
    if (supportedUserRegions.has(params.region) === false) {
        redirect("/euw");
    }

    return (
        <>
            <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center">
                        <header className="m-2 text-center text-2xl font-bold md:text-4xl">
                            Dodges
                        </header>
                        <RefreshButton />
                    </div>
                    <p className="m-2 px-2 text-center">
                        The database is updated automatically every ~10 seconds.
                        Press the fetch button to fetch the latest dodges from
                        the database or enable auto-fetch to automatically fetch
                        the latest dodges every 15 seconds.
                    </p>
                    <AutoFetchSwitch />
                </div>
            </div>
            <Suspense
                fallback={
                    <div className="flex h-[75vh] items-center justify-center">
                        <div className="size-16">
                            <LoadingSpinner />
                        </div>
                    </div>
                }
            >
                <div className="mx-auto md:w-5/6 lg:w-3/4">
                    <DodgeList
                        pageNumber={pageNumber}
                        userRegion={params.region}
                    ></DodgeList>
                </div>
            </Suspense>
        </>
    );
}
