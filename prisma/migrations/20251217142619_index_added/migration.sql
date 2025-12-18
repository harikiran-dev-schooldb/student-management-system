-- DropIndex
DROP INDEX "Student_clerk_id_idx";

-- DropIndex
DROP INDEX "Student_gender_idx";

-- DropIndex
DROP INDEX "Student_name_idx";

-- DropIndex
DROP INDEX "Student_phone_idx";

-- DropIndex
DROP INDEX "Student_status_gender_idx";

-- CreateIndex
CREATE INDEX "Attendance_classId_date_idx" ON "Attendance"("classId", "date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_classId_idx" ON "Attendance"("studentId", "classId");

-- CreateIndex
CREATE INDEX "Student_gender_status_idx" ON "Student"("gender", "status");

-- CreateIndex
CREATE INDEX "Student_classId_gender_status_idx" ON "Student"("classId", "gender", "status");

-- CreateIndex
CREATE INDEX "Student_academicYear_classId_gender_status_idx" ON "Student"("academicYear", "classId", "gender", "status");
