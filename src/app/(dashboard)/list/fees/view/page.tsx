import { fetchUserInfo } from "@/lib/utils/server-utils";
import { redirect } from "next/navigation";

export default async function FeesViewIndex() {
  const { role, studentId } = await fetchUserInfo();

  if (role === "student" && studentId) {
    redirect(`/list/fees/view/${studentId}`);
  }

  // Admin can land here (optional dashboard)
  redirect("/list/fees/collect");
}
