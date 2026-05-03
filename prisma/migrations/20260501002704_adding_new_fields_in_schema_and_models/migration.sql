/*
  Warnings:

  - You are about to drop the column `abacusFees` on the `FeeStructure` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `FeeStructure` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `FeeStructure` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `FeeStructure` table. All the data in the column will be lost.
  - You are about to drop the column `termFees` on the `FeeStructure` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `FeeTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `abacusPaidAmount` on the `StudentFees` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `StudentFees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gradeId,feeCycleId,feeType,academicYearId,schoolId]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,feeCycleId,feeType,academicYearId,schoolId]` on the table `StudentFees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FeeStructure_gradeId_term_academicYearId_schoolId_key";

-- DropIndex
DROP INDEX "FeeTransaction_academicYearId_receiptDate_idx";

-- DropIndex
DROP INDEX "FeeTransaction_schoolId_receiptDate_idx";

-- DropIndex
DROP INDEX "FeeTransaction_schoolId_studentId_receiptDate_idx";

-- DropIndex
DROP INDEX "FeeTransaction_studentId_academicYearId_idx";

-- DropIndex
DROP INDEX "FeeTransaction_studentId_term_idx";

-- DropIndex
DROP INDEX "StudentFees_studentId_academicYearId_idx";

-- DropIndex
DROP INDEX "StudentFees_studentId_academicYearId_term_schoolId_key";

-- DropIndex
DROP INDEX "StudentFees_studentId_term_idx";

-- AlterTable
ALTER TABLE "FeeStructure" DROP COLUMN "abacusFees",
DROP COLUMN "dueDate",
DROP COLUMN "startDate",
DROP COLUMN "term",
DROP COLUMN "termFees",
ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "feeCycleId" INTEGER,
ADD COLUMN     "feeType" TEXT;

-- AlterTable
ALTER TABLE "FeeTransaction" DROP COLUMN "term",
ADD COLUMN     "feeCycleId" INTEGER;

-- AlterTable
ALTER TABLE "StudentFees" DROP COLUMN "abacusPaidAmount",
DROP COLUMN "term",
ADD COLUMN     "dueAmount" INTEGER,
ADD COLUMN     "feeCycleId" INTEGER,
ADD COLUMN     "feeType" TEXT;

-- CreateTable
CREATE TABLE "FeeCycle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,

    CONSTRAINT "FeeCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeCycle_schoolId_idx" ON "FeeCycle"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeCycle_name_schoolId_academicYearId_key" ON "FeeCycle"("name", "schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_gradeId_feeCycleId_feeType_academicYearId_scho_key" ON "FeeStructure"("gradeId", "feeCycleId", "feeType", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "FeeTransaction_feeCycleId_idx" ON "FeeTransaction"("feeCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFees_studentId_feeCycleId_feeType_academicYearId_sch_key" ON "StudentFees"("studentId", "feeCycleId", "feeType", "academicYearId", "schoolId");

-- AddForeignKey
ALTER TABLE "FeeCycle" ADD CONSTRAINT "FeeCycle_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCycle" ADD CONSTRAINT "FeeCycle_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_feeCycleId_fkey" FOREIGN KEY ("feeCycleId") REFERENCES "FeeCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTransaction" ADD CONSTRAINT "FeeTransaction_feeCycleId_fkey" FOREIGN KEY ("feeCycleId") REFERENCES "FeeCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFees" ADD CONSTRAINT "StudentFees_feeCycleId_fkey" FOREIGN KEY ("feeCycleId") REFERENCES "FeeCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
