export const dynamic = "force-dynamic";

import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function AttendanceViewIndex({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  const user = await fetchUserInfo(schoolId).catch(() => null);

  if (!user) {
    redirect(`/${schoolId}/logout`);
  }

  const { role, studentId } = user;

  if (role === "student" && studentId) {
    redirect(`/${schoolId}/list/attendance/calendar/${studentId}`);
  }

  redirect(`/${schoolId}/logout`);
}
