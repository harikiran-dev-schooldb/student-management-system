-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessageType" ADD VALUE 'HOMEWORK';
ALTER TYPE "MessageType" ADD VALUE 'EXAM_RESULT';
ALTER TYPE "MessageType" ADD VALUE 'EVENT';

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "data" JSONB,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teacherId" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Messages_studentId_isRead_idx" ON "Messages"("studentId", "isRead");

-- CreateIndex
CREATE INDEX "Messages_teacherId_isRead_idx" ON "Messages"("teacherId", "isRead");

-- CreateIndex
CREATE INDEX "Messages_classId_idx" ON "Messages"("classId");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
