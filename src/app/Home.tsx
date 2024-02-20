import { Suspense } from "react";
import DodgeList from "../components/DodgeList";
import RefreshButton from "../components/RefreshButton";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const page = Array.isArray(searchParams["page"])
        ? searchParams["page"][0]
        : searchParams["page"];
    const pageNumber = parseInt(page ?? "1", 10);

    return (
        <>
            <header className="p-4 text-center text-4xl font-bold">
                Dodges
            </header>
            <RefreshButton />
            <div className="mx-auto w-3/4">
                <Suspense
                    fallback={
                        <div>
                            <LoadingSpinner />
                        </div>
                    }
                >
                    <DodgeList pageNumber={pageNumber}></DodgeList>
                </Suspense>
            </div>
        </>
    );
}
