import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export async function GET(req: NextRequest) {
    try {
        // Authenticate the user
        const { userId } = await fetchUserInfo();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find student by Clerk ID
        const student = await prisma.student.findFirst({
            where: { clerk_id: userId },
            include: {
                Class: {
                    include: {
                        Grade: {
                            include: {
                                feestructure: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Get total fee transactions
        const transactions = await prisma.studentTotalFees.findMany({
            where: { studentId: student.id },
        });

        const totalPaid = transactions.reduce((sum, t) => sum + t.totalPaidAmount, 0);

        // Get expected fee (term + abacus fees)
        const feeStructures = student.Class?.Grade?.feestructure ?? [];


        const totalFees = feeStructures.reduce((sum, fs) => {
            return sum + (fs.termFees || 0) + (fs.abacusFees || 0);
        }, 0);

        const totalDue = totalFees - totalPaid;


        const isFullyPaid = totalPaid >= totalDue;

        return NextResponse.json({
            totalPaid,
            totalFees,
            totalDue,
            isFullyPaid: totalPaid >= totalFees,
        });

    } catch (error) {
        console.error("[FEE_SUMMARY_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
