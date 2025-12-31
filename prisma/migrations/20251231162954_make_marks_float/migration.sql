-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "marks" SET DATA TYPE DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
