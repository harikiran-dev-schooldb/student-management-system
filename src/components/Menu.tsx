"use client";

import Link from "next/link";
import Dropdown from "./Dropdown";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/context/SidebarContext"; // Import the hook
import { usePathname } from "next/navigation";

type Role = "admin" | "teacher" | "student";

interface MenuProps {
  role: Role;
  isCollapsed?: boolean;
}

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: Role[];
  dropdown?: MenuItem[];
}

interface MenuItemSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuItemSection[] = [
  {
    title: "",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/profile.png",
        label: "Users",
        href: "#",
        visible: ["admin"],
        dropdown: [
          {
            icon: "/student.png",
            label: "Students",
            href: "/list/users/students",
            visible: ["admin"],
          },
          {
            icon: "/teacher.png",
            label: "Teachers",
            href: "/list/users/teachers",
            visible: ["admin"],
          },
          {
            icon: "/admin.png",
            label: "Admins",
            href: "/list/users/admin",
            visible: ["admin"],
          },
        ],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/users/students",
        visible: ["teacher"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          {
            icon: "/lesson.png",
            label: "Mark Attendance",
            href: "/list/attendance/mark_attendance",
            visible: ["admin", "teacher"],
          },
          {
            icon: "/attendance.png",
            label: "View Attendance",
            href: "/list/attendance/view",
            visible: ["admin", "teacher"],
          },
        ],
      },
      {
        icon: "/homework.png",
        label: "Homeworks",
        href: "/list/homeworks",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/fees.png",
        label: "Fees",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          {
            icon: "/fees.png",
            label: "Fee Collection",
            href: "/list/fees/collect",
            visible: ["admin", "teacher"],
          },
          {
            icon: "/student.png",
            label: "Student Fee Report",
            href: "/list/reports/student-fees",
            visible: ["admin"],
          },
          {
            icon: "/report.png",
            label: "Day Wise Report",
            href: "/list/reports/daywise-fees",
            visible: ["admin"],
          },
          {
            icon: "/edit.png",
            label: "Fee Management",
            href: "/list/fees/feemanagement",
            visible: ["admin"],
          },
        ],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin"],
      },
      {
        icon: "/lesson.png",
        label: "Time Table",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/result.png",
        label: "View Results",
        href: "/list/results/view",
        visible: ["student"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          {
            icon: "/result.png",
            label: "View Results",
            href: "/list/results/view",
            visible: ["admin", "teacher"],
          },
          {
            icon: "/lesson.png",
            label: "Marks Entry",
            href: "/list/results/marks-entry",
            visible: ["admin", "teacher"],
          },
        ],
      },
      {
        icon: "/exam.png",
        label: "Permissions",
        href: "/list/permissions",
        visible: ["admin"],
      },
      {
        icon: "/warning.png",
        label: "Import Data",
        href: "#",
        visible: ["admin"],
        dropdown: [
          {
            icon: "/class.png",
            label: "Grades",
            href: "/list/reports/bulk-import/grades",
            visible: ["admin"],
          },
          {
            icon: "/fees.png",
            label: "Fees Structure",
            href: "/list/reports/bulk-import/feestructure",
            visible: ["admin"],
          },
          {
            icon: "/teacher.png",
            label: "Teachers",
            href: "/list/reports/bulk-import/teachers",
            visible: ["admin"],
          },
          {
            icon: "/class.png",
            label: "Classes",
            href: "/list/reports/bulk-import/classes",
            visible: ["admin"],
          },
          {
            icon: "/student.png",
            label: "Students",
            href: "/list/reports/bulk-import/students",
            visible: ["admin"],
          },
          {
            icon: "/subject.png",
            label: "Subjects",
            href: "/list/reports/bulk-import/subjects",
            visible: ["admin"],
          },
          {
            icon: "/fees.png",
            label: "Fee Collection",
            href: "/list/reports/bulk-import/feecollection",
            visible: ["admin"],
          },
          {
            icon: "/lesson.png",
            label: "Time Table",
            href: "/list/reports/bulk-import/lessons",
            visible: ["admin"],
          },
        ],
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/list/profiles",
        visible: ["teacher", "student", "admin"],
      },
      // { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student"] },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student"],
      },
    ],
  },
];

/**
 * Dynamically adjust menu items based on role
 */
function updateMenuItem(item: MenuItem, role: Role): MenuItem | null {
  // Home should redirect to /<role>
  if (item.label === "Home") {
    return { ...item, href: `/${role}` };
  }

  // Profile should redirect to role-specific profile
  if (item.label === "Profile") {
    const profileHref: Record<Role, string> = {
      student: "/list/profiles/student",
      teacher: "/list/profiles/teacher",
      admin: "/list/profiles/admin",
    };
    return { ...item, href: profileHref[role] };
  }

  // Filter dropdown items by role
  const filteredDropdown = item.dropdown?.filter((sub) =>
    sub.visible.includes(role)
  );
  if (item.dropdown && (!filteredDropdown || filteredDropdown.length === 0))
    return null;

  return { ...item, dropdown: filteredDropdown };
}

export default function Menu({ role }: MenuProps) {
  if (!role) {
    return <div className="p-4 text-gray-400 text-sm">Loading menu...</div>;
  }

  const pathname = usePathname();
  const { t } = useTranslation();
  const { isOpen, toggle } = useSidebar();
  const isCollapsed = !isOpen;

  // Logic to auto-close sidebar on mobile after clicking
  const handleLinkClick = () => {
    if (window.innerWidth < 768 && isOpen) {
      toggle();
    }
  };

  // Filter + transform menu items logic (updateMenuItem call remains same)
  const updatedMenu: MenuItemSection[] = menuItems
    .map((section) => {
      const filteredItems = section.items
        .map((item) => updateMenuItem(item, role))
        .filter((item): item is MenuItem => !!item)
        .filter((item) => item.visible.includes(role));

      return filteredItems.length ? { ...section, items: filteredItems } : null;
    })
    .filter((section): section is MenuItemSection => section !== null);

  return (
    <div className="mt-4 flex flex-col gap-1 px-2">
      {updatedMenu.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          {/* Section Title - Compact styling */}
          {section.title && !isCollapsed && (
            <span className="mt-4 mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {t(section.title)}
            </span>
          )}

          {/* Menu Items */}
          {section.items.map((item) => {
            const isActive = pathname === item.href;

            return item.dropdown ? (
              <Dropdown
                key={item.label}
                icon={item.icon}
                label={t(item.label)}
                items={item.dropdown}
                isCollapsed={isCollapsed}
              />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center transition-all duration-200 rounded-md
                  ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}
                  py-2
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e293b]"
                  }
                `}
              >
                <img
                  src={item.icon}
                  alt=""
                  width={18} // Matching Dropdown icons
                  height={18}
                  className={`shrink-0 ${
                    isActive ? "opacity-100" : "opacity-70"
                  }`}
                />

                {!isCollapsed && (
                  <span className="text-[13px] font-medium whitespace-nowrap">
                    {t(item.label)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
