"use server";

import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import clsx from "clsx";

const Messages = async ({
  type = "ANNOUNCEMENT",
}: {
  type?: "ANNOUNCEMENT" | "GENERAL";
}) => {
  try {
    const { userId, role, students } = await fetchUserInfo();
    if (!userId || !role) return <div>Error: Could not fetch user info</div>;

    let classId: number | null = null;

    if (role === "student") {
      const student = students?.[0];
      if (!student) return <div>Error: Student not found</div>;
      classId = student.classId ?? null;
    }

    const whereCondition: Prisma.MessagesWhereInput = {
      type,
      ...(role !== "admin" && {
        OR: [{ classId: classId ?? undefined }, { classId: null }],
      }),
    };

    const data = await prisma.messages.findMany({
      take: 3,
      orderBy: { date: "desc" },
      where: whereCondition,
      include: {
        Class: true,
      },
    });

    if (data.length === 0) return <div>No announcements available</div>;

    return (
      <div className="p-4 bg-white dark:bg-gray-900 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black dark:text-gray-200">
            Announcements
          </h1>
          <span className="text-xs text-gray-400 dark:text-gray-200 cursor-pointer">
            View All
          </span>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {data.map((msg, index) => (
            <div
              key={msg.id}
              className={clsx("p-4 rounded-md", {
                "bg-LamaSkyLight": index === 0,
                "bg-LamaPurpleLight": index === 1,
                "bg-LamaPinkLight": index === 2,
                "dark:text-gray-500": true, // ensure text contrast
              })}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium dark:text-black">
                  {msg.Class?.name ??
                    (type === "GENERAL" ? "General Message" : "Announcement")}
                </h2>
                <span className="px-1 py-1 text-xs bg-white text-gray-600 dark:bg-black dark:text-white rounded-md">
                  {new Intl.DateTimeFormat("en-GB").format(msg.date)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-black">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading messages:", error);
    return <div>Error fetching announcements</div>;
  }
};

export default Messages;
