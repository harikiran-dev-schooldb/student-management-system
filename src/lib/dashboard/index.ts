import { resolveSchoolId } from "../resolveSchool";
import { AdminDashboardData } from "../../../types";
import { getUserCounts } from "./counts";
import { getGenderStats } from "./gender";
import { getAttendanceStats } from "./attendance";
import { getFinanceStats } from "./finance";
import { getRecentEvents } from "./events";

export async function getAdminDashboardData(
    schoolSlug: string,
    targetDate: Date
): Promise<AdminDashboardData> {

    const schoolId = await resolveSchoolId(schoolSlug);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(targetDate);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const [
        counts,
        genderStats,
        attendance,
        finance,
        events,
    ] = await Promise.all([
        getUserCounts(schoolId),
        getGenderStats(schoolId),
        getAttendanceStats(schoolId, start, end),
        getFinanceStats(schoolId, start, end),
        getRecentEvents(schoolId, start, end),
    ]);

    return {
        ...counts,
        genderStats,
        attendance,
        finance,
        events,
    };
}