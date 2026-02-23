import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

interface TeacherProfileIndexProps {
  params: Promise<{ schoolId: string }>;
}

const TeacherProfile = async ({ params }: TeacherProfileIndexProps) => {
  const { schoolId: slug } = await params;

  // 1️⃣ Resolve internal school id
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) notFound();

  // 2️⃣ Get user info (tenant-aware)
  const { role, userId } = await fetchUserInfo(slug);

  if (role === "teacher" && userId) {
    const teacher = await prisma.teacher.findFirst({
      where: {
        linkedUserId: userId,
        schoolId: school.id, // 🔒 IMPORTANT
      },
      select: { id: true },
    });

    if (teacher?.id) {
      redirect(`/${slug}/list/profiles/teacher/${teacher.id}`);
    }
  }

  // Admin fallback
  return <p>Select a teacher profile</p>;
};

export default TeacherProfile;
