-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SC', 'ST', 'OBC', 'GENERAL');

-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('YES', 'NO');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "category" "Category",
ADD COLUMN     "fatherProfession" TEXT,
ADD COLUMN     "fatherQualification" TEXT,
ADD COLUMN     "hostelRequired" "YesNo" NOT NULL DEFAULT 'NO',
ADD COLUMN     "joinedDate" TIMESTAMP(3),
ADD COLUMN     "motherProfession" TEXT,
ADD COLUMN     "motherQualification" TEXT,
ADD COLUMN     "motherTongue" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "religion" "Religion",
ADD COLUMN     "transportRequired" "YesNo" NOT NULL DEFAULT 'NO';
