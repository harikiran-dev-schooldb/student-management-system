import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  context: { params: Promise<{ schoolId: string; id: string }> }
) {
  try {
    const { schoolId, id } = await context.params;
    const body = await req.json();
    const { name, gradeId } = body;

    const subjectId = Number(id);

    /* ------------------------------
       Check Existing Subject
    ------------------------------ */
    const existingSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { grades: true },
    });

    if (!existingSubject || existingSubject.schoolId !== schoolId) {
      return NextResponse.json(
        { message: `Subject not found.` },
        { status: 404 }
      );
    }

    /* ------------------------------
       Check Duplicate (Tenant Safe)
    ------------------------------ */
    const duplicateSubject = await prisma.subject.findUnique({
      where: {
        name_schoolId: {
          name: name.trim(),
          schoolId,
        },
      },
    });

    if (duplicateSubject && duplicateSubject.id !== subjectId) {
      return NextResponse.json(
        { message: `Subject with name "${name}" already exists!` },
        { status: 409 }
      );
    }

    /* ------------------------------
       Validate Grades (Tenant Safe)
    ------------------------------ */
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

    /* ------------------------------
       Update Subject
    ------------------------------ */
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: name.trim(),
        grades: {
          set: gradeId.map((gid: number) => ({ id: gid })),
        },
      },
    });

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error: any) {
    console.error('Error updating subject:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Subject already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
