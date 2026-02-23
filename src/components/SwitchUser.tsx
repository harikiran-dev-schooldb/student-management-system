"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useSchoolSlug } from "./hooks/getschool";

type Role = {
  id: string;
  username: string;
  name: string;
  className?: string;
  role: string;
  imageUrl?: string;
};

interface Props {
  roles: Role[];
  activeUsername?: string | null;
}

// ✅ Helper to get initials (first + last name)
function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (
    (parts[0][0] ?? "").toUpperCase() +
    (parts[parts.length - 1][0] ?? "").toUpperCase()
  );
}

export default function SwitchUser({ roles, activeUsername }: Props) {
  const [isPending, startTransition] = useTransition();
  const schoolId = useSchoolSlug();

  async function handleSwitch(username: string) {
    startTransition(async () => {
      await fetch(`/api/v1/tenants/${schoolId}/switch-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      window.location.reload();
    });
  }

  const activeRole = roles.find((r) => r.username === activeUsername);

  return (
    <DropdownMenu>
      {/* Avatar Trigger */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none shadow-md"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={-1} // ⬅️ CRITICAL
            className="inline-flex rounded-full"
          >
            <Avatar className="w-10 h-10 ring-2 ring-gray-200">
              {activeRole?.imageUrl ? (
                <AvatarImage src={activeRole.imageUrl} alt={activeRole.name} />
              ) : (
                <AvatarFallback>{getInitials(activeRole?.name)}</AvatarFallback>
              )}
            </Avatar>
          </motion.span>
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl shadow-lg border p-2 bg-white"
      >
        {roles.map((r) => {
          const isActive = r.username === activeUsername;
          return (
            <DropdownMenuItem
              key={r.id}
              onClick={() => handleSwitch(r.username)}
              disabled={isPending}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer 
                transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-gray-50"
                }`}
            >
              <Avatar className="w-8 h-8 border">
                {r.imageUrl ? (
                  <AvatarImage src={r.imageUrl} alt={r.name} />
                ) : (
                  <AvatarFallback>{getInitials(r.name)}</AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col flex-1">
                {/* ✅ No wrap + truncate */}
                <span className="text-sm font-semibold uppercase whitespace-nowrap truncate">
                  {r.name}
                </span>
                <span className="text-xs text-gray-500">
                  {r.className ?? r.role}
                </span>
              </div>

              {isActive && <Check className="w-4 h-4 text-blue-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
