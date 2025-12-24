"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 1. ADD THIS LINE to fix the 'Cannot find name' error
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Cleanup timer on unmount to prevent memory leaks
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const handleMouseEnter = () => {
    // 2. IMMEDIATE RESET: Clear the timer as soon as the mouse enters
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Function to close after 3 seconds (3000ms)
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Button Trigger */}
      <button
        type="button"
        className={`
          flex items-center w-full transition-all duration-200
          ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}
          py-2 rounded-md
          text-gray-700 dark:text-gray-200
          hover:bg-blue-100 dark:hover:bg-gray-700
          ${isOpen ? "bg-blue-50 dark:bg-gray-700" : ""}
        `}
      >
        <img src={icon} alt="" width={20} height={20} className="shrink-0" />

        {!isCollapsed && (
          <>
            <span className="whitespace-nowrap flex-1 text-left">
              {t(label)}
            </span>
            {/* Right-pointing arrow for fly-out menu */}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
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

      {/* Sub-Items Menu (Always Fly-out to the Right) */}
      <div
        className={`
          absolute z-[100] w-56 rounded-md shadow-xl
          bg-white dark:bg-gray-800
          ring-1 ring-black/10 dark:ring-white/10
          transition-all duration-200 origin-left
          
          /* POSITIONING: Moves to the right of the parent container */
          left-full top-0 ml-2

          /* VISIBILITY LOGIC */
          ${
            isOpen
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-95 invisible pointer-events-none"
          }
        `}
      >
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              <img src={item.icon} alt="" width={18} height={18} />
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
