-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" SERIAL NOT NULL,
    "type" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsTemplate_schoolId_idx" ON "SmsTemplate"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_type_schoolId_key" ON "SmsTemplate"("type", "schoolId");

-- AddForeignKey
ALTER TABLE "SmsTemplate" ADD CONSTRAINT "SmsTemplate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "SchoolInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
