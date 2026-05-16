/*
  Warnings:

  - The `hostelRequired` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transportRequired` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "hostelRequired",
ADD COLUMN     "hostelRequired" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "transportRequired",
ADD COLUMN     "transportRequired" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "YesNo";
