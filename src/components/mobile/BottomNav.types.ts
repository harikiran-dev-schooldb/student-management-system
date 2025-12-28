// BottomNav.types.ts
import type { ElementType } from "react";

export type Role = "admin" | "teacher" | "student";

export type BottomNavChild = {
  label: string;
  href: string | ((role: Role) => string);
  icon?: ElementType;
  visible: Role[];
};

export type BottomNavItem = {
  label: string;
  icon: ElementType;
  visible: Role[];
  href?: (role: Role) => string;
  children?: BottomNavChild[];
};
