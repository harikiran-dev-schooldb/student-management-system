import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { slipSchema } from "@/lib/formValidationSchemas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

/* ======================================================
   POST → Create Permission Slip (Tenant Safe)
====================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    /* -----------------------------------
       Validate Body
    ----------------------------------- */
    const body = await req.json();
    const data = slipSchema.parse(body);

    /* -----------------------------------
       Fetch Student (Tenant Safe)
    ----------------------------------- */
    const student = await prisma.student.findFirst({
      where: {
        id: data.studentId,
        schoolId,
      },
      include: {
        Class: {
          include: { Grade: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in this school" },
        { status: 404 }
      );
    }

    /* -----------------------------------
       Integrity Validation
    ----------------------------------- */
    if (data.classId && student.classId !== data.classId) {
      return NextResponse.json(
        { error: "Selected class mismatch" },
        { status: 400 }
      );
    }

    if (data.gradeId && student.Class?.gradeId !== data.gradeId) {
      return NextResponse.json(
        { error: "Selected grade mismatch" },
        { status: 400 }
      );
    }

    const leaveDate = data.date
      ? new Date(data.date)
      : new Date();

    /* -----------------------------------
       Create Permission Slip
    ----------------------------------- */
    const newSlip = await prisma.permissionSlip.create({
      data: {
        studentId: data.studentId,
        leaveType: data.leaveType,
        subReason: data.subReason,
        description: data.description,
        date: leaveDate,
        withWhom: data.withWhom,
        relation: data.relation,
        schoolId,
      },
    });

    /* -----------------------------------
       Generate Gate Slip PDF
    ----------------------------------- */
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 255;
    const pageHeight = 255;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    

    /* -------- Logo (Safe Load) -------- */
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    let logoDims;

    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      logoDims = logoImage.scale(0.07);

      page.drawImage(logoImage, {
        x: (pageWidth - logoDims.width) / 2,
        y: pageHeight - logoDims.height - 10,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    const headerY = logoDims
      ? pageHeight - logoDims.height - 25
      : pageHeight - 25;

    page.drawText("KOTAK SALESIAN SCHOOL", {
      x:
        (pageWidth -
          fontBold.widthOfTextAtSize("KOTAK SALESIAN SCHOOL", 11)) /
        2,
      y: headerY,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    page.drawText("GATE SLIP", {
      x:
        (pageWidth -
          fontRegular.widthOfTextAtSize("GATE SLIP", 10)) /
        2,
      y: headerY - 15,
      size: 10,
      font: fontRegular,
    });

    /* -------- Content -------- */
    const lines = [
      `Name: ${student.name}`,
      `Class: ${student.Class?.Grade.level ?? ""} - ${
        student.Class?.section ?? ""
      }`,
      `Date: ${leaveDate.toLocaleDateString("en-GB")}`,
      `Type: ${data.leaveType}`,
      `Reason: ${data.subReason || "-"}`,
      `With Whom: ${data.withWhom || "-"}`,
      `Relation: ${data.relation || "-"}`,
    ];

    let y = headerY - 40;

    for (const line of lines) {
      page.drawText(line, {
        x: 20,
        y,
        size: 9,
        font: fontRegular,
      });
      y -= 14;
    }

    /* -------- Signatures -------- */
    page.drawText("Principal Signature", {
      x: 20,
      y: 20,
      size: 9,
      font: fontRegular,
    });

    page.drawText("Parent Signature", {
      x: pageWidth - 95,
      y: 20,
      size: 9,
      font: fontRegular,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    return NextResponse.json(
      {
        success: true,
        data: newSlip,
        gateSlipPdf: `data:application/pdf;base64,${pdfBase64}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Permission slip POST error:", error);

    return NextResponse.json(
      {
        error:
          error?.name === "ZodError"
            ? "Validation failed"
            : "Failed to create permission slip",
      },
      { status: 400 }
    );
  }
}


/* ======================================================
   GET → Fetch Single Permission Slip
====================================================== */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);
    

    const slip = await prisma.permissionSlip.findFirst({
      where: {
        schoolId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            Class: {
              include: { Grade: true },
            },
          },
        },
      },
    });

    if (!slip) {
      return NextResponse.json(
        { error: "Permission slip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slip, { status: 200 });
  } catch (error) {
    console.error("Permission slip GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permission slip" },
      { status: 500 }
    );
  }
}