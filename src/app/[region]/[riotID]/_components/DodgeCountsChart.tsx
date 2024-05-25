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
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={data}>
        <XAxis stroke="white" dataKey="period" />
        <Tooltip
          contentStyle={{ backgroundColor: "#27272A", color: "#fff" }}
          cursor={{ fill: "#27272A", fillOpacity: 1 }}
        />
        <Bar dataKey="dodges" fill="#8884d8">
          <LabelList dataKey="dodges" stroke="black" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default withNoSSR(DodgeCountsChart);
