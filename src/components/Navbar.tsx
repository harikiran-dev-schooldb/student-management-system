import NavbarClient from "./NavbarClient";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export default async function NavbarServer() {
  const user = await currentUser();
  if (!user) return null;

  const profile = await prisma.profile.findFirst({
  where: {
    clerk_id: user.id,
  },
  select: {
    activeUser: {
      select: {
        username: true,
      },
    },
    users: {
      select: {
        id: true,
        username: true,
        role: true,

        admin: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
        student: {
          select: {
            name: true,
            Class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
  },
});


  if (!profile) {
  return <NavbarClient roles={[]} activeUser={null} />;
}


  const roles = profile?.users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.admin?.name ?? u.teacher?.name ?? u.student?.name ?? u.username,
    className: u.student?.Class?.name ?? undefined,
    role: u.role,
  }));

  return (
    <NavbarClient
      roles={roles ?? []}
      activeUser={
        profile?.activeUser ? { username: profile.activeUser.username } : null
      }
    />
  );
}
