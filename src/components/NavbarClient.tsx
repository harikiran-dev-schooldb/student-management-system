"use client";

import SwitchUser from "./SwitchUser";
import ThemeToggle from "./ThemeToggle";

import Image from "next/image";

interface NavbarClientProps {
  roles: Array<{
    id: string;
    username: string;
    name: string;
    className?: string;
    role: string;
    img?: string | null;
  }>;
  activeUser: { username?: string } | null;
}

function Avatar({ img, name }: { img?: string | null; name: string }) {
  if (img) {
    return (
      <Image
        src={img}
        alt={name}
        width={36}
        height={36}
        className="rounded-full object-cover border border-gray-200 dark:border-gray-600"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

export default function NavbarClient({ roles, activeUser }: NavbarClientProps) {
  const activeRole = roles.find((r) => r.username === activeUser?.username);

  return (
    <div className="flex items-center justify-between px-3 py-4 bg-white dark:bg-gray-800 shadow-md">
      {/* ICONS + USER */}
      <div className="flex items-center justify-end w-full gap-4 md:gap-6">
        {/* Messages */}
        <div className="flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <img src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        {/* Announcements */}
        <div className="relative flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <img
            src="/announcement.png"
            alt="Announcements"
            width={20}
            height={20}
          />
          <div className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-LamaPurple rounded-full -top-2 -right-2 shadow-md">
            1
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* USER AVATAR + ROLE SWITCH */}
        {activeRole && (
          <div className="flex items-center gap-2">
            <Avatar img={activeRole.img} name={activeRole.name} />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {activeRole.name}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {activeRole.role}
              </span>
            </div>
          </div>
        )}

        {/* Role switcher – show only if multiple roles */}
        {roles.length > 1 && (
          <SwitchUser
            roles={roles}
            activeUsername={activeUser?.username ?? null}
          />
        )}
      </div>
    </div>
  );
}
