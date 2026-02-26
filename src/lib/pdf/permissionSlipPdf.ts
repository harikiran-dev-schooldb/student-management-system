import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generatePermissionSlipPDF({
  schoolName,
  student,
  slip,
}: {
  schoolName: string;
  student: any;
  slip: any;
}) {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 255;
  const pageHeight = 255;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  /* -------- Logo -------- */
  const logoPath = path.join(process.cwd(), "public", "logo.png");

  let headerY = pageHeight - 25;

  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // Scale properly (adjust if needed)
    const logoDims = logoImage.scale(0.05);

    page.drawImage(logoImage, {
      x: (pageWidth - logoDims.width) / 2,
      y: pageHeight - logoDims.height - 10,
      width: logoDims.width,
      height: logoDims.height,
    });

    headerY = pageHeight - logoDims.height - 25;
  }

  const headerText = schoolName.toUpperCase();

  page.drawText(headerText, {
    x: (pageWidth - fontBold.widthOfTextAtSize(headerText, 11)) / 2,
    y: headerY,
    size: 11,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  page.drawText("GATE SLIP", {
    x: (pageWidth - fontRegular.widthOfTextAtSize("GATE SLIP", 10)) / 2,
    y: headerY - 16,
    size: 10,
    font: fontRegular,
  });

  page.drawLine({
    start: { x: 20, y: headerY - 24 },
    end: { x: pageWidth - 20, y: headerY - 24 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const formattedDate = new Date(slip.date).toLocaleDateString("en-GB");

  const lines = [
    `Slip No: ${slip.id}`,
    `Name: ${student.name}`,
    `Class: ${student.Class?.Grade?.level ?? ""} - ${
      student.Class?.section ?? ""
    }`,
    `Date: ${formattedDate}`,
    `Type: ${slip.leaveType}`,
    `Reason: ${slip.subReason || "-"}`,
    `With Whom: ${slip.withWhom || "-"}`,
    `Relation: ${slip.relation || "-"}`,
  ];

  let y = headerY - 40;

  for (const line of lines) {
    page.drawText(line, {
      x: 20,
      y,
      size: 10,
      font: fontRegular,
    });
    y -= 14;
  }

  const signatureY = 15;

  // Left line
  page.drawLine({
    start: { x: 20, y: signatureY + 15 },
    end: { x: 110, y: signatureY + 15 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Right line
  page.drawLine({
    start: { x: pageWidth - 110, y: signatureY + 15 },
    end: { x: pageWidth - 20, y: signatureY + 15 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText("Teacher Signature", {
    x: 20,
    y: signatureY,
    size: 9,
    font: fontRegular,
  });

  const principalText = "Principal Signature";

  page.drawText(principalText, {
    x: pageWidth - 20 - fontRegular.widthOfTextAtSize(principalText, 9),
    y: signatureY,
    size: 9,
    font: fontRegular,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}
