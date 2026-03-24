import StudentPerformancePage from "@/components/StudentPerformancePage";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ schoolId: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1️⃣ Resolve slug
  const { schoolId: slug } = await params;
  const schoolId = await resolveSchoolId(slug);

  const db = tenantPrisma(schoolId);

  // 2️⃣ Get internal school ID
  const school = await db.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) return notFound();

  // 3️⃣ Fetch user info scoped to this school
  const user = await fetchUserInfo(slug);

  if (!user?.role) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  return (
    <StudentPerformancePage
      role={user.role as "admin" | "teacher"}
      teacherClassId={user.role === "teacher" ? user.classId : undefined}
    />
  );
}
