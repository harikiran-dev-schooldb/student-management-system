/*
  Warnings:

  - The `status` column on the `FeePayment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id,schoolId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `FeePayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `FeePayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,schoolId]` on the table `LinkedUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `FeePayment` table without a default value. This is not possible if the table is not empty.
  - Made the column `orderId` on table `FeePayment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `schoolId` to the `LinkedUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "FeePayment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "orderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LinkedUser" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SchoolInfo" ADD COLUMN     "receiptFooter" TEXT,
ADD COLUMN     "receiptHeader" TEXT,
ADD COLUMN     "taxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_id_schoolId_key" ON "Admin"("id", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_transactionId_key" ON "FeePayment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_orderId_key" ON "FeePayment"("orderId");

-- CreateIndex
CREATE INDEX "FeePayment_studentId_idx" ON "FeePayment"("studentId");

-- CreateIndex
CREATE INDEX "LinkedUser_schoolId_idx" ON "LinkedUser"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedUser_username_schoolId_key" ON "LinkedUser"("username", "schoolId");

-- AddForeignKey
ALTER TABLE "LinkedUser" ADD CONSTRAINT "LinkedUser_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
