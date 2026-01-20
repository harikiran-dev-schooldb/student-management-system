'use client';

import { exportStudentReportToExcel } from '@/lib/utils/exportToExcel';
import React from 'react';

const DownloadExcelButton = () => {
  const handleDownload = async () => {
    const res = await fetch('/api/student-fees-report');
    const data = await res.json();
    exportStudentReportToExcel(data);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-LamaBlue dark:bg-LamaBLue text-white px-2 py-1 rounded-md hover:bg-green-800"
    >
      Download Excel
    </button>
  );
};

export default DownloadExcelButton;
