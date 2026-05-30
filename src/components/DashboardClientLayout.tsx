// components\DashboardClientLayout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import MenuWrapper from "@/components/MenuWrapper";
import SidebarShell from "@/components/Sidebar";
import { SidebarProvider } from "@/components/context/SidebarContext";

type Role = "admin" | "teacher" | "student";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
  schoolId: string;
}) {
  const { user } = useUser();

  const role = (user?.publicMetadata?.role as Role | undefined) ?? "student";

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white dark:bg-darkMode">
        {/* Desktop Sidebar */}
        <SidebarShell>
          <MenuWrapper />
        </SidebarShell>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-darkMode pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
