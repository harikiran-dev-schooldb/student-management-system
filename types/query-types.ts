import { Prisma } from "@prisma/client";

// -------------------------------
// 🔹 Student List
// -------------------------------
export const StudentSelect = {
  id: true,
  admissionNo: true,
  name: true,
  gender: true,
  status: true,
  fatherName: true,
  phone: true,
  dob: true,
  img: true,

  /* ---------------- CURRENT ENROLLMENT ---------------- */
  enrollments: {
    where: {
      status: "ACTIVE",
      academicYear: { isActive: true },
    },
    select: {
      class: {
        select: {
          id: true,
          section: true,
          gradeId: true,
          name: true,

          Grade: {
            select: {
              level: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
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
  admissionNo: true,
  name: true,
  gender: true,
  fatherName: true,
  dob: true,
  email: true,
  phone: true,
  img: true,
  bloodType: true,
  status: true,

  /* ---------------- ATTENDANCE ---------------- */
  attendances: {
    select: {
      date: true,
      present: true,
    },
  },

  /* ---------------- CURRENT ENROLLMENT ---------------- */
  enrollments: {
    where: {
      status: "ACTIVE",
      academicYear: { isActive: true },
    },
    select: {
      class: {
        select: {
          id: true,
          section: true,
          gradeId: true,
          name: true,

          /* -------- GRADE -------- */
          Grade: {
            select: {
              id: true,
              level: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },

          /* ✅ CLASS SUPERVISOR (via assignment) */
          teacherClassAssignments: {
            where: {
              academicYear: { isActive: true },
              role: "SUPERVISOR",
            },
            select: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          /* -------- LESSON COUNT -------- */
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentWithClass = Prisma.StudentGetPayload<{
  select: typeof SingleStudentSelect;
}>;

// -------------------------------
// 🔹 Teacher List Page
// -------------------------------
export const SingleTeacherSelect = {
  id: true,
  username: true,
  name: true,
  parentName: true,
  email: true,
  phone: true,
  address: true,
  img: true,
  bloodType: true,
  gender: true,
  dob: true,
  status: true,
  createdAt: true,
  leftAt: true,
  leftReason: true,

  /* ---------------- PROFILE ---------------- */
  profile: {
    select: {
      id: true,
      clerk_id: true,
      phone: true,
    },
  },

  /* ---------------- CLASS ASSIGNMENTS ---------------- */
  teacherClassAssignments: {
    where: {
      academicYear: {
        isActive: true,
      },
    },
    select: {
      role: true,

      class: {
        select: {
          id: true,
          name: true,
          section: true,

          Grade: {
            select: {
              id: true,
              level: true,

              branch: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },

          /* Student count in class */
          _count: {
            select: {
              studentEnrollments: true,
            },
          },
        },
      },
    },
  },

  /* ---------------- SUBJECTS TEACHING ---------------- */
  subjects: {
    select: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },

      class: {
        select: {
          id: true,
          name: true,
          section: true,

          Grade: {
            select: {
              level: true,
            },
          },
        },
      },
    },
  },

  /* ---------------- LESSONS (TIMETABLE) ---------------- */
  lessons: {
    select: {
      id: true,
      title: true,
      day: true,
      period: true,

      Subject: {
        select: {
          id: true,
          name: true,
        },
      },

      Class: {
        select: {
          id: true,
          name: true,
          section: true,
        },
      },
    },
  },

  /* ---------------- COUNTS ---------------- */
  _count: {
    select: {
      lessons: true,
      subjects: true,
      teacherClassAssignments: true,
    },
  },
} satisfies Prisma.TeacherSelect;

export type TeacherWithDetails = Prisma.TeacherGetPayload<{
  select: typeof SingleTeacherSelect;
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
  fatherName: true,

  enrollments: {
    where: {
      status: "ACTIVE",
      academicYear: { isActive: true },
    },
    select: {
      class: {
        select: {
          id: true,
          section: true,
          gradeId: true,
          name: true,

          Grade: {
            select: {
              id: true,
              level: true,
            },
          },

          /* ✅ CLASS SUPERVISOR (via assignment) */
          teacherClassAssignments: {
            where: {
              academicYear: { isActive: true },
              role: "SUPERVISOR",
            },
            select: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          _count: {
            select: {
              lessons: true,
            },
          },
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
  section: true,
  gradeId: true,

  Grade: {
    select: {
      id: true,
      level: true,
    },
  },

  teacherClassAssignments: {
    where: {
      academicYear: { isActive: true },
      role: "SUPERVISOR", // if you added role enum
    },
    select: {
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ClassSelect;

export type ClassSelectType = Prisma.ClassGetPayload<{
  select: typeof ClassSelect;
}>;

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

  /* ---------------- STUDENT ---------------- */
  Student: {
    select: {
      id: true,
      admissionNo: true,
      name: true,

      enrollments: {
        where: {
          status: "ACTIVE",
          academicYear: { isActive: true },
        },
        select: {
          class: {
            select: {
              id: true,
              name: true,
              gradeId: true,
            },
          },
        },
      },
    },
  },

  /* ---------------- CLASS ---------------- */
  Class: {
    select: {
      id: true,
      section: true,
      gradeId: true,
      name: true,
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
  admissionNo: true,
  name: true,
  gender: true,
  fatherName: true,
  phone: true,
  img: true,

  /* ---------------- CURRENT ENROLLMENT ---------------- */
  enrollments: {
    where: {
      status: "ACTIVE",
      academicYear: { isActive: true },
    },
    select: {
      class: {
        select: {
          id: true,
          section: true,
          name: true,
          gradeId: true,
          Grade: {
            select: {
              id: true,
              level: true,
            },
          },
        },
      },
    },
  },

  /* ---------------- FEE TRANSACTIONS ---------------- */
  feeTransactions: {
    select: {
      id: true,
      receiptNo: true,
    },
  },

  /* ---------------- TOTAL FEES ---------------- */
  totalFees: {
    where: {
      academicYear: { isActive: true }, // very important
    },
    select: {
      totalDiscountAmount: true,
    },
  },
} satisfies Prisma.StudentSelect;

export type StudentFeeList = Prisma.StudentGetPayload<{
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

      grade: {
        select: {
          id: true,
          level: true,
        },
      },

      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ExamSelect;

export type ExamsList = Prisma.ExamGetPayload<{
  select: typeof ExamListSelect;
}>;

// -------------------------------
// 🔹 Profile With User
// -------------------------------

export const ProfileWithUsersSelect = {
  activeUser: {
    select: {
      username: true,
    },
  },
  users: {
    select: {
      id: true,
      username: true,
      role: true,

      /* ---------------- ADMIN ---------------- */
      admin: {
        select: {
          name: true,
          img: true,
        },
      },

      /* ---------------- TEACHER ---------------- */
      teacher: {
        select: {
          name: true,
          img: true,
          teacherClassAssignments: {
            where: {
              academicYear: { isActive: true },
              role: "SUPERVISOR",
            },
            select: {
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      /* ---------------- STUDENT ---------------- */
      student: {
        select: {
          id: true,
          name: true,
          img: true,
          enrollments: {
            where: {
              status: "ACTIVE",
              academicYear: { isActive: true },
            },
            select: {
              class: {
                select: {
                  id: true,
                  name: true,
                  gradeId: true,
                  Grade: {
                    select: {
                      branch: {
                        select: {
                          id: true,
                          name: true,
                          type: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProfileSelect;

export type ProfileWithUsers = Prisma.ProfileGetPayload<{
  select: typeof ProfileWithUsersSelect;
}>;

// -------------------------------
// 🔹 Permission Slip List Page
// -------------------------------

export const PermissionSlipSelect = {
  id: true,
  timeIssued: true,
  date: true,
  leaveType: true,
  description: true,
  withWhom: true,
  relation: true,
  studentId: true,

  /* ---------------- STUDENT ---------------- */
  student: {
    select: {
      id: true,
      name: true,
      admissionNo: true,

      /* -------- CURRENT ENROLLMENT -------- */
      enrollments: {
        where: {
          status: "ACTIVE",
          academicYear: { isActive: true },
        },
        select: {
          academicYearId: true,
          class: {
            select: {
              id: true,
              section: true,
              name: true,
              gradeId: true,

              /* -------- GRADE -------- */
              Grade: {
                select: {
                  id: true,
                  level: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PermissionSlipSelect;

export type PermissionSlipWithStudent = Prisma.PermissionSlipGetPayload<{
  select: typeof PermissionSlipSelect;
}>;

// -------------------------------
// 🔹 Teachers List Page
// -------------------------------
export const TeachersSelect = {
  id: true,
  username: true,
  name: true,
  gender: true,
  phone: true,
  img: true,
  dob: true,
  address: true,
  status: true,

  teacherClassAssignments: {
    where: {
      academicYear: { isActive: true },
    },
    select: {
      class: {
        select: {
          id: true,
          name: true,
          gradeId: true,
          section: true,
          Grade: {
            select: {
              id: true,
              level: true,
              subjects: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.TeacherSelect;

export type TeachersWithSelect = Prisma.TeacherGetPayload<{
  select: typeof TeachersSelect;
}>;
