

type Role = "admin" | "teacher" | "student";

export interface BottomNavItem {
  label: string;
  icon: any;
  visible: Role[];
  href?: string | ((role: Role) => string);
  dropdown?: BottomNavItem[];
}

export function resolveMobileItems(
  item: BottomNavItem,
  role: Role,
  schoolId: string
) {
  if (!item.dropdown) return [];

  return item.dropdown
    .filter((d) => d.visible.includes(role) && d.href)
    .map((d) => {
      if (!d.href) return null;

      const rawHref =
        typeof d.href === "function"
          ? d.href(role)
          : d.href;

      // 🔥 SPECIAL CASE: Home
      if (rawHref === "/") {
        return {
          label: d.label,
          icon: d.icon,
          href: `/${schoolId}`,
        };
      }

      const normalizedHref = rawHref.startsWith("/")
        ? rawHref
        : `/${rawHref}`;

      return {
        label: d.label,
        icon: d.icon,
        href: `/${schoolId}${normalizedHref}`,
      };
    });
}