import { MoreHorizontal, User, GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface UserCardProps {
  type: "admin" | "teacher" | "student";
  count: number;
}

const UserCard = ({ type, count }: UserCardProps) => {
  // 1. Map specific styling, icons, and borders to the type
  const styleMap = {
    admin: {
      icon: <ShieldCheck size={20} />,
      colors: "bg-purple-100 text-purple-600",
      borderColor: "border-purple-200", // <--- Added specific border
      label: "Admin",
    },
    teacher: {
      icon: <User size={20} />,
      colors: "bg-orange-100 text-orange-600",
      borderColor: "border-orange-200", // <--- Added specific border
      label: "Teachers",
    },
    student: {
      icon: <GraduationCap size={20} />,
      colors: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-200",   // <--- Added specific border
      label: "Students",
    },
  };

  // 2. Map route paths based on user request
  const routeMap = {
    admin: "/list/users/admin",
    teacher: "/list/users/teachers",
    student: "/list/users/students",
  };

  const currentStyle = styleMap[type];

  return (
    <div
      className={`flex-1 min-w-[200px] rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-darkMode dark:border-gray-800 ${currentStyle.borderColor}`}
    >
      <div className="flex items-center justify-between">
        {/* Type Icon with Pill Background */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStyle.colors}`}
        >
          {currentStyle.icon}
        </div>

        {/* Action */}
        <div className="flex items-center gap-2">
          {/* Linked Icon */}
          <Link href={routeMap[type]} className="flex items-center justify-center">
            <MoreHorizontal
              size={20}
              className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            />
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {count.toLocaleString()}
        </h1>
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
          {currentStyle.label}
        </h2>
      </div>
    </div>
  );
};

export default UserCard;