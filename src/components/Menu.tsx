"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/context/SidebarContext";
import Dropdown from "./Dropdown";

import {
  Home,
  Users,
  User,
  GraduationCap,
  CalendarCheck,
  BookOpenCheck,
  IndianRupee,
  MessageSquareText,
  Layers,
  School,
  Clock,
  FileText,
  BarChart3,
  ShieldCheck,
  Upload,
  LogOut,
  BarChart2,
  Edit,
} from "lucide-react";

type Role = "admin" | "teacher" | "student";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  visible: Role[];
  dropdown?: MenuItem[];
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    items: [
      {
        label: "Home",
        href: "/",
        icon: Home,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Users",
        href: "#",
        icon: Users,
        visible: ["admin"],
        dropdown: [
          {
            label: "Students",
            href: "/list/users/students",
            icon: GraduationCap,
            visible: ["admin"],
          },
          {
            label: "Teachers",
            href: "/list/users/teachers",
            icon: User,
            visible: ["admin"],
          },
          {
            label: "Admins",
            href: "/list/users/admin",
            icon: ShieldCheck,
            visible: ["admin"],
          },
        ],
      },
      {
        label: "Attendance",
        href: "#",
        icon: CalendarCheck,
        visible: ["admin", "teacher"],
        dropdown: [
          {
            label: "Mark Attendance",
            href: "/list/attendance/mark_attendance",
            icon: CalendarCheck,
            visible: ["admin", "teacher"],
          },
          {
            label: "View Attendance",
            href: "/list/attendance/view",
            icon: BarChart3,
            visible: ["admin", "teacher"],
          },
        ],
      },
      {
        label: "Homeworks",
        href: "/list/homeworks",
        icon: BookOpenCheck,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Fees",
        href: "#",
        icon: IndianRupee,
        visible: ["admin", "teacher"],
        dropdown: [
          {
            label: "Fee Collection",
            href: "/list/fees/collect",
            icon: IndianRupee,
            visible: ["admin", "teacher"],
          },
          {
            label: "Student Fee Report",
            href: "/list/reports/student-fees",
            icon: FileText,
            visible: ["admin"],
          },
          {
            label: "Day Wise Report",
            href: "/list/reports/daywise-fees",
            icon: BarChart3,
            visible: ["admin"],
          },
        ],
      },
      {
        label: "Messages",
        href: "/list/messages",
        icon: MessageSquareText,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Subjects",
        href: "/list/subjects",
        icon: Layers,
        visible: ["admin"],
      },
      {
        label: "Classes",
        href: "/list/classes",
        icon: School,
        visible: ["admin"],
      },
      {
        label: "Time Table",
        href: "/list/lessons",
        icon: Clock,
        visible: ["admin", "teacher"],
      },
      {
        label: "Exams",
        href: "/list/exams",
        icon: FileText,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Results",
        href: "#",
        icon: BarChart3,
        visible: ["admin", "teacher"],
        dropdown: [
          {
            label: "Marks Entry",
            href: "/list/results/marks-entry",
            icon: Edit,
            visible: ["admin", "teacher", "student"],
          },
          {
            label: "View Results",
            href: "/list/results/view",
            icon: BarChart2,
            visible: ["admin", "teacher", "student"],
          },
        ],
      },
      {
        label: "Import Data",
        href: "#",
        icon: Upload,
        visible: ["admin"],
        dropdown: [
          {
            label: "Grades",
            href: "/list/reports/bulk-import/grades",
            icon: School,
            visible: ["admin"],
          },
          {
            label: "Fees Structure",
            href: "/list/reports/bulk-import/feestructure",
            icon: IndianRupee,
            visible: ["admin"],
          },
          {
            label: "Teachers",
            href: "/list/reports/bulk-import/teachers",
            icon: User,
            visible: ["admin"],
          },
          {
            label: "Classes",
            href: "/list/reports/bulk-import/classes",
            icon: School,
            visible: ["admin"],
          },
          {
            label: "Students",
            href: "/list/reports/bulk-import/students",
            icon: GraduationCap,
            visible: ["admin"],
          },
          {
            label: "Subjects",
            href: "/list/reports/bulk-import/subjects",
            icon: Layers,
            visible: ["admin"],
          },
          {
            label: "Fees Collection",
            href: "/list/reports/bulk-import/feecollection",
            icon: IndianRupee,
            visible: ["admin"],
          },
          {
            label: "Time Table",
            href: "/list/reports/bulk-import/lessons",
            icon: Clock,
            visible: ["admin", "teacher"],
          },
        ],
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      {
        label: "Profile",
        href: "/list/profiles",
        icon: User,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Logout",
        href: "/logout",
        icon: LogOut,
        visible: ["admin", "teacher", "student"],
      },
    ],
  },
];

export default function Menu({ role }: { role: Role }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isOpen, toggle } = useSidebar();
  const isCollapsed = !isOpen;

  const handleClick = () => {
    if (window.innerWidth < 768 && isOpen) toggle();
  };

  return (
    <nav className="mt-4 flex flex-col gap-2 px-2">
      {menuSections.map((section, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          {section.title && !isCollapsed && (
            <span className="px-4 py-2 text-[11px] font-semibold uppercase text-gray-400">
              {t(section.title)}
            </span>
          )}

          {section.items
            .filter((item) => item.visible.includes(role))
            .map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              if (item.dropdown) {
                return (
                  <Dropdown
                    key={item.label}
                    icon={<Icon size={18} />}
                    label={item.label}
                    items={item.dropdown}
                    isCollapsed={isCollapsed}
                  />
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleClick}
                  className={`
    group relative flex items-center rounded-md py-2 transition-colors
    ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"}

    ${
      active
        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
    }
  `}
                >
                  {/* Icon */}
                  <span className="shrink-0">
                    <Icon size={18} />
                  </span>

                  {/* Label (expanded only) */}
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {t(item.label)}
                    </span>
                  )}

                  {/* Tooltip (collapsed only, NON-dropdown) */}
                  {isCollapsed && (
                    <span
                      className="
        pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2
        whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs
        text-white opacity-0 group-hover:opacity-100
        transition-opacity z-[9999]
      "
                    >
                      {t(item.label)}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
}
