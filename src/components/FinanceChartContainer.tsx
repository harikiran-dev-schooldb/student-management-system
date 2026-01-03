"use client";

import FinanceChart from "./FinanceChart";
import { MoreHorizontal, TrendingUp, AlertCircle } from "lucide-react";

type ChartData = {
  date: string;
  collected: number;
};

interface FinanceChartContainerProps {
  data: ChartData[];
}

export default function FinanceChartContainer({
  data,
}: FinanceChartContainerProps) {
  
  // --- UI: Premium "No Data" State ---
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
          <AlertCircle className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No financial records found.
        </p>
      </div>
    );
  }

  // --- UI: Main Container ---
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-darkMode">
      
      {/* Header Section */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Finance
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
            Revenue Analytics
          </p>
        </div>
        
        {/* Action Button */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Chart Wrapper */}
      {/* We use flex-1 to ensure the chart takes up all remaining vertical space */}
      <div className="relative h-full w-full flex-1">
        <FinanceChart data={data} />
      </div>
    </div>
  );
}