import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getSchool = unstable_cache(
  async (slug: string) => {
    return prisma.schoolInfo.findUnique({
      where: { schoolId: slug },
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
  },
  ["school-info"],
  { revalidate: 300 }
);