import Leaderboard from "@/src/components/Leaderboard";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";

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
            <Leaderboard userRegion={userRegion} pageNumber={pageNumber} />
        </section>
    );
}
