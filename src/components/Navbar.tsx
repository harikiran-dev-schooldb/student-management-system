import NavbarClient from "./NavbarClient";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ProfileWithUsersSelect } from "../../types/query-types";

export async function NavbarServer() {
  const user = await currentUser();

  if (!user) {
    return <NavbarClient roles={[]} activeUser={null} />;
  }

  const profile = await prisma.profile.findFirst({
    where: { clerk_id: user.id },
    select: ProfileWithUsersSelect,
  });

  if (!profile) {
    return <NavbarClient roles={[]} activeUser={null} />;
  }

  const roles = profile.users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.admin?.name ?? u.teacher?.name ?? u.student?.name ?? u.username,
    className: u.student?.Class?.name ?? undefined,
    role: u.role,
    img: u.admin?.img ?? u.teacher?.img ?? u.student?.img ?? null,
  }));

  return (
    <NavbarClient
      roles={roles}
      activeUser={
        profile.activeUser
          ? { username: profile.activeUser.username }
          : null
      }
    />
  );
}
