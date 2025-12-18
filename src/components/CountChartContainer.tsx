import CountChart from "./CountChart";
import { Gender } from "@prisma/client";

interface GenderStat {
  gender: Gender;
  _count: number;
}

interface CountChartContainerProps {
  stats: GenderStat[];
}

const CountChartContainer = ({ stats }: CountChartContainerProps) => {
  const male = stats.find(s => s.gender === "Male")?._count ?? 0;
  const female = stats.find(s => s.gender === "Female")?._count ?? 0;

  const total = male + female || 1;

  return (
    <div className="w-full h-full p-4 bg-white dark:bg-gray-900 rounded-xl">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Students</h1>
        <img src="/moreDark.png" alt="More options" width={20} height={20} />
      </div>

      {/* CHART */}
      <CountChart male={male} female={female} />

      {/* BOTTOM SECTION */}
      <div className="flex justify-center gap-16 mt-4">
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-LamaSky" />
          <h1 className="font-bold">{male}</h1>
          <h2 className="text-xs">
            Boys {Math.round((male / total) * 100)}%
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-LamaYellow" />
          <h1 className="font-bold">{female}</h1>
          <h2 className="text-xs">
            Girls {Math.round((female / total) * 100)}%
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
