"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

interface ResetFiltersButtonProps {
  basePath: string;
}

const ResetFiltersButton = ({ basePath }: ResetFiltersButtonProps) => {
  const router = useRouter();

  const handleReset = () => {
    router.push(basePath); // clears all filters
  };

  return (
    <button
      onClick={handleReset}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaBlue dark:bg-LamaBLue"
      title="Reset All Filters"
    >
      <RotateCcw className="w-4 h-4 text-white" />
    </button>
  );
};

export default ResetFiltersButton;
