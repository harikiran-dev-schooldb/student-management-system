import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

const ProfilePage = async () => {
  const { role, userId } = await fetchUserInfo();

  if (role === "teacher" && userId) {
    // Find the student in Prisma by linked user id
    const teacher = await prisma.teacher.findFirst({
      where: { linkedUserId: userId },
      select: { id: true },
    });

    if (teacher?.id) {
      redirect(`/list/profiles/teachers/${teacher.id}`);
    }
  }

  // fallback for admin/teacher roles
  return <p>Select a student profile</p>;
};

export default ProfilePage;
