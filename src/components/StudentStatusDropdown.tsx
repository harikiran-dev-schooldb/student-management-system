"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";

// --- Premium Status Configuration ---
const STATUS_CONFIG: Record<string, any> = {
  ACTIVE: {
    label: "Active",
    icon: UserCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    checkColor: "text-emerald-600",
  },
  INACTIVE: {
    label: "Inactive",
    icon: UserX,
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
    checkColor: "text-slate-500",
  },
  TRANSFERRED: {
    label: "Transferred",
    icon: LogOut,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    checkColor: "text-indigo-600",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: Ban,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
    checkColor: "text-rose-600",
  },
};

export default function StudentStatusDropdown({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { schoolId } = useParams<{ schoolId: string }>();
  console.log("Current School:", schoolId);

  // Keep local state in sync if parent updates props
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const updateStatus = async (newStatus: string) => {
    // 1. Optimistic Check: Don't fire if clicking the same status
    if (newStatus === status) return;

    const oldStatus = status; // Backup for rollback
    setLoading(true);
    setStatus(newStatus); // ⚡ Update UI Immediately

    try {
      const res = await fetch(`/api/v1/tenants/${schoolId}/users/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error(error);
      setStatus(oldStatus); // Revert on failure
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end">

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            className="h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="left"
          align="start"
          sideOffset={5}
          // ✅ Native CSS Animations (Guarantees Clicks Work)
          className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-xl shadow-gray-200/50 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
        dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/50"
        >
          {/* Header Label */}
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Change Status
          </div>

          {Object.keys(STATUS_CONFIG).map((key) => {
            const config = STATUS_CONFIG[key];
            const Icon = config.icon;
            const isActive = status === key;

            return (
              <DropdownMenuItem
                key={key}
                onSelect={() => updateStatus(key)} // ✅ Standard Radix Event
                disabled={loading}
                className={clsx(
                  "relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium outline-none transition-all",
                  isActive
                    ? `${config.bgColor} ${config.color}` // Active Style
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                {/* Icon Box */}
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    isActive
                      ? "bg-white/50 dark:bg-black/20"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Icon className={clsx("h-4 w-4", config.color)} />
                </div>

                {/* Label */}
                <span className="flex-1">{config.label}</span>

                {/* Checkmark */}
                {isActive && (
                  <div className={config.checkColor}>
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}