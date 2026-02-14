import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
// or import your DB connection accordingly

export async function GET() {
  try {
    const fees = await prisma.studentFees.findMany(); 
    // or your table/model name if different
    return NextResponse.json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json({ message: "Failed to fetch fees" }, { status: 500 });
  }
}
  