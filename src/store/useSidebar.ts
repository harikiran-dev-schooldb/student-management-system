"use client";

import { create } from "zustand";

type SidebarState = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

export const useSidebar = create<SidebarState>((set) => ({
  open: false,        // mobile default: closed
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
