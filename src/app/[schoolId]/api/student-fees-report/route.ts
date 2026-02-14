// app/api/student-fees-report/route.ts
import { NextResponse } from "next/server";
import { getFullStudentFeesReport } from "@/lib/fees/getFullStudentFeesReport";

export async function GET() {
  try {
    const data = await getFullStudentFeesReport();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch student fee report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
