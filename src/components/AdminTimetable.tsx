"use client";

import { useSearchParams } from "next/navigation";
import ClassTimetableContainer from "./ClassTimetableContainer";

interface Props {
  classes: { id: number }[];
}

const AdminTimetable = ({ classes }: Props) => {
  const searchParams = useSearchParams();

  const param = searchParams.get("classId");
  const parsedClassId = param ? Number(param) : null;

  const selectedClassId =
    parsedClassId && !Number.isNaN(parsedClassId)
      ? parsedClassId
      : classes.length > 0
      ? classes[0].id
      : null;

  if (!selectedClassId) {
    return (
      <p className="text-sm text-gray-500">
        No classes available.
      </p>
    );
  }

  return <ClassTimetableContainer classId={selectedClassId} />;
};

export default AdminTimetable;