/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,academicYearId]` on the table `ReceiptSequence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYearId` to the `ReceiptSequence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReceiptSequence" DROP CONSTRAINT "ReceiptSequence_schoolId_fkey";

-- DropIndex
DROP INDEX "ReceiptSequence_schoolId_key";

-- AlterTable
ALTER TABLE "ReceiptSequence" ADD COLUMN     "academicYearId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptSequence_schoolId_academicYearId_key" ON "ReceiptSequence"("schoolId", "academicYearId");

-- AddForeignKey
ALTER TABLE "ReceiptSequence" ADD CONSTRAINT "ReceiptSequence_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptSequence" ADD CONSTRAINT "ReceiptSequence_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
