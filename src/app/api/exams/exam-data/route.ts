import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this doesn't get cached statically

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examTitle = searchParams.get('examTitle');
    const gradeId = Number(searchParams.get('gradeId'));
    const classId = Number(searchParams.get('classId'));

    if (!examTitle || !gradeId || !classId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Get the Exam ID from the title
    const exam = await prisma.exam.findFirst({
      where: { title: examTitle },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    // 2. Fetch Subjects for this Grade
    const subjects = await prisma.subject.findMany({
      where: {
        grades: { some: { id: gradeId } },
      },
      select: { id: true, name: true },
    });

    // 3. Fetch Students in this Class AND their results for this specific exam
    // This is the most efficient way: get students and join their results in one query
    const students = await prisma.student.findMany({
      where: {
        classId: classId,
        // Optional: Ensure student belongs to grade if your schema requires it
        // gradeId: gradeId 
      },
      select: {
        id: true,
        name: true,
        results: {
          where: {
            examId: exam.id, // Only fetch results for THIS exam
          },
          select: {
            marks: true,
            Subject: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' }, // Sort alphabetically
    });

    // 4. Transform Data for the Frontend
    // We need to convert the nested Prisma result into the "Marks Map" format the UI expects:
    // { "student_123": { "Math": "95", "English": "88" } }
    
    const existingMarks: Record<string, Record<string, string>> = {};

    students.forEach((student) => {
      const studentMarks: Record<string, string> = {};
      
      student.results.forEach((result) => {
        if (result.Subject?.name) {
          studentMarks[result.Subject.name] = String(result.marks);
        }
      });

      if (Object.keys(studentMarks).length > 0) {
        existingMarks[student.id] = studentMarks;
      }
    });

    return NextResponse.json({
      examId: exam.id,
      subjects,
      students: students.map(s => ({ id: s.id, name: s.name })), // Send clean student list
      existingMarks,
    });

  } catch (error) {
    console.error('Error fetching exam data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}