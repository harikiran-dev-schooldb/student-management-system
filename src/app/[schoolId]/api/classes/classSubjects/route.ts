import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const classId = parseInt(url.searchParams.get('classId') || '', 10);

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Get class with its grade
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: { Grade: true },
    });

    if (!cls || !cls.gradeId) {
      return NextResponse.json({ error: 'Class or associated grade not found' }, { status: 404 });
    }

    // Get subjects linked to the grade of that class
    const subjects = await prisma.subject.findMany({
      where: {
        grades: {
          some: {
            id: cls.gradeId,
          },
        },
      },
    });

    return NextResponse.json({ classId, subjects });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subjects for class' }, { status: 500 });
  }
}
