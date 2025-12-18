-- DropIndex
DROP INDEX "Student_academicYear_idx";

-- DropIndex
DROP INDEX "Student_classId_idx";

-- DropIndex
DROP INDEX "Student_gender_status_idx";

-- DropIndex
DROP INDEX "Student_status_classId_idx";

-- DropIndex
DROP INDEX "Student_status_idx";

-- CreateIndex
CREATE INDEX "Grade_level_idx" ON "Grade"("level");
