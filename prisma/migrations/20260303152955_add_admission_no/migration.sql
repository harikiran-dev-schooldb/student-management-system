/*
  Warnings:

  - You are about to alter the column `cancelledAmount` on the `CancelledReceipt` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cancelledDiscount` on the `CancelledReceipt` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cancelledFine` on the `CancelledReceipt` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cancelledTotal` on the `CancelledReceipt` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `FeePayment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `discountAmount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `fineAmount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalPaidAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalDiscountAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalFineAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalAbacusAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalFeeAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `dueAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[admissionNo,schoolId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BloodType" ADD VALUE 'NA';

-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'NOT_COMING';

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_branchId_fkey";

-- AlterTable
ALTER TABLE "CancelledReceipt" ALTER COLUMN "cancelledAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "cancelledDiscount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "cancelledFine" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "cancelledTotal" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "FeePayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "FeeTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "fineAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "admissionNo" TEXT;

-- AlterTable
ALTER TABLE "StudentTotalFees" ALTER COLUMN "totalPaidAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalDiscountAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalFineAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalAbacusAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalFeeAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "dueAmount" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_schoolId_key" ON "Student"("admissionNo", "schoolId");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
