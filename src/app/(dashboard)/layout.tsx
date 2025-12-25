import Navbar from "@/components/Navbar";
import MenuWrapper from "@/components/MenuWrapper";
import SidebarShell from "@/components/Sidebar";
import { SidebarProvider } from "@/components/context/SidebarContext";

export default function DashboardLayout({
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

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-[#121727]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
