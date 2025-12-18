export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";

const AdminProfilePage = async () => {
  // Get Clerk user info
  const { userId } = await fetchUserInfo();
  if (!userId) return notFound();

  // Fetch admin by clerk_id
  const admin = await prisma.admin.findUnique({
    where: { clerk_id: userId },
    include: {
      profile: true,
      linkedUser: true,
    },
  });

  if (!admin) {
    return <div className="p-4 text-red-500">Admin data not found</div>;
  }

  return (
    <div className="flex flex-col flex-1 gap-4 p-4 xl:flex-row">
      {/* LEFT COLUMN */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* ADMIN INFO CARD */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 py-6 rounded-md bg-LamaSky">
          <div className="w-1/3">
            <img
              src={
                admin.img ||
                (admin.gender === "Male" ? "/male.png" : "/female.png")
              }
              alt={admin.name}
              width={144}
              height={144}
              className="object-cover rounded-full w-24 h-24"
            />
          </div>
          <div className="flex flex-col justify-between w-2/3 gap-4">
            <h1 className="text-xl font-semibold">{admin.name}</h1>
            <p className="text-sm text-gray-500">
              Parent: {admin.parentName || "Not provided"}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
              <div className="flex items-center gap-2 w-full md:w-1/3">
                <img
                  src="/blood.png"
                  alt="Blood Type"
                  width={14}
                  height={14}
                />
                <span>{admin.bloodType || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-1/3">
                <img src="/date.png" alt="DOB" width={14} height={14} />
                <span>
                  {admin.dob
                    ? new Intl.DateTimeFormat("en-GB").format(
                        new Date(admin.dob)
                      )
                    : "DOB not available"}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-1/3">
                <img src="/mail.png" alt="Email" width={14} height={14} />
                <span>{admin.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-1/3">
                <img src="/phone.png" alt="Phone" width={14} height={14} />
                <span>{admin.phone || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SMALL INFO CARDS */}
        <div className="flex flex-wrap justify-between gap-4">
          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
            <img
              src="/singleBranch.png"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <div>
              <h1 className="text-xl font-semibold">{admin.id}</h1>
              <span className="text-sm text-gray-400">Admin ID</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%]">
            <img
              src="/role.png"
              alt="Role"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <div>
              <h1 className="text-xl font-semibold capitalize">{admin.linkedUser?.role}</h1>
              <span className="text-sm text-gray-400">Role</span>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        {admin.profile && (
          <div className="mt-4 bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Profile Info</h1>
            <p>{admin.profile.activeUserId || "No additional profile info"}</p>
          </div>
        )}

        {/* LINKED USER */}
        {admin.linkedUser && (
          <div className="mt-4 bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Linked User Account</h1>
            <p>Name: {admin.linkedUser.username}</p>
            <p>Role: {admin.linkedUser.role}</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col w-full gap-4 xl:w-1/3">
        <div className="p-4 bg-white rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-LamaYellowLight"
              href="/list/students"
            >
              Manage Students
            </Link>
            <Link
              className="p-3 rounded-md bg-LamaPurpleLight"
              href="/list/teachers"
            >
              Manage Teachers
            </Link>
            <Link className="p-3 rounded-md bg-pink-50" href="/list/classes">
              Manage Classes
            </Link>
            <Link className="p-3 rounded-md bg-LamaSkyLight" href="/list/exams">
              View Exams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
