

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

  "/student/performance(.*)": ["admin"],
  "/student/promote(.*)": ["admin"],

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

  
  