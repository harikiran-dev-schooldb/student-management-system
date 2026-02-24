import type { ElementType } from "react";

type Role = "admin" | "teacher" | "student";

interface MenuItem {
  label: string;
  href?: string | ((role: Role) => string);
  icon: ElementType;
  visible: Role[];
  dropdown?: MenuItem[];
}

export function resolveMobileItems(
  item: MenuItem,
  role: Role,
  schoolId: string
) {
  if (!item.dropdown) return [];

  return item.dropdown
    .filter((d) => d.visible.includes(role))
    .map((d) => {
      const rawHref =
        typeof d.href === "function" ? d.href(role) : d.href!;

      return {
        label: d.label,
        icon: d.icon,
        href: `/${schoolId}${rawHref}`,
      };
    });
}