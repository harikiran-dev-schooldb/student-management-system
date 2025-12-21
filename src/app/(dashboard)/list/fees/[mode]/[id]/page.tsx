import FeesTableContainer from "@/components/fees/FeesTableContainer";
import FormContainer from "@/components/FormContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SingleStudentFeeSelect } from "../../../../../../../types/query-types";

interface StudentFeePageProps {
  params: Promise<{ mode: string; id: string }>;
}

const StudentFeePage = async ({ params }: StudentFeePageProps) => {
  const { mode, id } = await params;
  const { role } = await fetchUserInfo();

  if (mode !== "collect" && mode !== "cancel") {
    notFound();
  }

  const student = await prisma.student.findUnique({
    where: { id },
    select: SingleStudentFeeSelect,
  });

  if (!student) return notFound();

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      {/* TOP ROW */}
      <div className="flex flex-col gap-4 xl:flex-row">
        {/* LEFT COLUMN (USER INFO) */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4">
          {/* USER INFO CARD */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 gap-6 px-6 py-6 rounded-lg bg-LamaSky dark:bg-gray-800">
              <div className="w-1/3 flex items-start justify-center">
                <img
                  src={
                    student.img ||
                    (student.gender === "Male" ? "/male.png" : "/female.png")
                  }
                  alt={student.name}
                  width={144}
                  height={144}
                  className="object-cover rounded-full w-24 h-24"
                />
              </div>
              <div className="flex flex-col justify-between w-2/3 gap-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                    <img src="/blood.png" alt="" width={14} height={14} />
                    <span>{student.bloodType || "-"}</span>
                  </div>
                  <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                    <img src="/date.png" alt="" width={14} height={14} />
                    <span>
                      {student.dob
                        ? new Intl.DateTimeFormat("en-GB").format(
                            new Date(student.dob)
                          )
                        : "Date of birth not available"}
                    </span>
                  </div>
                  <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                    <img src="/mail.png" alt="" width={14} height={14} />
                    <span>{student.email || "-"}</span>
                  </div>
                  <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                    <img src="/phone.png" alt="" width={14} height={14} />
                    <span>{student.phone || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex flex-wrap justify-between gap-4 mt-4">
            {/* Class Name Card */}
            <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-lg flex-1 min-h-[96px]">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {student.Class.Grade.level} - {student.Class.section}
              </h1>
              <span className="text-sm text-gray-400 dark:text-gray-300">
                Class
              </span>
            </div>

            {/* Attendance Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex items-start justify-start flex-1">
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>

            {/* Grade Card */}
            <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-lg flex-1 min-h-[96px]">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {student.Class.gradeId}
              </h1>
              <span className="text-sm text-gray-400 dark:text-gray-300">
                Grade
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (SHORTCUTS) */}
        <div className="flex flex-col w-full gap-4 xl:w-1/3">
          <div className="px-5 py-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500 dark:text-gray-300">
              {student.Class.id && (
                <Link
                  className="p-3 rounded-md bg-LamaYellowLight dark:bg-LamaYellow dark:text-black"
                  href={`/list/homeworks?classId=${student.Class.id}`}
                >
                  Student&apos;s Homeworks
                </Link>
              )}
              <Link
                className="p-3 rounded-md bg-LamaPurpleLight dark:bg-LamaPurple dark:text-black"
                href={`/list/teachers?classId=${student.Class.id}`}
              >
                Student&apos;s Teachers
              </Link>
              <Link
                className="p-3 rounded-md bg-LamaSkyLight dark:bg-LamaSky dark:text-black"
                href={`/list/exams?classId=${student.Class.id}`}
              >
                Student&apos;s Exams
              </Link>
              <Link
                className="p-3 rounded-md bg-LamaSkyLight dark:bg-LamaSky dark:text-black"
                href={`/list/assignments?classId=${student.Class.id}`}
              >
                Student&apos;s Assignments
              </Link>
              <Link
                className="p-3 rounded-md bg-LamaYellowLight dark:bg-LamaYellow dark:text-black"
                href={`/list/results?studentId=${student.id}`}
              >
                Student&apos;s Results
              </Link>
              <Link
                className="p-3 rounded-md bg-LamaPurpleLight dark:bg-LamaPurple dark:text-black"
                href={`/list/lessons?classId=${student.Class.id}`}
              >
                Student&apos;s Lessons
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FEES TABLE BELOW EVERYTHING */}
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 mt-4 overflow-auto">
        <FeesTableContainer studentId={student.id} mode={mode} />
      </div>
    </div>
  );
};

export default StudentFeePage;
