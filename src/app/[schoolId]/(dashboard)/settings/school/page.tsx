import prisma from "@/lib/prisma";
import SchoolSettingsForm from "@/components/forms/SchoolSettingsForm";
import { fetchUserInfo } from "@/lib/utils/server-utils"; // Adjust based on your auth helper path
import { Settings, ShieldCheck, GraduationCap } from "lucide-react";

/**
 * SchoolSettingsPage (Server Component)
 * Handles data fetching and permission logic before rendering the form.
 */
const SchoolSettingsPage = async () => {
  // 1. Get the current user's role (admin, teacher, student)
  const { role } = await fetchUserInfo();

  // 2. Fetch the school configuration from the database.
  // We use findFirst because there is typically only one global config record.
  const schoolInfo = await prisma.schoolInfo.findFirst();

  // 3. Determine if the user has write access (Admins only)
  const isAdmin = role === "admin";

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50/30 dark:bg-transparent min-h-screen">
      {/* 1. Page Breadcrumbs / Meta Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <Settings
              className="text-indigo-600 dark:text-indigo-400"
              size={24}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest mt-0.5">
              <span>System</span>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                School Configuration
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm w-fit">
          {isAdmin ? (
            <>
              <ShieldCheck className="text-emerald-500" size={16} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Admin Access
              </span>
            </>
          ) : (
            <>
              <GraduationCap className="text-blue-500" size={16} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                View Only Mode
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      {/* Hydrating the Client Component:
          - initialData: Loaded from Prisma
          - userRole: Passed to control edit permissions
      */}
      <SchoolSettingsForm initialData={schoolInfo} userRole={role} />
    </div>
  );
};

export default SchoolSettingsPage;
