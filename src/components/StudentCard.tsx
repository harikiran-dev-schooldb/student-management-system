"use client";

import { useRouter } from "next/navigation";
import StudentStatusDropdown from "@/components/StudentStatusDropdown";

export default function StudentCard({ item, slug }: any) {
  const router = useRouter();

  const className =
    item.enrollments?.[0]?.class?.Grade?.level &&
    item.enrollments?.[0]?.class?.section
      ? `${item.enrollments[0].class.Grade.level} - ${item.enrollments[0].class.section}`
      : "-";

  const isActive = item.status === "ACTIVE";

  return (
    <div
      onClick={() => router.push(`/${slug}/list/users/students/${item.id}`)}
      className={`group relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer

      ${
        isActive
          ? "bg-white dark:bg-darkfg border-slate-200 dark:border-slate-800 hover:border-indigo-400"
          : "bg-rose-50/40 dark:bg-rose-900/10 border-rose-200"
      }

      shadow-sm hover:shadow-md`}
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-slate-100">
        {item.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {item.name}
        </p>

        <p className="text-xs text-slate-500">
          ID: {item.admissionNo}
        </p>

        <p className="text-xs text-slate-400 truncate">
          {className}
        </p>
      </div>

      {/* ✅ Dropdown */}
      <div
        className="ml-2 opacity-60 group-hover:opacity-100 transition relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <StudentStatusDropdown
          id={item.id}
          currentStatus={item.status}
        />
      </div>
    </div>
  );
}