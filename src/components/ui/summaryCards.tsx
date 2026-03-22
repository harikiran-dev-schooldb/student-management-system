export const Summary3D = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="[perspective:1200px]">
    <div
      className={`rounded-xl border p-5 transform-gpu transition-all h-full flex flex-col justify-center bg-white dark:bg-darkMode border-gray-200 dark:border-white/10 hover:-translate-y-1 hover:shadow-xl ${highlight ? "ring-2 ring-blue-500" : ""
        }`}
    >
      <p className="text-xs uppercase text-gray-500 font-bold">{title}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

export const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs uppercase text-gray-500 bg-gray-50 dark:bg-white/5 font-bold text-left tracking-wider">
    {children}
  </th>
);

export const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </td>
);