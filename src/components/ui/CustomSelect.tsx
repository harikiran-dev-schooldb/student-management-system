"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export interface CustomSelectProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  icon,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`
          group flex items-center justify-between w-full p-3 
          bg-zinc-50 dark:bg-darkMode
          hover:bg-zinc-100 dark:hover:bg-zinc-800/50
          border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700
          rounded-xl cursor-pointer transition-all duration-200
          ${
            isOpen
              ? "ring-2 ring-indigo-500/20 bg-white dark:bg-darkMode"
              : ""
          }
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && (
            <div
              className={`
                p-2 rounded-lg transition-colors
                ${
                  value
                    ? "bg-indigo-100 dark:bg-darkMode text-indigo-600 dark:text-indigo-400"
                    : "bg-zinc-200 dark:bg-darkMode text-zinc-500"
                }
              `}
            >
              {icon}
            </div>
          )}

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
              {label}
            </span>

            <span
              className={`text-sm font-semibold truncate ${
                value
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-400"
              }`}
            >
              {selectedOption?.label || placeholder}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 w-full max-h-60 overflow-y-auto bg-white dark:bg-darkMode border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
          {options.length > 0 ? (
            options.map((opt) => {
              const isSelected =
                String(value) === String(opt.value);

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(String(opt.value));
                    setIsOpen(false);
                  }}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer 
                    transition-colors flex items-center justify-between
                    ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-darkbg"
                    }
                  `}
                >
                  {opt.label}
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-400 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
