import CountChart from "./CountChart";
import { MoreHorizontal, Users } from "lucide-react";
import { Gender } from "@prisma/client";

interface GenderStat {
  gender: Gender;
  _count: number;
}

interface CountChartContainerProps {
  stats: GenderStat[];
}

const CountChartContainer = ({ stats }: CountChartContainerProps) => {
  const male = stats.find((s) => s.gender === "Male")?._count ?? 0;
  const female = stats.find((s) => s.gender === "Female")?._count ?? 0;
  const total = male + female || 1;

  const malePercentage = Math.round((male / total) * 100);
  const femalePercentage = Math.round((female / total) * 100);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-darkMode">
      {/* --- HEADER --- */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Students
          </h2>
          <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
            Distribution by Gender
          </p>
        </div>
        <MoreHorizontal
          className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          size={20}
        />
      </div>

      {/* --- CHART SECTION --- */}
      <div className="relative my-6 h-[240px] w-full">
        {/* Pass the dynamic counts to the chart */}
        <CountChart male={male} female={female} />
      </div>

      {/* --- LEGEND SECTION --- */}
      <div className="flex justify-center gap-8 border-t border-gray-100 pt-6 dark:border-gray-800">
        
        {/* Boys Legend (Indigo) */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-500" /> 
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {male.toLocaleString()}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-400">Boys ({malePercentage}%)</p>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-gray-100 dark:bg-gray-800" />

        {/* Girls Legend (Rose) */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500" /> 
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {female.toLocaleString()}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-400">Girls ({femalePercentage}%)</p>
        </div>

      </div>
    </div>
  );
};

export default CountChartContainer;