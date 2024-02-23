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
                <header className="p-2 text-center text-2xl font-bold md:text-4xl">
                    Dodges
                </header>
                <RefreshButton />
            </div>
            <Suspense
                fallback={
                    <div className="flex h-[75vh] items-center justify-center">
                        <LoadingSpinner></LoadingSpinner>
                    </div>
                }
            >
                <div className="mx-auto lg:w-5/6">
                    <DodgeList
                        pageNumber={pageNumber}
                        userRegion={params.region}
                    ></DodgeList>
                </div>
            </Suspense>
        </>
    );
}
