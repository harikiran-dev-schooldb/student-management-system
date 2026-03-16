/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Profile_phone_idx";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phone_key" ON "Profile"("phone");
