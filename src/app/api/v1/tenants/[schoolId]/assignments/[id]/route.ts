import { tenantSlugGuard } from "@/lib/tenantGuard";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string, id: string }> },
) {
    try {
        /* ================================
           Resolve Tenant
        ================================= */

        const { schoolId: slug, id } = await params;

        const { access, error } = await tenantSlugGuard(slug);
        if (error) return error;

        if (!["admin", "teacher"].includes(access.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const schoolId = access.schoolId;
        const parsedId = Number(id);

        if (isNaN(parsedId)) {
            return NextResponse.json({ error: "Invalid assignment id" }, { status: 400 });
        }

        const body = await req.json();

        const assignment = await prisma.assignment.update({
            where: {
                id: parsedId,
                schoolId,
            },
            data: {
                title: body.title,
                description: body.description,
                assignmentGradeSubjects: {
                    updateMany: {
                        where: { assignmentId: parsedId, schoolId },
                        data: {
                            gradeId: body.gradeId,
                            classId: body.classId,
                            subjectId: body.subjectId,
                            dueDate: new Date(body.dueDate),
                            maxMarks: body.maxMarks,
                        },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, assignment });

    } catch (error) {
        console.error("Assignment update error:", error);

        return NextResponse.json(
            { error: "Failed to update assignment" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string, id: string }> },
) {
    try {
        /* ================================
           Resolve Tenant
        ================================= */

        const { schoolId: slug, id } = await params;

        const { access, error } = await tenantSlugGuard(slug);
        if (error) return error;

        if (access.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const schoolId = access.schoolId;
        const parsedId = Number(id);

        if (isNaN(parsedId)) {
            return NextResponse.json({ error: "Invalid assignment id" }, { status: 400 });
        }

        await prisma.assignment.delete({
            where: {
                id: parsedId,
                schoolId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Assignment deleted",
        });

    } catch (error) {
        console.error("Assignment delete error:", error);

        return NextResponse.json(
            { error: "Failed to delete assignment" },
            { status: 500 }
        );
    }
}