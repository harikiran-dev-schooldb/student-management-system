/*
  Warnings:

  - You are about to drop the column `supervisor` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherId,classId,academicYearId,schoolId]` on the table `TeacherClassAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClassTeacherRole" AS ENUM ('SUPERVISOR', 'SUBJECT');

-- DropIndex
DROP INDEX "TeacherClassAssignment_classId_academicYearId_schoolId_key";

-- DropIndex
DROP INDEX "TeacherClassAssignment_teacherId_idx";

-- DropIndex
DROP INDEX "Class_supervisorId_idx";

-- DropIndex
DROP INDEX "class_supervisorId_key";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "supervisor";

-- AlterTable
ALTER TABLE "TeacherClassAssignment" ADD COLUMN     "role" "ClassTeacherRole" NOT NULL DEFAULT 'SUBJECT';

-- AlterTable
ALTER TABLE "class" DROP COLUMN "supervisorId";

-- CreateIndex
CREATE INDEX "TeacherClassAssignment_classId_academicYearId_idx" ON "TeacherClassAssignment"("classId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherClassAssignment_teacherId_classId_academicYearId_sch_key" ON "TeacherClassAssignment"("teacherId", "classId", "academicYearId", "schoolId");
