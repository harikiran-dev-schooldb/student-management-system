import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportStudentReportToExcel = async (data: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Student Fee Report");

  // Title Row 1 - School Name
  sheet.mergeCells("A1:H1");
  const schoolNameRow = sheet.getCell("A1");
  schoolNameRow.value = "Kotak Salesian School";
  schoolNameRow.font = { bold: true, size: 16 };
  schoolNameRow.alignment = { horizontal: "center" };

  // Title Row 2 - Report Title
  sheet.mergeCells("A2:H2");
  const titleRow = sheet.getCell("A2");
  titleRow.value = "Fee Reports 2024-25";
  titleRow.font = { bold: true, size: 14 };
  titleRow.alignment = { horizontal: "center" };

  // Row 3 - Headers
  const headerRow = sheet.getRow(3);
  headerRow.values = [
    "S.No", "ID", "Name", "Class", "Total Fees", "Paid", "Discount", "Due"
  ];
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Enable filters on header row
  sheet.autoFilter = {
    from: {
      row: 3,
      column: 1,
    },
    to: {
      row: 3,
      column: 8,
    },
  };

  // Add data from row 4
  data.forEach((item, index) => {
    sheet.addRow([
      index + 1,
      item.admissionNo,
      item.name,
      item.className,
      item.totalFees,
      item.totalPaidAmount,
      item.totalDiscountAmount,
      item.dueAmount,
    ]);
  });

  // Apply border and currency format
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      // Add border to each cell
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Format currency columns (5th to 8th)
      if (rowNumber > 3 && colNumber >= 5 && colNumber <= 8) {
        cell.numFmt = '"₹"#,##0.00';
      }
    });
  });

  // Autofit columns
  sheet.columns.forEach((column) => {
    let maxLength = 0;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      let cellText = "";

      const value = cell.value;

      if (typeof value === "string" || typeof value === "number") {
        cellText = value.toString();
      } else if (value instanceof Date) {
        cellText = value.toLocaleDateString();
      } else if (value && typeof value === "object") {
        if ("text" in value) {
          cellText = value.text;
        } else if ("richText" in value && Array.isArray(value.richText)) {
          cellText = value.richText.map((r: any) => r.text).join("");
        } else if ("formula" in value && "result" in value) {
          cellText = value.result?.toString() || "";
        }
      }

      const length = cellText.length + (cellText.includes("₹") ? 2 : 0);
      maxLength = Math.max(maxLength, length);
    });

    column.width = maxLength < 10 ? 12 : maxLength + 2;
  });



  // Export as file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "student-fee-report.xlsx");
};
