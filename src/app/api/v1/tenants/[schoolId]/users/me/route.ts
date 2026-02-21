import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId: schoolSlug } = await params;
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);

    if (!user || !user.linkedUserId || !user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        profileId: user.profileId,
        linkedUserId: user.linkedUserId, // ✅ correct field
        role: user.role,
        studentId: user.studentId ?? null,
        teacherId: user.teacherId ?? null,
        classId: user.classId ?? null,
        gradeId: user.gradeId ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /users/me error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
