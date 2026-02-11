import StudentPerformancePage from "@/components/StudentPerformancePage";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export default async function Page() {
  const user = await fetchUserInfo();

  if (!user?.role) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  return (
    <StudentPerformancePage
      role={user.role as "admin" | "teacher"}
      teacherClassId={user.role === "teacher" ? user.classId : undefined}
    />
  );
}
