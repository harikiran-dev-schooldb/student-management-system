import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1), // From Jan 1
      },
    },
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day) => day.present).length;
  const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold">
        {totalDays > 0 ? `${percentage.toFixed(1)}%` : "-"}
      </h1>
      <span className="text-sm text-gray-500 dark:text-gray-500">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
