"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

type Props = {
  data: any[];
};

export default function StudentFeesExcelDownload({
  data,
}: Props) {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Student Fees");

    worksheet.columns = [
      { header: "S.No", key: "sno", width: 10 },
      { header: "Admission No", key: "admissionNo", width: 18 },
      { header: "Student Name", key: "name", width: 30 },
      { header: "Class", key: "className", width: 20 },
      { header: "Total Fees", key: "totalFees", width: 18 },
      { header: "Total Paid", key: "paid", width: 18 },
      { header: "Discount", key: "discount", width: 18 },
      { header: "Due", key: "due", width: 18 },
      { header: "Payment %", key: "paymentPercent", width: 15 },
    ];

    data.forEach((student, index) => {
      const totalFees = Number(
  student.totalFeeAmount ?? 0
);

const paid = Number(
  student.totalPaidAmount ?? 0
);

const discount = Number(
  student.totalDiscountAmount ?? 0
);

const due = Number(
  student.dueAmount ?? 0
);

      const paymentPercent =
  totalFees > 0
    ? Math.min(
        100,
        Math.round(
          ((paid + discount) / totalFees) * 100
        )
      )
    : 0;

      worksheet.addRow({
        sno: index + 1,
        admissionNo: student.admissionNo || "-",
        name: student.name || "-",
        className:
          student.enrollments?.[0]?.class?.name || "-",
        totalFees: `₹${totalFees}`,
paid: `₹${paid}`,
discount: `₹${discount}`,
due: `₹${due}`,
        paymentPercent: `${paymentPercent}%`,
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `Student_Fees_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  return (
    <button
      onClick={handleDownload}
      disabled={data.length === 0}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-LamaBlue text-white hover:opacity-90 disabled:opacity-50"
    >
      <Download size={16} />
      Export Excel
    </button>
  );
}