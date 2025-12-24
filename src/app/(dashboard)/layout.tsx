import Navbar from "@/components/Navbar";
import MenuWrapper from "@/components/MenuWrapper";
import { SidebarProvider } from "@/components/context/SidebarContext";
import SidebarShell from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-gray-900">
        {/* SIDEBAR (controls its own width) */}
        <SidebarShell>
          <MenuWrapper />
        </SidebarShell>
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] dark:bg-gray-900">
          <Navbar />
          <div className="flex-1 overflow-y-auto mt-3 w-full">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
