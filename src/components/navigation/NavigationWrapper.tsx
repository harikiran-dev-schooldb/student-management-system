"use client";

import { useEffect, useState } from "react";
import MenuWrapper from "@/components/MenuWrapper";
import SidebarShell from "@/components/Sidebar";
import BottomNav from "./BottomNav";

type Role = "admin" | "teacher" | "student";

export default function NavigationWrapper({ role }: { role: Role }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone;

      setMobile(isStandalone || window.innerWidth < 768);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (mobile) {
    return <BottomNav role={role} />;
  }

  return (
    <SidebarShell>
      <MenuWrapper />
    </SidebarShell>
  );
}
