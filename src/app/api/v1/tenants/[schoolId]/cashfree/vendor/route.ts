export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: slug } = await params;
    const schoolId = await resolveSchoolId(slug);

    const {
      name,
      email,
      phone,
      bank_account,
      ifsc,
    } = await req.json();

    if (!name || !email || !phone || !bank_account || !ifsc) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const base =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/payout"
        : "https://sandbox.cashfree.com/payout";

    const res = await fetch(`${base}/v1/addVendor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      },
      body: JSON.stringify({
        vendor_id: `vendor_${Date.now()}`, // unique
        name,
        email,
        phone,
        bank: {
          account_number: bank_account,
          ifsc,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Vendor creation failed:", data);
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      vendor_id: data.vendor_id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}