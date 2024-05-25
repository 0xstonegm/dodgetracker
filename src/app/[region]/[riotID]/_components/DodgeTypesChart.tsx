"use client";
import withNoSSR from "@/src/components/higherOrder/withNoSSR";
import {} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = {
  "Short dodges": "#807035",
  "Long dodges": "#805055",
} as const;

interface DodgeTypesChartProps {
  data: {
    type: string;
    count: number;
  }[];
}

function DodgeTypesChart({ data }: DodgeTypesChartProps) {
  const totalDodges = data.reduce((acc, { count }) => acc + count, 0);

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#D4D4D8"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip rounded-md bg-zinc-800 p-4">
          <p className="label font-semibold">{`${payload[0].name}: ${payload[0].value}/${totalDodges}`}</p>
          <p className="desc text-sm">
            {payload[0].name === "Short dodges"
              ? "Dodges with 5 or fewer LP lost"
              : "Dodges with more than 5 LP lost"}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart margin={{ top: -20 }}>
        <Tooltip
          content={<CustomTooltip />}
          allowEscapeViewBox={{ x: false, y: true }}
        />
        <Pie
          animationDuration={500}
          data={data}
          dataKey="count"
          nameKey="type"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.type as keyof typeof COLORS]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default withNoSSR(DodgeTypesChart);
