import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId, SchoolNotFoundError } from "@/lib/resolveSchool";
import { revalidatePath } from "next/cache";

/* ======================================================
   GET → Fetch School Info (Tenant Safe)
====================================================== */
export async function GET(
  req: NextRequest,
  context: { params: { schoolId: string } }
) {
  try {
    const schoolSlug = context.params.schoolId;

    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId: schoolSlug }, // slug lookup
      select: {
        name: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        taxId: true,
        receiptHeader: true,
        receiptFooter: true,
      },
    });

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
  context: { params: { schoolId: string } }
) {
  try {
    const schoolSlug = context.params.schoolId;

    // Resolve to internal ID
    const schoolId = await resolveSchoolId(schoolSlug);

    const user = await fetchUserInfo(schoolId);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const payload = {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      logo: body.logo,
      taxId: body.taxId,
      receiptHeader: body.receiptHeader,
      receiptFooter: body.receiptFooter,
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