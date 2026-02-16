import prisma from "@/lib/prisma";
import SchoolSettingsForm from "@/components/forms/SchoolSettingsForm";
import { fetchUserInfo } from "@/lib/utils/server-utils"; // Adjust based on your auth helper path
import { Settings, ShieldCheck, GraduationCap } from "lucide-react";

/**
 * SchoolSettingsPage (Server Component)
 * Handles data fetching and permission logic before rendering the form.
 */
interface SchoolSettingsPageProps {
  params: Promise<{ schoolId: string }>;
}

const SchoolSettingsPage = async ({ params }: SchoolSettingsPageProps) => {
  const { schoolId: slug } = await params;

  // 1️⃣ Resolve internal numeric/string school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    throw new Error("Invalid school");
  }

  // 2️⃣ Get role for THIS school
  const { role } = await fetchUserInfo(school.id);

  if (!role) {
    throw new Error("Unauthorized");
  }

  // 3️⃣ Fetch THIS school's settings only
  const schoolInfo = await prisma.schoolInfo.findUnique({
    where: { id: school.id },
  });

  if (!schoolInfo) {
    throw new Error("School config not found");
  }

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
