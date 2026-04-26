/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,gradeId]` on the table `PaymentAccount` will be added. If there are existing duplicate values, this will fail.
  - Made the column `branchId` on table `PaymentAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gradeId` on table `PaymentAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaymentAccount" ALTER COLUMN "branchId" SET NOT NULL,
ALTER COLUMN "gradeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAccount_schoolId_gradeId_key" ON "PaymentAccount"("schoolId", "gradeId");
