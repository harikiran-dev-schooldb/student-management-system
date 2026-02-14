import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { gradeId, examId, entries } = await request.json();

    // 1. Basic Validation
    if (!gradeId || !examId || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 2. Fetch Subjects to map Names -> IDs
    // We do this to ensure we only save valid subjects for this grade
    const subjects = await prisma.subject.findMany({
      where: {
        grades: { some: { id: gradeId } },
      },
    });

    const subjectMap = subjects.reduce((acc, subj) => {
      acc[subj.name] = subj.id;
      return acc;
    }, {} as Record<string, number>);

    // 3. Prepare Database Operations
    const transactionOperations = [];

    for (const entry of entries) {
      const { studentId, marks } = entry;

      for (const [subjectName, markValue] of Object.entries(marks)) {
        const subjectId = subjectMap[subjectName];
        
        // Skip empty strings or invalid subjects
        if (!subjectId || markValue === '' || markValue === null || markValue === undefined) {
          continue;
        }

        const numericMark = Number(markValue);

        // Prepare the Upsert (Update if exists, Insert if new)
        const op = prisma.result.upsert({
          where: {
            // This requires @@unique([studentId, examId, subjectId]) in your schema
            studentId_examId_subjectId: {
              studentId,
              examId,
              subjectId,
            },
          },
          update: {
            marks: numericMark,
          },
          create: {
            studentId,
            examId,
            subjectId,
            marks: numericMark,
          },
        });

        transactionOperations.push(op);
      }
    }

    // 4. Execute all operations in a single transaction
    if (transactionOperations.length > 0) {
      await prisma.$transaction(transactionOperations);
    }

    return NextResponse.json({ 
      message: 'Results saved successfully', 
      count: transactionOperations.length 
    });

  } catch (error) {
    console.error('Bulk Entry Error:', error);
    return NextResponse.json(
      { error: 'Failed to save results. Check server console.' }, 
      { status: 500 }
    );
  }
}