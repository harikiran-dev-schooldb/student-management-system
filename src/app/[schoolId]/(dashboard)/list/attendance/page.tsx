export const dynamic = "force-dynamic";

import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function AttendanceViewIndex({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId: schoolSlug } = await params;
  const user = await fetchUserInfo(schoolSlug).catch(() => null);

  if (!user) {
    redirect(`/${schoolSlug}/logout`);
  }

  const { role, studentId } = user;

  if (role === "student" && studentId) {
    redirect(`/${schoolSlug}/list/attendance/calendar/${studentId}`);
  }

  redirect(`/${schoolSlug}/logout`);
}
