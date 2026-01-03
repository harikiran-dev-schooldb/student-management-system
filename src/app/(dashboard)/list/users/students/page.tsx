import ClassFilterDropdown, {
  GenderFilter,
  StudentStatusFilter,
} from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { $Enums, Prisma } from "@prisma/client";
import Link from "next/link";
import { SearchParams, StudentsList } from "../../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import StudentStatusDropdown from "@/components/StudentStatusDropdown";
import { StudentSelect } from "../../../../../../types/query-types";
import { Eye, Filter } from "lucide-react";
import Avatar from "@/components/Avatar";
import { notFound } from "next/navigation";
import IconButton from "@/components/IconButton";

// --- 1. Render Row (Ultimate UI) ---
const renderRow = (item: StudentsList, role: string | null) => (
  <tr
    key={item.id}
    className="group border-b border-gray-100 last:border-none transition-all hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-900/50 dark:bg-darkMode"
  >
    {/* Student Profile */}
    <td className="py-4 pl-8 pr-4 align-middle">
      <div className="flex items-center gap-4">
        {/* Avatar Ring Effect */}
        <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-white p-[2px] shadow-sm ring-1 ring-gray-100 dark:from-gray-800 dark:to-gray-900 dark:ring-gray-800 sm:flex">
          <Avatar
            src={item.img}
            name={item.name}
            gender={item.gender}
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 font-mono">
            #{item.id}
          </p>
        </div>
      </div>
    </td>

    {/* Class (Admin Only) */}
    {role === "admin" && (
      <td className="py-4 px-6 align-middle">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          {item.Class.Grade.level} - {item.Class.section}
        </div>
      </td>
    )}

    {/* Parent Name */}
    <td className="hidden py-4 px-6 align-middle text-sm text-gray-600 dark:text-gray-300 md:table-cell">
      {item.fatherName || (
        <span className="text-gray-300 dark:text-gray-600 italic">No Data</span>
      )}
    </td>

    {/* DOB (Tabular Nums for alignment) */}
    <td className="hidden py-4 px-6 align-middle text-sm text-gray-600 dark:text-gray-300 lg:table-cell font-mono tabular-nums">
      {new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(item.dob))}
    </td>

    {/* Mobile (Tabular Nums) */}
    <td className="hidden py-4 px-6 align-middle text-sm font-medium text-gray-600 dark:text-gray-300 lg:table-cell font-mono tabular-nums">
      {item.phone || (
        <span className="text-gray-300 dark:text-gray-600">-</span>
      )}
    </td>

    {/* Actions */}
    <td className="py-4 pl-4 pr-8 align-middle">
      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity sm:opacity-200 sm:group-hover:opacity-100">
        <Link href={`/list/users/students/${item.id}`}>
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors">
            <Eye className="h-4 w-4" />
          </div>
        </Link>
        {role === "admin" && (
          <StudentStatusDropdown id={item.id} currentStatus={item.status} />
        )}
      </div>
    </td>
  </tr>
);

// --- 2. Dynamic Columns ---
const getColumns = (role: string | null) => [
  { header: "Student", accessor: "name" },
  ...(role === "admin" ? [{ header: "Class", accessor: "class" }] : []),
  {
    header: "Parent",
    accessor: "fatherName",
    className: "hidden md:table-cell",
  },
  { header: "Birth Date", accessor: "dob", className: "hidden lg:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "action", className: "text-right pr-8" },
];

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const {
    page,
    gradeId,
    classId,
    teacherId,
    studentStatus,
    gender,
    ...queryParams
  } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role, classId: teacherClassId } = await fetchUserInfo();
  const columns = getColumns(role);

  // Sorting
  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "classId";

  const search = Array.isArray(queryParams.search)
    ? queryParams.search[0]
    : queryParams.search;
  const teacher = Array.isArray(teacherId) ? teacherId[0] : teacherId;
  const grade = Array.isArray(gradeId) ? gradeId[0] : gradeId;
  const classIdNum = Array.isArray(classId)
    ? Number(classId[0])
    : classId
    ? Number(classId)
    : undefined;

  const classFilter: Prisma.ClassWhereInput = {
    ...(teacher && { supervisorId: teacher }),
    ...(grade && { gradeId: Number(grade) }),
  };

  if (role === "student") {
    return notFound();
  }

  const query: Prisma.StudentWhereInput = {
    status: {
      equals: (studentStatus as $Enums.StudentStatus) || "ACTIVE",
    },

    ...(classIdNum && { classId: classIdNum }),
    ...(Object.keys(classFilter).length && { Class: classFilter }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { id: { contains: search } },
        { phone: { contains: search } },
      ],
    }),
    ...(gender ? { gender: gender as $Enums.Gender } : {}),
    ...(role === "teacher" && teacherClassId
      ? { classId: teacherClassId }
      : {}),
  };

  const classes = await prisma.class.findMany({
    where: gradeId ? { gradeId: Number(gradeId) } : {},
  });

  const grades = await prisma.grade.findMany();

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      orderBy: [
        { [sortKey]: sortOrder },
        { classId: "asc" },
        { gender: "desc" },
        { name: "asc" },
      ],
      where: query,
      select: StudentSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  const Path = `/list/users/students`;

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 p-4 md:p-8 bg-gray-50/50 dark:bg-darkMode">
      {/* --- Page Header --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your school's student directory
          </p>
        </div>

        {/* Primary Action */}
        {role === "admin" && (
          <div className="flex-shrink-0">
            <FormContainer table="student" type="create" />
          </div>
        )}
      </div>

      {/* --- Main Content Surface --- */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-darkMode">
        {/* Toolbar */}
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="w-full xl:max-w-md">
              <TableSearch />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {role === "admin" && (
                <ClassFilterDropdown
                  classes={classes}
                  grades={grades}
                  basePath={Path}
                />
              )}
              <GenderFilter basePath={Path} />
              {role === "admin" && <StudentStatusFilter basePath={Path} />}

              <div className="hidden h-6 w-px bg-gray-200 dark:bg-gray-800 md:block mx-1" />

              <div className="flex items-center gap-2">
                <ResetFiltersButton basePath={Path} />
                <SortButton sortKey="id" />
                <IconButton icon={Filter} />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            renderRow={(item) => renderRow(item, role)}
            data={data}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <Pagination page={parseInt(p)} count={count} />
        </div>
      </div>
    </div>
  );
};

export default StudentListPage;
