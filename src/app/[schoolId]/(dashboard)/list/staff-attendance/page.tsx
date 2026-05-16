import StaffAttendancePage from "@/components/StaffAttendancePage";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ schoolId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { schoolId: schoolSlug } = await params;
  const user = await fetchUserInfo(schoolSlug).catch(() => null);

  if (!user) {
    redirect(`/${schoolSlug}/logout`);
  }

  const role = user.role;

  if (role !== "admin" && role !== "teacher") {
    notFound();
  }

  return <StaffAttendancePage role={role} />;
}
