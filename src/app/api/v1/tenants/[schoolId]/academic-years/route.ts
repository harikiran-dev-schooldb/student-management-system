import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { tenantSlugGuard } from "@/lib/tenantGuard";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ schoolId: string; }> }) {
    try {

        const { schoolId: slug } = await params;
        const { access, error } = await tenantSlugGuard(slug);

        if (error) return error;

        const years = await prisma.academicYear.findMany({
            where: { schoolId: access.schoolId },
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