import { getDodgeCounts } from "../data";

export default async function DodgeStats({
    gameName,
    tagLine,
}: {
    gameName: string;
    tagLine: string;
}) {
    const dodgeStats = await getDodgeCounts(gameName, tagLine);
    if (!dodgeStats) {
        return <div>No statistics found.</div>;
    }

    return (
        <div className="rounded-md border-2 border-zinc-900 p-2">
            <h2 className="font-bold md:text-xl">Dodge Statistics</h2>
            <div className="px-2 text-sm">
                <p className="flex justify-between border-b-[1px] border-zinc-900">
                    <div>Last 24h:</div>
                    <div>{dodgeStats.last24Hours}</div>
                </p>
                <p className="flex justify-between border-b-[1px] border-zinc-900">
                    <div>Last 7d:</div>
                    <div>{dodgeStats.last7Days}</div>
                </p>
                <p className="flex justify-between">
                    <div>Last 30d:</div>
                    <div>{dodgeStats.last30Days}</div>
                </p>
            </div>
        </div>
    );
}
