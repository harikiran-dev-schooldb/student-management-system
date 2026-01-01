"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ElementType } from "react";
import { X } from "lucide-react";

type Item = {
  label: string;
  href: string;
  icon?: ElementType;
};

const ITEM_HEIGHT = 36;
const HEADER_HEIGHT = 32;
const SAFE_MARGIN = 12;
const BOTTOM_NAV_HEIGHT = 56;

export default function MobileSheet({
  title,
  items,
  anchor,
  onClose,
}: {
  title: string;
  items: Item[];
  anchor: { x: number; y: number };
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const close = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };

  /* ---------- Vertical positioning ---------- */
  const { top, openDirection } = useMemo(() => {
    const sheetHeight = items.length * ITEM_HEIGHT + HEADER_HEIGHT;
    const viewportHeight = window.innerHeight;

    const openUp = anchor.y > sheetHeight + SAFE_MARGIN;

    let calculatedTop = openUp
      ? anchor.y - sheetHeight - SAFE_MARGIN
      : anchor.y + SAFE_MARGIN;

    const maxTop =
      viewportHeight -
      sheetHeight -
      BOTTOM_NAV_HEIGHT -
      SAFE_MARGIN;

    calculatedTop = Math.min(calculatedTop, maxTop);

    return {
      top: Math.max(SAFE_MARGIN, calculatedTop),
      openDirection: openUp ? "up" : "down",
    };
  }, [anchor, items.length]);

  /* ---------- Width (adaptive) ---------- */
  const SHEET_WIDTH = items.length <= 3 ? 200 : 220;

  /* ---------- Horizontal positioning ---------- */
  const calculatedLeft = anchor.x - SHEET_WIDTH + 24;

  const clampedLeft = Math.min(
    Math.max(SAFE_MARGIN, calculatedLeft),
    window.innerWidth - SHEET_WIDTH - SAFE_MARGIN
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`
          fixed inset-0 z-[200]
          bg-black/40
          transition-opacity duration-200
          ${open ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Sheet */}
      <div
        className={`
          fixed z-[201]
          rounded-xl
          bg-white dark:bg-darkMode
          shadow-xl
          transition-all duration-300
          ease-smooth  /* ✅ UPDATED HERE */
          ${
            open
              ? "opacity-100 scale-100 translate-y-0"
              : openDirection === "up"
              ? "opacity-0 scale-95 translate-y-2"
              : "opacity-0 scale-95 -translate-y-2"
          }
        `}
        style={{
          width: SHEET_WIDTH,
          left: clampedLeft,
          top,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-white/10">
          <span className="text-sm font-medium">{title}</span>
          <button onClick={close}>
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <ul className="py-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="
                    flex items-center gap-2
                    px-3 py-2
                    text-[13px]
                    hover:bg-gray-100 dark:hover:bg-white/10
                  "
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}