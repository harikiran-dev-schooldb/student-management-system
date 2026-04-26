/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,branchId,gradeId]` on the table `PaymentAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PaymentAccount_schoolId_gradeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAccount_schoolId_branchId_gradeId_key" ON "PaymentAccount"("schoolId", "branchId", "gradeId");
