import Messages from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import TeacherTimetableContainer from "@/components/TeacherTimetableContainer";
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
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* USER INFO CARD */}
          <div className="flex flex-1 gap-4 px-4 py-6 rounded-md bg-LamaSky dark:bg-gray-800">
            <div className="w-1/3">
              <img
                src={teacher.img || (teacher.gender === "Male" ? "/maleteacher.png" : "/femaleteacher.png")}
                alt={teacher.name}
                width={144}
                height={144}
                className="object-cover rounded-full w-24 h-24"
              />
            </div>
            <div className="flex flex-col justify-between w-2/3 gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{teacher.name}</h1>
                {role === "admin" && <FormContainer table="teacher" type="update" data={teacher} />}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <img src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType || "-"}</span>
                </div>
                <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <img src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {teacher.dob
                      ? new Intl.DateTimeFormat("en-GB").format(new Date(teacher.dob))
                      : "Date of birth not available"}
                  </span>
                </div>
                <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <img src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span>
                </div>
                <div className="flex items-center w-full gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <img src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="flex flex-wrap justify-between flex-1 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <img src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{teacher.class?.name}</h1>
                <span className="text-sm text-gray-400 dark:text-gray-300">Class</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <img src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{totalStudents}</h1>
                <span className="text-sm text-gray-400 dark:text-gray-300">Students</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <img src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{teacher._count.subjects}</h1>
                <span className="text-sm text-gray-400 dark:text-gray-300">Subjects</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <img src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{teacher._count.lessons}</h1>
                <span className="text-sm text-gray-400 dark:text-gray-300">Lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TIMETABLE */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-md p-1 h-[850px]">
          <h1 className="text-gray-900 dark:text-gray-100">Teacher&apos;s Schedule</h1>
          <TeacherTimetableContainer teacherId={teacher.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col w-full gap-4 xl:w-1/3">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Shortcuts</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500 dark:text-gray-300">
            <Link
              className="p-3 rounded-md bg-LamaSkyLight dark:bg-LamaSky dark:text-black"
              href={`/list/classes?supervisorId=${teacher.id}`}
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-LamaPurpleLight dark:bg-LamaPurple dark:text-black"
              href={`/list/users/students?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Students
            </Link>
            <Link
              className="p-3 rounded-md bg-LamaYellowLight dark:bg-LamaYellow dark:text-black"
              href={`/list/lessons?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 dark:bg-LamaSky dark:text-black"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-LamaSkyLight dark:bg-LamaPurple dark:text-black"
              href={`/list/subjects?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Subjects
            </Link>
          </div>
        </div>
        <Messages />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
