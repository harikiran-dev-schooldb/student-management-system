import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getActiveProfile() {
  const cookieStore = await cookies();
  const activeProfileId = cookieStore.get("activeProfileId")?.value;
  console.log("All cookies:", cookieStore.getAll());
  console.log("Active Profile ID from cookie:", activeProfileId);

  if (!activeProfileId) return null;

  return prisma.profile.findUnique({
    where: { id: activeProfileId },
  });
}
