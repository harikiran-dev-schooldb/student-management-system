import { resolveSchoolId } from "../resolveSchool";
import { AdminDashboardData } from "../../../types";
import { getUserCounts } from "./counts";
import { getGenderStats } from "./gender";
import { getAttendanceStats } from "./attendance";
import { getFinanceStats } from "./finance";
import { getRecentEvents } from "./events";
import { redis } from "@/lib/redis";

export async function getAdminDashboardData(
    schoolSlug: string,
    targetDate: Date
): Promise<AdminDashboardData> {
    const schoolId = await resolveSchoolId(schoolSlug);

    // 🔹 Normalize dates (important for consistency)
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(targetDate);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const cacheKey = `dashboard:admin:${schoolId}:${start.toISOString()}:${end.toISOString()}`;

    /* ---------- Cache (top-level) ---------- */
    try {
        const cached = await redis.get<AdminDashboardData>(cacheKey);
        if (cached) return cached;
    } catch (err) {
        console.error("Dashboard cache GET error:", err);
    }

    /* ---------- Parallel fetch (fault-tolerant) ---------- */
    const results = await Promise.allSettled([
        getUserCounts(schoolId),
        getGenderStats(schoolId),
        getAttendanceStats(schoolId, start, end),
        getFinanceStats(schoolId, start, end),
        getRecentEvents(schoolId, start, end),
    ]);

    const [
        countsRes,
        genderRes,
        attendanceRes,
        financeRes,
        eventsRes,
    ] = results;


    const counts =
        countsRes.status === "fulfilled"
            ? countsRes.value
            : {
                adminCount: 0,
                teacherCount: 0,
                studentCount: 0,
            };

    const data: AdminDashboardData = {
        ...counts,
        genderStats:
            genderRes.status === "fulfilled" ? genderRes.value : [],
        attendance:
            attendanceRes.status === "fulfilled" ? attendanceRes.value : [],
        finance:
            financeRes.status === "fulfilled" ? financeRes.value : [],
        events:
            eventsRes.status === "fulfilled" ? eventsRes.value : [],
    };

    /* ---------- Cache (safe) ---------- */
    try {
        await redis.set(cacheKey, data, { ex: 300 }); // 5 min
    } catch (err) {
        console.error("Dashboard cache SET error:", err);
    }

    return data;
}