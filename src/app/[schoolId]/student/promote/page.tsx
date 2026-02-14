import PromoteStudentsPage from "@/components/StudentPromotionPage";
import { fetchUserInfo } from "@/lib/utils/server-utils";

export default async function Page() {
  const user = await fetchUserInfo();

  if (!user?.role) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  return <PromoteStudentsPage />;
}
