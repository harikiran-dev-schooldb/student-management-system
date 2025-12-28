import DashboardClientLayout from "@/components/DashboardClientLayout";
import PageNavbar from "@/components/PageNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ SERVER: Clerk + Prisma allowed */}
      <PageNavbar />

      {/* ✅ CLIENT: sidebar + context */}
      <DashboardClientLayout>
        {children}
      </DashboardClientLayout>
    </>
  );
}
