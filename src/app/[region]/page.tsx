import DodgeList from "@/src/components/DodgeList";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import RefreshButton from "@/src/components/RefreshButton";
import React, { Suspense } from "react";
import { supportedUserRegions } from "@/src/regions";
import { redirect } from "next/navigation";

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
                <header className="p-4 text-center text-4xl font-bold">
                    Dodges
                </header>
                <RefreshButton />
            </div>
            <div className="mx-auto w-3/4">
                <Suspense fallback={<LoadingSpinner />}>
                    <DodgeList
                        pageNumber={pageNumber}
                        userRegion={params.region}
                    ></DodgeList>
                </Suspense>
            </div>
        </>
    );
}
