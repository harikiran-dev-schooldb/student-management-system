import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { tenantPrisma } from "@/lib/tenant-prisma";

const StudentProfile = async ({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) => {
  const { schoolId: slug } = await params;

  // 1️⃣ Resolve internal school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) notFound();

  // 2️⃣ Tenant-scoped DB
  const db = tenantPrisma(school.id);

  // 3️⃣ Fetch user info with tenant
  const { role, userId } = await fetchUserInfo(school.id);

  if (role === "student" && userId) {
    const student = await db.student.findFirst({
      where: { linkedUserId: userId },
      select: { id: true, status: true },
    });

    if (student?.id) {
      redirect(`/${slug}/list/profiles/student/${student.id}`);
    }
  }

  return <p>Select a student profile</p>;
};

export default StudentProfile;
