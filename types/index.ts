// types/index.ts

import {
  AcademicYear,
  Announcement,
  Attendance,
  Event,
  Exam,
  FeeTransaction,
  Grade,
  Messages,
  PaymentMode,
  Prisma,
  Student,
} from "@prisma/client";

export type FeeStructure = {
  id: number;
  gradeId: number;
  startDate: string; // or Date, based on usage
  dueDate: string; // ✅ Add this line
  termFees: number;
  abacusFees: number | null;
  term: string; // Or enum Term if you have it
  academicYear: string; // Or enum if defined
};

// Define individual StudentFees entry
export type StudentFees = {
  paidAmount?: number;
  discountAmount?: number;
  fineAmount?: number; // fineAmount missing earlier, added it
  feeStructure?: FeeStructure; // studentFees can have feeStructure
};

// Define StudentTotalFees entry
export type StudentTotalFees = {
  id: number;
  studentId: string;
  totalPaidAmount: number;
  totalDiscountAmount: number;
  totalFineAmount: number;
  totalAbacusAmount: number;
  totalFeeAmount: number;
  dueAmount: number;
  status: string; // like "Paid", "Partial", "Not Paid"
};

// types.ts
export type MessageType =
  | "ABSENT"
  | "FEE_RELATED"
  | "ANNOUNCEMENT"
  | "GENERAL"
  | "FEE_COLLECTION";

export type CurrentState = { success: boolean; error: boolean };

// types.ts
export type SearchParams = { [key: string]: string | string[] | undefined };

export type PageProps = { searchParams?: SearchParams };

export interface StudentFeesTable {
  id: number;
  studentId: string;
  feeStructureId: number;
  term: string;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  abacusPaidAmount?: number | null;
  receivedDate: string | null;
  receiptDate: string | null;
  paymentMode: string;
  feeStructure: FeeStructure;
  feeTransactions: FeeTransaction[];
  collectedAmount?: number;
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
  studentId: string;
  term: string;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  receiptDate?: string;
  receiptNo?: string;
  remarks?: string;
  paymentMode: PaymentMode;
  academicYear: AcademicYear; // ✅ add this line
  feeStructure?: {
    id: number;
    termFees?: number;
    abacusFees?: number;
    dueDate?: string;
  };
  feeTransactions?: {
    receiptNo?: string;
    remarks?: string;
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
    classId: number;
    Class: {
      id: number;
      section: string | null;
      gradeId: number;
      Grade: {
        id: number;
        level: string;
      };
    };
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
      classId: number;
      Class: {
        id: number;
        section: string | null;
        gradeId: number;
        Grade: {
          id: number;
          level: string;
        };
      };
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
    Class: {
      section: string | null;
      Grade: {
        level: string;
      };
    } | null;
  })[];
};

export type ClassList = {
  id: number;
  name: string;
  supervisorId: string | null;
  Teacher: {
    name: string;
  } | null;
};

export type Events = Event & {
  class?: {
    section: string | null;
    grade?: {
      id: number;
      level: string;
    } | null;
  } | null;
};

export type Exams = Exam & {
  examGradeSubjects: {
    date: Date;
    startTime: string;
    maxMarks: number;
    Grade: { id: number; level: string };
    Subject: { id: number; name: string };
  }[];
};

export type StudentList = {
  id: string;
  name: string;
  gender: string;
  fatherName: string | null;
  phone: string;
  img?: string | null;
  Class: {
    id: number;
    section: string | null;
    gradeId: number;
    Grade: {
      level: string;
    };
  };
  totalFees?: { totalDiscountAmount: number | null } | null;
};

// -------------------- Types --------------------
// type TeachersList = Teacher & {
//   subjects: { Subject: Subject }[];
//   class?: (Class & { students: Student[] }) | null;
// };

export type TeachersList = {
  id: string;
  name: string;
  gender: string;
  phone: string;
  img?: string | null;
  dob: Date | string;
  address: string | null;
  status: string;
  Class:{
    id: number;
    name: string;
  }
  subjects: { Subject: { id: number; name: string } }[];
};

export type StudentsList = {
  id: string;
  name: string;
  img: string | null;
  gender: "Male" | "Female" | string;
  fatherName: string | null;
  dob: Date | string;
  phone: string | null;
  status: string;
  Class: {
    id: number;
    section: string | null;
    gradeId: number;
    name: string;
    Grade: {
      level: string;
    };
  };
};

export type FeesList = Grade & {
  feestructure: FeeStructure[];
};

// Types
export type StudentsFeeReportList = {
  id: string;
  name: string;
  username: string;
  fatherName: string | null;
  img: string | null;
  dob: string;
  phone: string | null;
  gender: string | null;
  studentFees?: (StudentFees & { feeStructure?: FeeStructure })[];
  studentTotalFees?: StudentTotalFees | null;
  Class?: {
    name: string;
    Grade?: {
      name: string;
      feestructure?: FeeStructure[];
    };
  };
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
    name: string;
    classId: number;
  } | null;
  Class: {
    id: number;
    section: string | null;
    gradeId: number;
    Grade: {
      id: number;
      level: string;
    };
  } | null;
};

export type FeeColectList = Prisma.StudentGetPayload<{
  select: {
    id: true;
    name: true;
    gender: true;
    fatherName: true;
    phone: true;
    img: true;
    Class: {
      select: {
        section: true;
        Grade: {
          select: {
            id: true;
            level: true;
          };
        };
      };
    };
    feeTransactions: {
      select: {
        id: true;
        receiptNo: true;};
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
