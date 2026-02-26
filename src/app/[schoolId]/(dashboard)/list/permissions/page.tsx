import ClassFilterDropdown, { DateFilter } from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getISTRange, ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo, getClassIdForRole } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import ExportButton from "@/components/ExportButton";
import { PermissionWithRelations, SearchParams } from "../../../../../../types";
import { PermissionSlipSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import IconButton from "@/components/IconButton";
import { Filter } from "lucide-react";
import Avatar from "@/components/Avatar";

// 🔹 Render Table Row
const renderRow = (item: PermissionWithRelations, role: string | null) => {
  const localTime = new Date(item.timeIssued).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return (
    <tr
      key={item.id}
      className="text-sm border-b border-gray-200 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-gray-700"
    >
      {/* Student Profile */}
      <td className="flex items-center gap-2 p-2">
        {/* Avatar Ring Effect */}
        <Avatar className="rounded-full object-cover" />
        <div className="flex flex-col">
          <h3 className="font-semibold text-darkMode dark:text-gray-100">
            {item.student.name}
          </h3>
          <p className="text-xs text-darkMode dark:text-gray-300">
            {item.studentId}
          </p>
        </div>
      </td>
      <td className="px-2 py-1">
        {item.student.Class?.Grade?.level
          ? `${item.student.Class.Grade.level} - ${
              item.student.Class.section ?? "N/A"
            }`
          : "N/A"}
      </td>
      <td className="px-2 py-1 hidden md:table-cell">{item.leaveType}</td>
      <td className="px-2 py-1 hidden md:table-cell">
        {item.description || "-"}
      </td>
      <td className="px-2 py-1 hidden md:table-cell">{item.withWhom}</td>
      <td className="px-2 py-1 hidden md:table-cell">{item.relation}</td>
      <td className="px-2 py-1">{localTime}</td>
      {(role === "admin" || role === "teacher") && (
        <td className="px-2 py-1">
          <div className="flex items-center gap-2">
            <FormContainer table="permissions" type="update" data={item} />
            <FormContainer table="permissions" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );
};

// 🔹 Table Columns
const getColumns = (role: string | null) => [
  { header: "Student", accessor: "student" },
  { header: "Class", accessor: "class" },
  {
    header: "Leave Type",
    accessor: "leaveType",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  {
    header: "Person Name",
    accessor: "withWhom",
    className: "hidden md:table-cell",
  },
  {
    header: "Relation",
    accessor: "relation",
    className: "hidden md:table-cell",
  },
  { header: "Issued Time", accessor: "timeIssued" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const PermissionSlipListPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const { schoolId: slug } = await params;
  const resolvedSearchParams = await searchParams;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) throw new Error("Invalid school");

  const db = tenantPrisma(school.id);

  const getSingle = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const p = getSingle(resolvedSearchParams.page) ?? "1";
  const gradeId = getSingle(resolvedSearchParams.gradeId);
  const classId = getSingle(resolvedSearchParams.classId);
  const date = getSingle(resolvedSearchParams.date);
  const search = getSingle(resolvedSearchParams.search);

  // 🔹 User Info
  const { role, userId } = await fetchUserInfo(slug);

  const userClassIds = await getClassIdForRole(
    role ?? null,
    userId ?? null,
    school.id,
  );

  const columns = getColumns(role);

  // 🔹 Sorting
  const sortOrder = resolvedSearchParams.sort === "asc" ? "asc" : "desc";
  const allowedSortKeys = ["id", "timeIssued", "leaveType", "date"];
  const sortKey = allowedSortKeys.includes(String(resolvedSearchParams.sortKey))
    ? String(resolvedSearchParams.sortKey)
    : "id";

  // 🔹 Query Builder
  const query: Prisma.PermissionSlipWhereInput = {};

  const { start, end } = getISTRange(date as string | undefined);
  query.date = { gte: start, lte: end };

  // Student/Class/Grade/Search filters
  query.student = {
    ...(classId ? { classId: Number(classId) } : {}),
    ...(gradeId
      ? {
          Class: {
            gradeId: Number(gradeId),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: String(search),
                mode: "insensitive",
              },
            },
            {
              id: {
                contains: String(search),
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  if (userClassIds.length > 0) {
    query.student = {
      ...(query.student || {}),
      classId: classId ? Number(classId) : { in: userClassIds },
    };
  }

  console.log("Start:", start.toISOString());
  console.log("End:", end.toISOString());

  const [data, count] = await db.$transaction([
    db.permissionSlip.findMany({
      where: query,
      orderBy: [{ [sortKey]: sortOrder }, { id: "desc" }],
      select: PermissionSlipSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.permissionSlip.count({ where: query }),
  ]);

  // 🔹 For filters
  const grades = await db.grade.findMany({
    select: { id: true, level: true },
  });

  const classes = await db.class.findMany({
    select: { id: true, section: true, gradeId: true },
  });

  const Path = `/${slug}/list/permissions`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white shadow-md">
      {/* 🔹 TOP Section */}
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">
          Permission Slips ({count})
        </h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          <DateFilter basePath={Path} />
          {(role === "admin" || role === "teacher") && (
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
            />
          )}
          <div className="flex items-center gap-4">
            <ResetFiltersButton basePath={Path} />
            <IconButton icon={Filter} />
            <SortButton sortKey="id" />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="permissions" type="create" />
            )}
            <ExportButton data={data} fileName="Permission_Slips" />
          </div>
        </div>
      </div>

      {/* 🔹 TABLE */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* 🔹 PAGINATION */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default PermissionSlipListPage;
