"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
}

export default function Dropdown({ icon, label, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isDesktop) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="relative group w-full"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main button */}
      <button
        onClick={() => !isDesktop && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
          if (e.key === "Escape") setIsOpen(false);
        }}
        className="flex items-center gap-3 w-full px-4 py-2 
                   text-gray-700 dark:text-gray-200 
                   hover:bg-blue-100 dark:hover:bg-gray-700 
                   rounded-md transition-all duration-300 ease-in-out"
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <Image src={icon} alt={label} width={20} height={20} className="min-w-[20px]" />
        <span className="hidden lg:block">{t(label)}</span>
        <svg
          className={`w-4 h-4 ml-auto transition-transform transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        className={`
          absolute z-50 mt-2 w-56 rounded-md shadow-lg 
          bg-white dark:bg-gray-800 
          ring-1 ring-black/10 dark:ring-white/10
          transition-all duration-300 ease-in-out transform origin-top-left
          ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
          md:left-full md:top-0 md:translate-x-2 left-0 translate-y-1
        `}
        role="menu"
      >
        <div className="py-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-blue-100 dark:hover:bg-gray-700 
                         transition-all duration-200 ease-in-out 
                         rounded-md whitespace-nowrap"
              role="menuitem"
            >
              <Image src={item.icon} alt={item.label} width={18} height={18} className="min-w-[18px]" />
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
