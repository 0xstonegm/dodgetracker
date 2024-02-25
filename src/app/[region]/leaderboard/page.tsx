import Leaderboard from "@/src/Leaderboard";
import { supportedUserRegions } from "@/src/regions";
import { notFound } from "next/navigation";

export default async function page({
    params,
}: {
    params: {
        region: string;
    };
}) {
    const userRegion = (function () {
        if (!supportedUserRegions.has(params.region)) {
            // TODO: show error message instead ?
            notFound();
        }
        return params.region;
    })();

    return (
        <section className="p-2">
            <Leaderboard userRegion={userRegion} />
        </section>
    );
}
