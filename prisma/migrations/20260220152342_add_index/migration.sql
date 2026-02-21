-- DropIndex
DROP INDEX "LinkedUser_schoolId_idx";

-- CreateIndex
CREATE INDEX "LinkedUser_profileId_schoolId_idx" ON "LinkedUser"("profileId", "schoolId");
