export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
} from "lucide-react";

const AdminProfilePage = async () => {
  const { userId } = await fetchUserInfo();

  if (!userId) return notFound();

  const admin = await prisma.admin.findUnique({
    where: { linkedUserId: userId },
    include: {
      profile: true,
      linkedUser: true,
    },
  });

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-medium">
            Admin profile not found. Please contact support.
          </span>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not provided";
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
      new Date(date)
    );
  };

  return (
    <div className="flex flex-col flex-1 gap-6 p-6 bg-gray-50/50 dark:bg-darkMode min-h-screen">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage your account details and shortcuts
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider">
          {admin.linkedUser?.role || "Admin"}
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* === LEFT COLUMN === */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          {/* 1. HERO CARD */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-4">
                <img
                  src={
                    admin.img ||
                    (admin.gender === "Male" ? "/male.png" : "/female.png")
                  }
                  alt={admin.name}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-md bg-white dark:bg-gray-800"
                />
                <div className="flex-1 pt-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {admin.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                    Admin ID:{" "}
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {admin.id.substring(0, 8)}...
                    </span>
                  </p>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <InfoItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={admin.email}
                />
                <InfoItem
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={admin.phone}
                />
                <InfoItem
                  icon={<Calendar size={16} />}
                  label="Date of Birth"
                  value={formatDate(admin.dob)}
                />
                <InfoItem
                  icon={<Droplet size={16} />}
                  label="Blood Type"
                  value={admin.bloodType}
                />
                <InfoItem
                  icon={<User size={16} />}
                  label="Parent Name"
                  value={admin.parentName}
                />
                <InfoItem
                  icon={<ShieldCheck size={16} />}
                  label="System Role"
                  value={admin.linkedUser?.role}
                  capitalize
                />
              </div>
            </div>
          </div>

          {/* 2. ACCOUNT SECURITY CARD */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Account Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">
                    Username
                  </span>
                  <p className="text-gray-700 dark:text-gray-200 font-medium">
                    {admin.linkedUser?.username || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">
                    Active User ID
                  </span>
                  <p className="text-gray-700 dark:text-gray-200 font-medium font-mono text-sm">
                    {admin.profile?.activeUserId || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <ShortcutButton
                href="/list/users/students"
                icon={<GraduationCap size={20} />}
                label="Manage Students"
                colorClass="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              />
              <ShortcutButton
                href="/list/users/teachers"
                icon={<Users size={20} />}
                label="Manage Teachers"
                colorClass="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
              />
              <ShortcutButton
                href="/list/classes"
                icon={<BookOpen size={20} />}
                label="Manage Classes"
                colorClass="bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/30"
              />
              <ShortcutButton
                href="/list/exams"
                icon={<FileText size={20} />}
                label="View Exams"
                colorClass="bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:hover:bg-sky-900/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */

// 1. Info Item (Dark Mode Compatible)
const InfoItem = ({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">
        {label}
      </p>
      <p
        className={`text-sm text-gray-700 dark:text-gray-200 font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

// 2. Shortcut Button (Dark Mode Compatible)
const ShortcutButton = ({
  href,
  icon,
  label,
  colorClass,
}: {
  href: string;
  icon: any;
  label: string;
  colorClass: string;
}) => (
  <Link
    href={href}
    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 border border-transparent hover:border-black/5 dark:hover:border-white/5 ${colorClass}`}
  >
    <div className="bg-white/60 dark:bg-black/20 p-2 rounded-md shadow-sm">
      {icon}
    </div>
    <span className="font-semibold">{label}</span>
  </Link>
);

export default AdminProfilePage;
