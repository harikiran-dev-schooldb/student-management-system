"use client";

import { useSidebar } from "@/components/context/SidebarContext";
import { Menu } from "lucide-react";

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
    bg-white dark:bg-[#121727]
    border-gray-200 dark:border-white/10
    text-gray-700 dark:text-gray-200

    fixed inset-y-0 left-0 z-[100]
    md:relative md:z-40

    ${
      isOpen
        ? "flex w-[200px] md:w-48 translate-x-0"
        : "hidden md:flex md:w-20 md:translate-x-0"
    }
  `}
    >
      {/* TOP SECTION: Logo & Toggle */}
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } px-4 py-3 h-20`}
      >

        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-LamaSkyLight dark:hover:bg-gray-700 transition-colors"
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
