import ViewAttendancePage from "@/components/ViewAttendancePage";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export default async function Page() {
  const user = await fetchUserInfo();

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
