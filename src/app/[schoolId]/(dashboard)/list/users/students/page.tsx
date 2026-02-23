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
import ResetFiltersButton from "@/components/ResetFiltersButton";
import StudentStatusDropdown from "@/components/StudentStatusDropdown";
import { Eye, Filter } from "lucide-react";
import Avatar from "@/components/Avatar";
import { notFound } from "next/navigation";
import IconButton from "@/components/IconButton";
import { SearchParams, StudentsList } from "../../../../../../../types";
import { StudentSelect } from "../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

// --- 1. Render Row (Ultimate UI) ---
const renderRow = (item: StudentsList, role: string | null, schoolId: string) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-LamaPurpleLight dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
  >
    {/* Student Profile */}
    <td className="flex items-center gap-2 p-2">
      {/* Avatar Ring Effect */}
      <Avatar
        src={item.img}
        name={item.name}
        gender={item.gender}
        className="rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold text-darkMode dark:text-gray-100">
          {item.name}
        </h3>
        <p className="text-xs text-darkMode dark:text-gray-300">{item.id}</p>
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
    <td className="hidden py-4 px-6 align-middle text-sm text-darkfg dark:text-gray-300 md:table-cell">
      {item.fatherName || (
        <span className="text-gray-300 dark:text-gray-400 ">No Data</span>
      )}
    </td>

    {/* DOB */}
    <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
      {item.dob
        ? new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "N/A"}
    </td>

    {/* Mobile (Tabular Nums) */}
    <td className="hidden py-4 px-6 align-middle text-sm font-medium text-darkfg dark:text-gray-300 lg:table-cell font-mono tabular-nums">
      {item.phone || (
        <span className="text-gray-300 dark:text-gray-600">-</span>
      )}
    </td>

    {/* Actions */}
    <td className="p-2">
      <div className="flex items-center gap-2">
        <Link href={`/${schoolId}/list/users/students/${item.id}`}>
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-darkfg dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors">
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
  { header: "Student Name", accessor: "name" },
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
  const {
    page,
    gradeId,
    classId,
    teacherId,
    studentStatus,
    gender,
    ...queryParams
  } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role, classId: teacherClassId } = await fetchUserInfo(slug);
  const columns = getColumns(role);

  // Sorting
  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "classId";

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
    schoolId: school.id,
    ...(teacher && { supervisorId: teacher }),
    ...(grade && { gradeId: Number(grade) }),
  };

  if (role === "student") {
    return notFound();
  }

  const db = tenantPrisma(school.id);

  let finalClassId = classIdNum;

  if (role === "teacher" && teacherClassId) {
    finalClassId = teacherClassId;
  }

  const hasClassFilter = teacher || grade;

  const query: Prisma.StudentWhereInput = {
    schoolId: school.id,
    status: {
      equals: (studentStatus as $Enums.StudentStatus) || "ACTIVE",
    },
    ...(finalClassId && { classId: finalClassId }),
    ...(hasClassFilter && { Class: classFilter }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { id: { contains: search } },
        { phone: { contains: search } },
      ],
    }),
    ...(gender ? { gender: gender as $Enums.Gender } : {}),
  };

  const classes = await db.class.findMany({
    where: gradeId ? { gradeId: Number(gradeId) } : {},
  });

  const grades = await db.grade.findMany();

  const allowedSortKeys = ["id", "name", "classId", "gender"];
  const safeSortKey = allowedSortKeys.includes(sortKey) ? sortKey : "classId";

  const [data, count] = await db.$transaction([
    db.student.findMany({
      orderBy: [
        { [safeSortKey]: sortOrder },
        { classId: "asc" },
        { gender: "desc" },
        { name: "asc" },
      ],
      where: query,
      select: StudentSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.student.count({ where: query }),
  ]);

  const Path = `/${slug}/list/users/students`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-darkbg">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
          All Students ({count})
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          {role === "admin" && (
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
            />
          )}
          <GenderFilter basePath={Path} />
          {role === "admin" && <StudentStatusFilter basePath={Path} />}

          <div className="flex items-center gap-4">
            <ResetFiltersButton basePath={Path} />
            <SortButton sortKey="id" />
            <IconButton icon={Filter} />
            {/* Primary Action */}
            {role === "admin" && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Table View */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role, slug)}
        data={data}
      />

      {/* Footer */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default StudentListPage;
