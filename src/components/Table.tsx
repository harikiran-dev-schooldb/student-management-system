import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";

type Column = {
  header: string;
  accessor: string;
  className?: string;
  sortable?: boolean;
};

const Table = ({
  columns,
  renderRow,
  data,
  sortKey,
  sortOrder,
}: {
  columns: Column[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
  sortKey: string;
  sortOrder: "asc" | "desc";
}) => {
  return (
    <table className="w-full mt-4">

      <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b dark:bg-gray-900/80 dark:border-gray-700">
        <tr className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {columns.map((col) => {
            const isActive = sortKey === col.accessor;
            const nextOrder =
              isActive && sortOrder === "asc" ? "desc" : "asc";

            return (
              <th
                key={col.accessor}
                className={`px-4 py-3 text-left font-semibold ${col.className || ""
                  }`}
              >
                {col.sortable ? (
                  <Link
                    href={`?sortKey=${col.accessor}&sort=${nextOrder}`}
                    className="flex items-center gap-1 hover:text-indigo-600 transition"
                  >
                    {col.header}

                    {/* Icon Logic */}
                    {isActive ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </Link>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      {/* Table body can go here */}
      <tbody>{data.map((item) => renderRow(item))}</tbody>
    </table>
  );
};

export default Table;   