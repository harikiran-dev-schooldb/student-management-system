const Table = ({
    columns,
    renderRow,
    data
}: {
    columns: { header: string; accessor: string; className?: string }[];
    renderRow: (item:any) => React.ReactNode;
    data: any[];
}) => {
  return (
    <table className="w-full mt-4">
        <thead>
          <tr className="text-sm text-left text-gray-500">
            {columns.map((col) => (
                <th key={col.accessor} className={col.className}>{col.header}</th>
            ))}
          </tr>  
        </thead>
        {/* Table body can go here */}
        <tbody>{data.map((item)=>renderRow(item))}</tbody>
   </table>
  );
};

export default Table;   