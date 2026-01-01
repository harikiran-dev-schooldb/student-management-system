"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

import { bottomNavItems } from "./BottomNav.config";
import type { Role, BottomNavChild } from "./BottomNav.types";
import MobileSheet from "./MobileSheet";

type SheetItem = {
  label: string;
  href: string;
  icon?: ElementType;
};

type SheetState = {
  title: string;
  items: SheetItem[];
  anchor: { x: number; y: number };
};


/**
 * Resolves role-based hrefs into concrete URLs.
 * <Link> must always receive a string.
 */

function resolveHref(
  href: string | ((role: Role) => string),
  role: Role
): string {
  return typeof href === "function" ? href(role) : href;
}

export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<SheetState | null>(null);

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-[100]
          md:hidden
          bg-white dark:bg-darkMode
          border-t border-gray-200 dark:border-white/10
        "
      >
        <ul className="flex items-center justify-around h-14">
          {bottomNavItems
            .filter((item) => item.visible.includes(role))
            .map((item) => {
              const Icon = item.icon;

              /* ================= CHILD MENU ITEMS ================= */
              if (item.children) {
                const visibleChildren: SheetItem[] = item.children
                  .filter((child: BottomNavChild) =>
                    child.visible.includes(role)
                  )
                  .map((child) => ({
                    label: child.label,
                    icon: child.icon,
                    href: resolveHref(child.href, role),
                  }));

                // Do not render parent if nothing is visible
                if (visibleChildren.length === 0) return null;

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={(e) => {
                        const rect = (
                          e.currentTarget as HTMLElement
                        ).getBoundingClientRect();

                        setSheet({
                          title: item.label,
                          items: visibleChildren,
                          anchor: {
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          },
                        });
                      }}
                      className="
    flex flex-col items-center gap-1 text-[11px]
    text-gray-500 dark:text-gray-400
  "
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              }

              /* ================= DIRECT LINK ITEMS ================= */
              const resolvedHref = resolveHref(item.href!, role);
              const isActive = pathname.startsWith(resolvedHref);

              return (
                <li key={item.label}>
                  <Link
                    href={resolvedHref}
                    className={`
                      flex flex-col items-center gap-1 text-[11px]
                      ${
                        isActive
                          ? "text-LamaPurple"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Bottom Sheet */}
      {sheet && (
        <MobileSheet
          title={sheet.title}
          items={sheet.items}
          anchor={sheet.anchor}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
