'use client';

import { exportStudentReportToExcel } from '@/lib/utils/exportToExcel';
import { useParams } from "next/navigation";
import { tenantFetch } from '@/lib/tenantFetch';
import React from 'react';

const DownloadExcelButton = () => {
  const { schoolId } = useParams<{ schoolId: string }>();

  const handleDownload = async () => {
    try {
      const data = await tenantFetch(
        schoolId,
        "/students/fee-report"
      );

      exportStudentReportToExcel(data);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-LamaBlue text-white px-2 py-1 rounded-md hover:bg-green-800"
    >
      Download Excel
    </button>
  );
};

export default DownloadExcelButton;