import { Prisma } from "@prisma/client";

// -------------------------------
// 🔹 Student List
// -------------------------------
export const StudentSelect = {
  id: true,
  name: true,
  gender: true,
  status: true,
  classId: true,
  fatherName: true,
  phone: true,
  dob: true,
  img: true,
  Class: {
    select: {
      id: true,
      section: true,
      gradeId: true,
      Grade: {
        select: {
          level: true,
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentMinimal = Prisma.StudentGetPayload<{
  select: typeof StudentSelect;
}>;

// -------------------------------
// 🔹 Single Student Page
// -------------------------------

export const SingleStudentSelect = {
  id: true,
  name: true,
  gender: true,
  dob: true,
  email: true,
  phone: true,
  img: true,
  bloodType: true,
  classId: true,
  attendances: {
    select: { date: true, present: true },
  },
  Class: {
    select: {
      id: true,
      section: true,
      gradeId: true,
      Grade: { select: { id: true, level: true } },
      Teacher: { select: { id: true, name: true } },
      _count: { select: { lessons: true } },
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentWithClass = Prisma.StudentGetPayload<{
  select: typeof SingleStudentSelect;
}>;

// -------------------------------
// 🔹 Fees Management Page
// -------------------------------

export const FeeGradeSelect = {
  id: true,
  level: true,
  feestructure: {
    select: {
      id: true,
      term: true,
      termFees: true,
      abacusFees: true,
      startDate: true,
      dueDate: true,
      academicYear: true,
    },
  },
} satisfies Prisma.GradeSelect;

export type GradeWithFees = Prisma.GradeGetPayload<{
  select: typeof FeeGradeSelect;
}>;

// -------------------------------
// 🔹 Single Student Fees Management Page
// -------------------------------

export const SingleStudentFeeSelect = {
  id: true,
  name: true,
  img: true,
  gender: true,
  dob: true,
  bloodType: true,
  email: true,
  phone: true,
  Class: {
    select: {
      id: true,
      section: true,
      gradeId: true,
      Grade: {
        select: {
          id: true,
          level: true,
        },
      },
      Teacher: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          lessons: true,
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

// ✅ Type for the single-student page
export type StudentSingle = Prisma.StudentGetPayload<{
  select: typeof SingleStudentFeeSelect;
}>;

// -------------------------------
// 🔹 Announcement Page
// -------------------------------

export const AnnouncementSelect = {
  id: true,
  title: true,
  date: true,
  description: true,
  classId: true,
  Class: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.AnnouncementSelect;

export type AnnouncementList = Prisma.AnnouncementGetPayload<{
  select: typeof AnnouncementSelect;
}>;

// -------------------------------
// 🔹 Permission Page
// -------------------------------

export const ClassSelect = {
  id: true,
  name: true,
  supervisorId: true,
  Teacher: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ClassSelect;

export type ClassSelect = Prisma.ClassGetPayload<{
  select: typeof AnnouncementSelect;
}>;

// -------------------------------
// 🔹 Homeworks Page
// -------------------------------

export const HomeworkSelect = {
  id: true,
  groupId: true,
  date: true,
  description: true,
  classId: true,
  Class: {
    select: {
      id: true,
      gradeId: true,
      section: true,
      Grade: {
        select: {
          level: true,
        },
      },
    },
  },
} satisfies Prisma.HomeworkSelect;

export type HomeworkList = Prisma.HomeworkGetPayload<{
  select: typeof HomeworkSelect;
}>;

// -------------------------------
// 🔹 Messages Page
// -------------------------------

export const MessagesSelect = {
  id: true,
  type: true,
  date: true,
  message: true,
  studentId: true,
  classId: true,
  Student: {
    select: {
      id: true,
      name: true,
      classId: true,
    },
  },
  Class: {
    select: {
      id: true,
      section: true,
      gradeId: true,
      Grade: {
        select: {
          id: true,
          level: true,
        },
      },
    },
  },
} satisfies Prisma.MessagesSelect;

// ✅ Strongly typed return payload
export type MessagesList = Prisma.MessagesGetPayload<{
  select: typeof MessagesSelect;
}>;

// -------------------------------
// 🔹 Fee Collect Page
// -------------------------------
export const StudentFeeSelect = {
  id: true,
  name: true,
  gender: true,
  fatherName: true,
  phone: true,
  img: true,

  // 👇 Class + Grade
  Class: {
    select: {
      section: true,
      Grade: {
        select: {
          id: true,
          level: true,
        },
      },
    },
  },

  totalFees: {
    select: {
      totalDiscountAmount: true,
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentFeeList =
  Prisma.StudentGetPayload<{
    select: typeof StudentFeeSelect;
  }>;

// -------------------------------
// 🔹 Exam List Page
// -------------------------------
export const ExamListSelect = {
  id: true,
  title: true,

  examGradeSubjects: {
    select: {
      date: true,
      startTime: true,
      maxMarks: true,

      Grade: {
        select: {
          id: true,
          level: true,
        },
      },

      Subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ExamSelect;

export type ExamsList =
  Prisma.ExamGetPayload<{
    select: typeof ExamListSelect;
  }>;


