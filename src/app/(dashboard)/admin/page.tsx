import { Suspense } from "react";
import UserCard from "@/components/UserCard";
import Messages from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import { getAdminDashboardData } from "@/lib/dashboard";
import { SearchParams } from "../../../../types";

/* ----------------------------- */
/* Skeletons (lightweight)       */
/* ----------------------------- */

const CardsSkeleton = () => (
  <div className="flex gap-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-28 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
      />
    ))}
  </div>
);

const ChartSkeleton = ({ height = 450 }: { height?: number }) => (
  <div
    className="w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
    style={{ height }}
  />
);

/* ----------------------------- */
/* Page                          */
/* ----------------------------- */

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const dateParam =
    typeof params?.date === "string"
      ? params.date
      : Array.isArray(params?.date)
      ? params.date[0]
      : undefined;

  const date = dateParam ? new Date(dateParam) : new Date();

  /* SINGLE BACKEND CALL */
  const dashboard = await getAdminDashboardData(date);

  return (
      <div className="flex flex-col gap-6 p-4 lg:flex-row bg-white dark:bg-gray-900 text-black dark:text-white">
        {/* LEFT COLUMN */}
        <section className="flex flex-col w-full gap-8 lg:w-2/3">
          {/* USER CARDS (LCP TARGET) */}
          <Suspense fallback={<CardsSkeleton />}>
            <div className="flex flex-wrap gap-4">
              <UserCard type="admin" count={dashboard.adminCount} />
              <UserCard type="teacher" count={dashboard.teacherCount} />
              <UserCard type="student" count={dashboard.studentCount} />
            </div>
          </Suspense>

          {/* CHART ROW */}
          <Suspense fallback={<ChartSkeleton />}>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="w-full lg:w-1/3 h-[450px] rounded-md bg-white dark:bg-gray-800 shadow">
                <CountChartContainer stats={dashboard.genderStats} />
              </div>

              <div className="w-full lg:w-2/3 h-[450px] rounded-md bg-white dark:bg-gray-800 shadow">
                <AttendanceChartContainer records={dashboard.attendance} />
              </div>
            </div>
          </Suspense>

          {/* FINANCE */}
          <Suspense fallback={<ChartSkeleton height={400} />}>
            <div className="w-full h-[400px] rounded-md bg-white dark:bg-gray-800 shadow">
              <FinanceChartContainer data={dashboard.finance} />
            </div>
          </Suspense>
        </section>

        {/* RIGHT COLUMN */}
        <section className="flex flex-col w-full gap-8 lg:w-1/3">
          <Suspense fallback={<ChartSkeleton height={360} />}>
            <div className="rounded-md bg-white dark:bg-gray-800 shadow">
              <EventCalendarContainer
                events={dashboard.events}
                searchParams={params}
              />
            </div>
          </Suspense>

          <Suspense fallback={<ChartSkeleton height={280} />}>
            <div className="rounded-md bg-white dark:bg-gray-800 shadow">
              <Messages />
            </div>
          </Suspense>
        </section>
      </div>
  );
}
