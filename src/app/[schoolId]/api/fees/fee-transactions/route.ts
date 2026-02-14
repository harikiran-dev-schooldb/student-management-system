import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const receiptDate = url.searchParams.get("receiptDate");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const whereConditions: any = {};

    if (receiptDate) {
      // Single date filter
      const dateOnly = new Date(receiptDate);
      whereConditions.receiptDate = {
        gte: new Date(dateOnly.setHours(0, 0, 0, 0)),      // start of day
        lte: new Date(dateOnly.setHours(23, 59, 59, 999)), // end of day
      };
    } else if (from || to) {
      // Date range filter
      whereConditions.receiptDate = {};
      if (from) {
        whereConditions.receiptDate.gte = new Date(new Date(from).setHours(0, 0, 0, 0));
      }
      if (to) {
        whereConditions.receiptDate.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
      }
    } else {
      // Default to current date if no params given
      const today = new Date();
      whereConditions.receiptDate = {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lte: new Date(today.setHours(23, 59, 59, 999)),
      };
    }

    const receipts = await prisma.feeTransaction.findMany({
      where: whereConditions,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            Class: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return Response.json(receipts);
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Error fetching fee transactions" }, { status: 500 });
  }
}
