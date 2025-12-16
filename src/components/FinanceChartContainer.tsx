"use client";

import FinanceChart from "./FinanceChart";

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
  if (!data || data.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No data available</div>;
  }

  return <FinanceChart data={data} />;
}
