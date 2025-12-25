import ClassFilterDropdown, { DateFilter } from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo, getClassIdForRole } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { PermissionWithRelations, SearchParams } from "../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import ExportButton from "@/components/ExportButton";

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
      <td className="px-2 py-1">{localTime}</td>
      <td className="px-2 py-1">{item.student.name}</td>
      <td className="px-2 py-1">
        {item.student.Class?.Grade?.level
          ? `${item.student.Class.Grade.level} - ${
              item.student.Class.section ?? "N/A"
            }`
          : "N/A"}
      </td>
      <td className="px-2 py-1">{item.leaveType}</td>
      <td className="px-2 py-1">{item.description || "-"}</td>
      <td className="px-2 py-1">{item.withWhom}</td>
      <td className="px-2 py-1">{item.relation}</td>
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
  { header: "Issued Time", accessor: "timeIssued" },
  { header: "Student", accessor: "student" },
  { header: "Class", accessor: "class" },
  { header: "Leave Type", accessor: "leaveType" },
  { header: "Description", accessor: "description" },
  { header: "Person Name", accessor: "withWhom" },
  { header: "Relation", accessor: "relation" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const PermissionSlipListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const { page, gradeId, classId, date, search } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  // 🔹 User Info
  const { role, userId } = await fetchUserInfo();
  const userClassIds = await getClassIdForRole(role, userId); // array
  const columns = getColumns(role);

  // 🔹 Sorting
  const sortOrder = params.sort === "asc" ? "asc" : "desc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "id";

  // 🔹 Query Builder
  const query: Prisma.PermissionSlipWhereInput = {};

  // Date filter — default to today if no date selected
  let startDate: Date;
  let endDate: Date;

  if (date) {
    // If user selected a date
    const rawDate = Array.isArray(date) ? date[0] : date;
    const selectedDate = new Date(rawDate);
    startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
    endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
  } else {
    // Default: today's date
    const today = new Date();
    startDate = new Date(today.setHours(0, 0, 0, 0));
    endDate = new Date(today.setHours(23, 59, 59, 999));
  }

  query.date = { gte: startDate, lte: endDate };

  // Student/Class/Grade filters
  query.student = {
    ...(classId ? { classId: Number(classId) } : {}),
    ...(gradeId ? { Class: { gradeId: Number(gradeId) } } : {}),
    ...(search
      ? { name: { contains: String(search), mode: "insensitive" } }
      : {}),
  };

  // 🔹 Restrict by role (teacher/student)
  if (userClassIds.length > 0) {
    query.student = {
      ...(query.student || {}),
      classId: { in: userClassIds },
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.permissionSlip.findMany({
      where: query,
      orderBy: [{ [sortKey]: sortOrder }, { id: "desc" }],
      select: {
        id: true,
        timeIssued: true,
        date: true,
        leaveType: true,
        description: true,
        withWhom: true,
        relation: true,
        studentId: true,
        student: {
          select: {
            id: true,
            name: true,
            classId: true,
            Class: {
              select: {
                id: true,
                section: true,
                gradeId: true,
                Grade: {
                  select: {
                    id: true,
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.permissionSlip.count({ where: query }),
  ]);

  // 🔹 For filters
  const grades = await prisma.grade.findMany();
  const classes = await prisma.class.findMany();

  const Path = "/list/permissions";

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
          <ResetFiltersButton basePath={Path} />
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:bg-LamaYellow">
              <img src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
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
