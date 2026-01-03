"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  // --- Logic ---
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Calculate stats for "Showing 1 to 10 of 50" text
  const startItem = (page - 1) * ITEM_PER_PAGE + 1;
  const endItem = Math.min(page * ITEM_PER_PAGE, count);

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  // Logic to generate page numbers with ellipsis (...)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) pages.push("...");

      // Show current page and neighbors
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");

      // Always show last page
      pages.push(totalPages);
    }
    // Filter duplicates just in case logic overlaps for small counts
    return [...new Set(pages)];
  };

  if (count === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
      {/* --- Section 1: Result Stats --- */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {count}
        </span>{" "}
        results
      </p>

      {/* --- Section 2: Controls --- */}
      <div className="flex items-center gap-2">
        {/* PREV BUTTON */}
        <button
          disabled={!hasPrev}
          onClick={() => changePage(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 dark:border-gray-800 dark:bg-darkMode dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
        >
          <ChevronLeft size={16} />
        </button>

        {/* PAGE NUMBERS */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, index) => {
            const isEllipsis = p === "...";
            const isActive = p === page;

            if (isEllipsis) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={p}
                onClick={() => changePage(Number(p))}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-LamaBlue text-white shadow-sm hover:bg-indigo-500"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-800 dark:bg-darkMode dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-900 dark:hover:text-indigo-400"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* NEXT BUTTON */}
        <button
          disabled={!hasNext}
          onClick={() => changePage(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 dark:border-gray-800 dark:bg-darkMode dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
