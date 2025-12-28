import Link from "next/link";
import { BarChart2, Edit, Eye } from "lucide-react";

export default function ResultsCard() {
  return (
    <div
      className="
        rounded-2xl
        bg-white/5 dark:bg-[#1a1f35]
        border border-white/10
        p-4
        shadow-sm
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
          <BarChart2 size={18} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Results</h3>
          <p className="text-xs text-gray-400">
            Marks & performance
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <Link
          href="/list/results/marks-entry"
          className="
            flex items-center gap-2
            rounded-full px-4 py-2 text-xs
            bg-white/10 hover:bg-white/20
            transition
          "
        >
          <Edit size={14} />
          Enter
        </Link>

        <Link
          href="/list/results/view"
          className="
            flex items-center gap-2
            rounded-full px-4 py-2 text-xs
            bg-white/10 hover:bg-white/20
            transition
          "
        >
          <Eye size={14} />
          View
        </Link>
      </div>
    </div>
  );
}
