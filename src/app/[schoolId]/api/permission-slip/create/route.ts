import { slipSchema } from "@/lib/formValidationSchemas";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = slipSchema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        Class: {
          include: { Grade: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }

    if (data.classId !== undefined && student.classId !== data.classId) {
      return NextResponse.json(
        { success: false, message: "Selected class doesn't match student's actual class." },
        { status: 400 }
      );
    }

    if (data.gradeId !== undefined && student.Class?.gradeId !== data.gradeId) {
      return NextResponse.json(
        { success: false, message: "Selected grade doesn't match student's actual grade." },
        { status: 400 }
      );
    }

    const leaveDate = data.date
      ? new Date(data.date)
      : new Date(new Date().toDateString());

    const newSlip = await prisma.permissionSlip.create({
      data: {
        studentId: data.studentId,
        leaveType: data.leaveType,
        subReason: data.subReason,
        description: data.description,
        date: leaveDate,
        withWhom: data.withWhom,
        relation: data.relation,
      },
    });

    const pdfDoc = await PDFDocument.create();

    // Page size: 9cm x 9cm in points
    const pageWidth = 255;
    const pageHeight = 255;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // --- EMBED LOGO DIRECTLY FROM PUBLIC FOLDER ---
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    // Scale down the logo
    const logoDims = logoImage.scale(0.07);

    // Draw logo at top center
    page.drawImage(logoImage, {
      x: (pageWidth - logoDims.width) / 2,
      y: pageHeight - logoDims.height - 10,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Title below logo (centered)
    page.drawText("KOTAK SALESIAN SCHOOL", {
      x: (pageWidth - fontBold.widthOfTextAtSize("KOTAK SALESIAN SCHOOL", 11)) / 2,
      y: pageHeight - logoDims.height - 25,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Subtitle: GATE SLIP (centered)
    page.drawText("GATE SLIP", {
      x: (pageWidth - fontRegular.widthOfTextAtSize("GATE SLIP", 10)) / 2,
      y: pageHeight - logoDims.height - 40,
      size: 10,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });

    // Content
    const lines = [
      `Name: ${student.name}`,
      `Class: ${student.Class?.Grade.level} – ${student.Class?.section ?? ""}`,
      `Date & Time: ${leaveDate.toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`,
      `Permission Type: ${data.leaveType}`,
      `Reason: ${data.subReason || "-"}`,
      `Description: ${data.description || "-"}`,
      `With Whom: ${data.withWhom || "-"}`,
      `Relation: ${data.relation || "-"}`,
    ];

    let y = pageHeight - logoDims.height - 65; // start after header block
    for (const line of lines) {
      page.drawText(line, {
        x: 20,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
      y -= 14;
    }

    // Footer
    page.drawText("Principal Signature", {
      x: 20,
      y: 20,
      size: 9,
      font: fontRegular,
    });

    page.drawText("Signature", {
      x: pageWidth - 80,
      y: 20,
      size: 9,
      font: fontRegular,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json(
      {
        success: true,
        slip: newSlip,
        gateSlipPdf: `data:application/pdf;base64,${pdfBase64}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Permission slip creation error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid input or server error." },
      { status: 400 }
    );
  }
}
