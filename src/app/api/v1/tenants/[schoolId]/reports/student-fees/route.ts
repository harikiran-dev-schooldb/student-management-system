import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { getFullStudentFeesReport } from "@/lib/fees/getFullStudentFeesReport";

export const runtime = "nodejs";

/* ======================================================
   GET → Student Fees Report (Admin Only, Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const academicYear = url.searchParams.get("academicYear");

    const data = await getFullStudentFeesReport(
      schoolId,
      academicYear ?? undefined
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch student fee report:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}