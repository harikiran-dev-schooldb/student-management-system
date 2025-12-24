"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartData = {
  date: string;
  collected: number;
};

type FinanceChartProps = {
  data: ChartData[];
};

const formatDateTick = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleString("en-US", { month: "short", day: "numeric" });
};

export default function FinanceChart({ data }: FinanceChartProps) {
  return (
    <div className="w-full h-[400px] p-4 bg-white dark:bg-gray-900 rounded-xl shadow">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-black dark:text-gray-300">
          Payments Collected (Last 30 Days)
        </h1>
        <img src="/moreDark.png" alt="More options" width={20} height={20} />
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 25, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ccc dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", color: "currentColor" }}
            tickFormatter={formatDateTick}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            tick={{ fill: "#6b7280", color: "currentColor" }}
            tickLine={false}
            axisLine={false}
            tickMargin={20}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", color: "#000" }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{
              paddingTop: "10px",
              paddingBottom: "30px",
              color: "#000",
            }}
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorCollected)"
            strokeWidth={3}
            isAnimationActive={true}
            animationDuration={1200} // ⏱ duration in ms
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
