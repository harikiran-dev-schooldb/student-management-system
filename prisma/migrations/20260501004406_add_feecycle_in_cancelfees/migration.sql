/*
  Warnings:

  - You are about to drop the column `term` on the `CancelledReceipt` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CancelledReceipt_term_idx";

-- AlterTable
ALTER TABLE "CancelledReceipt" DROP COLUMN "term",
ADD COLUMN     "feeCycleId" INTEGER;
