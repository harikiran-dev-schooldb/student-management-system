-- DropForeignKey
ALTER TABLE "StudentTotalFees" DROP CONSTRAINT "StudentTotalFees_studentId_fkey";

-- AddForeignKey
ALTER TABLE "StudentTotalFees" ADD CONSTRAINT "StudentTotalFees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
