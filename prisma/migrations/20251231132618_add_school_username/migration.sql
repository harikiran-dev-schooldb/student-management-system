/*
  Warnings:

  - A unique constraint covering the columns `[schoolId]` on the table `SchoolInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SchoolInfo" ADD COLUMN     "schoolId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SchoolInfo_schoolId_key" ON "SchoolInfo"("schoolId");
