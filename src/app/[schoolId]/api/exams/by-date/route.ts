// POST /api/exams/by-date
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { date } = await request.json();

        // Validate the date parameter
        if (!date) {
            return NextResponse.json(
                { error: "Date parameter is required." },
                { status: 400 }
            );
        }

        const parsedDate = new Date(date);

        // Check for valid date format
        if (isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format." },
                { status: 400 }
            );
        }

        // Set the start and end of the day
        const start = new Date(parsedDate);
        const end = new Date(parsedDate);
        end.setHours(23, 59, 59, 999); // End of the same day

        // Query the database to find exams associated with the given date
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
                        Grade: true,
                        Subject: true,
                    },
                },
            },
        });

        // Return the found exams or a message if no exams are found
        if (exams.length === 0) {
            return NextResponse.json(
                { message: "No exams found for the selected date." },
                { status: 404 }
            );
        }

        return NextResponse.json({ exams });
    } catch (error) {
        console.error("[FETCH_EXAMS_FOR_DATE_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to fetch exams. Please try again later." },
            { status: 500 }
        );
    }
}
