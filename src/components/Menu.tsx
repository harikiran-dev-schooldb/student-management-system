"use client";

import Image from "next/image";
import Link from "next/link";
import Dropdown from "./Dropdown";
import { useTranslation } from "react-i18next";

type Role = "admin" | "teacher" | "student";

interface MenuProps {
  role: Role;
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
      { icon: "/home.png", label: "Home", href: "/", visible: ["admin", "teacher", "student"] },
      {
        icon: "/profile.png",
        label: "Users",
        href: "#",
        visible: ["admin"],
        dropdown: [
          { icon: "/student.png", label: "Students", href: "/list/users/students", visible: ["admin"] },
          { icon: "/teacher.png", label: "Teachers", href: "/list/users/teachers", visible: ["admin"] },
          { icon: "/admin.png", label: "Admins", href: "/list/users/admin", visible: ["admin"] },
        ],
      },
      { icon: "/student.png", label: "Students", href: "/list/users/students", visible: ["teacher"] },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          { icon: "/lesson.png", label: "Mark Attendance", href: "/list/attendance/mark_attendance", visible: ["admin", "teacher"] },
          { icon: "/attendance.png", label: "View Attendance", href: "/list/attendance/view", visible: ["admin", "teacher"] },
        ],
      },
      { icon: "/homework.png", label: "Homeworks", href: "/list/homeworks", visible: ["admin", "teacher", "student"] },
      {
        icon: "/fees.png",
        label: "Fees",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          { icon: "/fees.png", label: "Fee Collection", href: "/list/fees/collect", visible: ["admin", "teacher"], },
          { icon: "/student.png", label: "Student Fee Report", href: "/list/reports/student-fees", visible: ["admin"] },
          { icon: "/report.png", label: "Day Wise Report", href: "/list/reports/daywise-fees", visible: ["admin"] },
          { icon: "/edit.png", label: "Fee Management", href: "/list/fees/feemanagement", visible: ["admin"] },
        ],
      },
      { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin"] },
      { icon: "/lesson.png", label: "Time Table", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student"] },
      { icon: "/result.png", label: "View Results", href: "/list/results/view", visible: ["student"] },
      {
        icon: "/result.png",
        label: "Results",
        href: "#",
        visible: ["admin", "teacher"],
        dropdown: [
          { icon: "/result.png", label: "View Results", href: "/list/results/view", visible: ["admin", "teacher"] },
          { icon: "/lesson.png", label: "Marks Entry", href: "/list/results/marks-entry", visible: ["admin", "teacher"] },
        ],
      },
      { icon: "/exam.png", label: "Permissions", href: "/list/permissions", visible: ["admin"] },
      {
        icon: "/warning.png",
        label: "Import Data",
        href: "#",
        visible: ["admin"],
        dropdown: [
          { icon: "/class.png", label: "Grades", href: "/list/reports/bulk-import/grades", visible: ["admin"] },
          { icon: "/fees.png", label: "Fees Structure", href: "/list/reports/bulk-import/feestructure", visible: ["admin"] },
          { icon: "/teacher.png", label: "Teachers", href: "/list/reports/bulk-import/teachers", visible: ["admin"] },
          { icon: "/class.png", label: "Classes", href: "/list/reports/bulk-import/classes", visible: ["admin"] },
          { icon: "/student.png", label: "Students", href: "/list/reports/bulk-import/students", visible: ["admin"] },
          { icon: "/subject.png", label: "Subjects", href: "/list/reports/bulk-import/subjects", visible: ["admin"] },
          { icon: "/fees.png", label: "Fee Collection", href: "/list/reports/bulk-import/feecollection", visible: ["admin"] },
          { icon: "/lesson.png", label: "Time Table", href: "/list/reports/bulk-import/lessons", visible: ["admin"] },
        ],
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/list/profiles", visible: ["teacher", "student", "admin"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", visible: ["admin", "teacher", "student"] },
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
  const filteredDropdown = item.dropdown?.filter((sub) => sub.visible.includes(role));
  if (item.dropdown && (!filteredDropdown || filteredDropdown.length === 0)) return null;

  return { ...item, dropdown: filteredDropdown };
}

export default function Menu({ role }: MenuProps) {
  const { t } = useTranslation();

  // Filter + transform menu items
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
    <div className="mt-4 text-sm">
      {updatedMenu.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          {section.title && (
            <span className="hidden my-4 mb-4 font-light text-gray-500 dark:text-gray-400 lg:block">
              {t(section.title)}
            </span>
          )}
          {section.items.map((item) =>
            item.dropdown ? (
              <Dropdown
                key={item.label}
                icon={item.icon}
                label={t(item.label)}
                items={item.dropdown}
              />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center gap-6 py-2 
                           rounded-md md:px-4 
                           text-gray-700 dark:text-gray-200 
                           hover:bg-LamaSkyLight dark:hover:bg-gray-700
                           lg:justify-start"
              >
                <Image src={item.icon} alt={item.label} width={20} height={20} />
                <span className="hidden lg:block">{t(item.label)}</span>
              </Link>
            )
          )}
        </div>
      ))}
    </div>
  );
}
