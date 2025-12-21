-- CreateEnum
CREATE TYPE "LessonDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "Term" AS ENUM ('TERM_1', 'TERM_2', 'TERM_3', 'TERM_4');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'ONLINE', 'UPI', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "AcademicYear" AS ENUM ('Y2024_2025', 'Y2025_2026');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('ABSENT', 'FEE_RELATED', 'ANNOUNCEMENT', 'GENERAL', 'FEE_COLLECTION');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'PERSONAL', 'HALFDAY', 'DAILY_PERMISSION');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('PERIOD1', 'PERIOD2', 'PERIOD3', 'PERIOD4', 'PERIOD5', 'PERIOD6', 'PERIOD7', 'PERIOD8', 'BREAK1', 'BREAK2', 'LUNCH');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'Male',
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "img" TEXT,
    "bloodType" "BloodType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clerk_id" TEXT,
    "profileId" TEXT,
    "linkedUserId" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "section" TEXT NOT NULL,
    "supervisorId" TEXT,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "day" "LessonDay" NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "period" "Period" NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "studentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamGradeSubject" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,

    CONSTRAINT "ExamGradeSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" SERIAL NOT NULL,
    "groupId" TEXT,
    "description" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "marks" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "motherName" TEXT,
    "fatherName" TEXT,
    "penNo" TEXT,
    "studentAadhar" TEXT,
    "fatherAadhar" TEXT,
    "motherAadhar" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "bloodType" TEXT,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "clerk_id" TEXT,
    "academicYear" "AcademicYear" NOT NULL DEFAULT 'Y2024_2025',
    "classId" INTEGER NOT NULL,
    "profileId" TEXT,
    "linkedUserId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "bloodType" TEXT,
    "gender" "Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "supervisor" BOOLEAN NOT NULL DEFAULT false,
    "dob" TIMESTAMP(3),
    "profileId" TEXT,
    "classId" INTEGER,
    "clerk_id" TEXT,
    "linkedUserId" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTeacher" (
    "subjectId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("subjectId","teacherId","classId")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" SERIAL NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "termFees" INTEGER NOT NULL,
    "abacusFees" INTEGER,
    "term" "Term" NOT NULL,
    "academicYear" "AcademicYear" NOT NULL DEFAULT 'Y2024_2025',

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeTransaction" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentFeesId" INTEGER NOT NULL,
    "term" "Term" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "receivedDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "receiptNo" TEXT NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "academicYear" "AcademicYear" NOT NULL DEFAULT 'Y2024_2025',
    "transactionType" TEXT NOT NULL DEFAULT 'PAYMENT',
    "updatedByName" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentFees" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" INTEGER NOT NULL,
    "academicYear" "AcademicYear" NOT NULL DEFAULT 'Y2024_2025',
    "term" "Term" NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "abacusPaidAmount" INTEGER,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "fineAmount" INTEGER NOT NULL DEFAULT 0,
    "receiptDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "receiptNo" TEXT,
    "remarks" TEXT DEFAULT '',
    "updatedByName" TEXT,

    CONSTRAINT "StudentFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTotalFees" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalPaidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAbacusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Not Paid',

    CONSTRAINT "StudentTotalFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "studentId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancelledReceipt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "originalReceiptNo" TEXT NOT NULL,
    "cancelledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledBy" TEXT,
    "reason" TEXT,
    "cancelledAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cancelledDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cancelledFine" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cancelledTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "CancelledReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionSlip" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "subReason" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeIssued" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withWhom" TEXT,
    "relation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT,
    "phone" TEXT,
    "activeUserId" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "LinkedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubjectGrades" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SubjectGrades_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_clerk_id_key" ON "Admin"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_linkedUserId_key" ON "Admin"("linkedUserId");

