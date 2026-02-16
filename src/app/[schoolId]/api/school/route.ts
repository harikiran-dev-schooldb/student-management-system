import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type RouteContext = {
  params: Promise<{ schoolId: string }>;
};

/* -------------------------------------------------------
   GET → Fetch School Info
------------------------------------------------------- */
export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const { schoolId } = await context.params;

    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId }, // 🔥 use slug, not id
      select: {
        name: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        website: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: "Invalid school" },
        { status: 404 }
      );
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("[SCHOOL_GET_ERROR]", error);
    return NextResponse.json(
      { message: "Error fetching school info" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   POST → Create or Update School
------------------------------------------------------- */
export async function POST(
  req: Request,
  context: RouteContext
) {
  try {
    const { schoolId } = await context.params;

    const { role } = await fetchUserInfo(schoolId);

    if (role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
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

    const schoolInfo = await prisma.$transaction(async (tx) => {
      const existing = await tx.schoolInfo.findUnique({
        where: { schoolId }, // 🔥 important: slug field
      });

      if (existing) {
        return tx.schoolInfo.update({
          where: { schoolId },
          data: payload,
        });
      }

      return tx.schoolInfo.create({
        data: {
          ...payload,
          schoolId,
        },
      });
    });

    revalidatePath(`/${schoolId}/settings/school`);

    return NextResponse.json(schoolInfo);
  } catch (error) {
    console.error("[SCHOOL_POST_ERROR]", error);
    return NextResponse.json(
      { message: "Error saving settings" },
      { status: 500 }
    );
  }
}
