/*
  Warnings:

  - Added the required column `academicYearId` to the `CancelledReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CancelledReceipt_originalReceiptNo_idx";

-- AlterTable
ALTER TABLE "CancelledReceipt" ADD COLUMN     "academicYearId" INTEGER NOT NULL,
ALTER COLUMN "originalReceiptNo" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CancelledReceipt_feeCycleId_idx" ON "CancelledReceipt"("feeCycleId");

-- CreateIndex
CREATE INDEX "CancelledReceipt_academicYearId_idx" ON "CancelledReceipt"("academicYearId");

-- AddForeignKey
ALTER TABLE "CancelledReceipt" ADD CONSTRAINT "CancelledReceipt_feeCycleId_fkey" FOREIGN KEY ("feeCycleId") REFERENCES "FeeCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancelledReceipt" ADD CONSTRAINT "CancelledReceipt_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
