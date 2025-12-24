"use client";

import { useSidebar } from "@/components/context/SidebarContext";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggle } = useSidebar();

  return (
    <aside
      className={`
    h-screen transition-all duration-300 flex-col border-r
    bg-white dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#020617]
    border-gray-200 dark:border-white/10
    text-gray-700 dark:text-gray-200
    
    fixed inset-y-0 left-0 z-[100] 
    
    md:relative md:z-40
    
    /* VISIBILITY & WIDTH LOGIC */
    ${
      isOpen
        ? "flex w-64 translate-x-0"
        : "w-0 -translate-x-full md:flex md:w-20 md:translate-x-0 hidden"
    }
  `}
    >
      {/* TOP SECTION: Logo & Toggle */}
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } px-4 py-3 h-20`}
      >
        {isOpen && (
          <Link href="/" className="flex items-center gap-2 p-2">
            <img src="/logo.png" alt="logo" width={40} height={40} />
          </Link>
        )}

        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MENU SECTION: The scrollable area */}
      <div
        className={`
          flex-1 px-2 
          /* CRITICAL: Allow dropdowns to fly out to the right */
          overflow-x-visible 
          /* Allow vertical scrolling only when expanded */
          ${isOpen ? "overflow-y-visible" : "overflow-y-visible"}
        `}
      >
        {children}
      </div>
    </aside>
  );
}
