export const dynamic = "force-dynamic";

import React from "react";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Admin, Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { SearchParams } from "../../../../../../types";
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { GenderFilter } from "@/components/FilterDropdown";

// -------------------- Types --------------------
type AdminList = Admin;

// -------------------- Table Row --------------------
const renderRow = (item: AdminList, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
  >
    {/* Info */}
    <td className="flex items-center gap-2 p-2">
      <img
        src={item.img || "/profile.png"}
        alt={item.name}
        width={40}
        height={40}
        className="object-cover w-10 h-10 rounded-full md:hidden xl:block"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {item.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {item.username}
        </p>
      </div>
    </td>

    {/* Gender */}
    <td className="hidden md:table-cell">{item.gender}</td>

    {/* Parent */}
    <td className="hidden md:table-cell">{item.parentName || "N/A"}</td>

    {/* DOB */}
    <td className="hidden md:table-cell">
      {item.dob
        ? new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "N/A"}
    </td>

    {/* Phone */}
    <td>{item.phone}</td>

    {/* Actions */}
    {role === "admin" && (
      <td className="p-2">
        <div className="flex items-center gap-2">
          <FormContainer table="admin" type="update" data={item} />
          <FormContainer table="admin" type="delete" id={item.id} />
        </div>
      </td>
    )}
  </tr>
);

// -------------------- Columns --------------------
const getColumns = (role: string | null) => [
  { header: "Admin Name", accessor: "info" },
  { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
  {
    header: "Parent Name",
    accessor: "parentName",
    className: "hidden md:table-cell",
  },
  { header: "DOB", accessor: "dob", className: "hidden md:table-cell" },
  { header: "Mobile", accessor: "phone" },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

// -------------------- Page --------------------
const AdminListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { role } = await fetchUserInfo();
  const columns = getColumns(role);

  const params = await searchParams;
  const { page, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "id";

  const query: Prisma.AdminWhereInput = {};

  const normalize = (
    value: string | string[] | undefined
  ): string | undefined => (Array.isArray(value) ? value[0] : value);

  // -------------------- Filters --------------------
  for (const [key, value] of Object.entries(queryParams)) {
    const normalizedValue = normalize(value);
    if (!normalizedValue) continue;

    switch (key) {
      case "search":
        query.OR = [
          { name: { contains: normalizedValue, mode: "insensitive" } },
          { username: { contains: normalizedValue, mode: "insensitive" } },
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
    prisma.admin.findMany({
      where: query,
      orderBy: { [sortKey]: sortOrder },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.admin.count({ where: query }),
  ]);

  const Path = "/list/users/admin";

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="hidden md:block text-lg font-semibold text-gray-800 dark:text-gray-100">
          Admins List ({count})
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <GenderFilter basePath={Path} />

          <div className="flex items-center gap-4">
            <ResetFiltersButton basePath={Path} />
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <SortButton sortKey="id" />
            {role === "admin" && <FormContainer table="admin" type="create" />}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data}
        renderRow={(item) => renderRow(item, role)}
      />

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default AdminListPage;
