// components\DashboardClientLayout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import MenuWrapper from "@/components/MenuWrapper";
import SidebarShell from "@/components/Sidebar";
import { SidebarProvider } from "@/components/context/SidebarContext";
import BottomNav from "./mobile/BottomNav";
import { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";

type Role = "admin" | "teacher" | "student";

export default function DashboardClientLayout({
  children,
  schoolId,
}: {
  children: React.ReactNode;
  schoolId: string;

}) {
  const { user } = useUser();

  const role =
    (user?.publicMetadata?.role as Role | undefined) ?? "student";


  useEffect(() => {
    console.log("🚀 Initializing Push Notifications");

    // Request permission
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      } else {
        console.log("❌ Permission denied");
      }
    });

    // Token received
    PushNotifications.addListener("registration", async (token) => {
      console.log("📱 FCM Token from plugin:", token.value);

      try {
        await fetch(`/api/v1/tenants/${schoolId}/save-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token.value }),
        });

        console.log("✅ Token saved to DB");
      } catch (err) {
        console.error("❌ Save failed", err);
      }
    });

    // Error
    PushNotifications.addListener("registrationError", (err) => {
      console.error("❌ FCM Error:", err);
    });

  }, [schoolId]);

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

        {/* Mobile Bottom Nav */}
        <BottomNav role={role} />
      </div>
    </SidebarProvider>
  );
}
