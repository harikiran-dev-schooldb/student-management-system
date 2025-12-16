-- CreateIndex
CREATE INDEX "FeeTransaction_receiptDate_idx" ON "FeeTransaction"("receiptDate");

-- CreateIndex
CREATE INDEX "FeeTransaction_academicYear_receiptDate_idx" ON "FeeTransaction"("academicYear", "receiptDate");
