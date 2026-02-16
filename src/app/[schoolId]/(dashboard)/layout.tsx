// app/[schoolId]/(dashboard)/layout.tsx

export const dynamic = "force-dynamic";

import PageNavbar from "@/components/PageNavbar";
import DashboardClientLayout from "@/components/DashboardClientLayout";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  return (
    <>
      <PageNavbar schoolId={schoolId} />
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </>
  );
}
