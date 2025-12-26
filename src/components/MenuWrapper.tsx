import { currentUser } from "@clerk/nextjs/server";
import Menu from "./Menu";

export default async function MenuWrapper({
  isCollapsed,
}: {
  isCollapsed?: boolean;
}) {
  const user = await currentUser();

  const role =
    (user?.publicMetadata?.role as "admin" | "teacher" | "student") ??
    "student";

  return <Menu role={role}  />;
}
