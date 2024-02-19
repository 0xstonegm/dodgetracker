import DodgeList from "../components/DodgeList";
import RefreshButton from "../components/RefreshButton";

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
            <div className="flex items-center justify-center">
                <header className="p-4 text-center text-4xl font-bold">
                    Dodges
                </header>
                <RefreshButton />
            </div>
            <div className="mx-auto w-3/4">
                <DodgeList pageNumber={pageNumber}></DodgeList>
            </div>
        </>
    );
}
