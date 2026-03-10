import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { getFullStudentFeesReport } from "@/lib/fees/getFullStudentFeesReport";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string; }> }
) {
  try {
    const { schoolId: slug } = await params;

    // resolve internal ID
    const schoolId = await resolveSchoolId(slug);

    const url = new URL(req.url);
    const academicYear = url.searchParams.get("academicYear") || undefined;
    const academicYearId = academicYear
      ? Number(academicYear)
      : undefined;

    const data = await getFullStudentFeesReport(schoolId, academicYearId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch student fee report:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
