/*
  Warnings:

  - You are about to alter the column `amount` on the `FeePayment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `discountAmount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `fineAmount` on the `FeeTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `academicYearId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `StudentTotalFees` table. All the data in the column will be lost.
  - You are about to alter the column `totalPaidAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDiscountAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalFineAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalAbacusAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalFeeAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `dueAmount` on the `StudentTotalFees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `deletedAt` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,date,academicYearId,schoolId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,examId,subjectId,academicYearId,schoolId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,academicYearId,schoolId]` on the table `StudentTotalFees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYearId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `StudentTotalFees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BranchType" AS ENUM ('KINDERGARTEN', 'PRIMARY', 'HIGHER', 'COLLEGE', 'INSTITUTION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserStatus" ADD VALUE 'RESIGNED';
ALTER TYPE "UserStatus" ADD VALUE 'TERMINATED';

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropIndex
DROP INDEX "Attendance_studentId_date_schoolId_key";

-- DropIndex
DROP INDEX "Result_studentId_examId_subjectId_schoolId_key";

-- DropIndex
DROP INDEX "Student_academicYearId_classId_gender_status_idx";

-- DropIndex
DROP INDEX "Student_classId_gender_status_idx";

-- DropIndex
DROP INDEX "StudentTotalFees_studentId_schoolId_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "academicYearId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeePayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "FeeTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "fineAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "branchId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "academicYearId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "academicYearId",
DROP COLUMN "classId",
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "leftReason" TEXT;

-- AlterTable
ALTER TABLE "StudentTotalFees" DROP COLUMN "status",
ADD COLUMN     "academicYearId" TEXT NOT NULL,
ALTER COLUMN "totalPaidAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDiscountAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalFineAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalAbacusAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalFeeAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "dueAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "deletedAt",
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "leftReason" TEXT;

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BranchType" NOT NULL,
    "order" INTEGER NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branch_schoolId_idx" ON "Branch"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_schoolId_key" ON "Branch"("name", "schoolId");

-- CreateIndex
CREATE INDEX "Attendance_academicYearId_studentId_idx" ON "Attendance"("academicYearId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_academicYearId_schoolId_key" ON "Attendance"("studentId", "date", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "Grade_branchId_idx" ON "Grade"("branchId");

-- CreateIndex
CREATE INDEX "Result_academicYearId_studentId_idx" ON "Result"("academicYearId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_academicYearId_schoolId_key" ON "Result"("studentId", "examId", "subjectId", "academicYearId", "schoolId");

-- CreateIndex
CREATE INDEX "Student_gender_status_idx" ON "Student"("gender", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTotalFees_studentId_academicYearId_schoolId_key" ON "StudentTotalFees"("studentId", "academicYearId", "schoolId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTotalFees" ADD CONSTRAINT "StudentTotalFees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
