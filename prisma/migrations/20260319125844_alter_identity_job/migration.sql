/*
  Warnings:

  - A unique constraint covering the columns `[username,schoolId]` on the table `IdentityJob` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "IdentityJob" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "nextRunAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "IdentityJob_status_nextRunAt_idx" ON "IdentityJob"("status", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityJob_username_schoolId_key" ON "IdentityJob"("username", "schoolId");
