"use client";

import SwitchUser from "./SwitchUser";
import ThemeToggle from "./ThemeToggle";
import TableSearch from "./TableSearch";

interface NavbarClientProps {
  roles: Array<{
    id: string;
    username: string;
    name: string;
    className?: string;
    role: string;
  }>;
  activeUser: { username?: string } | null;
}

export default function NavbarClient({ roles, activeUser }: NavbarClientProps) {
  return (
    <div className="flex items-center justify-between px-3 py-4 bg-white dark:bg-gray-800 shadow-md">
      {/* SEARCH BAR */}
      <TableSearch />

      {/* ICONS + USER */}
      <div className="flex items-center justify-end w-full gap-4 md:gap-6">
        {/* Messages */}
        <div className="flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <img src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        {/* Announcements */}
        <div className="relative flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <img src="/announcement.png" alt="Announcements" width={20} height={20} />
          <div className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-LamaPurple rounded-full -top-2 -right-2 shadow-md">
            1
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Role switcher */}
        <SwitchUser roles={roles} activeUsername={activeUser?.username ?? null} />
      </div>
    </div>
  );
}
