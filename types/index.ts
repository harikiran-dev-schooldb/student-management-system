// types/index.ts

import {
  Announcement,
  Attendance,
  Exam,
  FeeTransaction,
  Gender,
  Grade,
  Messages,
  PaymentMode,
  Prisma,
  Student,
} from "@prisma/client";
import { ClassSelect } from "./query-types";

export type FeeType = "TUITION" | "BUS" | "EXAM" | "OTHER";

export type CurrentEnrollment = {
  academicYearId: number;
  class: {
    id: number;
    name: string | null;
    section: string;
    gradeId: number;

    Grade: {
      id: number;
      level: string;
    };
  };
};

export type FeeCycle = {
  id: number;
  name: string;
  startDate: Date;
  dueDate: Date;
  type: string;
  order: number;
};

export type FeeStructure = {
  id: number;
  gradeId: number;
  feeCycleId: number;
  feeType: FeeType; // or enum later
  amount: number;
  academicYearId: number;
};

export type FeeStructureWithRelations = FeeStructure & {
  feeCycle?: FeeCycle;
};

export type GenderStat = {
  gender: Gender;
  _count: number;
};

export type AttendanceRecord = {
  date: string;
  present: number;
};

export type FinanceRecord = {
  date: string;
  collected: number;
};

export type UserCounts = {
  adminCount: number;
  teacherCount: number;
  studentCount: number;
};

export type AdminDashboardData = UserCounts & {
  genderStats: GenderStat[];
  attendance: AttendanceRecord[];
  finance: FinanceRecord[];
  events: any[];
};

// Define individual StudentFees entry
export type StudentFees = {
  id: number;
  studentId: string;
  feeStructureId: number;
  feeCycleId: number;

  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;

  receiptDate?: string | null;
  receiptNo?: string | null;
  remarks?: string | null;

  paymentMode?: PaymentMode;

  feeStructure?: FeeStructure;
  feeCycle?: FeeCycle;
};

// Define StudentTotalFees entry
export type StudentTotalFees = {
  id: number;
  studentId: string;
  schoolId: string;
  academicYearId: number;

  totalPaidAmount: number;
  totalDiscountAmount: number;
  totalFineAmount: number;
  totalAbacusAmount: number;
  totalFeeAmount: number;
  dueAmount: number;
};

// types.ts
export type MessageType =
  | "ABSENT"
  | "FEE_RELATED"
  | "ANNOUNCEMENT"
  | "GENERAL"
  | "HOMEWORK"
  | "EXAM_RESULT"
  | "EVENT"
  | "PERMISSION_SLIP"
  | "FEE_COLLECTION";

export type MessageContext = {
  studentName: string;
  className?: string | null;
  schoolName: string;

  amount?: number;
  feeCycleName?: string;
  date?: Date;

  additionalInfo?: string;

  // Permission
  leaveType?: string;
  withWhom?: string;
  relation?: string;

  // Exam
  marks?: string;
  examName?: string;

  // Homework
  subject?: string;
  dueDate?: Date;

  // Event
  eventName?: string;
};

export type CurrentState = { success: boolean; error: boolean };

// types.ts
export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type PageProps = {
  params: Promise<{ schoolId: string }>;
  searchParams?: Promise<SearchParams>;
};

export interface StudentAttendancePageProps {
  params: Promise<{ id: string }>;
}

export interface StudentFeesTable {
  id: number;
  studentId: string;
  feeStructureId: number;
  feeCycleId: number;

  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;

  receivedDate: string | null;
  receiptDate: string | null;

  paymentMode: string;

  feeStructure: FeeStructure;
  feeCycle: FeeCycle;

  feeTransactions: FeeTransaction[];

  receiptNo?: string | null;
  remarks?: string | null;
  updatedByName?: string | null;
}

export type Mode = "collect" | "cancel";

// types/index.ts
export type SafeUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  email?: string;
  role?: string | null; // make role flexible
};

export const dropdownUI =
  "w-full py-2 pl-4 pr-10 text-sm rounded-full appearance-none md:w-auto " +
  "border border-gray-300 text-gray-700 bg-white " +
  "focus:ring-2 focus:ring-LamaSky focus:outline-none " +
  "dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800";

export interface StudentFee {
  id: number;

  /* ---------- Core ---------- */
  studentId: string;
  academicYearId: number;
  feeCycleId: number;

  /* ---------- Amounts ---------- */
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;

  /* ---------- Payment Info ---------- */
  receiptDate?: string | null;
  receiptNo?: string | null;
  remarks?: string | null;
  paymentMode?: PaymentMode | null;

  /* ---------- Relations ---------- */
  academicYear?: {
    id: number;
    name: string;
  } | null;

  feeCycle?: {
    id: number;
    name: string;
  } | null;

  /* ---------- Fee Definition ---------- */
  feeStructure?: {
    id: number;
    amount: number;
    feeType: FeeType;
  } | null;

