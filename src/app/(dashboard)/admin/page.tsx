import Messages from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import { SearchParams } from "../../../../types";
import { getAdminDashboardData } from "@/lib/dashboard";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const AdminPage = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;

  const rawDate = resolvedSearchParams?.date;

  const dateString =
    typeof rawDate === "string"
      ? rawDate
      : Array.isArray(rawDate)
      ? rawDate[0]
      : undefined;

  const date = dateString ? new Date(dateString) : new Date();

  // ✅ SINGLE data fetch (critical)
  const dashboard = await getAdminDashboardData(date);

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* LEFT COLUMN */}
      <div className="flex flex-col w-full gap-8 lg:w-2/3">
        {/* USER CARDS */}
        <div className="flex flex-wrap justify-between gap-4">
          <UserCard type="admin" count={dashboard.adminCount} />
          <UserCard type="teacher" count={dashboard.teacherCount} />
          <UserCard type="student" count={dashboard.studentCount} />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px] bg-white dark:bg-gray-800 rounded-md shadow-md">
            <CountChartContainer stats={dashboard.genderStats} />
          </div>

          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px] bg-white dark:bg-gray-800 rounded-md shadow-md">
            <AttendanceChartContainer records={dashboard.attendance} />
          </div>
        </div>

        {/* FINANCE CHART */}
        <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-md shadow-md">
          <FinanceChartContainer data={dashboard.finance} />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col w-full gap-8 lg:w-1/3">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-0">
          <EventCalendarContainer
            events={dashboard.events}
            searchParams={resolvedSearchParams}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-0">
          <Messages />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
