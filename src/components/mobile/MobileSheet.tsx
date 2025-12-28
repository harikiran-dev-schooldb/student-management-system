"use client";

import Link from "next/link";
import type { ElementType } from "react";

export default function MobileSheet({
  title,
  items,
  onClose,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    icon?: ElementType;
  }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 rounded-t-xl
        bg-white dark:bg-[#121727] p-4"
      >
        <div className="mb-3 text-sm font-semibold text-gray-500">
          {title}
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm
                  bg-gray-100 dark:bg-gray-800
                  hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {Icon && <Icon size={18} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
