// app/api/grade-subjects/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the gradeId from the query string (e.g., ?gradeId=1)
    const url = new URL(request.url);
    const gradeId = parseInt(url.searchParams.get('gradeId') || '', 10);

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    // Fetch subjects for the given grade
    const subjects = await prisma.subject.findMany({
      where: {
        grades: {
          some: {
            id: gradeId, // Ensure the subject is associated with the given grade
          },
        },
      },
    });

    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'No subjects found for the given grade' }, { status: 404 });
    }

    // Fetch students associated with the given grade (via the class model)
    const students = await prisma.class.findMany({
      where: { gradeId: gradeId },
      include: {
        students: {
          select: {
            id: true,
            name: true, // Get the student name
          },
        },
      },
    });

    // Flatten the student data (since a grade can have multiple classes)
    const flattenedStudents = students.flatMap((classData) => classData.students);

    return NextResponse.json({
      gradeId,
      subjects,
      students: flattenedStudents,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subjects and students' }, { status: 500 });
  }
}
