import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

const ProfilePage = async () => {
  const { role, userId } = await fetchUserInfo();

  if (role === "student" && userId) {
    // Find the student in Prisma by linked user id
    const student = await prisma.student.findFirst({
      where: { linkedUserId: userId },
      select: { id: true },
    });

    if (student?.id) {
      redirect(`/list/users/students/${student.id}`);
    }
  }

  // fallback for admin/teacher roles
  return <p>Select a student profile</p>;
};

export default ProfilePage;
