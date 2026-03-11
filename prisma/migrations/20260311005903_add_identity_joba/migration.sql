/*
  Warnings:

  - The primary key for the `AcademicYear` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AcademicYear` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BulkUploadJob` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `academicYearId` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `Exam` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `ExamGradeSubject` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `FeeStructure` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `FeeTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `Result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `StudentEnrollment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `StudentFees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `StudentTotalFees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `academicYearId` on the `TeacherClassAssignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "BulkUploadJob" DROP CONSTRAINT "BulkUploadJob_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "ExamGradeSubject" DROP CONSTRAINT "ExamGradeSubject_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "FeeStructure" DROP CONSTRAINT "FeeStructure_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "FeeTransaction" DROP CONSTRAINT "FeeTransaction_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "StudentEnrollment" DROP CONSTRAINT "StudentEnrollment_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "StudentFees" DROP CONSTRAINT "StudentFees_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "StudentTotalFees" DROP CONSTRAINT "StudentTotalFees_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherClassAssignment" DROP CONSTRAINT "TeacherClassAssignment_academicYearId_fkey";

-- AlterTable
ALTER TABLE "AcademicYear" DROP CONSTRAINT "AcademicYear_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ExamGradeSubject" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FeeStructure" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FeeTransaction" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentEnrollment" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentFees" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentTotalFees" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TeacherClassAssignment" DROP COLUMN "academicYearId",
ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "BulkUploadJob";

-- CreateTable
CREATE TABLE "IdentityJob" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_schoolId_isActive_idx" ON "AcademicYear"("schoolId", "isActive");

-- CreateIndex
CREATE INDEX "Attendance_academicYearId_studentId_idx" ON "Attendance"("academicYearId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_academicYearId_schoolId_key" ON "Attendance"("studentId", "date", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "Exam_academicYearId_idx" ON "Exam"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_title_academicYearId_schoolId_key" ON "Exam"("title", "academicYearId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_academicYearId_sc_key" ON "ExamGradeSubject"("examId", "gradeId", "subjectId", "academicYearId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_gradeId_term_academicYearId_schoolId_key" ON "FeeStructure"("gradeId", "term", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "FeeTransaction_academicYearId_receiptDate_idx" ON "FeeTransaction"("academicYearId", "receiptDate");

-- CreateIndex
CREATE INDEX "FeeTransaction_studentId_academicYearId_idx" ON "FeeTransaction"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "Result_academicYearId_idx" ON "Result"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_academicYearId_schoolId_key" ON "Result"("studentId", "examId", "subjectId", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicYearId_classId_idx" ON "StudentEnrollment"("academicYearId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicYearId_schoolId_key" ON "StudentEnrollment"("studentId", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "StudentFees_studentId_academicYearId_idx" ON "StudentFees"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFees_studentId_academicYearId_term_schoolId_key" ON "StudentFees"("studentId", "academicYearId", "term", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTotalFees_studentId_academicYearId_schoolId_key" ON "StudentTotalFees"("studentId", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "TeacherClassAssignment_classId_academicYearId_idx" ON "TeacherClassAssignment"("classId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherClassAssignment_teacherId_classId_academicYearId_sch_key" ON "TeacherClassAssignment"("teacherId", "classId", "academicYearId", "schoolId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassAssignment" ADD CONSTRAINT "TeacherClassAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFees" ADD CONSTRAINT "StudentFees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTotalFees" ADD CONSTRAINT "StudentTotalFees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