  /* ---------- Optional: Transactions ---------- */
  feeTransactions?: {
    id?: number;
    receiptNo?: string | null;
    amount?: number;
    date?: string;
  }[];
}

export type PermissionWithRelations = {
  id: number;
  timeIssued: Date;
  date: Date;
  leaveType: string;
  description: string | null;
  withWhom: string | null;
  relation: string | null;
  studentId: string;

  student: {
    id: string;
    name: string;
    enrollments: CurrentEnrollment[];
  };
};

export type Props = {
  data: {
    id: number;
    date: Date;
    leaveType: string;
    description: string | null;
    timeIssued: Date;
    withWhom: string | null;
    relation: string | null;
    student: {
      id: string;
      name: string;
      enrollments: CurrentEnrollment[];
    };
  }[];
  fileName: string;
};

export type AnnouncementList = Announcement & {
  Class: {
    name: string | null;
  };
};

export type AttendanceResponse = {
  attendance: Attendance[];
  students: (Student & {
    enrollments: CurrentEnrollment[];
  })[];
};

export type AttendanceRangeResponse = {
  success: boolean;
  attendance: Attendance[];
};

export type ClassList = Prisma.ClassGetPayload<{
  select: typeof ClassSelect;
}>;

export type Events = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  Class: {
    name: string;
    section: string;
    Grade: {
      level: string;
    } | null;
  } | null;
};

export type Exams = Exam & {
  examGradeSubjects: {
    id: number;
    date: Date;
    startTime: string;
    maxMarks: number;
    grade: { id: number; level: string };
    subject: { id: number; name: string };
  }[];
};

export type StudentList = {
  id: string;
  name: string;
  gender: string;
  fatherName: string | null;
  phone: string;
  img?: string | null;

  enrollments: CurrentEnrollment[];

  totalFees?: { totalDiscountAmount: number | null } | null;
};

// -------------------- Types --------------------
// type TeachersList = Teacher & {
//   subjects: { Subject: Subject }[];
//   class?: (Class & { students: Student[] }) | null;
// };

export type TeacherClassAssignment = {
  academicYearId: string;
  class: {
    id: number;
    name: string;
    section: string | null;
    gradeId: number;
  };
};

export type TeachersList = {
  id: string;
  name: string;
  gender: string;
  phone: string;
  img?: string | null;
  dob: Date | string;
  address: string | null;
  status: string;

  assignments: TeacherClassAssignment[];

  subjects: {
    Subject: { id: number; name: string };
  }[];
};

export type StudentsList = {
  id: string;
  admissionNo: string;
  name: string;
  img: string | null;
  gender: "Male" | "Female" | string;
  fatherName: string | null;
  dob: Date | string;
  phone: string | null;
  status: string;
  categorty: string | null;
  religion: string | null;
  

  enrollments: CurrentEnrollment[];
};

export type FeesList = Grade & {
  feestructure: FeeStructureWithRelations[];
};

// Types
export type StudentsFeeReportList = {
  id: string;
  admissionNo: string;
  name: string;
  username: string;
  fatherName: string | null;
  img: string | null;
  dob: string;
  phone: string | null;
  gender: string | null;

  studentFees?: (StudentFees & { feeStructure?: FeeStructure })[];

  studentTotalFees?: StudentTotalFees[];

  enrollments?: CurrentEnrollment[];
};

export type Homeworks = {
  id: number;
  groupId: string;
  date: string;
  description: string;
  classId: number;
  Class: {
    id: number;
    gradeId: number;
    section: string | null;
    Grade: {
      level: string;
    };
  };
};

export type MessageList = Messages & {
  Student: {
    id: string;
    admissionNo: String;
    name: string;
    enrollments: CurrentEnrollment[];
  } | null;

  Class: {
    id: number;
    section: string | null;
    gradeId: number;
    name: string;
    Grade: {
      id: number;
      level: string;
    };
  } | null;
};

export type FeeColectList = Prisma.StudentGetPayload<{
  select: {
    id: true;
    admissionNo: true;
    name: true;
    gender: true;
    fatherName: true;
    phone: true;
    img: true;

    enrollments: {
      select: {
        class: {
          select: {
            section: true;
            name: true;
            Grade: {
              select: {
                id: true;
                level: true;
              };
            };
          };
        };
      };
    };

    feeTransactions: {
      select: {
        id: true;
        receiptNo: true;
      };
    };

    totalFees: {
      select: {
        totalDiscountAmount: true;
      };
    };
  };
}>;

export type AttendanceList = {
  id: number;
  date: string; // ISO string
  present: boolean;
  studentId: string;
  classId: number;

  class: {
    id: number;
    section: string | null;
    gradeId: number;

    Grade: {
      level: string;
    };
  };

  Student: {
    id: string;
    name: string;
    phone: string;
  };
};
