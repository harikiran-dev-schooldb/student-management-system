import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, gradeId } = body;

    console.log('Received data for update:', body);

    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: { grades: true }, // Also fetch current grades
    });

    if (!existingSubject) {
      return NextResponse.json(
        { message: `Subject with ID "${id}" does not exist.` },
        { status: 404 }
      );
    }

    const duplicateSubject = await prisma.subject.findUnique({
      where: {
        name: name.trim(),
      },
    });

    if (duplicateSubject && duplicateSubject.id !== id) {
      return NextResponse.json(
        { message: `Subject with the name "${name}" already exists!` },
        { status: 409 }
      );
    }

    const validGradeCount = await prisma.grade.count({
      where: {
        id: { in: gradeId },
      },
    });

    console.log('Valid grade count for update:', validGradeCount);

    if (validGradeCount !== gradeId.length) {
      return NextResponse.json(
        { message: 'Some grade IDs are invalid or do not exist.' },
        { status: 400 }
      );
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name: name.trim(),
        grades: {
          set: gradeId.map((id: number) => ({ id })), // 🛠️ THIS resets the previous grades and sets the new ones
        },
      },
    });

    console.log('Subject updated:', updatedSubject);

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error: any) {
    console.error('Error updating subject:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Subject with this name already exists!' },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
