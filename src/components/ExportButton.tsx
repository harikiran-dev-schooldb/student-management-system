"use client";

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { Props } from "../../types";



const ExportButton = ({ data, fileName }: Props) => {
  // ✅ Excel Export
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Permission Slips");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Date", key: "date", width: 15 },
      { header: "Student ID", key: "studentId", width: 15 },
      { header: "Student", key: "student", width: 20 },
      { header: "Class", key: "class", width: 15 },
      { header: "Leave Type", key: "leaveType", width: 20 },
      { header: "Description", key: "description", width: 30 },
      { header: "Issued Time", key: "time", width: 20 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        date: new Date(item.date).toLocaleDateString("en-GB"),
        studentId: item.student.id, // ✅ fixed
        student: item.student.name,
        class: `${item.student.enrollments[0]?.class.name}`,
        leaveType: item.leaveType,
        description: item.description || "-",
        time: new Date(item.timeIssued).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });
    });

    // ✅ Header Styling
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  // ✅ PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Report Title
    doc.setFontSize(14);
    doc.text("Permission Slips Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "ID",
          "Date",
          "Student ID",
          "Student",
          "Class",
          "Leave Type",
          "Description",
          "Time",
        ],
      ],
      body: data.map((item) => [
        item.id,
        new Date(item.date).toLocaleDateString("en-GB"),
        item.student.id,
        item.student.name,
        `${item.student.enrollments[0]?.class.name}`,
        item.leaveType,
        item.description || "-",
        new Date(item.timeIssued).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] }, // red header
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        className="text-xs px-3 py-2 border rounded-md bg-LamaBlue hover:bg-LamaPurple dark:bg-LamaYellow dark:hover:bg-LamaPurple dark:text-black text-white "
      >
        Excel
      </button>
      <button
        onClick={exportToPDF}
        className="text-xs px-3 py-2 border rounded-md bg-LamaBlue hover:bg-LamaPurple dark:bg-LamaYellow dark:hover:bg-LamaPurple dark:text-black text-white"
      >
        PDF
      </button>
    </div>
  );
};

export default ExportButton;
