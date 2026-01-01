export const dynamic = "force-dynamic";

import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function AttendanceViewIndex() {
  const user = await fetchUserInfo().catch(() => null);

  if (!user) {
    redirect("/logout");
  }

  const { role, studentId } = user;

  if (role === "student" && studentId) {
    redirect(`/list/attendance/calendar/${studentId}`);
  }

  redirect("/logout");
}
