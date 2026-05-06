import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { buildClassHierarchyFilter } from "@/lib/filters/buildHierarchyFilter";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest, { params }: any) {
  const { schoolId: slug } = await params;

  const { access, error } = await tenantSlugGuard(slug);
  if (error) return error;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const skip = (page - 1) * limit;

  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId");
  const gradeId = searchParams.get("gradeId");
  const branchId = searchParams.get("branchId");

  /* ---------------- STUDENT FILTER ---------------- */
  const studentWhere: Prisma.StudentWhereInput = {};

  if (search) {
    studentWhere.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { admissionNo: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

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

  /* ---------------- WHERE ---------------- */
  const where: Prisma.StudentTotalFeesWhereInput = {
  schoolId: access.schoolId,
  dueAmount: { gt: 0 }, // ✅ safer
};

if (Object.keys(studentWhere).length > 0) {
  where.student = studentWhere;
}

console.log("WHERE:", JSON.stringify(where, null, 2));

  /* ---------------- QUERY ---------------- */
  const [data, agg] = await Promise.all([
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
              where: { status: "ACTIVE" },
              take: 1,
              select: {
                class: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { dueAmount: "desc" },
      skip,
      take: limit,
    }),

    prisma.studentTotalFees.aggregate({
      where,
      _count: true,
      _sum: { dueAmount: true },
    }),
  ]);

  /* ---------------- FORMAT ---------------- */
  const formatted = data.map((row) => ({
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

  return NextResponse.json({
  items: formatted,
  pagination: {
    page,
    totalPages: Math.ceil((agg._count ?? 0) / limit),
  },
  summary: {
    totalStudents: agg._count,
    totalDue: Number(agg._sum?.dueAmount ?? 0),
  },
});
}