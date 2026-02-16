import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function FeesViewIndex({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;

  const { role, studentId } = await fetchUserInfo(schoolId);

  // Student → go to own fee view
  if (role === "student" && studentId) {
    redirect(`/${schoolId}/list/fees/view/${studentId}`);
  }

  // Admin / Teacher → go to collect page
  redirect(`/${schoolId}/list/fees/collect`);
}
