-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentGradeSubject" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "AssignmentGradeSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "marks" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_schoolId_idx" ON "Assignment"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_title_schoolId_key" ON "Assignment"("title", "schoolId");

-- CreateIndex
CREATE INDEX "AssignmentGradeSubject_schoolId_idx" ON "AssignmentGradeSubject"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentGradeSubject_assignmentId_gradeId_classId_subject_key" ON "AssignmentGradeSubject"("assignmentId", "gradeId", "classId", "subjectId", "schoolId");

-- CreateIndex
CREATE INDEX "AssignmentSubmission_schoolId_idx" ON "AssignmentSubmission"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_schoolId_key" ON "AssignmentSubmission"("assignmentId", "studentId", "schoolId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGradeSubject" ADD CONSTRAINT "AssignmentGradeSubject_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGradeSubject" ADD CONSTRAINT "AssignmentGradeSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGradeSubject" ADD CONSTRAINT "AssignmentGradeSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGradeSubject" ADD CONSTRAINT "AssignmentGradeSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGradeSubject" ADD CONSTRAINT "AssignmentGradeSubject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
