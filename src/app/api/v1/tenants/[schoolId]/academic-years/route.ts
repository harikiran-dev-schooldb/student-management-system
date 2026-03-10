import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ schoolId: string; }> }) {
    try {

        const { schoolId: slug } = await params;
        const schoolId = await resolveSchoolId(slug);

        const years = await prisma.academicYear.findMany({
            where: { schoolId },
            orderBy: { id: "asc" },
        });

        return NextResponse.json(years);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch academic years" },
            { status: 500 }
        );
    }
}