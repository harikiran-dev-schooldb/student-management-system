import prisma from "@/lib/prisma";
import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "permissions"
  | "subject"
  | "class"
  | "lesson"
  | "exams"
  | "assignment"
  | "attendance"
  | "event"
  | "announcement"
  | "fees"
  | "admin"
  | "fees_structure"
  | "messages"
  | "results"
  | "homework"
  | "examGradeSubjects";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = { grades: subjectGrades, teachers: subjectTeachers };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        relatedData = { subjects: teacherSubjects };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true, },
        });

        const studentClasses = await prisma.class.findMany({
          include: {
            _count: {
              select: {
                studentEnrollments: {
                  where: {
                    status: "ACTIVE",
                    academicYear: { isActive: true },
                  },
                },
              },
            },
            Grade: true,
          },
        });

        const studentFees = await prisma.feeStructure.findMany({
          select: {
            id: true,
            gradeId: true,
            term: true,
            academicYear: true,
            startDate: true,
            dueDate: true,
            termFees: true,
            abacusFees: true,
          },
        });

        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
          feeStructures: studentFees, // ✅ added
        };
        break;

      case "exams":
        const examGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const examSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        relatedData = { grades: examGrades, subjects: examSubjects };
        break;

      case "examGradeSubjects":
        const grades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        const subjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        const exams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });

        relatedData = { grades, subjects, exams };
        break;

      case "lesson":
        const lessonGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        const lessonClasses = await prisma.class.findMany({
          include: {
            _count: {
              select: {
                studentEnrollments: {
                  where: {
                    status: "ACTIVE",
                    academicYear: { isActive: true },
                  },
                },
              },
            },
            Grade: true,
          },
        });

        // Fetch related data for dropdowns or selection options
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true },
        });

        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
          grades: lessonGrades,
        };
        break;

      case "homework":
        const classHomework = await prisma.class.findMany({
          select: { id: true, gradeId: true, section: true }, // ✅ include gradeId
        });

        const gradeHomework = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        relatedData = { classes: classHomework, grades: gradeHomework };
        break;

      case "fees":
        // Fetch Grades
        const gradeFees = await prisma.grade.findMany({
          select: { id: true, level: true }, // ✅ Grade ID & Level
        });

        // Fetch Fees Structure
        const feesGrades = await prisma.feeStructure.findMany({
          select: {
            gradeId: true, // ✅ Link Fees to Grade
            termFees: true,
            abacusFees: true,
            startDate: true,
            dueDate: true,
          },
        });

        relatedData = { grades: gradeFees, fees: feesGrades };
        break;

      case "announcement":
        const classAnnouncement = await prisma.class.findMany({
          select: { id: true, section: true },
        });

        const gradeAnnouncement = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        relatedData = { classes: classAnnouncement, grades: gradeAnnouncement };
        break;

      case "messages":

        // 🔥 BRANCHES

        const branchMessages = await prisma.branch.findMany({
          select: { id: true, name: true },
        });

        // 1️⃣ Grades
        const gradeMessages = await prisma.grade.findMany({

          select: { id: true, level: true },
        });

        // 2️⃣ Students (Active + current academic year)
        const studentMessages = await prisma.student.findMany({
          where: {
            status: "ACTIVE",

            enrollments: {
              some: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
            },
          },
          select: {
            id: true,
            name: true,
            enrollments: {
              where: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
              select: {
                classId: true,
              },
            },
          },
        });

        // 3️⃣ Classes + Active Student Count
        const classMessages = await prisma.class.findMany({

          include: {
            _count: {
              select: {
                studentEnrollments: {
                  where: {
                    status: "ACTIVE",
                    academicYear: { isActive: true },
                  },
                },
              },
            },
            Grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
        });

        relatedData = {
          branches: branchMessages,
          grades: gradeMessages,
          classes: classMessages,
          students: studentMessages,
        };
        break;

      case "permissions":
        // 1️⃣ Grades (school scoped)
        const gradepermissions = await prisma.grade.findMany({

          select: { id: true, level: true },
        });

        // 2️⃣ Classes (school scoped)
        const classpermissions = await prisma.class.findMany({

          select: {
            id: true,
            gradeId: true,
            section: true,
          },
        });

        // 3️⃣ Students (ACTIVE + current academic year)
        const studentpermissionsRaw = await prisma.student.findMany({
          where: {
            status: "ACTIVE",
            enrollments: {
              some: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
            },
          },
          select: {
            id: true,
            name: true,
            enrollments: {
              where: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
              select: {
                classId: true,
              },
            },
          },
        });

        // ✅ FIX: flatten structure
        const studentpermissions = studentpermissionsRaw.map((s) => ({
          id: s.id,
          name: s.name,
          classId: s.enrollments[0]?.classId, // 🔥 KEY FIX
        }));

        relatedData = {
          grades: gradepermissions,
          classes: classpermissions,
          students: studentpermissions,
        };

        break;

      case "results":
        // Fetch grades
        const gradeResults = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        // Fetch exams based on the grade
        const examresults = await prisma.exam.findMany({
          select: {
            id: true,
            title: true,
            examGradeSubjects: {
              select: {
                id: true,
                gradeId: true,
                subjectId: true,
                maxMarks: true,
                date: true,
                startTime: true,
                academicYearId: true,
              },
            },
          }, // Including gradeId to associate exams with grades
        });

        const studentResults = await prisma.student.findMany({
          where: {
            status: "ACTIVE",

            enrollments: {
              some: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
            },
          },
          select: {
            id: true,
            name: true,
            enrollments: {
              where: {
                status: "ACTIVE",
                academicYear: { isActive: true },
              },
              select: {
                classId: true,
              },
            },
          },
        });

        // Fetch subjects based on the exam
        const subjectResults = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        const classesResults = await prisma.class.findMany({
          select: { id: true, section: true, gradeId: true }, // Including gradeId to associate classes with grades
        });

        relatedData = {
          grades: gradeResults, // List of grades
          examGradeSubjects: examresults.flatMap(
            (exam) => exam.examGradeSubjects,
          ), // Flatten the exams and their examGradeSubjects
          students: studentResults, // List of students
          subjects: subjectResults, // List of subjects
          classes: classesResults, // List of classes
        };
        break;

      default:
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
