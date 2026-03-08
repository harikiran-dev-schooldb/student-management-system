/*
  Warnings:

  - A unique constraint covering the columns `[receiptNo,schoolId]` on the table `FeeTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "FeeTransaction_studentFeesId_idx" ON "FeeTransaction"("studentFeesId");

-- CreateIndex
CREATE INDEX "FeeTransaction_studentId_term_idx" ON "FeeTransaction"("studentId", "term");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_studentId_receiptDate_idx" ON "FeeTransaction"("schoolId", "studentId", "receiptDate");

-- CreateIndex
CREATE UNIQUE INDEX "FeeTransaction_receiptNo_schoolId_key" ON "FeeTransaction"("receiptNo", "schoolId");

-- CreateIndex
CREATE INDEX "Student_schoolId_createdAt_idx" ON "Student"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentFees_studentId_academicYearId_idx" ON "StudentFees"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentFees_studentId_term_idx" ON "StudentFees"("studentId", "term");

-- CreateIndex
CREATE INDEX "TeacherClassAssignment_schoolId_classId_idx" ON "TeacherClassAssignment"("schoolId", "classId");

-- CreateIndex
CREATE INDEX "class_schoolId_gradeId_idx" ON "class"("schoolId", "gradeId");
