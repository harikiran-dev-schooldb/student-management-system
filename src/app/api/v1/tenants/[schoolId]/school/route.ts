import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { revalidatePath } from "next/cache";
import { getSchool } from "@/lib/server/school-cache";

export const runtime = "nodejs";

/* ======================================================
   GET → Fetch School Info (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;

    if (!schoolSlug) {
      return NextResponse.json(
        { error: "School slug missing" },
        { status: 400 }
      );
    }

    const school = await getSchool(schoolSlug);

    if (!school) {
      return NextResponse.json(
        { error: "Invalid school" },
        { status: 404 }
      );
    }

    return NextResponse.json(school, { status: 200 });
  } catch (error) {
    console.error("[SCHOOL_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch school info" },
      { status: 500 }
    );
  }
}

/* ======================================================
   PUT → Update School Settings (Admin Only)
====================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolSlug } = await params;

    // Resolve to internal ID
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolSlug);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const payload = {
      ...(body.name && { name: body.name }),
      ...(body.address && { address: body.address }),
      ...(body.phone && { phone: body.phone }),
      ...(body.email && { email: body.email }),
      ...(body.website && { website: body.website }),
      ...(body.logo && { logo: body.logo }),
      ...(body.taxId && { taxId: body.taxId }),
      ...(body.receiptHeader && { receiptHeader: body.receiptHeader }),
      ...(body.receiptFooter && { receiptFooter: body.receiptFooter }),
    };

    const updatedSchool = await prisma.schoolInfo.update({
      where: { id: schoolId },
      data: payload,
    });

    revalidatePath(`/${schoolSlug}/settings/school`);

    return NextResponse.json(updatedSchool, { status: 200 });
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("[SCHOOL_PUT_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to update school settings" },
      { status: 500 }
    );
  }
}