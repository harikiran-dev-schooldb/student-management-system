"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  date: string;
  collected: number;
};

type FinanceChartProps = {
  data: ChartData[];
};

// 1. Helper to format dates (e.g., "Jan 21")
const formatDateTick = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// 2. Helper to format currency (e.g., $1.5k) for Axis
const formatCurrencyAxis = (value: number) => {
  if (value >= 1000) return `${(value / 1000)}k`;
  return `${value}`;
};

// 3. Custom Tooltip (Premium Card Style)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-black">
        <p className="mb-1 text-xs font-medium text-gray-400">
          {new Date(label).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="flex items-center gap-1 text-lg font-bold text-gray-800 dark:text-white">
          <span className="text-indigo-500">₹</span>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function FinanceChart({ data }: FinanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {/* Premium Indigo Gradient */}
          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false} // Only horizontal lines for cleaner look
          stroke="rgba(107, 114, 128, 0.1)" // Very subtle gray
        />

        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }} // Gray-400
          tickFormatter={formatDateTick}
          tickMargin={15}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
          tickFormatter={formatCurrencyAxis}
          tickMargin={15}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} // Dotted Indigo cursor line
        />

        <Area
          type="monotone"
          dataKey="collected"
          stroke="#6366f1" // Indigo-500 (Solid Line)
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorCollected)"
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
