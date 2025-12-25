import prisma from "@/lib/prisma";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
import ClassFilterDropdown from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import TeacherFilterDropdown from "@/components/dropdowns/teachers";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import TableSearch from "@/components/TableSearch";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const dynamic = "force-dynamic";

const LessonsListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams;
  const { role, teacherId: userTeacherId, classId: userClassId } = await fetchUserInfo();

  // Normalize query params
  const selectedTeacherId = Array.isArray(params.teacherId)
    ? params.teacherId[0]
    : params.teacherId;
  const selectedClassId = Array.isArray(params.classId)
    ? Number(params.classId[0])
    : params.classId
    ? Number(params.classId)
    : undefined;

  // Fetch data for dropdowns
  const classes = await prisma.class.findMany({ select: { id: true, section: true, gradeId: true } });
  const grades = await prisma.grade.findMany({select: { id: true, level: true }});
  const teachers = await prisma.teacher.findMany({select: { id: true, name: true }});

  const classData = classes.map((cls) => ({
    id: cls.id,
    section: cls.section,
    gradeId: cls.gradeId ?? 0,
  }));

  const gradeData = grades.map((g) => ({ id: g.id, level: g.level }));
  const teacherData = teachers.map((t) => ({ id: t.id, name: t.name }));

  const Path = "/list/lessons";

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-black dark:text-white">Timetable</h1>

        {/* Filters only for admin */}
        {role === "admin" && (
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <div className="flex flex-wrap gap-4">
              <TableSearch />
              <TeacherFilterDropdown teachers={teacherData}  />
              <ClassFilterDropdown
                classes={classData}
                grades={gradeData}
                basePath={Path}
              />
              <FormContainer table="lesson" type="create" />
              <ResetFiltersButton basePath={Path} />
            </div>
          </div>
        )}
      </div>

      {/* Role-based timetable rendering */}
      {role === "admin" ? (
        selectedTeacherId ? (
          <TeacherTimetableContainer teacherId={selectedTeacherId} />
        ) : (
          <ClassTimetableContainer
            classId={selectedClassId || classes[0]?.id || 1}
          />
        )
      ) : role === "teacher" ? (
        <TeacherTimetableContainer teacherId={userTeacherId || ""} />
      ) : role === "student" ? (
        <ClassTimetableContainer classId={userClassId || classes[0]?.id || 1} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No timetable available</p>
      )}
    </div>
  );
};

export default LessonsListPage;
