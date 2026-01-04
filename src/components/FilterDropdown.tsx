"use client";
export const revalidate = 60;
import { LessonDay } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { dropdownUI } from "../../types";

type ClassType = {
  id: number;
  section: string | null;
  gradeId: number;
};

type GradeType = {
  id: number;
  level: string;
};

type DayFilterProps = { basePath: string };
type StatusFilterProps = { basePath: string };
type StudentStatusFilterProps = { basePath: string };
type TeacherStatusFilterProps = { basePath: string };

interface ClassFilterProps {
  classes: ClassType[];
  grades: GradeType[];
  basePath: string;
  showClassFilter?: boolean;
}

/* ---------------- Class Filter ---------------- */
const ClassFilterDropdown = ({
  classes,
  grades,
  basePath,
  showClassFilter = true,
}: ClassFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedGradeId = searchParams.get("gradeId");
  const selectedClassId = searchParams.get("classId");

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (gradeId) {
      params.set("gradeId", gradeId);
      params.delete("classId");
    } else {
      params.delete("gradeId");
      params.delete("classId");
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (classId) {
      params.set("classId", classId);
    } else {
      params.delete("classId");
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  const filteredClasses = selectedGradeId
    ? classes.filter((cls) => cls.gradeId.toString() === selectedGradeId)
    : [];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* Grade Dropdown */}
      <div className="relative w-full md:w-auto">
        <select
          className={dropdownUI}
          onChange={handleGradeChange}
          value={selectedGradeId || ""}
        >
          <option value="" disabled>
            Select Grade
          </option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.level}
            </option>
          ))}
        </select>
      </div>

      {/* Class Dropdown */}
      {showClassFilter && (
        <div className="relative w-full md:w-auto">
          <select
            className={dropdownUI}
            onChange={handleClassChange}
            value={selectedClassId || ""}
            disabled={!selectedGradeId}
          >
            <option value="" disabled>
              Select Class
            </option>
            {filteredClasses
              .sort((a, b) => (a.section ?? "").localeCompare(b.section ?? ""))
              .map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.section}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

/* ---------------- Date Filter ---------------- */
const DateFilter = ({ basePath }: { basePath: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) params.set("date", newDate);
    else params.delete("date");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="relative w-full md:w-auto">
      <input type="date" onChange={handleDateChange} className={dropdownUI} />
    </div>
  );
};

/* ---------------- Status Filters ---------------- */
const StatusFilter = ({ basePath }: StatusFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "Status";
  const feeStatus = searchParams.get("status");

  useEffect(() => {
    if (!searchParams.get("status")) {
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, basePath, router]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) params.set("status", newStatus);
    else params.delete("status");
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full md:w-auto mt-4 md:mt-0">
      <select
        className={dropdownUI}
        onChange={handleStatusChange}
        value={currentStatus}
      >
        <option value="">Status</option>
        <option value="Not Paid">Not Paid</option>
        <option value="1 Term Paid">1 Term Paid</option>
        <option value="2 Terms Paid">2 Terms Paid</option>
        <option value="3 Terms Paid">3 Terms Paid</option>
        <option value="Fully Paid">Fully Paid</option>
      </select>
    </div>
  );
};

/* ---------------- Teacher Status Filter ---------------- */
const TeacherStatusFilter = ({ basePath }: TeacherStatusFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("userStatus") || "";

  const handleStudentStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus) params.set("userStatus", newStatus);
    else params.delete("userStatus");

    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full md:w-auto mt-4 md:mt-0">
      <select
        className={dropdownUI}
        onChange={handleStudentStatusChange}
        value={currentStatus}
      >
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="TRANSFERRED">Transferred</option>
        <option value="SUSPENDED">Suspended</option>
      </select>
    </div>
  );
};

/* ---------------- Student Status Filter ---------------- */
const StudentStatusFilter = ({ basePath }: StudentStatusFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("studentStatus") || "";

  const handleStudentStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus) params.set("studentStatus", newStatus);
    else params.delete("studentStatus");

    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full md:w-auto mt-4 md:mt-0">
      <select
        className={dropdownUI}
        onChange={handleStudentStatusChange}
        value={currentStatus}
      >
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="TRANSFERRED">Transferred</option>
        <option value="SUSPENDED">Suspended</option>
      </select>
    </div>
  );
};

/* ---------------- Gender Filter ---------------- */
const GenderFilter = ({ basePath }: { basePath: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "";

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("gender", value);
    } else {
      params.delete("gender");
    }

    router.replace(`${basePath}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="relative w-full md:w-auto">
      <select
        className={dropdownUI}
        value={currentGender}
        onChange={handleGenderChange}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
  );
};

/* ---------------- Day Filter ---------------- */
export const getTodayLessonDay = (): LessonDay => {
  const days: LessonDay[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday
  return days[today === 0 ? 6 : today - 1];
};

const DayFilter = ({ basePath }: DayFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<LessonDay>(
    getTodayLessonDay()
  );

  useEffect(() => {
    const dayFromUrl = searchParams.get("day") as LessonDay | null;

    if (dayFromUrl && Object.values(LessonDay).includes(dayFromUrl)) {
      setSelectedDay(dayFromUrl);
    } else {
      const today = getTodayLessonDay();
      setSelectedDay(today);
      const params = new URLSearchParams(searchParams.toString());
      params.set("day", today);
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, basePath, router]);

  const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = event.target.value as LessonDay;
    setSelectedDay(newDay);
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", newDay);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full md:w-auto">
      <select
        value={selectedDay}
        onChange={handleDayChange}
        className={dropdownUI}
      >
        {Object.values(LessonDay).map((day) => (
          <option key={day} value={day}>
            {day.charAt(0) + day.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ---------------- Exports ---------------- */
export {
  DayFilter,
  DateFilter,
  StatusFilter,
  StudentStatusFilter,
  TeacherStatusFilter,
  GenderFilter,
};
export default ClassFilterDropdown;
