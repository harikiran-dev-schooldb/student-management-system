import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { role } = await fetchUserInfo();

    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const existing = await prisma.schoolInfo.findFirst();

    // Use a transaction to ensure data integrity during the update
    const schoolInfo = await prisma.$transaction(async (tx) => {
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

      if (existing) {
        return tx.schoolInfo.update({
          where: { id: existing.id },
          data: payload,
        });
      } else {
        return tx.schoolInfo.create({
          data: payload,
        });
      }
    });

    // Clear cache for pages that display school info (Receipts, Settings, Dashboard)
    revalidatePath("/settings/school");

    return NextResponse.json(schoolInfo);
  } catch (error) {
    console.error("[SCHOOL_POST_ERROR]", error);
    return NextResponse.json({ message: "Error saving settings" }, { status: 500 });
  }
}