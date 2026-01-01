"use client";

import { useSidebar } from "@/components/context/SidebarContext";
import { Menu, ChevronsLeft  } from "lucide-react";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggle } = useSidebar();

  return (
    <aside
      className={`
        hidden md:flex flex-col
        sticky top-0 left-0 h-screen
        bg-white dark:bg-darkMode
        border-r border-gray-200 dark:border-gray-800
        text-gray-600 dark:text-gray-300
        transition-all duration-300 ease-in-out
        z-40 shadow-sm
        ${isOpen ? "w-48" : "w-20"}
      `}
    >
      {/* --- HEADER: Logo & Toggle --- */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
        {/* Logo Area - Hides when collapsed */}
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            isOpen ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        ></div>

        {/* Toggle Button - Centered when collapsed */}
        <button
          onClick={toggle}
          className={`
            p-1.5 rounded-lg
            text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400
            hover:bg-indigo-50 dark:hover:bg-indigo-900/20
            transition-all duration-200
            ${!isOpen && "mx-auto"} 
          `}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronsLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div
        className={`
          flex-1 px-2 
          /* CRITICAL: Allow dropdowns to fly out to the right */
          overflow-x-visible 
          /* Allow vertical scrolling only when expanded */
          ${isOpen ? "overflow-y-visible" : "overflow-y-visible"}
        `}
      >
        <div className="flex flex-col gap-1">{children}</div>
      </div>

      {/* --- FOOTER (Optional: User Profile or Settings) --- */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800/50 shrink-0">
        {/* You can put a mini user profile here later */}
      </div>
    </aside>
  );
}
