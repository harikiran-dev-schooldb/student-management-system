import Messages from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
import InfoItem from "@/components/student/InfoItem";
import { cardBase, cardBase1, metricCard } from "@/components/student/studentCardStyles";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TeacherSinglePageProps {
  params: Promise<{ id: string }>;
}

const SingleTeacherPage = async ({ params }: TeacherSinglePageProps) => {
  const { id } = await params;
  const { role } = await fetchUserInfo();

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          Grade: true,
          _count: { select: { students: true, lessons: true } },
        },
      },
      _count: { select: { subjects: true, lessons: true } },
    },
  });

  if (!teacher) return notFound();

  const totalStudents = teacher.class?._count?.students ?? 0;

  return (
    <div className="flex flex-col flex-1 gap-4 p-4 xl:flex-row">
      {/* ================= LEFT ================= */}
      <div className="w-full xl:w-3/4 space-y-4">
        {/* ---------- TOP SECTION ---------- */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* TEACHER CARD */}
          <div className={`${cardBase1} flex flex-1 gap-5 p-6`}>
            <div className="flex items-center justify-center w-24">
              <img
                src={
                  teacher.img ||
                  (teacher.gender === "Male"
                    ? "/maleteacher.png"
                    : "/femaleteacher.png")
                }
                alt={teacher.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-white/10"
              />
            </div>

            <div className="flex flex-col justify-between flex-1 gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {teacher.name}
                </h1>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem icon="blood" value={teacher.bloodType || "-"} />

                <InfoItem
                  icon="calendar"
                  value={
                    teacher.dob
                      ? new Intl.DateTimeFormat("en-GB").format(
                          new Date(teacher.dob)
                        )
                      : "-"
                  }
                />

                <InfoItem
                  icon="mail"
                  value={teacher.email || "-"}
                  large
                  className="sm:col-span-2 lg:col-span-1"
                />

                <InfoItem
                  icon="phone"
                  value={teacher.phone || "-"}
                  large
                  className="sm:col-span-2 lg:col-span-1"
                />
              </div>
            </div>
          </div>

          {/* METRIC CARDS */}
          <div className="flex flex-wrap justify-between flex-1 gap-4">
            <div className={metricCard}>
              <img src="/singleBranch.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {teacher.class?.name || "-"}
                </h2>
                <span className="text-xs text-gray-400">Class</span>
              </div>
            </div>

            <div className={metricCard}>
              <img src="/singleLesson.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {totalStudents}
                </h2>
                <span className="text-xs text-gray-400">Students</span>
              </div>
            </div>

            <div className={metricCard}>
              <img src="/singleClass.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {teacher._count.subjects}
                </h2>
                <span className="text-xs text-gray-400">Subjects</span>
              </div>
            </div>

            <div className={metricCard}>
              <img src="/singleLesson.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {teacher._count.lessons}
                </h2>
                <span className="text-xs text-gray-400">Lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- TIMETABLE ---------- */}
        <div className={`${cardBase} p-4`}>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            Teacher Schedule
          </p>
          <TeacherTimetableContainer teacherId={teacher.id} />
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex flex-col w-full gap-4 xl:w-1/4">
        <div className={`${cardBase} p-4`}>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Shortcuts
          </h2>

          <div className="flex flex-wrap gap-3 text-xs">
            <Shortcut
              href={`/list/classes?supervisorId=${teacher.id}`}
              label="Classes"
            />
            <Shortcut
              href={`/list/users/students?teacherId=${teacher.id}`}
              label="Students"
            />
            <Shortcut
              href={`/list/lessons?teacherId=${teacher.id}`}
              label="Lessons"
            />
          </div>
        </div>

        <div className={`${cardBase} p-4`}>
          <Messages />
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   Shortcut Button
------------------------------*/
const Shortcut = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="px-3 py-2 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition"
  >
    {label}
  </Link>
);

export default SingleTeacherPage;
