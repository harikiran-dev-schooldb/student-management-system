import { fetchUserInfo } from "@/lib/utils/server-utils";
import ViewAttendancePage from "@/components/ViewAttendancePage";
import { TenantPageProps } from "../../../../../../../types/tenant";

export default async function Page({ params }: TenantPageProps) {
  const { schoolId } = await params;

  const user = await fetchUserInfo(schoolId);

  if (!user?.role) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  return (
    <ViewAttendancePage
      role={user.role as "admin" | "teacher"}
      teacherClassId={user.role === "teacher" ? user.classId : undefined}
    />
  );
}
