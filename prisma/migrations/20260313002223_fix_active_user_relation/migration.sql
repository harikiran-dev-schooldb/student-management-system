-- DropIndex
DROP INDEX "Profile_activeUserId_key";

-- CreateIndex
CREATE INDEX "SubjectTeacher_teacherId_schoolId_idx" ON "SubjectTeacher"("teacherId", "schoolId");

-- CreateIndex
CREATE INDEX "SubjectTeacher_classId_schoolId_idx" ON "SubjectTeacher"("classId", "schoolId");

-- CreateIndex
CREATE INDEX "SubjectTeacher_subjectId_schoolId_idx" ON "SubjectTeacher"("subjectId", "schoolId");
