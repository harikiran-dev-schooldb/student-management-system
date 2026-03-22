export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { buildClassHierarchyFilter } from "@/lib/filters/buildHierarchyFilter";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;

    const { access, error } = await tenantSlugGuard(slug);
    if (error) return error;

    const { searchParams } = new URL(req.url);

    /* ---------------- PARAMS ---------------- */
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 50);

    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId");
    const gradeId = searchParams.get("gradeId");
    const branchId = searchParams.get("branchId");
    

    const skip = (page - 1) * limit;

    /* ---------------- STUDENT FILTER ---------------- */
    const studentWhere: Prisma.StudentWhereInput = {};

    if (search) {
      studentWhere.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    /* ---------------- HIERARCHY FILTER ---------------- */
    const classFilter = buildClassHierarchyFilter({
      branchId,
      gradeId,
      classId,
    });

    if (Object.keys(classFilter).length > 0) {
      studentWhere.enrollments = {
        some: {
          status: "ACTIVE",
          class: classFilter,
        },
      };
    }

    /* ---------------- FINAL WHERE ---------------- */
    const where: any = {
      schoolId: access.schoolId,
      dueAmount: { gt: new Prisma.Decimal(0) },
      ...(Object.keys(studentWhere).length > 0 && {
        student: studentWhere,
      }),
    };

    /* ---------------- PARALLEL QUERIES ---------------- */
    const [data, summaryAgg, ratioData] = await Promise.all([
      // 📄 Data
      prisma.studentTotalFees.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
              admissionNo: true,
              enrollments: {
                where: { status: "ACTIVE" }, // 👈 ensures correct class
                select: {
                  class: {
                    select: { name: true },
                  },
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { dueAmount: "desc" },
        skip,
        take: limit,
      }),

      // 📊 Summary
      prisma.studentTotalFees.aggregate({
        where,
        _count: { id: true },
        _sum: { dueAmount: true },
      }),

      // 📈 Ratio data
      prisma.studentTotalFees.findMany({
        where,
        select: {
          totalPaidAmount: true,
          totalFeeAmount: true,
        },
      }),
    ]);

    /* ---------------- FORMAT DATA ---------------- */
    const formattedData = data.map((row) => ({
      ...row,
      student: {
        id: row.student.id,
        name: row.student.name,
        phone: row.student.phone,
        admissionNumber: row.student.admissionNo,
        className:
          row.student.enrollments?.[0]?.class?.name || "-",
      },
    }));

    /* ---------------- SUMMARY ---------------- */
    const totalStudents = summaryAgg._count.id;
    const totalDue = Number(summaryAgg._sum.dueAmount ?? 0);

    let halfPaid = 0;
    let severe = 0;

    for (const d of ratioData) {
      const paid = Number(d.totalPaidAmount);
      const totalFee = Number(d.totalFeeAmount) || 1;

      const ratio = paid / totalFee;

      if (paid === 0) severe++;
      else if (ratio >= 0.5) halfPaid++;
      else severe++;
    }

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      data: formattedData,
      pagination: {
        total: totalStudents,
        page,
        limit,
        totalPages: Math.ceil(totalStudents / limit),
      },
      summary: {
        totalStudents,
        totalDue,
        halfPaid,
        severe,
      },
    });

  } catch (err) {
    console.error("Defaulters API Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch defaulters" },
      { status: 500 }
    );
  }
}