export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
import ClassFilterDropdown from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import TeacherFilterDropdown from "@/components/dropdowns/teachers";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import TableSearch from "@/components/TableSearch";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { SearchParams } from "../../../../../../types";

const LessonsListPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const { schoolId: slug } = await params;
  const resolvedSearchParams = await searchParams;

  // 2️⃣ Resolve internal school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) throw new Error("Invalid school");

  const {
    role,
    teacherId: userTeacherId,
    classId: userClassId,
  } = await fetchUserInfo(slug);

  // 3️⃣ Tenant-scoped Prisma
  const db = tenantPrisma(school.id);

  // Normalize query params
  const selectedTeacherId = Array.isArray(resolvedSearchParams.teacherId)
    ? resolvedSearchParams.teacherId[0]
    : resolvedSearchParams.teacherId;

  const selectedClassId = Array.isArray(resolvedSearchParams.classId)
    ? Number(resolvedSearchParams.classId[0])
    : resolvedSearchParams.classId
    ? Number(resolvedSearchParams.classId)
    : undefined;

  // Fetch data for dropdowns
  const classes = await db.class.findMany({
    select: { id: true, section: true, gradeId: true },
  });
  const grades = await db.grade.findMany({
    select: { id: true, level: true },
  });
  const teachers = await db.teacher.findMany({
    select: { id: true, name: true },
  });

  const classData = classes.map((cls) => ({
    id: cls.id,
    section: cls.section,
    gradeId: cls.gradeId ?? 0,
  }));

  const gradeData = grades.map((g) => ({ id: g.id, level: g.level }));
  const teacherData = teachers.map((t) => ({ id: t.id, name: t.name }));

  const Path = `/${slug}/list/lessons`;

  const fallbackClassId = classes[0]?.id;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-darkMode text-black dark:text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="hidden text-lg font-semibold md:block">Schedule</h1>

        {/* Filters only for admin */}
        {role === "admin" && (
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="order-1 md:order-1 w-full md:w-auto">
                <TableSearch />
              </div>

              {/* Teacher */}
              <div className="order-2 md:order-2 w-full md:w-auto">
                <TeacherFilterDropdown teachers={teacherData} />
              </div>

              {/* Class (anchor point for mobile) */}
              <div className="order-3 md:order-3 w-full md:w-auto">
                <ClassFilterDropdown
                  classes={classData}
                  grades={gradeData}
                  basePath={Path}
                />
              </div>

              {/* Reset + Create → same line */}
              <div className="order-4 md:order-4 flex items-center gap-2 w-full md:w-auto md:justify-end">
                <ResetFiltersButton basePath={Path} />
                <FormContainer table="lesson" type="create" />
              </div>

              {/* Create Lesson → LAST on mobile */}
              <div className="order-5 md:order-5 w-full md:w-auto"></div>
            </div>
          </div>
        )}
      </div>
      {role === "admin" ? (
        selectedTeacherId ? (
          <TeacherTimetableContainer teacherId={selectedTeacherId} />
        ) : fallbackClassId ? (
          <ClassTimetableContainer
            classId={selectedClassId || fallbackClassId}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No classes available
          </p>
        )
      ) : role === "teacher" && userTeacherId ? (
        <TeacherTimetableContainer teacherId={userTeacherId} />
      ) : role === "student" && userClassId ? (
        <ClassTimetableContainer classId={userClassId} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No timetable available
        </p>
      )}
    </div>
  );
};

export default LessonsListPage;
