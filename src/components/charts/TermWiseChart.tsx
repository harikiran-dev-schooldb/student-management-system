"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type TermWiseItem = {
  term: string;
  _sum: {
    amount: number | null;
    discountAmount?: number | null;
    fineAmount?: number | null;
  };
};

interface Props {
  data: TermWiseItem[];
}

export default function TermWiseChart({ data }: Props) {
  // Normalize data for chart
  const chartData = data.map((item) => {
    const collected = item._sum.amount ?? 0;
    const discount = item._sum.discountAmount ?? 0;
    const fine = item._sum.fineAmount ?? 0;

    return {
      term: item.term,
      collected,
      discount,
      fine,
      net: collected - discount + fine,
    };
  });

  return (
    <div className="w-full h-[350px] bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4 shadow">
      <h2 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
        Term-wise Fee Collection
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            dataKey="term"
            tick={{ fontSize: 12 }}
            stroke="#888"
          />

          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#888"
          />

          <Tooltip
            formatter={(value: number) => `₹ ${value.toFixed(2)}`}
          />

          {/* Collected */}
          <Bar
            dataKey="collected"
            name="Collected"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />

          {/* Discount */}
          <Bar
            dataKey="discount"
            name="Discount"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />

          {/* Fine */}
          <Bar
            dataKey="fine"
            name="Fine"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />

          {/* Net */}
          <Bar
            dataKey="net"
            name="Net"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
