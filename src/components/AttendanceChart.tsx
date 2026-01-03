"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceChartData {
  name: string;
  present: number;
  absent: number;
}

const AttendanceChart = ({
  data,
  darkMode = false,
}: {
  data: AttendanceChartData[];
  darkMode?: boolean;
}) => {
  // --- COLOR PALETTE: "Modern Mint" ---
  // A rich Teal for success, and a soft warm Peach for absent.
  // This combination feels very designed and expensive.
  const colors = {
    present: darkMode ? "#818cf8" : "#4f46e5", // Indigo 400 / Indigo 600
    absent: darkMode ? "#312e81" : "#e0e7ff", // Indigo 900 / Indigo 100
    text: darkMode ? "#9ca3af" : "#6b7280", // Gray 400 / Gray 500
    grid: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    hover: darkMode ? "#115e59" : "#ccfbf1", // For cursor hover effects
  };

  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart
        data={data}
        barSize={24}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.grid}
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: colors.text, fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          tickMargin={12}
        />

        <YAxis
          axisLine={false}
          tick={{ fill: colors.text, fontSize: 12 }}
          tickLine={false}
          tickMargin={12}
        />

        <Tooltip
          cursor={{ fill: colors.grid }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            backgroundColor: darkMode ? "#18181b" : "#fff", // Zinc 900 / White
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            padding: "12px",
            color: darkMode ? "#f3f4f6" : "#1f2937",
          }}
          itemStyle={{
            fontSize: "13px",
            fontWeight: 600,
            paddingBottom: "2px",
            textTransform: "capitalize",
          }}
          labelStyle={{
            color: colors.text,
            marginBottom: "8px",
            fontSize: "12px",
          }}
        />

        <Bar
          dataKey="present"
          fill={colors.present}
          radius={[6, 6, 0, 0]} // Smooth rounded top
          animationDuration={1200}
        />
        <Bar
          dataKey="absent"
          fill={colors.absent}
          radius={[6, 6, 0, 0]} // Smooth rounded top
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
