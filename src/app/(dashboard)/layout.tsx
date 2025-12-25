import Navbar from "@/components/Navbar";
import MenuWrapper from "@/components/MenuWrapper";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/context/SidebarContext";
import SidebarShell from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar controls its own width */}
        <SidebarShell>
          <MenuWrapper />
        </SidebarShell>

        {/* Main column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* <SidebarOverlay /> */}
      </div>
    </SidebarProvider>
  );
}
