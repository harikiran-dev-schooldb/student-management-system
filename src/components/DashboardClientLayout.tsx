"use client";

import MenuWrapper from "@/components/MenuWrapper";
import SidebarShell from "@/components/Sidebar";
import { SidebarProvider } from "@/components/context/SidebarContext";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white dark:bg-[#121727]">
        {/* Sidebar */}
        <SidebarShell>
          <MenuWrapper />
        </SidebarShell>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#121727]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
