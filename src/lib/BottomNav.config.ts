// BottomNav.config.ts
import {
  Home,
  Users,
  CalendarCheck,
  MessageSquareText,
  User,
} from "lucide-react";

type Role = "admin" | "teacher" | "student";

export const bottomNavItems = [
  {
    label: "Home",
    icon: Home,
    href: (role: Role) => `/${role}`,
    visible: ["admin", "teacher", "student"],
  },
  {
    label: "Users",
    icon: Users,
    visible: ["admin"],
    children: [
      { label: "Students", href: "/list/users/students" },
      { label: "Teachers", href: "/list/users/teachers" },
      { label: "Admins", href: "/list/users/admin" },
    ],
  },
  {
    label: "Attendance",
    icon: CalendarCheck,
    visible: ["admin", "teacher"],
    children: [
      { label: "Mark Attendance", href: "/list/attendance/mark_attendance" },
      { label: "View Attendance", href: "/list/attendance/view" },
    ],
  },
  {
    label: "Messages",
    icon: MessageSquareText,
    href: () => "/list/messages",
    visible: ["admin", "teacher", "student"],
  },
  {
    label: "Profile",
    icon: User,
    href: (role: Role) => `/list/profiles/${role}`,
    visible: ["admin", "teacher", "student"],
  },
];
