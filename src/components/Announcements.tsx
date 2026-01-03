"use server";

import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import clsx from "clsx";
import { CalendarDays, Megaphone, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

// Premium color accents map
// Using standard Tailwind colors to ensure it works out-of-the-box
const ACCENT_STYLES = [
  {
    border: "border-l-sky-500", // Bright Sky Blue
    bg: "bg-sky-50 dark:bg-sky-900/10",
    text: "text-sky-600 dark:text-sky-400",
  },
  {
    border: "border-l-purple-500", // Vibrant Purple
    bg: "bg-purple-50 dark:bg-purple-900/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    border: "border-l-pink-500", // Soft Pink/Rose
    bg: "bg-pink-50 dark:bg-pink-900/10",
    text: "text-pink-600 dark:text-pink-400",
  },
];

const Messages = async ({
  type = "ANNOUNCEMENT",
}: {
  type?: "ANNOUNCEMENT" | "GENERAL";
}) => {
  try {
    const { userId, role, students } = await fetchUserInfo();

    // Guard clause: If no user info, stop early
    if (!userId || !role) {
      return <ErrorState message="Could not authenticate user." />;
    }

    let classId: number | null = null;

    // Role-based logic: Students only see global + their class messages
    if (role === "student") {
      const student = students?.[0];
      // Fallback: If logic says student but no record found, filtering might fail safely
      classId = student?.classId ?? null;
    }

    // Dynamic Query Construction
    const whereCondition: Prisma.MessagesWhereInput = {
      type,
      ...(role !== "admin" && {
        OR: [
          { classId: classId ?? undefined }, // Class-specific
          { classId: null },                 // Global (School-wide)
        ],
      }),
    };

    const data = await prisma.messages.findMany({
      take: 3, // Limit to top 3 for the dashboard widget
      orderBy: { date: "desc" },
      where: whereCondition,
      include: {
        Class: true, // Include class name if it exists
      },
    });

    if (data.length === 0) return <EmptyState />;

    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-darkMode">
        {/* --- HEADER --- */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Announcements
            </h1>
          </div>
          <Link
            href="/list/messages"
            className="group flex items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            View All
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* --- LIST --- */}
        <div className="flex flex-col gap-4">
          {data.map((msg, index) => {
            // Cycle through styles safely
            const style = ACCENT_STYLES[index % ACCENT_STYLES.length];
            const dateStr = new Intl.DateTimeFormat("en-GB", {
              month: "short",
              day: "numeric",
            }).format(msg.date);

            return (
              <div
                key={msg.id}
                className={clsx(
                  "group relative flex flex-col gap-2 rounded-xl border border-gray-100 p-4 transition-all duration-200",
                  "bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-darkMode dark:bg-darkMode",
                  "border-l-[4px]", // The premium accent strip
                  style.border
                )}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {msg.Class?.name ?? (type === "GENERAL" ? "General Update" : "Announcement")}
                  </h2>
                  <div
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-2 py-1",
                      "bg-gray-50 dark:bg-darkMode"
                    )}
                  >
                    <CalendarDays className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {dateStr}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading messages:", error);
    return <ErrorState message="Unable to load announcements" />;
  }
};

/* --- Helper Components for UI Polish --- */

const EmptyState = () => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-black">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-darkMode">
      <Megaphone className="h-6 w-6 text-gray-300 dark:text-gray-600" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        No Announcements
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        You are all caught up!
      </p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex h-full min-h-[150px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
    <div className="flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      <span className="text-sm font-medium text-red-800 dark:text-red-300">
        {message}
      </span>
    </div>
  </div>
);

export default Messages;