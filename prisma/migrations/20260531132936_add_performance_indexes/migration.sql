-- CreateIndex
CREATE INDEX "Attendance_schoolId_academicYearId_date_idx" ON "Attendance"("schoolId", "academicYearId", "date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_academicYearId_date_idx" ON "Attendance"("studentId", "academicYearId", "date");

-- CreateIndex
CREATE INDEX "Attendance_schoolId_classId_academicYearId_date_idx" ON "Attendance"("schoolId", "classId", "academicYearId", "date");

-- CreateIndex
CREATE INDEX "Bus_schoolId_idx" ON "Bus"("schoolId");

-- CreateIndex
CREATE INDEX "Bus_routeId_idx" ON "Bus"("routeId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_academicYearId_idx" ON "FeeTransaction"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_studentId_idx" ON "FeeTransaction"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_receiptDate_idx" ON "FeeTransaction"("schoolId", "receiptDate");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_createdAt_idx" ON "FeeTransaction"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_feeCycleId_idx" ON "FeeTransaction"("schoolId", "feeCycleId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_transactionType_idx" ON "FeeTransaction"("schoolId", "transactionType");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_studentId_academicYearId_idx" ON "FeeTransaction"("schoolId", "studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "FeeTransaction_schoolId_deletedAt_idx" ON "FeeTransaction"("schoolId", "deletedAt");

-- CreateIndex
CREATE INDEX "Route_schoolId_idx" ON "Route"("schoolId");

-- CreateIndex
CREATE INDEX "Student_schoolId_status_idx" ON "Student"("schoolId", "status");

-- CreateIndex
CREATE INDEX "Student_schoolId_name_idx" ON "Student"("schoolId", "name");

-- CreateIndex
CREATE INDEX "Student_schoolId_admissionNo_idx" ON "Student"("schoolId", "admissionNo");

-- CreateIndex
CREATE INDEX "Student_schoolId_phone_idx" ON "Student"("schoolId", "phone");

-- CreateIndex
CREATE INDEX "Student_schoolId_createdAt_status_idx" ON "Student"("schoolId", "createdAt", "status");

-- CreateIndex
CREATE INDEX "StudentEnrollment_schoolId_academicYearId_idx" ON "StudentEnrollment"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_schoolId_classId_idx" ON "StudentEnrollment"("schoolId", "classId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_studentId_status_idx" ON "StudentEnrollment"("studentId", "status");

-- CreateIndex
CREATE INDEX "StudentFees_schoolId_studentId_idx" ON "StudentFees"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "StudentFees_schoolId_academicYearId_idx" ON "StudentFees"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentFees_schoolId_feeCycleId_idx" ON "StudentFees"("schoolId", "feeCycleId");

-- CreateIndex
CREATE INDEX "StudentFees_studentId_academicYearId_idx" ON "StudentFees"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentFees_schoolId_dueAmount_idx" ON "StudentFees"("schoolId", "dueAmount");

-- CreateIndex
CREATE INDEX "StudentTotalFees_schoolId_academicYearId_idx" ON "StudentTotalFees"("schoolId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentTotalFees_studentId_academicYearId_idx" ON "StudentTotalFees"("studentId", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentTotalFees_schoolId_dueAmount_idx" ON "StudentTotalFees"("schoolId", "dueAmount");

-- CreateIndex
CREATE INDEX "StudentTransport_studentId_idx" ON "StudentTransport"("studentId");

-- CreateIndex
CREATE INDEX "StudentTransport_busId_idx" ON "StudentTransport"("busId");

-- CreateIndex
CREATE INDEX "StudentTransport_stopId_idx" ON "StudentTransport"("stopId");
