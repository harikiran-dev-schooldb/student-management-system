import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const studentFees = await prisma.studentFees.findMany({
      include: {
        feeStructure: true,
        feeTransactions: true,
      },
    });

    return NextResponse.json(studentFees);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
