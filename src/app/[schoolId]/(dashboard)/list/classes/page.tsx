import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { ClassList, SearchParams } from "../../../../../../types";
import { ClassSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

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
      {item.teacherClassAssignments?.[0]?.teacher?.name ?? "No Supervisor"}
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
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { schoolId: slug } = resolvedParams;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    throw new Error("Invalid school");
  }

  const { role } = await fetchUserInfo(slug);
  // 🔐 Create tenant-scoped prisma
  const db = tenantPrisma(school.id);

  const pageParam = resolvedSearchParams.page;
  const currentPage = Array.isArray(pageParam)
    ? parseInt(pageParam[0])
    : parseInt(pageParam || "1");

  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKeyRaw = resolvedSearchParams.sortKey;
  const sortKey = Array.isArray(sortKeyRaw)
    ? sortKeyRaw[0]
    : sortKeyRaw || "id";

  const query: Prisma.ClassWhereInput = { schoolId: school.id };

  const supervisorIdRaw = resolvedSearchParams.supervisorId;
  const searchRaw = resolvedSearchParams.search;

  const supervisorId =
    Array.isArray(supervisorIdRaw) ? supervisorIdRaw[0] : supervisorIdRaw;

  const search =
    Array.isArray(searchRaw) ? searchRaw[0] : searchRaw;

  if (supervisorId) {
    query.teacherClassAssignments = {
      some: {
        teacherId: supervisorId,
        role: "SUPERVISOR",
        academicYear: { isActive: true },
      },
    };
  }

  if (search) {
    query.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [data, count] = await db.$transaction([
    db.class.findMany({
      where: query,
      orderBy: { [sortKey]: sortOrder },
      select: ClassSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (currentPage - 1),
    }),
    db.class.count({ where: query }),
  ]);

  const Path = `${slug}/list/classes`;
  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">All Classes</h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          <div className="flex items-center self-end gap-4">
            <ResetFiltersButton basePath={Path} />
            <IconButton icon={Filter} />
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
