// app/api/fees/daily-summary/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const summary = await prisma.feeTransaction.groupBy({
      by: ["receiptDate"],
      where: {
        receiptDate: {
          gte: thirtyDaysAgo.toISOString(),
          lte: today.toISOString(),
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        receiptDate: "asc",
      },
    });

    return NextResponse.json(
      summary.map((s) => ({
        date: new Date(s.receiptDate).toISOString().split("T")[0], // Convert to YYYY-MM-DD format
        collected: s._sum.amount || 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
