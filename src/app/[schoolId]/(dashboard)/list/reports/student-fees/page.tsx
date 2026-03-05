export const dynamic = "force-dynamic";

import React from "react";
import Image from "next/image";
import { Prisma } from "@prisma/client";

import DownloadExcelButton from "@/components/DownloadExcelButton";
import ClassFilterDropdown, {
  StudentStatusFilter,
} from "@/components/FilterDropdown";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import ResetFiltersButton from "@/components/ResetFiltersButton";

import { getGroupedStudentFees } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import {
  SearchParams,
  StudentsFeeReportList,
} from "../../../../../../../types";
import { tenantPrisma } from "@/lib/tenant-prisma";

// --- Types & Interfaces ---

interface StudentFeeData {
  totalPaidAmount: number;
  totalDiscountAmount: number;
}

// --- Helper Components ---

const StatusBadge = ({
  amount,
  type,
}: {
  amount: number;
  type: "due" | "paid";
}) => {
  if (type === "due") {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${amount > 0
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
      >
        {amount > 0 ? `₹${amount}` : "Paid"}
      </span>
    );
  }

  return (
    <span className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
      ₹{amount}
    </span>
  );
};

// --- Render Row Function ---

const renderRow = (
  item: StudentsFeeReportList,
  role: string | null,
  feeMap: Map<string, StudentFeeData>,
) => {
  const fee = item.studentTotalFees?.[0];

  const totalFees = fee?.totalFeeAmount ?? 0;
  const paidAmount = fee?.totalPaidAmount ?? 0;
  const discountAmount = fee?.totalDiscountAmount ?? 0;
  const dueAmount = fee?.dueAmount ?? 0;
  return (
    <tr
      key={item.id}
      className="group border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
    >
      <td className="p-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Avatar - Slightly smaller on mobile */}
          <div className="relative h-9 w-9 md:h-10 md:w-10 min-w-[2.25rem] overflow-hidden rounded-full ring-2 ring-gray-100 dark:ring-gray-800">
            <Image
              src={
                item.img ||
                (item.gender === "Male" ? "/male.png" : "/female.png")
              }
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm md:text-base text-darkfg dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.name}
            </h3>
            <span className="text-xs text-gray-500 font-mono">{item.admissionNo}</span>
            {/* ✅ MOBILE ONLY: Show Class Name here */}
            <span className="md:hidden text-[10px] text-gray-400 font-medium mt-0.5">
              {item.enrollments?.[0]?.class?.name ?? "N/A"}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {item.enrollments?.[0]?.class?.name ?? "N/A"}
        </span>
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600 dark:text-gray-400">
        {item.fatherName || "N/A"}
      </td>
      <td className="hidden xl:table-cell p-4 text-right font-medium text-darkfg dark:text-gray-100">
        ₹{totalFees}
      </td>
      <td className="hidden xl:table-cell p-4 text-right">
        <StatusBadge amount={paidAmount} type="paid" />
      </td>
      <td className="hidden 2xl:table-cell p-4 text-right text-gray-500">
        {discountAmount > 0 ? `₹${discountAmount}` : "-"}
      </td>
      {/* ✅ MOBILE: Visible on all screens now */}
      <td className="p-4 text-right pr-4 align-middle">
        <StatusBadge amount={dueAmount} type="due" />
      </td>
    </tr>
  );
};

// --- Main Page Component ---

const StudentListPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>;
  params: Promise<{ schoolId: string }>;
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { schoolId: slug } = resolvedParams;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    throw new Error("Invalid school");
  }

  const { role } = await fetchUserInfo(slug);

  const db = tenantPrisma(school.id);

  // Parse params
  const { page, gradeId, classId, ...queryParams } = resolvedSearchParams;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";
  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "classId";

  // Build Query
  const query: Prisma.StudentWhereInput = {
    status: "ACTIVE",
  };

  query.enrollments = {
    some: {
      ...(classId && { classId: Number(classId) }),
      ...(gradeId && { class: { gradeId: Number(gradeId) } }),
    },
  };

  if (queryParams.search) {
    const searchValue = Array.isArray(queryParams.search)
      ? queryParams.search[0]
      : queryParams.search;
    query.OR = [
      { name: { contains: searchValue, mode: "insensitive" } },
      { id: { contains: searchValue } },
    ];
  }

  // Fetch Data
  const classes = await db.class.findMany({
    where: gradeId ? { gradeId: Number(gradeId) } : {},
  });
  const grades = await db.grade.findMany();

  const [data, count] = await db.$transaction([
    db.student.findMany({
      where: query,
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            class: {
              include: {
                Grade: true,
              },
            },
          },
        },
        totalFees: true,
        studentFees: true,
      },
      orderBy: [
        { name: "asc" },
      ],
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    db.student.count({ where: query }),
  ]);

  // Process Fee Data
  const studentIds = data.map((s) => s.id);
  const rawGroupedFees = await getGroupedStudentFees(school.id, studentIds);

  const feeMap = new Map(rawGroupedFees.map((fee) => [fee.studentId, fee]));

  // Table Config
  // ✅ MOBILE FIX: "Due" column is now visible everywhere, "Class" is hidden on mobile (moved inside Name cell)
  const columns = [
    { header: "Student", accessor: "name", className: "pl-4" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    {
      header: "Parent",
      accessor: "fatherName",
      className: "hidden lg:table-cell",
    },
    {
      header: "Total",
      accessor: "totalFees",
      className: "hidden xl:table-cell text-right",
    },
    {
      header: "Paid",
      accessor: "paidAmount",
      className: "hidden xl:table-cell text-right",
    },
    {
      header: "Discount",
      accessor: "discountAmount",
      className: "hidden 2xl:table-cell text-right",
    },
    {
      header: "Due",
      accessor: "dueAmount",
      className: "text-right pr-4", // Visible on all screens
    },
  ];

  const Path = `/${slug}/list/reports/student-fees`;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-darkMode min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-darkfg dark:text-white tracking-tight">
            Fee Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Viewing {count} active students
          </p>
        </div>
      </div>

      {/* Controls & Filters Card */}
      <div className="bg-white dark:bg-darkfg rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search Area - Full width on mobile */}
          <div className="w-full md:w-72">
            <TableSearch />
          </div>

          {/* Filters Area - Scrollable on very small screens if needed */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
            />
            <StudentStatusFilter basePath={Path} />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />
            <SortButton sortKey="id" />
            <ResetFiltersButton basePath={Path} />
            <DownloadExcelButton />
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white dark:bg-darkfg rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            renderRow={(item) => renderRow(item, role, feeMap)}
            data={data}
          />
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-darkfg/50">
          <Pagination page={parseInt(p)} count={count} />
        </div>
      </div>
    </div>
  );
};

export default StudentListPage;
