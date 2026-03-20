export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { tenantSlugGuard } from "@/lib/tenantGuard";
import { PaymentMode } from "@prisma/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ schoolId: string }> },
) {
    const { schoolId: slug } = await params;

    const { searchParams } = new URL(req.url);
    const { access, error } = await tenantSlugGuard(slug);
    if (error) { return error; }

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const rawMode = searchParams.get("paymentMode");

    const paymentModeParam =
        rawMode && Object.values(PaymentMode).includes(rawMode as PaymentMode)
            ? (rawMode as PaymentMode)
            : undefined;

    const data = await prisma.feeTransaction.groupBy({
        by: ["paymentMode"],
        where: {
            schoolId: access.schoolId,
            deletedAt: null,
            receiptDate: {
                gte: new Date(startDate!),
                lte: new Date(endDate!),
            },
            ...(paymentModeParam && { paymentMode: paymentModeParam }),
        },
        _sum: {
            amount: true,
            discountAmount: true,
            fineAmount: true,
        },
    });

    return Response.json({ data });
}