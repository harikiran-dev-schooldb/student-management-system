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
import { Eye, Filter, UserRound } from "lucide-react";
import Avatar from "@/components/Avatar";
import { notFound } from "next/navigation";

// Render a single table row
const renderRow = (item: StudentsList, role: string | null) => (
  <tr
    className="text-sm border-b border-gray-200 even:bg-LamaHover hover:bg-LamaHover dark:border-[#6366F10D] dark:even:bg-gray-800 dark:hover:bg-[#6366F10D]"
    key={item.id}
  >
    <td className="flex items-center gap-2 p-2">
      <div
        className="w-10 h-10 rounded-full
             flex items-center justify-center
             bg-gray-100 dark:bg-gray-800
             md:hidden xl:flex"
      >
        <Avatar
          src={item.img}
          name={item.name}
          gender={item.gender}
          className="md:hidden xl:flex"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs">{item.id}</p>
      </div>
    </td>

    {role === "admin" && (
      <td>
        {item.Class.Grade.level} - {item.Class.section}
      </td>
    )}
    <td className="hidden md:table-cell">{item.fatherName || "N/A"}</td>
    <td className="hidden md:table-cell">
      {new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, "-")}
    </td>
    <td className="hidden md:table-cell">{item.phone}</td>

    <td className="p-2">
      <div className="flex items-center gap-2">
        <Link href={`/list/users/students/${item.id}`}>
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaBlueLight hover:opacity-90">
            <Eye className="w-4 h-4 text-white" />
          </button>
        </Link>

        {role === "admin" && (
          <>
            {/* <FormContainer table="student" type="delete" id={item.id} /> */}
            <StudentStatusDropdown id={item.id} currentStatus={item.status} />
          </>
        )}
      </div>
    </td>
  </tr>
);

// Define table columns dynamically based on role
const getColumns = (role: string | null) => [
  { header: "Student Name", accessor: "name" },
  ...(role === "admin" ? [{ header: "Class", accessor: "class" }] : []),
  {
    header: "Parent Name",
    accessor: "fatherName",
    className: "hidden md:table-cell",
  },
  { header: "DOB", accessor: "dob", className: "hidden md:table-cell" },
  { header: "Mobile", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
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
    <div className="flex-1 p-4 mt-0 bg-white dark:bg-gray-900">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
          All Students ({count})
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
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
          <GenderFilter basePath={Path} />
          {role === "admin" && (
            <>
              <StudentStatusFilter basePath={Path} />
            </>
          )}
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <div className="flex items-center gap-4">
              <ResetFiltersButton basePath={Path} />
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaBlue dark:bg-LamaBlue">
                <Filter className="w-4 h-4 text-white" />
              </button>
              <SortButton sortKey="id" />
              {role === "admin" && (
                <FormContainer table="student" type="create" />
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

export default StudentListPage;
