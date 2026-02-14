import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  context: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await context.params;
    const { role } = await fetchUserInfo();

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
        where: { id: schoolId }, // or schoolId field depending on usage
      });

      if (existing) {
        return tx.schoolInfo.update({
          where: { id: schoolId },
          data: payload,
        });
      }

      return tx.schoolInfo.create({
        data: {
          ...payload,
          schoolId, // ✅ REQUIRED
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
