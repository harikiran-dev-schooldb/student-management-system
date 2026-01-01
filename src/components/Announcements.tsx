"use server";

import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import clsx from "clsx";
import { CalendarDays, Megaphone, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

// Premium color accents map (keeping your original color palette identity but applying it subtly)
const ACCENT_STYLES = [
  {
    border: "border-l-LamaSky",
    bg: "bg-sky-50 dark:bg-sky-900/10",
    text: "text-sky-600 dark:text-sky-400",
  },
  {
    border: "border-l-LamaPurple",
    bg: "bg-purple-50 dark:bg-purple-900/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    border: "border-l-LamaPink",
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
    if (!userId || !role) return <ErrorState message="Could not fetch user info" />;

    let classId: number | null = null;

    if (role === "student") {
      const student = students?.[0];
      if (!student) return <ErrorState message="Student record not found" />;
      classId = student.classId ?? null;
    }

    const whereCondition: Prisma.MessagesWhereInput = {
      type,
      ...(role !== "admin" && {
        OR: [{ classId: classId ?? undefined }, { classId: null }],
      }),
    };

    const data = await prisma.messages.findMany({
      take: 3,
      orderBy: { date: "desc" },
      where: whereCondition,
      include: {
        Class: true,
      },
    });

    if (data.length === 0) return <EmptyState />;

    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Announcements
            </h1>
          </div>
          <Link 
            href="/list/messages" 
            className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {data.map((msg, index) => {
            // Cycle through styles safely
            const style = ACCENT_STYLES[index % ACCENT_STYLES.length];

            return (
              <div
                key={msg.id}
                className={clsx(
                  "group relative p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all duration-200",
                  "border-l-[4px]", // The premium accent strip
                  style.border
                )}
              >
                {/* Card Header: Title & Date */}
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                    {msg.Class?.name ?? (type === "GENERAL" ? "General Message" : "Announcement")}
                  </h2>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <CalendarDays className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {new Intl.DateTimeFormat("en-GB", { month: 'short', day: 'numeric' }).format(msg.date)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
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
    return <ErrorState message="Error loading announcements" />;
  }
};

/* --- Helper Components for UI Polish --- */

const EmptyState = () => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full">
      <Megaphone className="w-6 h-6 text-gray-300 dark:text-gray-600" />
    </div>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No Announcements</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400">You're all caught up!</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
    <span className="text-sm font-medium text-red-800 dark:text-red-300">{message}</span>
  </div>
);

export default Messages;