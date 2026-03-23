import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId: slug } = await params;
        const schoolId = await resolveSchoolId(slug);
        const db = tenantPrisma(schoolId);

        const activeYear = await db.academicYear.findFirst({
            where: {
                schoolId,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!activeYear) {
            return NextResponse.json(
                { error: "No active academic year found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ academicYear: activeYear });
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch academic year" },
            { status: 500 }
        );
    }
}