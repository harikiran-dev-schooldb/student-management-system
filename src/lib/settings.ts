export const ITEM_PER_PAGE = 25;

type RouteAccessMap = {
   [key: string]: string[]; // Maps routes to allowed roles
};

export const routeAccessMap: RouteAccessMap = {
   /* =========================
      ROLE BASE ROUTES
   ========================== */

   "/admin(.*)": ["admin"],
   "/teacher(.*)": ["teacher"],
   "/student(.*)": ["student"],

   /* =========================
      USERS MANAGEMENT
   ========================== */

   "/list/users/students(.*)": ["admin"],
   "/list/users/teachers(.*)": ["admin"],
   "/list/users/admin(.*)": ["admin"],

   /* =========================
      ATTENDANCE
   ========================== */

   "/list/attendance/mark(.*)": ["admin", "teacher"],
   "/list/attendance/view(.*)": ["admin", "teacher"],
   "/list/attendance(.*)": ["student"],

   /* =========================
      HOMEWORKS
   ========================== */

   "/list/homeworks(.*)": ["admin", "teacher", "student"],

   /* =========================
      FEES
   ========================== */

   "/list/fees/view(.*)": ["student"],
   "/list/fees/collect(.*)": ["admin", "teacher"],
   "/list/reports/fees/defaulters(.*)": ["admin", "teacher"],
   "/list/fees/manage(.*)": ["admin"],

   /* =========================
      REPORTS
   ========================== */

   "/list/reports/student-fees(.*)": ["admin"],
   "/list/reports/daywise-fees(.*)": ["admin"],

   /* =========================
      BULK IMPORT
   ========================== */

   "/list/reports/bulk-import/grades(.*)": ["admin"],
   "/list/reports/bulk-import/feestructure(.*)": ["admin"],
   "/list/reports/bulk-import/teachers(.*)": ["admin"],
   "/list/reports/bulk-import/classes(.*)": ["admin"],
   "/list/reports/bulk-import/students(.*)": ["admin"],
   "/list/reports/bulk-import/subjects(.*)": ["admin"],
   "/list/reports/bulk-import/feecollection(.*)": ["admin"],
   "/list/reports/bulk-import/lessons(.*)": ["admin", "teacher"],
   "/list/reports/bulk-import/exams(.*)": ["admin", "teacher"],

   /* =========================
      MESSAGES
   ========================== */

   "/list/messages(.*)": ["admin", "teacher", "student"],

   /* =========================
      SUBJECTS
   ========================== */

   "/list/subjects(.*)": ["admin", "teacher", "student"],

   /* =========================
      CLASSES
   ========================== */

   "/list/classes(.*)": ["admin"],

   /* =========================
      PERMISSIONS
   ========================== */

   "/list/permissions(.*)": ["admin"],

   /* =========================
      LESSONS / TIMETABLE
   ========================== */

   "/list/lessons(.*)": ["admin", "teacher"],

   /* =========================
      ASSIGNMENTS
   ========================== */

   "/list/assignments(.*)": ["admin", "teacher", "student"],

   /* =========================
      EXAMS
   ========================== */

   "/list/exams(.*)": ["admin", "teacher", "student"],

   /* =========================
      RESULTS
   ========================== */

   "/list/results/marks-entry(.*)": ["admin", "teacher"],
   "/list/results/view(.*)": ["admin", "teacher", "student"],
   "/list/results(.*)": ["admin", "teacher", "student"],

   /* =========================
      STUDENT PERFORMANCE
   ========================== */

   "/list/performance.*": ["admin"],
   "/list/promote.*": ["admin"],

   /* =========================
      PROFILE
   ========================== */

   "/list/profiles/(admin|teacher|student)(.*)": ["admin", "teacher", "student"],
   /* =========================
      SETTINGS
   ========================== */

   "/settings/school(.*)": ["admin", "teacher", "student"],

   /* =========================
      LOGOUT
   ========================== */

   "/logout(.*)": ["admin", "teacher", "student"],

   /* =========================
    PUBLIC ROUTES
 ========================== */

   "/": ["admin", "teacher", "student"], // tenant root
   "/login(.*)": ["admin", "teacher", "student"],
   "/auth(.*)": ["admin", "teacher", "student"],
};

export const getISTRange = (inputDate?: string) => {
   const now = inputDate ? new Date(inputDate) : new Date();

   const istOffset = 5.5 * 60; // IST offset in minutes
   const utc = now.getTime() + now.getTimezoneOffset() * 60000;
   const istTime = new Date(utc + istOffset * 60000);

   const start = new Date(istTime);
   start.setHours(0, 0, 0, 0);

   const end = new Date(istTime);
   end.setHours(23, 59, 59, 999);

   return { start, end };
};

export function formatCurrency(amount?: number): string {
   if (typeof amount !== "number") return "";

   return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
   }).format(amount);
}

export function formatDate(date?: Date): string {
   if (!date) return "";

   return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   }).format(date);
}

/* -----------------------------
   Parse DOB (DD-MM-YYYY)
--------------------------------*/
export function parseDDMMYYYY(dob: string): Date | null {
   const [dd, mm, yyyy] = dob.split("-");
   if (!dd || !mm || !yyyy) return null;

   const date = new Date(`${yyyy}-${mm}-${dd}`);
   return isNaN(date.getTime()) ? null : date;
}

// export function generateReceiptNo(
//   slug: string,
//   sequence: number,
//   date: Date
// ) {
//   const datePart = date.toISOString().slice(0,10).replace(/-/g,"");
//   const seq = sequence.toString().padStart(5,"0");

//   return `${slug}-${seq}-${datePart}`;
// }


