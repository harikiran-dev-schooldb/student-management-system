import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, gradeId } = body;

    console.log('Received data:', body); // Debugging: Check the received data

    // Check if a subject with the same name already exists
    const existingSubject = await prisma.subject.findUnique({
      where: {
        name: name.trim(),  // Check for duplicate name
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { message: `Subject with the name "${name}" already exists!` },
        { status: 409 }
      );
    }

    // Check if all grade IDs are valid
    const validGradeCount = await prisma.grade.count({
      where: {
        id: { in: gradeId },
      },
    });

    console.log('Valid grade count:', validGradeCount); // Debugging: Check how many grades are valid

    if (validGradeCount !== gradeId.length) {
      return NextResponse.json(
        { message: 'Some grade IDs are invalid or do not exist.' },
        { status: 400 }
      );
    }

    // Proceed with creating the new subject and linking it to the grades
    const newSubject = await prisma.subject.create({
      data: {
        name: name.trim(),
        grades: {
          connect: gradeId.map((id: number) => ({ id })) // Connect grades by their IDs
        }
      },
    });

    console.log('New subject created:', newSubject); // Debugging: Check the created subject data

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Subject with this name already exists!' },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get("gradeId");

    let subjects;

    if (gradeId) {
      // Fetch subjects by grade
      subjects = await prisma.subject.findMany({
        where: {
          grades: { some: { id: Number(gradeId) } },
        },
        include: { grades: true },
      });
    } else {
      // Fetch all subjects
      subjects = await prisma.subject.findMany({
        include: { grades: true },
      });
    }

    return NextResponse.json(subjects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
    