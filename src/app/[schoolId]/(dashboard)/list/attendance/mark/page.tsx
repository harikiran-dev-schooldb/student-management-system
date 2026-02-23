import MarkAttendancePage from "@/components/MarkAttendancePage";
import { fetchUserInfo } from "@/lib/utils/server-utils";

type PageProps = {
  params: Promise<{ schoolId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { schoolId } = await params;
  const user = await fetchUserInfo(schoolId);
  console.log("School ID:", schoolId, "User Info:", user);

  if (!user?.role) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  return (
    <MarkAttendancePage
      role={user.role as "admin" | "teacher"}
      teacherClassId={user.role === "teacher" ? user.classId : undefined}
    />
  );
}
