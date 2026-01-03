"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CountChartProps {
  male: number;
  female: number;
}

// --- 1. Custom Tooltip (Matches the white card style in your image) ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      // Style: Clean white card, shadow, rounded corners, "Name : Value" format
      <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-gray-800 dark:bg-black">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
           {data.name} : <span className="font-bold">{data.value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CountChart = ({ male, female }: CountChartProps) => {
  const data = [
    { name: "Boys", value: male, fill: "#6366f1" }, // Indigo-500
    { name: "Girls", value: female, fill: "#f43f5e" }, // Rose-500
  ];

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer>
        <PieChart>
          {/* --- 2. Tooltip Implementation --- */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={false} // Prevents the slice from changing color/shadow on hover
            wrapperStyle={{ outline: "none" }}
          />
          
          <Pie
            data={data}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill} 
                strokeWidth={0} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Total Text */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {(male + female).toLocaleString()}
        </h1>
        <p className="text-xs font-medium text-gray-400">Total</p>
      </div>
    </div>
  );
};

export default CountChart;