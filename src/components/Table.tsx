import { SearchX } from "lucide-react";
import clsx from "clsx";

const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="w-full relative">
      <table className="w-full min-w-[1000px] table-auto border-collapse">
        {/* --- PREMIUM STICKY HEADER --- */}
        <thead className="sticky top-0 z-20">
          <tr className="bg-white/95 backdrop-blur-md shadow-sm dark:bg-black/90 dark:shadow-gray-800/50">
            {columns.map((col, index) => {
              const isFirst = index === 0;
              const isLast = index === columns.length - 1;

              return (
                <th
                  key={col.accessor}
                  className={clsx(
                    "py-4 px-6 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400",
                    col.className,
                    isFirst && "pl-8", // Extra padding for the first column
                    isLast && "pr-8"   // Extra padding for the last column
                  )}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* --- BODY --- */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent">
          {data.length > 0 ? (
            data.map((item) => renderRow(item))
          ) : (
            // --- PREMIUM EMPTY STATE ---
            <tr>
              <td
                colSpan={columns.length}
                className="py-16 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
                    <SearchX className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No results found</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-1">
                      We couldn't find any records matching your filters. Try adjusting your search criteria.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;