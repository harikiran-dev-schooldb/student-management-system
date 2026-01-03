"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/context/SidebarContext";
import { ChevronRight } from "lucide-react";

interface DropdownItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface DropdownProps {
  icon: React.ReactNode;
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
  const pathname = usePathname();
  const { toggle, isOpen: isSidebarOpen } = useSidebar();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* ---------------- Active Parent Logic ---------------- */

  const isChildActive = items.some((item) => pathname.startsWith(item.href));

  /* ---------------- Hover / Click Handling ---------------- */

  const openDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleTriggerClick = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Close sidebar on mobile
    if (isMobile && isSidebarOpen) {
      toggle();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /* ---------------- Render ---------------- */

  return (
    <div
      className="relative w-full"
      onMouseEnter={!isMobile ? openDropdown : undefined}
      onMouseLeave={!isMobile ? closeDropdown : undefined}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`
          group flex w-full items-center rounded-md py-2 transition-colors
          ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}

          ${
            isChildActive || isOpen
              ? "bg-gray-100 text-gray-900 dark:bg-darkMode dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }

          hover:bg-gray-100 hover:text-gray-900
          dark:hover:bg-gray-800 dark:hover:text-white
        `}
      >
        {/* Icon + Tooltip */}
        <div className="relative">
          {icon}

          {/* Tooltip when collapsed */}
          
        </div>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium whitespace-nowrap">
              {t(label)}
            </span>

            <ChevronRight
              size={14}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Fly-out (Slide Animation) */}
      <div
        className={`
          absolute left-full top-1 ml-4 z-50 w-52
          rounded-lg border
          bg-white dark:bg-darkMode
          border-gray-200 dark:border-white/10
          shadow-xl
          transition-all duration-200
          ${
            isOpen
              ? "opacity-100 translate-x-0 visible"
              : "opacity-0 translate-x-2 invisible pointer-events-none"
          }
        `}
      >
        <div className="p-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleItemClick}
                className={`
                  flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium
                  transition-colors
                  ${
                    active
                      ? "bg-indigo-500/10 text-indigo-500"
                      : "text-gray-700 dark:text-gray-300"
                  }
                  hover:bg-gray-100 dark:hover:bg-gray-700/50
                  hover:text-gray-900 dark:hover:text-white
                `}
              >
                <Icon size={14} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
