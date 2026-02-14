import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const body = await req.json();
    const { name, gradeId } = body;

    /* -------------------------
       Check Duplicate (Tenant Safe)
    -------------------------- */
    const existingSubject = await prisma.subject.findUnique({
      where: {
        name_schoolId: {
          name: name.trim(),
          schoolId,
        },
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { message: `Subject "${name}" already exists.` },
        { status: 409 }
      );
    }

    /* -------------------------
       Validate Grades (Tenant Safe)
    -------------------------- */
    const validGradeCount = await prisma.grade.count({
      where: {
        id: { in: gradeId },
        schoolId,
      },
    });

    if (validGradeCount !== gradeId.length) {
      return NextResponse.json(
        { message: 'Some grade IDs are invalid.' },
        { status: 400 }
      );
    }

    /* -------------------------
       Create Subject
    -------------------------- */
    const newSubject = await prisma.subject.create({
      data: {
        name: name.trim(),
        schoolId, // ✅ REQUIRED
        grades: {
          connect: gradeId.map((id: number) => ({ id })),
        },
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Duplicate subject.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get("gradeId");

    let subjects;

    if (gradeId) {
      subjects = await prisma.subject.findMany({
        where: {
          schoolId,
          grades: {
            some: { id: Number(gradeId) },
          },
        },
        include: { grades: true },
      });
    } else {
      subjects = await prisma.subject.findMany({
        where: { schoolId },
        include: { grades: true },
      });
    }

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
