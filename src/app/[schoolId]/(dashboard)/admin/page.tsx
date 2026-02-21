import { Suspense } from "react";
import UserCard from "@/components/UserCard";
import Messages from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import { getAdminDashboardData } from "@/lib/dashboard";
import { PageProps } from "../../../../../types";

/* -----------------------------
   UI Tokens
------------------------------*/
const cardBase =
  "rounded-xl bg-white dark:bg-darkMode \
   border border-gray-200/70 dark:border-white/10 \
   shadow-sm dark:shadow-black/40 \
   transition-all duration-300 ease-out";

const cardHover = "hover:shadow-md hover:-translate-y-0.5";

/* -----------------------------
   Skeletons
------------------------------*/
const CardsSkeleton = () => (
  <div className="flex flex-wrap gap-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-28 w-full md:w-[32%] rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"
      />
    ))}
  </div>
);

const ChartSkeleton = ({ height = 450 }: { height?: number }) => (
  <div
    className="w-full rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"
    style={{ height }}
  />
);

/* -----------------------------
   Page
------------------------------*/

export default async function AdminPage({ searchParams, params }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const { schoolId } = resolvedParams;
  const dateParam =
    typeof resolvedSearchParams.date === "string"
      ? resolvedSearchParams.date
      : Array.isArray(resolvedSearchParams.date)
      ? resolvedSearchParams.date[0]
      : undefined;

  const date = dateParam ? new Date(dateParam) : new Date();

  const dashboard = await getAdminDashboardData(schoolId, date);

  return (
    <div className="flex flex-col gap-6 p-4 xl:flex-row">
      {/* ================= LEFT ================= */}
      <section className="flex flex-col w-full gap-8 xl:w-3/4">
        <Suspense fallback={<CardsSkeleton />}>
          <div className="flex flex-wrap gap-4">
            <UserCard type="admin" count={dashboard.adminCount} />
            <UserCard type="teacher" count={dashboard.teacherCount} />
            <UserCard type="student" count={dashboard.studentCount} />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div
              className={`${cardBase} ${cardHover} w-full lg:w-1/3 h-[450px] p-4`}
            >
              <CountChartContainer stats={dashboard.genderStats} />
            </div>

            <div
              className={`${cardBase} ${cardHover} w-full lg:w-2/3 h-[450px] p-4`}
            >
              <AttendanceChartContainer
                records={dashboard.attendance}
                totalStudents={dashboard.studentCount}
              />
            </div>
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton height={400} />}>
          <div className={`${cardBase} ${cardHover} w-full h-[400px] p-4`}>
            <FinanceChartContainer data={dashboard.finance} />
          </div>
        </Suspense>
      </section>

      {/* ================= RIGHT ================= */}
      <section className="flex flex-col w-full gap-8 xl:w-1/4">
        <Suspense fallback={<ChartSkeleton height={360} />}>
          <div className={`${cardBase} ${cardHover} p-4`}>
            <EventCalendarContainer
              events={dashboard.events}
              searchParams={resolvedSearchParams}
            />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton height={280} />}>
          <div className={`${cardBase} ${cardHover} p-4`}>
            <Messages />
          </div>
        </Suspense>
      </section>
    </div>
  );
}
