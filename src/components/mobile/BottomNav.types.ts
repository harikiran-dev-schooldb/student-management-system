import type { ElementType } from "react";

export type Role = "admin" | "teacher" | "student";

export type BottomNavItem = {
  label: string;
  icon: ElementType;
  visible: Role[];
  href?: string | ((role: Role) => string);
  dropdown?: BottomNavItem[];
};