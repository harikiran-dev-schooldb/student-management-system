import ClassFilterDropdown, { DateFilter } from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { Exams, SearchParams } from "../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import TitleFilterDropdown from "@/components/TitleFilterDropdown";
import { ExamListSelect } from "../../../../../types/query-types";

// Extended Exam type

const formatDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(combined);
};

const renderRow = (item: Exams, role: string | null) =>
  item.examGradeSubjects.map((egs, idx) => (
    <tr
      key={`${item.id}-${egs.Grade.id}-${egs.Subject.id}-${idx}`}
      className="text-sm border-b border-gray-200 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-gray-700"
    >
      <td className="hidden md:table-cell">
        {formatDateTime(new Date(egs.date), egs.startTime)}
      </td>
      <td className="p-4">{egs.Grade.level}</td>
      <td className="p-4">{egs.Subject.name}</td>
      <td className="p-4">{egs.maxMarks}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  ));

const getColumns = (role: string | null) => [
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  { header: "Grade", accessor: "grade" },
  { header: "Subject", accessor: "subject" },
  { header: "Marks", accessor: "maxMarks" },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const ExamsList = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const { page, date, gradeId, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";
  const { role, students } = await fetchUserInfo();
  const columns = getColumns(role);

  const sortOrder = params.sort === "asc" ? "asc" : "desc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "id";
  const teacherId = Array.isArray(params.teacherId)
    ? params.teacherId[0]
    : params.teacherId;

  let query: Prisma.ExamWhereInput = {};
  let examGradeSubjectsWhere: Prisma.ExamGradeSubjectWhereInput = {};

  // Teacher restriction
  if (role === "teacher" && teacherId) {
    const teacherClasses = await prisma.class.findMany({
      where: { supervisorId: teacherId },
      select: { gradeId: true },
    });
    const teacherGradeIds = teacherClasses.map((cls) => cls.gradeId);
    examGradeSubjectsWhere.gradeId = { in: teacherGradeIds };
  }

  // Student restriction
  // Student restriction (FIXED)
  if (role === "student" && students?.length) {
    const studentId = students[0].studentId;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        Class: {
          select: {
            gradeId: true,
          },
        },
      },
    });

    if (student?.Class?.gradeId) {
      examGradeSubjectsWhere.gradeId = student.Class.gradeId;
    }
  }

  if (role === "student" && !examGradeSubjectsWhere.gradeId) {
    return (
      <p className="text-center text-red-500">
        ⚠️ Unable to determine student grade.
      </p>
    );
  }

  // Date filter
  if (date) {
    const selectedDate = Array.isArray(date) ? date[0] : date;
    const dateObj = new Date(selectedDate);
    examGradeSubjectsWhere.date = {
      gte: startOfDay(dateObj),
      lt: endOfDay(dateObj),
    };
  }

  // Search filter
  if (queryParams.search) {
    const searchValue = Array.isArray(queryParams.search)
      ? queryParams.search[0]
      : queryParams.search;
    examGradeSubjectsWhere.OR = [
      { Subject: { name: { contains: searchValue, mode: "insensitive" } } },
      { Grade: { level: { contains: searchValue, mode: "insensitive" } } },
    ];
  }

  // Grade filter
  if (gradeId) examGradeSubjectsWhere.gradeId = Number(gradeId);

  // Exam title filter
  if (queryParams.title) {
    query.title = {
      contains: Array.isArray(queryParams.title)
        ? queryParams.title[0]
        : queryParams.title,
      mode: "insensitive",
    };
  }

  // Apply conditions
  if (Object.keys(examGradeSubjectsWhere).length > 0)
    query.examGradeSubjects = { some: examGradeSubjectsWhere };

  const [exams, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      orderBy: [{ [sortKey]: sortOrder }, { id: "desc" }],
      select: {
        ...ExamListSelect,
        examGradeSubjects: {
          where: Object.keys(examGradeSubjectsWhere).length
            ? examGradeSubjectsWhere
            : undefined,
          select: ExamListSelect.examGradeSubjects.select,
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),

    prisma.exam.count({ where: query }),
  ]);

  const classes = await prisma.class.findMany();
  const grades = await prisma.grade.findMany();
  const Path = "/list/exams";

  return (
    <div className="flex-1 p-4 m-4 mt-0 bg-white dark:bg-gray-900 rounded-md text-black dark:text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block text-black dark:text-white">
          All Exams
        </h1>
        <div className="flex items-center gap-4">
          <TableSearch />
          <TitleFilterDropdown basePath={Path} />
          <DateFilter basePath={Path} />
          {(role === "admin" || role === "teacher") && (
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
              showClassFilter={false}
            />
          )}
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <ResetFiltersButton basePath={Path} />
            <div className="flex items-center self-end gap-4">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:bg-LamaYellow">
                <img src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:bg-LamaYellow">
                <img src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="exam" type="create" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="space-y-6">
        <Table
          columns={columns}
          renderRow={(item) => renderRow(item, role)}
          data={exams}
        />
      </div>

      {/* PAGINATION */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default ExamsList;