-- CreateIndex
CREATE INDEX "Admin_username_email_phone_idx" ON "Admin"("username", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_key" ON "Grade"("level");

-- CreateIndex
CREATE INDEX "Grade_level_idx" ON "Grade"("level");

-- CreateIndex
CREATE UNIQUE INDEX "class_supervisorId_key" ON "class"("supervisorId");

-- CreateIndex
CREATE INDEX "Class_gradeId_idx" ON "class"("gradeId");

-- CreateIndex
CREATE INDEX "Class_supervisorId_idx" ON "class"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_gradeId_section_key" ON "class"("gradeId", "section");

-- CreateIndex
CREATE INDEX "Lesson_classId_idx" ON "Lesson"("classId");

-- CreateIndex
CREATE INDEX "Lesson_subjectId_idx" ON "Lesson"("subjectId");

-- CreateIndex
CREATE INDEX "Lesson_teacherId_idx" ON "Lesson"("teacherId");

-- CreateIndex
CREATE INDEX "Lesson_day_period_idx" ON "Lesson"("day", "period");

-- CreateIndex
CREATE INDEX "Announcement_classId_idx" ON "Announcement"("classId");

-- CreateIndex
CREATE INDEX "Event_classId_idx" ON "Event"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_title_key" ON "Exam"("title");

-- CreateIndex
CREATE INDEX "ExamGradeSubject_examId_idx" ON "ExamGradeSubject"("examId");

-- CreateIndex
CREATE INDEX "ExamGradeSubject_gradeId_idx" ON "ExamGradeSubject"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_key" ON "ExamGradeSubject"("examId", "gradeId", "subjectId");

-- CreateIndex
CREATE INDEX "Homework_classId_idx" ON "Homework"("classId");

-- CreateIndex
CREATE INDEX "Homework_gradeId_idx" ON "Homework"("gradeId");

-- CreateIndex
CREATE INDEX "Homework_groupId_idx" ON "Homework"("groupId");

-- CreateIndex
CREATE INDEX "Homework_date_idx" ON "Homework"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_key" ON "Result"("studentId", "examId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_linkedUserId_key" ON "Student"("linkedUserId");

-- CreateIndex
CREATE INDEX "Student_classId_gender_status_idx" ON "Student"("classId", "gender", "status");

-- CreateIndex
CREATE INDEX "Student_academicYear_classId_gender_status_idx" ON "Student"("academicYear", "classId", "gender", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_key" ON "Teacher"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_classId_key" ON "Teacher"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_clerk_id_key" ON "Teacher"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_linkedUserId_key" ON "Teacher"("linkedUserId");

-- CreateIndex
CREATE INDEX "Teacher_clerk_id_idx" ON "Teacher"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_gradeId_term_academicYear_key" ON "FeeStructure"("gradeId", "term", "academicYear");

-- CreateIndex
CREATE INDEX "FeeTransaction_receiptDate_idx" ON "FeeTransaction"("receiptDate");

-- CreateIndex
CREATE INDEX "FeeTransaction_academicYear_receiptDate_idx" ON "FeeTransaction"("academicYear", "receiptDate");

-- CreateIndex
CREATE INDEX "FeeTransaction_studentId_academicYear_idx" ON "FeeTransaction"("studentId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFees_studentId_academicYear_term_key" ON "StudentFees"("studentId", "academicYear", "term");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTotalFees_studentId_key" ON "StudentTotalFees"("studentId");

-- CreateIndex
CREATE INDEX "Attendance_classId_date_idx" ON "Attendance"("classId", "date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_classId_idx" ON "Attendance"("studentId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_key" ON "Attendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "CancelledReceipt_studentId_idx" ON "CancelledReceipt"("studentId");

-- CreateIndex
CREATE INDEX "CancelledReceipt_term_idx" ON "CancelledReceipt"("term");

-- CreateIndex
CREATE INDEX "CancelledReceipt_originalReceiptNo_idx" ON "CancelledReceipt"("originalReceiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_clerk_id_key" ON "Profile"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_activeUserId_key" ON "Profile"("activeUserId");

-- CreateIndex
CREATE INDEX "Profile_clerk_id_idx" ON "Profile"("clerk_id");

-- CreateIndex
CREATE INDEX "Profile_phone_idx" ON "Profile"("phone");

-- CreateIndex
CREATE INDEX "_SubjectGrades_B_index" ON "_SubjectGrades"("B");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "LinkedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "LinkedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "LinkedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_studentFeesId_fkey" FOREIGN KEY ("studentFeesId") REFERENCES "StudentFees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFees" ADD CONSTRAINT "StudentFees_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFees" ADD CONSTRAINT "StudentFees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTotalFees" ADD CONSTRAINT "StudentTotalFees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelledReceipt" ADD CONSTRAINT "CancelledReceipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionSlip" ADD CONSTRAINT "PermissionSlip_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_activeUserId_fkey" FOREIGN KEY ("activeUserId") REFERENCES "LinkedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedUser" ADD CONSTRAINT "LinkedUser_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectGrades" ADD CONSTRAINT "_SubjectGrades_A_fkey" FOREIGN KEY ("A") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectGrades" ADD CONSTRAINT "_SubjectGrades_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
