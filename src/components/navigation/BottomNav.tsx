"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems } from "@/lib/BottomNav.config";
import MobileSheet from "../MobileSheet";

type Role = "admin" | "teacher" | "student";


export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<null | {
    title: string;
    items: { label: string; href: string }[];
  }>(null);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden
        bg-white dark:bg-[#121727]
        border-t border-gray-200 dark:border-white/10"
      >
        <ul className="flex justify-around items-center h-14">
          {bottomNavItems
            .filter((i) => i.visible.includes(role))
            .map((item) => {
              const Icon = item.icon;

              if (item.children) {
                return (
                  <li key={item.label}>
                    <button
                      onClick={() =>
                        setSheet({
                          title: item.label,
                          items: item.children!,
                        })
                      }
                      className="flex flex-col items-center gap-1 text-[11px]
                        text-gray-500 dark:text-gray-400"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              }

              const href = item.href!(role);
              const active = pathname.startsWith(href);

              return (
                <li key={item.label}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center gap-1 text-[11px]
                      ${
                        active
                          ? "text-LamaPurple"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {sheet && (
        <MobileSheet
          title={sheet.title}
          items={sheet.items}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
