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
import IconButton, { IconButton2 } from "@/components/IconButton";
import { notFound } from "next/navigation";

// -------------------- Table Row --------------------
const renderRow = (item: TeachersList, role: string | null) => (
  <tr
    className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {item.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.id}</p>
      </div>
    </td>

    {/* Class */}
    <td className="hidden w-32 md:table-cell text-gray-700 dark:text-gray-200">
      {item.class ? item.class.name : "No Class"}
    </td>

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

    {/* Address */}
    <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
      {item.address}
    </td>

    {/* Actions */}
    <td className="p-2">
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <Link href={`/list/users/teachers/${item.id}`}>
              <IconButton2 icon={Eye} />
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
  { header: "Name", accessor: "info" },
  { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
  { header: "Phone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
  { header: "DOB", accessor: "dob", className: "hidden md:table-cell" },
  { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
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
    <div className="flex-1 p-4 bg-white dark:bg-gray-900">
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
