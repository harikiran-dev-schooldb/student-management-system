export const dynamic = "force-dynamic";
import React from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { $Enums, Prisma } from "@prisma/client";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { SearchParams, TeachersList } from "../../../../../../types";
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { GenderFilter, TeacherStatusFilter } from "@/components/FilterDropdown";
import TeacherStatusDropdown from "@/components/TeacherStatusDropdown";
import { TeachersSelect } from "../../../../../../types/query-types";
import { Eye, Filter, FilterX } from "lucide-react";
import Avatar from "@/components/Avatar";
import IconButton from "@/components/IconButton";
import { notFound } from "next/navigation";

// -------------------- Table Row --------------------
const renderRow = (item: TeachersList, role: string | null) => (
  <tr
    className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-LamaPurpleLight dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
    key={item.id}
  >
    {/* Info */}
    <td className="flex items-center gap-2 p-2">
      <Avatar
        src={item.img}
        name={item.name}
        gender={item.gender}
        className="md:hidden xl:flex"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold text-darkMode dark:text-gray-100">
          {item.name}
        </h3>
        <p className="text-xs text-darkMode dark:text-gray-300">{item.id}</p>
      </div>
    </td>

    {/* Class (Admin Only) */}
    {role === "admin" && (
      <td className="py-4 px-6 align-middle">
        {(() => {
          const hasClass = Boolean(item.class?.name);

          return (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium
            ${hasClass
                  ? "border-indigo-100 bg-indigo-50/50 text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300"
                }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${hasClass ? "bg-indigo-500" : "bg-red-500"
                  }`}
              />
              {hasClass ? item.class!.name : "No Class"}
            </div>
          );
        })()}
      </td>
    )}


    {/* Phone */}
    <td className="px-2 w-36 md:table-cell text-gray-700 dark:text-gray-200">
      {item.phone}
    </td>

    {/* Gender */}
    <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
      {item.gender}
    </td>

    {/* DOB */}
    <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
      {item.dob
        ? new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "N/A"}
    </td>

    {/* Actions */}
    <td className="p-2">
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <Link href={`/list/users/teachers/${item.id}`}>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-darkfg dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors">
                <Eye className="h-4 w-4" />
              </div>
            </Link>
          </>
        )}
        {role === "admin" && (
          <>
            {/* <FormContainer table="student" type="delete" id={item.id} /> */}
            <TeacherStatusDropdown id={item.id} currentStatus={item.status} />
          </>
        )}
      </div>
    </td>
  </tr>
);

// -------------------- Columns --------------------
const getColumns = (role: string | null) => [
  { header: "Teacher Name", accessor: "info" },
  { header: "Class", accessor: "class", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
  { header: "DOB", accessor: "dob", className: "hidden md:table-cell" },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];


// -------------------- Page --------------------
const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { role } = await fetchUserInfo();
  const columns = getColumns(role);
  const params = await searchParams;
  const { page, userStatus, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const query: Prisma.TeacherWhereInput = {
    status: {
      equals: (userStatus as $Enums.UserStatus) || "ACTIVE",
    },
  };

  const normalize = (
    value: string | string[] | undefined
  ): string | undefined => (Array.isArray(value) ? value[0] : value);

  if (role === "student") {
    return notFound();
  }

  // -------------------- Filter Parsing --------------------
  for (const [key, value] of Object.entries(queryParams)) {
    const normalizedValue = normalize(value);
    if (!normalizedValue) continue;

    switch (key) {
      case "classId":
        query.classId = parseInt(normalizedValue);
        break;
      case "search":
        query.OR = [
          { name: { contains: normalizedValue, mode: "insensitive" } },
          {
            class: { name: { contains: normalizedValue, mode: "insensitive" } },
          },
        ];
        break;
      case "gender":
        query.gender = normalizedValue as any;
        break;
      default:
        break;
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      orderBy: [{ id: "asc" }],
      select: TeachersSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  const Path = "/list/users/teachers";

  return (
    <div className="flex-1 p-4 bg-white dark:bg-darkbg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
          All Teachers ({count})
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <GenderFilter basePath={Path} />
          {role === "admin" && (
            <>
              <TeacherStatusFilter basePath={Path} />
            </>
          )}

          <div className="flex items-center gap-4">
            <ResetFiltersButton basePath={Path} />
            <IconButton icon={Filter} />
            <SortButton sortKey="id" />
            {role === "admin" && (
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default TeacherListPage;
