import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import ClassFilterDropdown from "@/components/FilterDropdown";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { MessageList, SearchParams } from "../../../../../../types";
import { MessagesSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

const renderRow = (item: MessageList, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-gray-700 transition-colors"
  >
    <td className="hidden md:table-cell w-24 text-gray-700 dark:text-gray-200">
      {new Date(item.date).toLocaleDateString("en-GB").replace(/\//g, "-")}
    </td>

    {(role === "teacher" || role === "admin") && (
      <>
        <td className="hidden md:table-cell capitalize w-32 text-gray-700 dark:text-gray-200">
          {item.type.toLowerCase()}
        </td>

        <td>
          <div className="flex flex-col">
            {item.Student ? (
              <>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.Student.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.Student.admissionNo}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-500 dark:text-gray-400 italic">
                  Class / School-wide
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  No specific student
                </p>
              </>
            )}
          </div>
        </td>

        <td className="hidden md:table-cell w-32 text-gray-700 dark:text-gray-200">
          {item.Class ? (
            <>
              {item.Class.Grade?.level ?? (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  No Grade
                </span>
              )}
              {" - "}
              {item.Class.section ?? (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  All Classes
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">
              No Class
            </span>
          )}
        </td>
      </>
    )}

    <td className="p-4 whitespace-pre-line px-0 text-gray-800 dark:text-gray-200">
      {item.message}
    </td>

    <td>
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="messages" type="update" data={item} />
            <FormContainer table="messages" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const getColumns = (role: string | null) => [
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  ...(role === "teacher" || role === "admin"
    ? [
        { header: "Type", accessor: "type", className: "hidden md:table-cell" },
        {
          header: "Student Name",
          accessor: "student",
        },
        {
          header: "Class",
          accessor: "class",
          className: "hidden md:table-cell",
        },
      ]
    : []),
  { header: "Message", accessor: "message" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const MessagesList = async ({
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

  const userInfo = await fetchUserInfo(slug);

  // 3️⃣ Tenant-scoped Prisma
  const db = tenantPrisma(school.id);

  const { page, ...queryParams } = resolvedSearchParams;

  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role, userId, classId: teacherClassId, studentId } = userInfo;

  const columns = getColumns(role);

  const gradeId = Array.isArray(queryParams.gradeId)
    ? queryParams.gradeId[0]
    : queryParams.gradeId;

  const classId = Array.isArray(queryParams.classId)
    ? queryParams.classId[0]
    : queryParams.classId;

  const sortOrder = resolvedSearchParams.sort === "asc" ? "asc" : "desc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "id";

  const searchValue = Array.isArray(queryParams.search)
    ? queryParams.search[0]
    : queryParams.search;

  // Get user class(es)
  const userClassIds =
    role === "teacher" && teacherClassId
      ? [teacherClassId]
      : role === "student" && userInfo.classId
      ? [userInfo.classId]
      : [];

  const filterConditions: Prisma.MessagesWhereInput[] = [];

  // Grade filter (via Class → Grade)
  if (gradeId && !classId) {
    filterConditions.push({
      Class: {
        gradeId: Number(gradeId),
      },
    });
  }

  // Class filter (direct)
  if (classId && (role !== "teacher" || Number(classId) === teacherClassId)) {
    filterConditions.push({
      classId: Number(classId),
    });
  }

  // Base role filter
  const roleFilter: Prisma.MessagesWhereInput = {};
  if (role === "student") {
    roleFilter.OR = [
      // 1. Messages sent directly to the student
      { studentId: userInfo.studentId },

      // 2. Class announcements
      {
        classId: { in: userClassIds },
        studentId: null,
      },

      // 3. School-wide announcements
      {
        classId: null,
        studentId: null,
      },
    ];
  } else if (role === "teacher") {
    roleFilter.OR = teacherClassId
      ? [
          { classId: teacherClassId }, // class messages
          { classId: null, studentId: null }, // school-wide
        ]
      : [{ classId: null, studentId: null }];
  }

  // Search filter
  let searchFilter: Prisma.MessagesWhereInput | undefined;
  if (searchValue) {
    searchFilter = {
      OR: [
        { message: { contains: searchValue, mode: "insensitive" } },
        { Student: { name: { contains: searchValue, mode: "insensitive" } } },
        { Student: { id: { contains: searchValue, mode: "insensitive" } } },
      ],
    };
  }

  // Combine filters safely
  const query: Prisma.MessagesWhereInput = {
    AND: [
      ...(Object.keys(roleFilter).length ? [roleFilter] : []),
      ...(searchFilter ? [searchFilter] : []),
      ...filterConditions,
    ],
  };

  const [data, count] = await db.$transaction([
    db.messages.findMany({
      orderBy: [{ [sortKey]: sortOrder }, { id: "desc" }],
      where: query,
      select: MessagesSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.messages.count({ where: query }),
  ]);

  const Path = `/${slug}/list/messages`;

  const classes = await db.class.findMany({
    where: gradeId ? { gradeId: Number(gradeId) } : {},
  });

  const grades = await db.grade.findMany();

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">
          All Messages ({count})
        </h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          {role === "admin" && (
            <>
              <ClassFilterDropdown
                classes={classes}
                grades={grades}
                basePath={Path}
              />
            </>
          )}
          <div className="flex items-center self-end gap-4">
            <ResetFiltersButton basePath={Path} />
            <IconButton icon={Filter} />
            <SortButton sortKey="id" />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="messages" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default MessagesList;
