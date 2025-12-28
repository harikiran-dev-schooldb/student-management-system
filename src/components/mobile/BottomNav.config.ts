import {
  Home,
  Users,
  CalendarCheck,
  MessageSquareText,
  Menu,
  GraduationCap,
  User,
  ShieldCheck,
  Edit,
  Eye,
  IndianRupee,
  Wallet,
  Banknote,
  LogOut,
  BookOpenCheck,
} from "lucide-react";

import type { BottomNavItem } from "./BottomNav.types";

export const bottomNavItems: BottomNavItem[] = [
  {
    label: "Home",
    icon: Home,
    visible: ["admin", "teacher", "student"],
    href: (role) => `/${role}`,
  },

  {
    label: "Users",
    icon: Users,
    visible: ["admin"],
    children: [
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
    label: "Homeworks",
    icon: BookOpenCheck,
    visible: ["admin", "teacher", "student"],
    href: () => "/list/homeworks",
  },

  {
    label: "Attendance",
    icon: CalendarCheck,
    visible: ["admin", "teacher"],
    children: [
      {
        label: "Mark Attendance",
        href: "/list/attendance/mark_attendance",
        icon: Edit,
        visible: ["admin", "teacher"],
      },
      {
        label: "View Attendance",
        href: "/list/attendance/view",
        icon: Eye,
        visible: ["admin", "teacher", "student"],
      },
    ],
  },

  {
    label: "Messages",
    icon: MessageSquareText,
    visible: ["admin", "teacher", "student"],
    href: () => "/list/messages",
  },

  {
    label: "Fees",
    icon: IndianRupee,
    visible: ["admin", "teacher"],
    children: [
      {
        label: "Collect Fees",
        href: "/list/fees/collect",
        icon: Wallet,
        visible: ["admin", "teacher"],
      },
      {
        label: "Student Fees Report",
        href: "/list/reports/student-fees",
        icon: Banknote,
        visible: ["admin"],
      },
    ],
  },

  {
    label: "More",
    icon: Menu,
    visible: ["admin", "teacher", "student"],
    children: [
      {
        label: "Enter Results",
        href: "/list/results/marks-entry",
        icon: Edit,
        visible: ["admin", "teacher"],
      },
      {
        label: "View Results",
        href: "/list/results/view",
        icon: Eye,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Profile",
        href: (role) => `/list/profiles/${role}`,
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
