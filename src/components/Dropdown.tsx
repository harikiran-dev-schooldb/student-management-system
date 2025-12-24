"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/context/SidebarContext";

interface DropdownItem {
  icon: string;
  label: string;
  href: string;
}

interface DropdownProps {
  icon: string;
  label: string;
  items: DropdownItem[];
  isCollapsed?: boolean;
}

export default function Dropdown({
  icon,
  label,
  items,
  isCollapsed,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { toggle, isOpen: isSidebarOpen } = useSidebar();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!mounted) return null;

  // --- Handlers ---

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // 500ms buffer to allow user to move mouse into the fly-out menu
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // If we are on mobile (sidebar behaves as overlay), close the whole sidebar
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggle();
    }
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Main Button Trigger */}
      <button
        type="button"
        className={`
          flex items-center w-full transition-all duration-200
          ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}
          py-2 rounded-md
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-[#1e293b]
          ${isOpen ? "bg-gray-100 dark:bg-[#1e293b]" : ""}
        `}
      >
        <img src={icon} alt="" width={18} height={18} className="shrink-0 opacity-80" />

        {!isCollapsed && (
          <>
            <span className="whitespace-nowrap flex-1 text-left text-[13px] font-medium">
              {t(label)}
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isOpen ? "rotate-90" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </button>

      {/* Sub-Items Menu (Compact Fly-out) */}
      <div
        className={`
          absolute z-[100] w-48 rounded-lg shadow-2xl
          bg-white dark:bg-[#1e293b]
          border border-gray-200 dark:border-white/10
          transition-all duration-200 origin-left
          
          /* Positioning: To the right with a small gap */
          left-full top-0 ml-3

          /* Visibility Logic */
          ${isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}
        `}
      >
        <div className="py-1.5 px-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleItemClick}
              className="
                flex items-center gap-2.5 px-3 py-1.5 
                text-[12px] font-medium
                text-gray-600 dark:text-gray-200 
                hover:bg-gray-50 dark:hover:bg-gray-700/50 
                rounded-md transition-colors
              "
            >
              <img src={item.icon} alt="" width={14} height={14} className="shrink-0" />
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}