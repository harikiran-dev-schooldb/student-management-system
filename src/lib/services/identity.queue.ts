import prisma from "@/lib/prisma";

type IdentityInput = {
  username: string;
  phone: string;
  name: string;
  role: "student" | "teacher" | "admin" | "principal" | "superadmin";
  schoolId: string;
};

export async function enqueueIdentityJob(data: IdentityInput) {
  await prisma.identityJob.create({
    data: {
      username: data.username,
      phone: data.phone,
      name: data.name,
      role: data.role,
      schoolId: data.schoolId,
    },
  });
}