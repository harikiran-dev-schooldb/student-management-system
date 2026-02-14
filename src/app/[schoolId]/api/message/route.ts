import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const { message, type, studentId, classId, gradeId } =
      await req.json();

    const formattedDate = new Date();

    /* --------------------------------
       1️⃣ Message to specific student
    ---------------------------------*/
    if (studentId) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: formattedDate,
          studentId,
          ...(classId && { classId: Number(classId) }),
          schoolId, // ✅ REQUIRED
        },
      });

      return NextResponse.json(
        { success: true, message: "Message sent to student", data: newMessage },
        { status: 201 }
      );
    }

    /* --------------------------------
       2️⃣ Message to whole class
    ---------------------------------*/
    if (classId) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          type,
          date: formattedDate,
          classId: Number(classId),
          schoolId, // ✅ REQUIRED
        },
      });

      return NextResponse.json(
        { success: true, message: "Message sent to class", data: newMessage },
        { status: 201 }
      );
    }

    /* --------------------------------
       3️⃣ Message to grade (all classes)
    ---------------------------------*/
    if (gradeId) {
      const classesInGrade = await prisma.class.findMany({
        where: {
          gradeId: Number(gradeId),
          schoolId, // ✅ TENANT SAFE
        },
        select: { id: true },
      });

      const messages = await Promise.all(
        classesInGrade.map((cls) =>
          prisma.messages.create({
            data: {
              message,
              type,
              date: formattedDate,
              classId: cls.id,
              schoolId, // ✅ REQUIRED
            },
          })
        )
      );

      return NextResponse.json(
        {
          success: true,
          message: "Message sent to all classes in grade",
          count: messages.length,
        },
        { status: 201 }
      );
    }

    /* --------------------------------
       4️⃣ School-wide message
    ---------------------------------*/
    const newMessage = await prisma.messages.create({
      data: {
        message,
        type,
        date: formattedDate,
        classId: null,
        schoolId, // ✅ REQUIRED
      },
    });

    return NextResponse.json(
      { success: true, message: "Message sent school-wide", data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create message" },
      { status: 500 }
    );
  }
}

/* --------------------------------
   GET (Tenant Safe)
---------------------------------*/
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;

    const messages = await prisma.messages.findMany({
      where: { schoolId }, // ✅ IMPORTANT
      orderBy: { date: "desc" },
      include: {
        Student: { select: { name: true } },
        Class: { select: { name: true } },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
