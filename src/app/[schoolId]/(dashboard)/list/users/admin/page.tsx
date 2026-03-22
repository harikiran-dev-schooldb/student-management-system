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
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { GenderFilter } from "@/components/FilterDropdown";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import { SearchParams } from "../../../../../../../types";
import { tenantPrisma } from "@/lib/tenant-prisma";

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
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  // 1️⃣ Resolve route params
  const { schoolId: slug } = await params;
  const resolvedSearchParams = await searchParams;

  // 2️⃣ Resolve internal school ID
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) throw new Error("Invalid school");
  const { role } = await fetchUserInfo(slug);
  const columns = getColumns(role);

  const { page, ...queryParams } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "id";

  // 3️⃣ Tenant-scoped Prisma
  const db = tenantPrisma(school.id);

  const query: Prisma.AdminWhereInput = { schoolId: school.id };

  if (role !== "admin") {
    return notFound();
  }

  const normalize = (
    value: string | string[] | undefined,
  ): string | undefined => (Array.isArray(value) ? value[0] : value);

  // -------------------- Filters --------------------
  for (const [key, value] of Object.entries(queryParams)) {
    const normalizedValue = normalize(value);
    if (!normalizedValue) continue;

    switch (key) {
      case "search":
        query.OR = [
          { name: { contains: normalizedValue, mode: "insensitive" } },
          {
            linkedUser: {
              username: {
                contains: normalizedValue,
                mode: "insensitive",
              },
            },
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

  const allowedSortKeys = ["id", "name", "createdAt"];
  const safeSortKey = allowedSortKeys.includes(sortKey) ? sortKey : "id";

  const [data, count] = await db.$transaction([
    db.admin.findMany({
      where: query,
      orderBy: { [safeSortKey]: sortOrder },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.admin.count({ where: query }),
  ]);

  const Path = `/${slug}/list/users/admin`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-darkbg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hidden md:block">
          Admins List ({count})
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <GenderFilter basePath={Path} />

          <div className="flex items-center gap-4">
            <ResetFiltersButton basePath={Path} />
            <IconButton icon={Filter} />
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
        sortKey={sortKey}
        sortOrder={sortOrder}
      />

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default AdminListPage;
