import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

const StudentProfile = async () => {
  const { role, userId } = await fetchUserInfo();

  if (role === "student" && userId) {
    // Find the student in Prisma by linked user id
    const student = await prisma.student.findFirst({
      where: { linkedUserId: userId },

      select: { id: true, status: true },
    });

    

    if (student?.id) {
      redirect(`/list/profiles/student/${student.id}`);
    }
  }

  // fallback for admin/teacher roles
  return <p>Select a student profile</p>;
};

export default StudentProfile;
