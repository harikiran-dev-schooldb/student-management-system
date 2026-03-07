/*
  Warnings:

  - A unique constraint covering the columns `[title,academicYearId,schoolId]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examId,gradeId,subjectId,academicYearId,schoolId]` on the table `ExamGradeSubject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYearId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `ExamGradeSubject` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Exam_title_schoolId_key";

-- DropIndex
DROP INDEX "ExamGradeSubject_examId_gradeId_subjectId_schoolId_key";

-- DropIndex
DROP INDEX "Result_academicYearId_studentId_idx";

-- DropIndex
DROP INDEX "Result_schoolId_idx";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "academicYearId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExamGradeSubject" ADD COLUMN     "academicYearId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Exam_academicYearId_idx" ON "Exam"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_title_academicYearId_schoolId_key" ON "Exam"("title", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "ExamGradeSubject_subjectId_idx" ON "ExamGradeSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamGradeSubject_examId_gradeId_subjectId_academicYearId_sc_key" ON "ExamGradeSubject"("examId", "gradeId", "subjectId", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "Result_examId_schoolId_studentId_idx" ON "Result"("examId", "schoolId", "studentId");

-- CreateIndex
CREATE INDEX "Result_academicYearId_idx" ON "Result"("academicYearId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamGradeSubject" ADD CONSTRAINT "ExamGradeSubject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
