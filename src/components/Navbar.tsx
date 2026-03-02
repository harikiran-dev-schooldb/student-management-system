import NavbarClient from "./NavbarClient";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ProfileWithUsersSelect } from "../../types/query-types";

export async function NavbarServer({
  schoolId,
  onToggleSidebar,
}: {
  schoolId: string;
  onToggleSidebar?: () => void;
}) {
  const user = await currentUser();

  if (!user) {
    return (
      <NavbarClient
        schoolName={schoolId}
        roles={[]}
        activeUser={null}
        onToggleSidebar={onToggleSidebar}
      />
    );
  }

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId },
    select: { name: true, logo: true },
  });

  const schoolName = school?.name ?? schoolId;

  const profile = await prisma.profile.findFirst({
    where: { clerk_id: user.id },
    select: ProfileWithUsersSelect,
  });

  if (!profile) {
    return (
      <NavbarClient
        schoolName={schoolName}
        logoUrl={school?.logo ?? null}
        roles={[]}
        activeUser={null}
        onToggleSidebar={onToggleSidebar}
      />
    );
  }

  const roles = profile.users.map((u) => {
    const enrollment = u.student?.enrollments?.[0];
    const studentClass = enrollment?.class;

    return {
      id: u.id,
      username: u.username,
      name: u.admin?.name ?? u.teacher?.name ?? u.student?.name ?? u.username,

      className: studentClass?.name ?? undefined,

      role: u.role,

      img: u.admin?.img ?? u.teacher?.img ?? u.student?.img ?? null,
    };
  });

  return (
    <NavbarClient
      schoolName={schoolName}
      logoUrl={school?.logo ?? null}
      roles={roles}
      activeUser={
        profile.activeUser ? { username: profile.activeUser.username } : null
      }
      onToggleSidebar={onToggleSidebar}
    />
  );
}
