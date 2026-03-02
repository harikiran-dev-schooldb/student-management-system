/*
  Warnings:

  - You are about to drop the column `classId` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_supervisorId_fkey";

-- DropIndex
DROP INDEX "Teacher_classId_schoolId_key";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "classId";

-- CreateTable
CREATE TABLE "TeacherClassAssignment" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "TeacherClassAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherClassAssignment_teacherId_idx" ON "TeacherClassAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherClassAssignment_schoolId_idx" ON "TeacherClassAssignment"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherClassAssignment_classId_academicYearId_schoolId_key" ON "TeacherClassAssignment"("classId", "academicYearId", "schoolId");

-- AddForeignKey
ALTER TABLE "TeacherClassAssignment" ADD CONSTRAINT "TeacherClassAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassAssignment" ADD CONSTRAINT "TeacherClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassAssignment" ADD CONSTRAINT "TeacherClassAssignment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClassAssignment" ADD CONSTRAINT "TeacherClassAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
