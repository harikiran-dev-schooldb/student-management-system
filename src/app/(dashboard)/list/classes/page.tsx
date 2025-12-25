import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { ClassList, SearchParams } from "../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { ClassSelect } from "../../../../../types/query-types";

const renderRow = (item: ClassList, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-LamaPurpleLight
               dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
  >
    <td className="flex items-center gap-4 p-4 text-black dark:text-white">
      {item.name}
    </td>
    <td className="hidden md:table-cell text-black dark:text-white">
      {item.Teacher ? item.Teacher.name : "No Class Teacher"}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const getColumns = (role: string | null) => [
  { header: "Class Name", accessor: "name" },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden md:table-cell",
  },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

const ClassesList = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const { role } = await fetchUserInfo();

  const pageParam = params.page;
  const currentPage = Array.isArray(pageParam)
    ? parseInt(pageParam[0])
    : parseInt(pageParam || "1");

  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKeyRaw = params.sortKey;
  const sortKey = Array.isArray(sortKeyRaw)
    ? sortKeyRaw[0]
    : sortKeyRaw || "id";

  const query: Prisma.ClassWhereInput = {};

  for (const [key, value] of Object.entries(params)) {
    const val = Array.isArray(value) ? value[0] : value;
    if (!val) continue;

    switch (key) {
      case "supervisorId":
        query.supervisorId = val;
        break;
      case "search":
        query.name = { contains: val, mode: "insensitive" };
        break;
      default:
        break;
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      orderBy: { [sortKey]: sortOrder },
      select: ClassSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (currentPage - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">All Classes</h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          <ResetFiltersButton basePath="/list/classes" />
          <div className="flex items-center self-end gap-4">
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:brightness-90">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <SortButton sortKey="id" />
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={getColumns(role)}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* Pagination */}
      <Pagination page={currentPage} count={count} />
    </div>
  );
};

export default ClassesList;
