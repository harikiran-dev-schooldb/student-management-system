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
import ResetFiltersButton from "@/components/ResetFiltersButton";
import TitleFilterDropdown from "@/components/TitleFilterDropdown";
import SortButton from "@/components/SortButton";
import IconButton from "@/components/IconButton";
import { Filter } from "lucide-react";
import { Exams, SearchParams } from "../../../../../../types";
import { ExamListSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";

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
      className="text-sm border-b border-gray-200 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-grey-olive-950"
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
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { schoolId: slug } = resolvedParams;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    throw new Error("Invalid school");
  }

  const userInfo = await fetchUserInfo(slug);
  const { role, studentId, gradeId, teacherId } = userInfo;
  const {
    page,
    date,
    gradeId: searchGradeId,
    ...queryParams
  } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";
  const columns = getColumns(role);

  const sortOrder = resolvedSearchParams.sort === "asc" ? "asc" : "desc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "id";

  const db = tenantPrisma(school.id);
  const query: Prisma.ExamWhereInput = { schoolId: school.id };
  const examGradeSubjectsWhere: Prisma.ExamGradeSubjectWhereInput = {};

  // Teacher restriction
  let teacherGradeIds: number[] | null = null;

  if (role === "teacher" && teacherId) {
    const teacherClasses = await db.class.findMany({
      where: {
        supervisorId: teacherId,
        schoolId: school.id,
      },
      select: { gradeId: true },
    });

    teacherGradeIds = teacherClasses.map((cls) => cls.gradeId);
    examGradeSubjectsWhere.gradeId = { in: teacherGradeIds };
  }

  // Student restriction
  if (role === "student" && gradeId) {
    examGradeSubjectsWhere.gradeId = gradeId;
  }

  if (role === "student" && !examGradeSubjectsWhere.gradeId) {
    return (
      <p className="text-center text-red-500">
        ⚠️ Unable to determine student grade.
      </p>
    );
  }

  // Grade filter from query params (safe)
  if (searchGradeId) {
    const parsedGradeId = Number(
      Array.isArray(searchGradeId) ? searchGradeId[0] : searchGradeId,
    );

    if (!Number.isNaN(parsedGradeId)) {
      if (role === "admin") {
        examGradeSubjectsWhere.gradeId = parsedGradeId;
      }

      if (role === "teacher") {
        const existing = examGradeSubjectsWhere.gradeId;

        if (
          existing &&
          typeof existing === "object" &&
          "in" in existing &&
          Array.isArray(existing.in)
        ) {
          if (existing.in.includes(parsedGradeId)) {
            examGradeSubjectsWhere.gradeId = parsedGradeId;
          }
        }
      }
    }
  }

  if (searchGradeId && role === "teacher" && teacherGradeIds) {
    const parsed = Number(searchGradeId);

    if (teacherGradeIds.includes(parsed)) {
      examGradeSubjectsWhere.gradeId = parsed;
    }
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

  const [data, count] = await db.$transaction([
    db.exam.findMany({
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

    db.exam.count({ where: query }),
  ]);

  const classes = await db.class.findMany();
  const grades = await db.grade.findMany();
  const Path = `${school.id}/list/exams`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-darkbg">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">Exams</h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
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
            <div className="flex items-center self-end gap-4">
              <ResetFiltersButton basePath={Path} />
              <IconButton icon={Filter} />
              <SortButton sortKey="id" />
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="exam" type="create" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* PAGINATION */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default ExamsList;
