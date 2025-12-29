import Messages from "@/components/Announcements";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ClassTimetableContainer from "@/components/ClassTimetableContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import InfoItem from "@/components/student/InfoItem";
import { cardBase, metricCard } from "@/components/student/studentCardStyles";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SingleStudentSelect } from "../../../../../../../types/query-types";

interface StudentSinglePageProps {
  params: Promise<{ id: string }>;
}

const SingleStudentPage = async ({ params }: StudentSinglePageProps) => {
  const { id } = await params;
  const { role } = await fetchUserInfo();

  const student = await prisma.student.findUnique({
    where: { id },
    select: SingleStudentSelect,
  });

  if (!student) return notFound();

  return (
    <div className="flex flex-col flex-1 gap-4 p-4 xl:flex-row">
      {/* ================= LEFT ================= */}
      <div className="w-full xl:w-3/4 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* USER CARD */}
          <div className={`${cardBase} flex flex-1 gap-5 p-6`}>
            <div className="flex items-center justify-center w-24">
              <img
                src={
                  student.img ||
                  (student.gender === "Male" ? "/male.png" : "/female.png")
                }
                alt={student.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-white/10"
              />
            </div>

            <div className="flex flex-col justify-between flex-1 gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {student.name}
                </h1>
                {role === "admin" && (
                  <FormContainer
                    table="student"
                    type="update"
                    data={{
                      ...student,
                      dob: student.dob
                        ? student.dob.toISOString().split("T")[0]
                        : "",
                    }}
                  />
                )}
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem icon="blood" value={student.bloodType || "-"} />

                <InfoItem
                  icon="calendar"
                  value={
                    student.dob
                      ? new Intl.DateTimeFormat("en-GB").format(
                          new Date(student.dob)
                        )
                      : "-"
                  }
                />

                <InfoItem
                  icon="mail"
                  value={student.email || "-"}
                  className="sm:col-span-2 lg:col-span-1"
                />

                <InfoItem
                  icon="phone"
                  value={student.phone || "-"}
                  className="sm:col-span-2 lg:col-span-1"
                />
              </div>
            </div>
          </div>

          {/* METRIC CARDS */}
          <div className="flex flex-wrap justify-between flex-1 gap-4">
            <div className={metricCard}>
              <img src="/singleAttendance.png" className="w-6 h-6 opacity-80" />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>

            <div className={metricCard}>
              <img src="/singleBranch.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {student.Class.gradeId}
                </h2>
                <span className="text-xs text-gray-400">Grade</span>
              </div>
            </div>

            <div className={metricCard}>
              <img src="/singleLesson.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {student.Class._count.lessons}
                </h2>
                <span className="text-xs text-gray-400">Lessons</span>
              </div>
            </div>

            <div className={metricCard}>
              <img src="/singleClass.png" className="w-6 h-6 opacity-80" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {student.Class.Grade.level} – {student.Class.section}
                </h2>
                <span className="text-xs text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>

        {/* TIMETABLE */}
        <div className={`${cardBase} p-4`}>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
            Student Schedule
          </p>
          <ClassTimetableContainer classId={student.Class.id} />
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex flex-col gap-4 w-full xl:w-1/4">
        <div className={`${cardBase} p-3`}>
          <AttendanceCalendar
            attendanceData={student.attendances.map((a) => ({
              date: a.date,
              present: a.present,
            }))}
          />
        </div>

        <div className={`${cardBase} p-4`}>
          <Messages />
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;
