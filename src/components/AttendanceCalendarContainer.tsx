"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AttendanceCalendar from "./AttendanceCalendar";

type Props = {
  studentId: string;
};

const AttendanceCalendarContainer = ({ studentId }: Props) => {
  const { schoolId } = useParams<{ schoolId: string }>();

  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    if (!schoolId || !studentId) return;

    fetch(
      `/api/v1/tenants/${schoolId}/attendance?studentId=${studentId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch attendance");
        return res.json();
      })
      .then((data) => setAttendanceData(data.attendance ?? []))
      .catch((err) => {
        console.error("Attendance fetch error:", err);
        setAttendanceData([]);
      });

  }, [schoolId, studentId]);

  return <AttendanceCalendar attendanceData={attendanceData} />;
};

export default AttendanceCalendarContainer;
