export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> },
) {
    try {
        const { schoolId: slug } = await params;
        const schoolId = await resolveSchoolId(slug);
        const db = tenantPrisma(schoolId);

        const { searchParams } = new URL(req.url);

        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const term = searchParams.get("term");
        const classId = searchParams.get("classId");
        const paymentMode = searchParams.get("paymentMode");

        const where: any = {
            schoolId,
        };

        /* ---------------- DATE FILTER ---------------- */

        if (from || to) {
            where.receiptDate = {};

            if (from) where.receiptDate.gte = new Date(from);

            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                where.receiptDate.lte = end;
            }
        }

        if (term) where.term = term;
        if (paymentMode) where.paymentMode = paymentMode;

        if (classId) {
            where.student = {
                enrollments: {
                    some: {
                        classId,
                    },
                },
            };
        }

        /* ---------------- SUMMARY ---------------- */

        const summary = await db.feeTransaction.aggregate({
            where,
            _sum: {
                amount: true,
                discountAmount: true,
                fineAmount: true,
            },
            _count: true,
        });

        /* ---------------- TERM BREAKDOWN ---------------- */

        const termSummary = await db.feeTransaction.groupBy({
            by: ["term"],
            where,
            _sum: {
                amount: true,
            },
        });

        /* ---------------- PAYMENT MODE BREAKDOWN ---------------- */

        const paymentModeSummary = await db.feeTransaction.groupBy({
            by: ["paymentMode"],
            where,
            _sum: {
                amount: true,
            },
        });

        /* ---------------- CLASS BREAKDOWN ---------------- */

        const classSummary = await db.feeTransaction.groupBy({
            by: ["studentId"],
            where,
            _sum: {
                amount: true,
            },
        });

        /* ---------------- TRANSACTIONS ---------------- */

        const transactions = await db.feeTransaction.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        admissionNo: true,
                        name: true,
                        enrollments: {
                            select: {
                                class: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: {
                receiptDate: "desc",
            },
            take: 100,
        });

        /* ---------------- FORMAT DATA ---------------- */

        const formattedTransactions = transactions.map((t) => ({
            id: t.id,
            receiptNo: t.receiptNo,
            amount: Number(t.amount),
            discountAmount: Number(t.discountAmount ?? 0),
            fineAmount: Number(t.fineAmount ?? 0),
            term: t.term,
            paymentMode: t.paymentMode,
            receiptDate: t.receiptDate,
            student: {
                id: t.student?.id,
                admissionNo: t.student?.admissionNo,
                name: t.student?.name,
                Class: {
                    name: t.student.enrollments?.[0]?.class?.name ?? null
                }
            },
        }));

        return NextResponse.json({
            summary: {
                totalTransactions: summary._count,
                totalCollected: Number(summary._sum.amount ?? 0),
                totalDiscount: Number(summary._sum.discountAmount ?? 0),
                totalFine: Number(summary._sum.fineAmount ?? 0),
            },

            termSummary: termSummary.map((t) => ({
                term: t.term,
                amount: Number(t._sum.amount ?? 0),
            })),

            paymentModeSummary: paymentModeSummary.map((p) => ({
                mode: p.paymentMode,
                amount: Number(p._sum.amount ?? 0),
            })),

            classSummary,

            transactions: formattedTransactions,
        });
    } catch (error: any) {
        console.error("Fee report error:", error);

        return NextResponse.json(
            { message: error.message || "Report failed" },
            { status: 500 },
        );
    }
}