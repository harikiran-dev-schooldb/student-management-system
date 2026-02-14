// app/api/grades/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: { id: "asc" }, // optional, for consistent order
    });

    return NextResponse.json(grades);
  } catch (error: any) {
    console.error("❌ Error fetching grades:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grades" },
      { status: 500 }
    );
  }
}
