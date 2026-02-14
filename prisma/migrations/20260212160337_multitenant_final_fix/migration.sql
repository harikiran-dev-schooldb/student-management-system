/*
  Warnings:

  - You are about to drop the column `data` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `receiptFooter` on the `SchoolInfo` table. All the data in the column will be lost.
  - You are about to drop the column `receiptHeader` on the `SchoolInfo` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `SchoolInfo` table. All the data in the column will be lost.
  - The primary key for the `SubjectTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[clerk_id,schoolId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,schoolId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,schoolId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone,schoolId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,date,schoolId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,schoolId]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examId,gradeId,subjectId,schoolId]` on the table `ExamGradeSubject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gradeId,term,academicYear,schoolId]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[level,schoolId]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,examId,subjectId,schoolId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,schoolId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,academicYear,term,schoolId]` on the table `StudentFees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,schoolId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,schoolId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_id,schoolId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classId,schoolId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gradeId,section,schoolId]` on the table `class` will be added. If there are existing duplicate values, this will fail.
  - Made the column `schoolId` on table `Admin` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolId` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `CancelledReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `ExamGradeSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `FeeTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Homework` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `PermissionSlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Made the column `schoolId` on table `SchoolInfo` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `StudentFees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `StudentTotalFees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `SubjectTeacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `class` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'REPEATED', 'TRANSFERRED');

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_teacherId_fkey";

-- DropIndex
DROP INDEX "Admin_clerk_id_key";

-- DropIndex
DROP INDEX "Admin_email_key";

-- DropIndex
DROP INDEX "Admin_phone_key";

-- DropIndex
DROP INDEX "Admin_username_key";

-- DropIndex
DROP INDEX "Attendance_studentId_date_key";

-- DropIndex
DROP INDEX "Exam_title_key";

-- DropIndex
DROP INDEX "ExamGradeSubject_examId_gradeId_subjectId_key";

-- DropIndex
DROP INDEX "FeeStructure_gradeId_term_academicYear_key";

-- DropIndex
DROP INDEX "FeeTransaction_receiptDate_idx";

-- DropIndex
DROP INDEX "Grade_level_key";

-- DropIndex
DROP INDEX "Messages_classId_idx";

-- DropIndex
DROP INDEX "Messages_studentId_isRead_idx";

-- DropIndex
DROP INDEX "Messages_teacherId_isRead_idx";

-- DropIndex
DROP INDEX "Result_studentId_examId_subjectId_key";

-- DropIndex
DROP INDEX "Student_username_key";

-- DropIndex
DROP INDEX "StudentFees_studentId_academicYear_term_key";

-- DropIndex
DROP INDEX "Subject_name_key";

-- DropIndex
DROP INDEX "Teacher_classId_key";

-- DropIndex
DROP INDEX "Teacher_clerk_id_key";

-- DropIndex
DROP INDEX "Teacher_username_key";

-- DropIndex
DROP INDEX "Class_gradeId_section_key";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CancelledReceipt" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExamGradeSubject" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeePayment" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeeTransaction" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Homework" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "data",
DROP COLUMN "isRead",
DROP COLUMN "teacherId",
DROP COLUMN "title",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PermissionSlip" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SchoolInfo" DROP COLUMN "receiptFooter",
DROP COLUMN "receiptHeader",
DROP COLUMN "taxId",
ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentFees" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentTotalFees" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubjectTeacher" DROP CONSTRAINT "SubjectTeacher_pkey",
ADD COLUMN     "schoolId" TEXT NOT NULL,
ADD CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("subjectId", "teacherId", "classId", "schoolId");

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "class" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYear" "AcademicYear" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "promotedFromId" INTEGER,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYear_classId_idx" ON "StudentEnrollment"("academicYear", "classId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_schoolId_idx" ON "StudentEnrollment"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYear_schoolId_key" ON "StudentEnrollment"("studentId", "academicYear", "schoolId");

-- CreateIndex
CREATE INDEX "Admin_schoolId_idx" ON "Admin"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_clerk_id_schoolId_key" ON "Admin"("clerk_id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_schoolId_key" ON "Admin"("username", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_schoolId_key" ON "Admin"("email", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_schoolId_key" ON "Admin"("phone", "schoolId");

-- CreateIndex
CREATE INDEX "Announcement_schoolId_idx" ON "Announcement"("schoolId");

-- CreateIndex
CREATE INDEX "Attendance_schoolId_idx" ON "Attendance"("schoolId");

-- CreateIndex
CREATE INDEX "Attendance_schoolId_date_idx" ON "Attendance"("schoolId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_schoolId_key" ON "Attendance"("studentId", "date", "schoolId");

-- CreateIndex
CREATE INDEX "CancelledReceipt_schoolId_idx" ON "CancelledReceipt"("schoolId");

-- CreateIndex
CREATE INDEX "Event_schoolId_idx" ON "Event"("schoolId");

-- CreateIndex
CREATE INDEX "Exam_schoolId_idx" ON "Exam"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_title_schoolId_key" ON "Exam"("title", "schoolId");

-- CreateIndex
CREATE INDEX "ExamGradeSubject_schoolId_idx" ON "ExamGradeSubject"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_schoolId_key" ON "ExamGradeSubject"("examId", "gradeId", "subjectId", "schoolId");

-- CreateIndex
CREATE INDEX "FeePayment_schoolId_idx" ON "FeePayment"("schoolId");

-- CreateIndex
CREATE INDEX "FeeStructure_schoolId_idx" ON "FeeStructure"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_gradeId_term_academicYear_schoolId_key" ON "FeeStructure"("gradeId", "term", "academicYear", "schoolId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_idx" ON "FeeTransaction"("schoolId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_receiptDate_idx" ON "FeeTransaction"("schoolId", "receiptDate");

-- CreateIndex
CREATE INDEX "Grade_schoolId_idx" ON "Grade"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_schoolId_key" ON "Grade"("level", "schoolId");

-- CreateIndex
CREATE INDEX "Homework_schoolId_idx" ON "Homework"("schoolId");

-- CreateIndex
CREATE INDEX "Lesson_schoolId_idx" ON "Lesson"("schoolId");

-- CreateIndex
CREATE INDEX "Messages_schoolId_idx" ON "Messages"("schoolId");

-- CreateIndex
CREATE INDEX "PermissionSlip_schoolId_idx" ON "PermissionSlip"("schoolId");

-- CreateIndex
CREATE INDEX "Result_schoolId_idx" ON "Result"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_schoolId_key" ON "Result"("studentId", "examId", "subjectId", "schoolId");

-- CreateIndex
CREATE INDEX "Student_schoolId_idx" ON "Student"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_schoolId_key" ON "Student"("username", "schoolId");

-- CreateIndex
CREATE INDEX "StudentFees_schoolId_idx" ON "StudentFees"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFees_studentId_academicYear_term_schoolId_key" ON "StudentFees"("studentId", "academicYear", "term", "schoolId");

-- CreateIndex
CREATE INDEX "StudentTotalFees_schoolId_idx" ON "StudentTotalFees"("schoolId");

-- CreateIndex
CREATE INDEX "Subject_schoolId_idx" ON "Subject"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_schoolId_key" ON "Subject"("name", "schoolId");

-- CreateIndex
CREATE INDEX "SubjectTeacher_schoolId_idx" ON "SubjectTeacher"("schoolId");

-- CreateIndex
CREATE INDEX "Teacher_schoolId_idx" ON "Teacher"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_schoolId_key" ON "Teacher"("username", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_clerk_id_schoolId_key" ON "Teacher"("clerk_id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_classId_schoolId_key" ON "Teacher"("classId", "schoolId");

-- CreateIndex
CREATE INDEX "class_schoolId_idx" ON "class"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_gradeId_section_key" ON "class"("gradeId", "section", "schoolId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFees" ADD CONSTRAINT "StudentFees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTotalFees" ADD CONSTRAINT "StudentTotalFees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelledReceipt" ADD CONSTRAINT "CancelledReceipt_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionSlip" ADD CONSTRAINT "PermissionSlip_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
