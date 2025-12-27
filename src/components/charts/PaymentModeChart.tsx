"use client";

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

interface Props {
  data: {
    paymentMode: string;
    _sum: { amount: number };
  }[];
}

export default function PaymentModeChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.paymentMode,
    value: d._sum.amount ?? 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
