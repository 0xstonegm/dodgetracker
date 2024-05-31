"use client";
import withNoSSR from "@/src/components/higherOrder/withNoSSR";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type DodgeCountsChartProps = {
  data: { period: string; dodges: number }[];
};

function DodgeCountsChart({ data }: DodgeCountsChartProps) {
  /* eslint-disable */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="custom-tooltip rounded-md bg-zinc-800 p-4">
          <p className="label text-sm font-semibold">{`${payload[0].value} dodges`}</p>
          <p className="desc text-sm">{`in the last ${label.toLowerCase()}`}</p>
        </div>
      );
    }

    return null;
  };
  /* eslint-enable */

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart margin={{ top: -20 }} data={data}>
        <XAxis stroke="#27272A" dataKey="period" tick={{ fill: "#D4D4D8" }} />
        <Tooltip
          allowEscapeViewBox={{
            x: false,
            y: true,
          }}
          cursor={{ fillOpacity: 0 }}
          content={<CustomTooltip />}
        />
        <Bar animationDuration={500} dataKey="dodges" fill="#27272A">
          <LabelList
            dataKey="dodges"
            stroke="#D4D4D8"
            fontWeight="lighter"
            fontSize="1rem"
            position={"center"}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default withNoSSR(DodgeCountsChart);
