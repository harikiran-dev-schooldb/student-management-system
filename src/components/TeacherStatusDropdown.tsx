"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Ban,
  Check,
  LogOut,
  MoreVertical,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const statusOptions = [
  {
    value: "ACTIVE",
    label: "Active",
    icon: UserCheck,
    color: "text-green-600",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    icon: UserX,
    color: "text-gray-500",
  },
  {
    value: "ON_LEAVE",
    label: "On Leave",
    icon: LogOut,
    color: "text-blue-600",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    icon: Ban,
    color: "text-red-600",
  },
];

export default function TeacherStatusDropdown({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);

    const res = await fetch(`/api/users/teachers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      console.error("Failed to update teacher status");
    }
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" className="p-0">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-44 rounded-md border bg-white shadow-lg p-1"
            >
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => updateStatus(option.value)}
                    className="flex items-center justify-between cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {status === option.value && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`flex-1 text-right ${option.color}`}>
                      {option.label}
                    </span>
                    <Icon className={`h-4 w-4 ${option.color}`} />
                  </DropdownMenuItem>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
