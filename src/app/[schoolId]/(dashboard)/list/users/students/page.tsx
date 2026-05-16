import ClassFilterDropdown, {
  GenderFilter,
  StudentStatusFilter,
} from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { $Enums, Prisma } from "@prisma/client";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { Eye, Filter } from "lucide-react";
import { notFound } from "next/navigation";
import IconButton from "@/components/IconButton";
import { SearchParams, StudentsList } from "../../../../../../../types";
import { StudentSelect } from "../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import StudentCard from "@/components/StudentCard";
import {
  buildClassHierarchyFilter,
  buildEnrollmentFilter,
} from "@/lib/filters/buildHierarchyFilter";
import Table from "@/components/Table";
import StudentStatusDropdown from "@/components/StudentStatusDropdown";
import Avatar from "@/components/Avatar";
import Link from "next/link";

// --- 1. Render Row (Ultimate UI) ---
const renderRow = (
  item: StudentsList,
  role: string | null,
  schoolId: string,
) => (
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
        <p className="text-xs text-darkMode dark:text-gray-300">
          {item.admissionNo}
        </p>
      </div>
    </td>

    {/* Class (Admin Only) */}
    {role === "admin" && (
      <td className="py-4 px-6 align-middle">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          {item.enrollments[0]?.class.Grade.level} -{" "}
          {item.enrollments[0]?.class.section}
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
  { header: "Student", accessor: "name", sortable: true },
  ...(role === "admin"
    ? [{ header: "Class", accessor: "class", sortable: true }]
    : []),
  {
    header: "Parent",
    accessor: "fatherName",
    className: "hidden md:table-cell",
  },
  {
    header: "Birth Date",
    accessor: "dob",
    className: "hidden lg:table-cell",
    sortable: true,
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
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
    teacherId: teacherFilterId,
    studentStatus,
    gender,
    ...queryParams
  } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role, teacherId: activeTeacherId } = await fetchUserInfo(slug);
  const columns = getColumns(role);

  // Sorting
  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "classId";

  const search = Array.isArray(queryParams.search)
    ? queryParams.search[0]
    : queryParams.search;

  if (role === "student") {
    return notFound();
  }

  const db = tenantPrisma(school.id);

  const classes = await db.class.findMany({
    where: buildClassHierarchyFilter({
      branchId: resolvedSearchParams.branchId,
      gradeId,
      classId,
    }),
  });

  const branches = await db.branch.findMany();

  const enrollmentFilter = buildEnrollmentFilter({
    branchId: resolvedSearchParams.branchId,
    gradeId,
    classId,
  });

  if (role === "teacher" && activeTeacherId) {
    enrollmentFilter.class = {
      ...(enrollmentFilter.class ?? {}),

      teacherClassAssignments: {
        some: {
          teacherId: activeTeacherId,
          academicYear: { isActive: true },
          schoolId: school.id,
        },
      },
    } as Prisma.ClassWhereInput;
  }

  const query: Prisma.StudentWhereInput = {
    schoolId: school.id,
    status: {
      equals: (studentStatus as $Enums.StudentStatus) || "ACTIVE",
    },

    enrollments: {
      some: {
        ...enrollmentFilter,
        academicYear: { isActive: true },
      },
    },

    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { admissionNo: { contains: search } },
        { phone: { contains: search } },
      ],
    }),

    ...(gender ? { gender: gender as $Enums.Gender } : {}),
  };

  const grades = await db.grade.findMany();

  const allowedSortKeys = ["admissionNo", "name", "gender"];
  const safeSortKey = allowedSortKeys.includes(sortKey)
    ? sortKey
    : "admissionNo";

  const [data, count] = await db.$transaction([
    db.student.findMany({
      orderBy: [
        { [safeSortKey]: sortOrder },
        { admissionNo: "asc" },
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
              branches={branches}
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

      {data.length === 0 ? (
        <div className="p-10 text-center text-slate-500">No students found</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block mt-4">
            <Table
              columns={columns}
              renderRow={(item) => renderRow(item, role, slug)}
              data={data}
              sortKey={sortKey}
              sortOrder={sortOrder}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mt-4">
            {data.map((item) => (
              <StudentCard key={item.id} item={item} slug={slug} />
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default StudentListPage;
