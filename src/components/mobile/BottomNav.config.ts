import {
  Home,
  Users,
  CalendarCheck,
  MessageSquareText,
  Menu,
  GraduationCap,
  User,
  UserCheck,
  ShieldCheck,
  Edit,
  Eye,
  IndianRupee,
  Wallet,
  Banknote,
  LogOut,
  BookOpenCheck,
  FileText,
  BarChart,
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
    icon: CalendarCheck,
    visible: ["admin", "teacher"],
    dropdown: [
      {
        label: "Mark Attendance",
        href: "/list/attendance/mark",
        icon: Edit,
        visible: ["admin", "teacher"],
      },
      {
        label: "View Attendance",
        href: "/list/attendance/view",
        icon: Eye,
        visible: ["admin", "teacher", "student"],
      },
      {
        label: "Staff Attendance",
        href: "/list/staff-attendance",
        icon: UserCheck,
        visible: ["admin", "teacher"],
      },
    ],
  },

  {
    label: "Fee",
    icon: IndianRupee,
    visible: ["student"],
    href: () => "/list/fees/view",
  },

  {
    label: "Attendance",
    icon: CalendarCheck,
    visible: ["student"],
    href: () => "/list/attendance/",
  },

  {
    label: "Fees",
    icon: IndianRupee,
    visible: ["admin", "teacher"],
    dropdown: [
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
      {
        label: "Day Wise Report",
        href: "/list/reports/daywise-fees",
        icon: BarChart,
        visible: ["admin"],
      },
      {
        label: "Fee Management",
        href: "/list/fees/manage",
        icon: Edit,
        visible: ["admin"],
      },
    ],
  },

  {
    label: "More",
    icon: Menu,
    visible: ["admin", "teacher", "student"],
    dropdown: [
      {
        label: "Messages",
        icon: MessageSquareText,
        visible: ["admin", "teacher", "student"],
        href: () => "/list/messages",
      },
      {
        label: "Homeworks",
        icon: BookOpenCheck,
        visible: ["admin", "teacher", "student"],
        href: () => "/list/homeworks",
      },
      {
        label: "Exams",
        href: "/list/exams",
        icon: FileText,
        visible: ["admin", "teacher", "student"],
      },
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
