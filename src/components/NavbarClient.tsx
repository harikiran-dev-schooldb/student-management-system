"use client";

import SwitchUser from "./SwitchUser";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { MessageSquare, Bell, Menu } from "lucide-react";

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
  onToggleSidebar?: () => void;
}

// --- Helper Components ---
function Avatar({ img, name }: { img?: string | null; name: string }) {
  if (img) {
    return (
      <div className="relative w-9 h-9">
        <Image
          src={img}
          alt={name}
          fill
          className="rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm">
      {initials}
    </div>
  );
}

function IconButton({ 
  icon: Icon, 
  badge 
}: { 
  icon: React.ElementType; 
  badge?: number 
}) {
  return (
    <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all">
      <Icon size={20} strokeWidth={2} />
      {badge && (
        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      )}
    </button>
  );
}

// --- Main Component ---
export default function NavbarClient({
  roles,
  activeUser,
  onToggleSidebar,
}: NavbarClientProps) {
  const activeRole = roles.find((r) => r.username === activeUser?.username);

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 dark:bg-darkMode backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* LEFT: Branding & Toggle */}
        <div className="flex items-center gap-4">
          {/* Mobile Toggle */}
          {/* <button 
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button> */}

          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 sm:w-10 sm:h-10">
               <Image
                 src="/logo.png"
                 alt="Logo"
                 fill
                 className="object-contain"
               />
             </div>
             
             {/* Text Branding - Visible on larger screens */}
             <div className="hidden lg:flex flex-col -space-y-0.5">
               <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                 Kotak Salesian School
               </span>
               <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                 Admin Dashboard
               </span>
             </div>
          </div>
        </div>

        {/* RIGHT: Actions & User Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Action Icons Group */}
          <div className="flex items-center pr-2 sm:pr-4 border-r border-slate-200 dark:border-slate-700/50 space-x-1">
            <IconButton icon={MessageSquare} />
            <IconButton icon={Bell} badge={1} />
            <ThemeToggle />
          </div>

          {/* User Profile Area */}
          <div className="flex items-center gap-3 pl-2 sm:pl-4">
            {activeRole && (
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="hidden md:flex flex-col items-end leading-tight">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {activeRole.name}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {activeRole.role}
                  </span>
                </div>
                <Avatar img={activeRole.img} name={activeRole.name} />
              </div>
            )}

            {roles.length > 1 && (
              <div className="ml-1">
                <SwitchUser
                  roles={roles}
                  activeUsername={activeUser?.username ?? null}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}