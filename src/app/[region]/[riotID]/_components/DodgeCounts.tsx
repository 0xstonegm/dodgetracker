import { getDodgeCounts } from "@/src/data";
import DodgeCountsChart from "./DodgeCountsChart";

type DodgeCountsProps = {
  gameName: string;
  tagLine: string;
};

export default async function DodgeCounts(props: DodgeCountsProps) {
  const dodgeCounts = await getDodgeCounts(props.gameName, props.tagLine);
  if (!dodgeCounts) return <div>No statistics found.</div>;

  const data = [
    {
      period: "Last 30d",
      dodges: dodgeCounts.last30Days,
    },
    {
      period: "Last 7d",
      dodges: dodgeCounts.last7Days,
    },
    {
      period: "Last 24h",
      dodges: dodgeCounts.last24Hours,
    },
  ];

  return <DodgeCountsChart data={data} />;
}
