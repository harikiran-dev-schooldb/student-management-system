export default function ReportTable({ columns, data }: any) {
  return (
    <div className="rounded-lg border overflow-hidden bg-white dark:bg-darkMode">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 dark:bg-white/5">
          <tr>
            {columns.map((col: any) => (
              <th key={col.key} className="px-4 py-3 text-xs uppercase text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row: any, i: number) => (
              <tr key={i} className="border-t">
                {columns.map((col: any) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-10">
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}