export const dynamic = "force-dynamic";
import ClassFilterDropdown from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Grade, Prisma, Subject, Teacher } from "@prisma/client";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import SortButton from "@/components/SortButton";
import { SearchParams } from "../../../../../../types";
import { tenantPrisma } from "@/lib/tenant-prisma";

type SubjectListType = Subject & {
  grades: Grade[];
  teachers: { teacher: Teacher }[];
};

const renderRow = (item: SubjectListType, role: string | null) => {
  const gradeLevels = item.grades.map((g) => g.level || "Unknown").join(", ");

  return (
    <tr
      key={item.id}
      className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-LamaPurpleLight
                 dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
    >
      <td className="flex items-center gap-4 p-4 text-black dark:text-white">
        {item.id}
      </td>
      <td className=" items-center gap-4 p-4 text-black dark:text-white">
        {item.name}
      </td>
      {role === "admin" && (
        <td className="hidden md:table-cell text-black dark:text-white">
          {gradeLevels}
        </td>
      )}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const getColumns = (role: string | null) => [
  { header: "Id", accessor: "id" },
  { header: "Subject", accessor: "name" },
  ...(role === "admin"
    ? [
        {
          header: "Grades",
          accessor: "grades",
          className: "hidden md:table-cell",
        },
      ]
    : []),
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

const SubjectList = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  // 1️⃣ Resolve route params
  const { schoolId: slug } = await params;
  const resolvedSearchParams = await searchParams;

  // 2️⃣ Resolve internal school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) throw new Error("Invalid school");

  const userInfo = await fetchUserInfo(school.id);
  const { role, gradeId } = userInfo;

  const { page, classId, ...queryParams } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const columns = getColumns(role);

  const db = tenantPrisma(school.id);

  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "name";

  const query: Prisma.SubjectWhereInput = {};

  // 🔒 Teacher / Student → ONLY their grade
  if (role === "teacher" || role === "student") {
    if (!gradeId) {
      return [];
    } else {
      query.grades = {
        some: { id: gradeId },
      };
    }
  }

  // 🧑‍💼 Admin → free filtering
  if (role === "admin") {
    if (resolvedSearchParams.gradeId && resolvedSearchParams.classId) {
      query.grades = {
        some: {
          classes: { some: { id: Number(resolvedSearchParams.classId) } },
        },
      };
    } else if (resolvedSearchParams.gradeId) {
      query.grades = {
        some: { id: Number(resolvedSearchParams.gradeId) },
      };
    }
  }

  if (queryParams.search) {
    const searchValue = Array.isArray(queryParams.search)
      ? queryParams.search[0]
      : queryParams.search;
    query.OR = [
      { name: { contains: searchValue, mode: "insensitive" } },
      {
        grades: {
          some: { level: { contains: searchValue, mode: "insensitive" } },
        },
      },
      {
        teachers: {
          some: {
            teacher: { name: { contains: searchValue, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  const classes =
    role === "admin"
      ? await db.class.findMany({
          where: resolvedSearchParams.gradeId
            ? { gradeId: Number(resolvedSearchParams.gradeId) }
            : {},
        })
      : [];

  const grades = role === "admin" ? await db.grade.findMany() : [];

  const [data, count] = await db.$transaction([
    db.subject.findMany({
      orderBy: [{ [sortKey]: sortOrder }, { name: "asc" }],
      where: query,
      include: {
        grades: { include: { classes: true } },
        teachers: { include: { teacher: { select: { name: true } } } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.subject.count({ where: query }),
  ]);

  const Path = `/${slug}/list/subjects`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          All Subjects ({count})
        </h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          {role === "admin" && (
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
            />
          )}
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <TableSearch />
            <div className="flex items-center self-end gap-4">
              <ResetFiltersButton basePath={Path} />
              <IconButton icon={Filter} />
              <SortButton sortKey="id" />
              {role === "admin" && (
                <FormContainer table="subject" type="create" />
              )}
            </div>
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

export default SubjectList;
