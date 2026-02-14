/*
  Warnings:

  - A unique constraint covering the columns `[studentId,schoolId]` on the table `StudentTotalFees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StudentTotalFees_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "StudentTotalFees_studentId_schoolId_key" ON "StudentTotalFees"("studentId", "schoolId");
