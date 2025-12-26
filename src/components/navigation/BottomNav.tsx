"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoreMenu from "../MoreMenu";

type Role = "admin" | "teacher" | "student";

export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] border-t border-gray-700 md:hidden">
        <div className="flex justify-around items-center h-16">

          <NavItem label="Home" icon="/home.png" href={`/${role}`} active={pathname === `/${role}`} />
          <NavItem label="Attendance" icon="/attendance.png" href="/list/attendance/view" active={pathname.includes("/attendance")} />
          <NavItem label="Classes" icon="/class.png" href="/list/classes" active={pathname.includes("/classes")} />
          <NavItem label="Messages" icon="/message.png" href="/list/messages" active={pathname.includes("/messages")} />

          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center text-xs text-gray-300"
          >
            <span className="text-xl">☰</span>
            More
          </button>
        </div>
      </nav>

      {/* Slide-up Menu */}
      {open && <MoreMenu role={role} onClose={() => setOpen(false)} />}
    </>
  );
}

function NavItem({ label, icon, href, active }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center text-xs ${active ? "text-blue-400" : "text-gray-300"}`}>
      <img src={icon} width={22} height={22} className={active ? "opacity-100" : "opacity-70"} />
      {label}
    </Link>
  );
}
