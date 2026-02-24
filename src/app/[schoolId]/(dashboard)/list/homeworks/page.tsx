import { startOfDay, endOfDay } from "date-fns";
import ClassFilterDropdown, { DateFilter } from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { Homeworks, SearchParams } from "../../../../../../types";
import { HomeworkSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { resolveSchoolId } from "@/lib/resolveSchool";

// Render a single table row
const renderRow = (item: Homeworks, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
  >
    <td className="p-2 text-gray-700 dark:text-gray-200">
      {new Intl.DateTimeFormat("en-GB")
        .format(new Date(item.date))
        .replace(/\//g, "-")}
    </td>

    {/* 🏫 Grade - Section */}
    {(role === "admin" || role === "teacher") && (
      <td className="p-2 text-gray-700 dark:text-gray-200">
        {item.Class?.Grade?.level && item.Class?.section
          ? `${item.Class.Grade.level} - ${item.Class.section}`
          : "N/A"}
      </td>
    )}

    <td className="p-2 text-gray-800 dark:text-gray-200 whitespace-pre-line">
      {item.description}
    </td>

    {(role === "admin" || role === "teacher") && (
      <td className="p-2">
        <div className="flex items-center gap-2">
          <FormContainer table="homework" type="update" data={item} />
          <FormContainer table="homework" type="delete" id={item.id} />
        </div>
      </td>
    )}
  </tr>
);

// Define table columns dynamically
const getColumns = (role: string | null) => [
  { header: "Date", accessor: "date" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Class", accessor: "class" }]
    : []),
  { header: "Description", accessor: "description" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const HomeworkListPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const { schoolId: schoolSlug } = await params;

  const schoolId = await resolveSchoolId(schoolSlug);
  
  const resolvedParams = await searchParams;

  const { page, gradeId, date, classId, ...queryParams } = resolvedParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  // ✅ Pass schoolId
  const { role, userId } = await fetchUserInfo(schoolSlug);
  const columns = getColumns(role);

  const db = tenantPrisma(schoolId);

  // Sorting
  const sortOrder = resolvedParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedParams.sortKey)
    ? resolvedParams.sortKey[0]
    : resolvedParams.sortKey || "date";

  const rawDate = Array.isArray(date) ? date[0] : date;
  const selectedDate = new Date(
    rawDate ?? new Date().toISOString().split("T")[0],
  );
  const startDate = startOfDay(selectedDate);
  const endDate = endOfDay(selectedDate);

  let userClassIds: number[] = [];

  if (role === "teacher" && userId) {
    const teacher = await db.teacher.findFirst({
      where: { linkedUserId: userId },
      select: { classId: true },
    });
    if (teacher?.classId) userClassIds = [teacher.classId];
  }

  if (role === "student" && userId) {
    const student = await db.student.findFirst({
      where: { linkedUserId: userId },
      select: { classId: true },
    });
    if (student?.classId) userClassIds = [student.classId];
  }

  const filters: Prisma.HomeworkWhereInput = {
    date: { gte: startDate, lt: endDate },
    ...(userClassIds.length > 0
      ? { classId: { in: userClassIds } }
      : classId
      ? { classId: Number(classId) }
      : {}),
    ...(gradeId ? { Class: { gradeId: Number(gradeId) } } : {}),
  };

  if (queryParams.search) {
    filters.OR = [
      {
        description: {
          contains: queryParams.search as string,
          mode: "insensitive",
        },
      },
      {
        Class: {
          name: {
            contains: queryParams.search as string,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const classes = await db.class.findMany();
  const grades = await db.grade.findMany();

  const [data, count] = await db.$transaction([
    db.homework.findMany({
      orderBy: [{ [sortKey]: sortOrder }, { id: "desc" }],
      where: filters,
      select: HomeworkSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.homework.count({ where: filters }),
  ]);

  const Path = `/${schoolId}/list/homeworks`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          Homeworks ({count})
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
            <SortButton sortKey={sortKey} />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="homework" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default HomeworkListPage;
