import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function FeesViewIndex({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId: schoolSlug } = await params;

  const { role, studentId } = await fetchUserInfo(schoolSlug).catch(() => ({ role: null, studentId: null }));

  if (role !== "student") {
    redirect(`/${schoolSlug}/logout`);
  }

  // Student → go to own fee view
  if (role === "student" && studentId) {
    redirect(`/${schoolSlug}/list/fees/view/${studentId}`);
  }

  // Admin / Teacher → go to collect page
  redirect(`/${schoolSlug}/list/fees/collect`);
}
