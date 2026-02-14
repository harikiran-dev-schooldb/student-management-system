import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const titles = await prisma.exam.findMany({
            distinct: ["title"],
            select: {
                title: true,
            },
            orderBy: {
                title: "asc",
            },
        });

        return NextResponse.json({
            titles: titles.map((t) => t.title),
        });
    } catch (error) {
        console.error("Error fetching exam titles:", error);
        return NextResponse.json(
            { error: "Failed to fetch exam titles" },
            { status: 500 }
        );
    }
}
