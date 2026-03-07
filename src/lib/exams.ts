// lib/exams.ts
import prisma from "@/lib/prisma";

export async function getExamsForDate(date: string) {
  if (!date) {
    throw new Error("Date parameter is required.");
  }

  const parsedDate = new Date(date);

  // Check for valid date format
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  // Set the start and end of the day
  const start = new Date(parsedDate);
  const end = new Date(parsedDate);
  end.setHours(23, 59, 59, 999); // End of the same day

  try {
    const exams = await prisma.exam.findMany({
      where: {
        examGradeSubjects: {
          some: {
            date: {
              gte: start, // Greater than or equal to start date
              lte: end,   // Less than or equal to end date
            },
          },
        },
      },
      include: {
        examGradeSubjects: {
          where: {
            date: {
              gte: start,
              lte: end,
            },
          },
          include: {
            grade: true,
            subject: true,
          },
        },
      },
    });

    if (exams.length === 0) {
      throw new Error("No exams found for the selected date.");
    }

    return exams;
  } catch (error) {
    throw new Error(`Failed to fetch exams: ${(error as any).message}`);
  }
}
