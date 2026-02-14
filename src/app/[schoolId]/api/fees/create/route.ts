import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const body = await req.json();

    // 🧹 Remove id if present
    const { id, ...data } = body;

    if ("id" in body) {
      console.warn("⚠️ Incoming data contained id, removing it:", body.id);
    }

    /* ─────────────────────────────
       1️⃣ Check existing (Composite Unique + Tenant Safe)
    ───────────────────────────── */
    const existing = await prisma.feeStructure.findUnique({
      where: {
        gradeId_term_academicYear_schoolId: {
          gradeId: data.gradeId,
          term: data.term,
          academicYear: data.academicYear,
          schoolId, // ✅ REQUIRED
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Fee structure already exists for this grade, term, and academic year.",
        },
        { status: 409 }
      );
    }

    /* ─────────────────────────────
       2️⃣ Create New Record
    ───────────────────────────── */
    const fee = await prisma.feeStructure.create({
      data: {
        gradeId: data.gradeId,
        term: data.term,
        academicYear: data.academicYear,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        termFees: Number(data.termFees),
        abacusFees: data.abacusFees ? Number(data.abacusFees) : 0,
        schoolId, // ✅ REQUIRED
      },
    });

    return NextResponse.json(
      { success: true, fee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Fee creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
