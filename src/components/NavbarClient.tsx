"use client";

import { Menu } from "lucide-react";
import SwitchUser from "./SwitchUser";
import TableSearch from "./TableSearch";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import Link from "next/link";

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
  onToggleSidebar?: () => void; // ✅ injected from layout
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

export default function NavbarClient({
  roles,
  activeUser,
  onToggleSidebar,
}: NavbarClientProps) {
  const activeRole = roles.find((r) => r.username === activeUser?.username);

  return (
    <div className="flex justify-between px-3 py-2 bg-white dark:bg-[#121727] shadow-md">
      {/* LEFT: Logo + School Identity */}
      <div className="flex items-center gap-3 md:gap-6">
        

        {/* School Logo */}
        <img
          src="/logo.png"
          alt="Kotak Salesian School"
          width={40}
          height={40}
          className="object-contain"
        />

        {/* School Name & Affiliation */}
        <div className="px-4 hidden md:flex flex-col leading-tight">
          <span className="text-xl font-extrabold tracking-wide text-red-600 dark:text-gray-200">
            KOTAK SALESIAN SCHOOL
          </span>
          <span className="text-[14px] text-gray-600 dark:text-gray-400 font-semibold">
            (Affiliated to the Council for the I.S.C. Examination, New Delhi)
          </span>
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">
            Affiliation No. AP/050 – Dt. 04-11-1987
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search */}
        <div className="hidden md:block">
          <TableSearch />
        </div>
        {/* Messages */}
        <div className="flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8">
          <img src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        {/* Announcements */}
        <div className="relative flex items-center justify-center bg-gray-100 dark:bg-LamaPurple rounded-full cursor-pointer w-8 h-8">
          <img
            src="/announcement.png"
            alt="Announcements"
            width={20}
            height={20}
          />
          <div className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center text-white bg-LamaPurple rounded-full">
            1
          </div>
        </div>

        <ThemeToggle />

        {activeRole && (
          <div className="flex items-center gap-2">
            <Avatar img={activeRole.img} name={activeRole.name} />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-medium">{activeRole.name}</span>
              <span className="text-xs text-gray-500 capitalize">
                {activeRole.role}
              </span>
            </div>
          </div>
        )}

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
