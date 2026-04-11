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
import SortButton from "@/components/SortButton";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { GenderFilter, TeacherStatusFilter } from "@/components/FilterDropdown";
import TeacherStatusDropdown from "@/components/TeacherStatusDropdown";
import { Eye, Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { notFound } from "next/navigation";
import { SearchParams } from "../../../../../../../types";
import { TeachersSelect, TeachersWithSelect } from "../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import TeacherCard from "@/components/TeacherCard";
import Avatar from "@/components/Avatar";


// -------------------- Table Row --------------------
const renderRow = (item: TeachersWithSelect, role: string | null, schoolId: string) => (
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
        <p className="text-xs text-darkMode dark:text-gray-300">{item.username}</p>
      </div>
    </td>

    {/* Class (Admin Only) */}
    {role === "admin" && (
      <td className="py-4 px-6 align-middle">
        {(() => {
          const className =
            item.teacherClassAssignments?.[0]?.class?.name ?? null;

          const hasClass = Boolean(className);

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
              {hasClass ? className : "No Class"}
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
            <Link href={`/${schoolId}/list/users/teachers/${item.id}`}>
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
  { header: "Teacher Name", accessor: "name", sortable: true },
  { header: "Class", accessor: "class", className: "hidden md:table-cell", sortable: true },
  { header: "Phone", accessor: "phone", className: "hidden md:table-cell" },
  { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
  { header: "DOB", accessor: "dob", className: "hidden md:table-cell" },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

// -------------------- Page --------------------
const TeacherListPage = async ({
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

  // 3️⃣ Tenant-scoped Prisma
  const db = tenantPrisma(school.id);

  const { role } = await fetchUserInfo(slug);
  const columns = getColumns(role);
  const { page, userStatus, ...queryParams } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";
  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKeyMap: Record<string, string> = {
    info: "name",   // UI "info" → DB "name"
    class: "name",  // optional fallback (can't sort relation directly)
  };
  const rawSortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "name";

  const validSortKeys = [
    "id",
    "username",
    "name",
    "gender",
    "phone",
    "dob",
    "status",
  ];

  const mappedSortKey = sortKeyMap[rawSortKey] || rawSortKey;

  const safeSortKey = validSortKeys.includes(mappedSortKey)
    ? mappedSortKey
    : "name";

  const statusValue = Array.isArray(userStatus) ? userStatus[0] : userStatus;

  const query: Prisma.TeacherWhereInput = {};

  if (statusValue && Object.values($Enums.UserStatus).includes(statusValue as $Enums.UserStatus)) {
    query.status = statusValue as $Enums.UserStatus;
  } else {
    query.status = "ACTIVE";
  }

  const normalize = (
    value: string | string[] | undefined,
  ): string | undefined => (Array.isArray(value) ? value[0] : value);

  if (!role || role === "student") {
    return notFound();
  }

  // -------------------- Filter Parsing --------------------
  for (const [key, value] of Object.entries(queryParams)) {
    const normalizedValue = normalize(value);
    if (!normalizedValue) continue;

    switch (key) {
      case "classId":
        query.teacherClassAssignments = {
          some: {
            classId: parseInt(normalizedValue),
          },
        };
        break;
      case "search":
        query.OR = [
          { name: { contains: normalizedValue, mode: "insensitive" } },
          {
            teacherClassAssignments: {
              some: {
                class: {
                  name: { contains: normalizedValue, mode: "insensitive" },
                },
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

  const [data, count] = await db.$transaction([
    db.teacher.findMany({
      where: query,
      orderBy: [{ [safeSortKey]: sortOrder }],
      select: TeachersSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.teacher.count({ where: query }),
  ]);

  const Path = `/${slug}/list/users/teachers`;

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
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">

        {data.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No teachers found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block mt-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <Table
                  columns={columns}
                  renderRow={(item) => renderRow(item, role, slug)}
                  data={data}
                  sortKey={safeSortKey}
                  sortOrder={sortOrder}
                />
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mt-4">
              {data.map((item) => (
                <TeacherCard key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default TeacherListPage;
