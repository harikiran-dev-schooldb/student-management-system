import clsx from "clsx";
import ClassFilterDropdown, {
  GenderFilter
} from "@/components/FilterDropdown";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { getTermStatus } from "@/lib/utils/getTermStatus";
import { $Enums, Prisma } from "@prisma/client";
import Link from "next/link";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { Eye, Filter, UserRound, X } from "lucide-react";
import IconButton from "@/components/IconButton";
import { FeeColectList, SearchParams } from "../../../../../../../types";
import { StudentFeeSelect } from "../../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import FeeStudentCard from "@/components/FeeStudentCard";
import StudentFeesExcelDownload from "@/components/StudentFeesExcelDownload";

const renderRow = (
  item: FeeColectList & {
    totalPaidAmount: number;
    totalFeeAmount: number;
    totalDiscountAmount: number;
    dueAmount: number;
  },
  role: string | null,
  schoolId: string
) => {
  const paidAmount = item.totalPaidAmount;
const totalFeeAmount = item.totalFeeAmount;
const discountAmount = item.totalDiscountAmount;
const abacusAmount = 0; // or add if you support it

const dueAmount = item.dueAmount;
  const isPreKg = item.enrollments[0]?.class.name?.trim().toLowerCase() === "pre kg";

  const { status } = getTermStatus({
    dueAmount,
    paidAmount,
    abacusAmount,
    totalFeeAmount,
    isPreKg,
  });

  const normalizedStatus =
  status === "Fully Paid"
    ? "FULLY_PAID"
    : status === "Not Paid"
    ? "NOT_PAID"
    : "PARTIAL";

  return (
    <tr
      key={item.id}
      className="text-sm border-b border-gray-100 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-gray-700 transition-colors"
    >
      <td className="flex items-center gap-2 p-2 text-gray-800 dark:text-gray-200">
        <div
          className="w-10 h-10 rounded-full
             flex items-center justify-center
             bg-gray-100 dark:bg-gray-800
             md:hidden xl:flex"
        >
          {item.img ? (
            <img
              src={item.img}
              alt={item.name}
              className="object-cover w-10 h-10 rounded-full"
            />
          ) : item.gender === "Male" ? (
            <UserRound className="w-5 h-5 text-blue-600" />
          ) : (
            <UserRound className="w-5 h-5 text-pink-600" />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name} ({item.enrollments[0]?.class.name || "N/A"})
          </h3>
          <p className="text-xs">{item.admissionNo}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {item.fatherName || "N/A"}
      </td>
      <td className="hidden md:table-cell text-gray-800 dark:text-gray-200">
        {item.phone}
      </td>
      <td className="text-gray-800 dark:text-gray-200 hidden md:table-cell">
        {item.feeTransactions?.[0]?.receiptNo || "N/A"}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {paidAmount}
      </td>
      {/* <td
        className={clsx(
          "",
          status === "Fully Paid" && "text-LamaGreen dark:text-LamaGreen",
          status === "Not Paid" && "text-red-500 dark:text-red-400",
          status.includes("Term") && "text-orange-500 dark:text-LamaYellow",
        )}
      >
        {status}
      </td> */}

      <td className="p-2">
        {role === "admin" && (
          <div className="flex items-center gap-2">
            {/* Collect Fees Button */}
            <Link href={`/${schoolId}/list/fees/collect/${item.id}`}>
              <button
                className="flex items-center justify-center rounded-full w-8 h-8
             bg-LamaSky dark:bg-LamaSkyLight"
              >
                <Eye className="w-4 h-4 text-black" />
              </button>
            </Link>

            {/* Cancel Fees Button */}
            <Link href={`/${schoolId}/list/fees/cancel/${item.id}`}>
              <button
                className="flex items-center justify-center rounded-full w-8 h-8
             bg-LamaPurple dark:bg-LamaPurple"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </Link>
          </div>
        )}
      </td>
    </tr>
  );
};

const getColumns = (role: string | null) => [
  { header: "Student Name", accessor: "name", sortable: true },
  {
    header: "Parent Name",
    accessor: "parentName",
    className: "hidden md:table-cell",
  },
  { header: "Mobile", accessor: "phone", className: "hidden md:table-cell" },
  {
    header: "Reciept No",
    accessor: "receiptNo",
    className: "hidden md:table-cell",
  },
  {
    header: "Fees Paid",
    accessor: "paidAmount",
    className: "hidden md:table-cell",
  },
  // { header: "Status", accessor: "status", className: "", sortable: true },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

const StudentFeeListPage = async ({
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

  // 4️⃣ Auth
  const { role, classId: teacherClassId } = await fetchUserInfo(slug);

  const columns = getColumns(role);

  // 5️⃣ Extract filters from searchParams
  const { page, gradeId, classId, studentStatus, branchId: rawBranchId, ...queryParams } =
    resolvedSearchParams;

  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const sortOrder = resolvedSearchParams.sort === "desc" ? "desc" : "asc";

  const sortKey = Array.isArray(resolvedSearchParams.sortKey)
    ? resolvedSearchParams.sortKey[0]
    : resolvedSearchParams.sortKey || "admissionNo";

  const branchId = Array.isArray(rawBranchId)
    ? rawBranchId[0]
    : rawBranchId;

  // 6️⃣ Build where clause (NO nested "where")
  const query: Prisma.StudentWhereInput = {
    schoolId: school.id,

    status: {
      equals: (studentStatus as $Enums.StudentStatus) || "ACTIVE",
    },

    enrollments: {
      some: {
        ...(classId && { classId: Number(classId) }),

        class: {
          ...(gradeId && { gradeId: Number(gradeId) }),

          ...(branchId && {
            Grade: {
              branchId: Number(branchId),
            },
          }),
        },
      },
    },

    ...(queryParams.search && {
      OR: [
        {
          name: {
            contains: Array.isArray(queryParams.search)
              ? queryParams.search[0]
              : queryParams.search,
            mode: "insensitive",
          },
        },
        {
          admissionNo: {
            contains: Array.isArray(queryParams.search)
              ? queryParams.search[0]
              : queryParams.search,
          },
        },
      ],
    }),
  };


  // 7️⃣ Tenant-safe queries
  const [data, count] = await db.$transaction([
    db.student.findMany({
  where: query,
  orderBy: [
    { [sortKey]: sortOrder },
    { name: "asc" },
  ],
  take: ITEM_PER_PAGE,
  skip: ITEM_PER_PAGE * (parseInt(p) - 1),
  select: {
    ...StudentFeeSelect,

    studentFees: {
      select: {
        paidAmount: true,
        discountAmount: true,
        fineAmount: true,
        dueAmount: true,
        feeStructure: {
          select: {
            amount: true,
          },
        },
      },
    },
  },
}),
    db.student.count({ where: query }),
  ]);

  const exportDataRaw = await db.student.findMany({
  where: query,
  orderBy: [
    { [sortKey]: sortOrder },
    { name: "asc" },
  ],
  select: {
    ...StudentFeeSelect,

    studentFees: {
      select: {
        paidAmount: true,
        discountAmount: true,
        fineAmount: true,
        dueAmount: true,
        feeStructure: {
          select: {
            amount: true,
          },
        },
      },
    },
  },
});

const exportData = exportDataRaw.map((item) => {
  let totalPaidAmount = 0;
  let totalDiscountAmount = 0;
  let totalFineAmount = 0;
  let totalFeeAmount = 0;

  for (const fee of item.studentFees ?? []) {
    totalPaidAmount += Number(fee.paidAmount ?? 0);
    totalDiscountAmount += Number(fee.discountAmount ?? 0);
    totalFineAmount += Number(fee.fineAmount ?? 0);
    totalFeeAmount += Number(fee.feeStructure?.amount ?? 0);
  }

  return {
    ...item,
    totalPaidAmount,
    totalDiscountAmount,
    totalFineAmount,
    totalFeeAmount,
    dueAmount:
      totalFeeAmount -
      totalPaidAmount -
      totalDiscountAmount,
  };
});

  const [branches, grades, classes] = await Promise.all([
  role === "admin" ? db.branch.findMany() : Promise.resolve([]),

  role === "admin"
    ? db.grade.findMany({
        where: {
          ...(branchId && { branchId: Number(branchId) }),
        },
      })
    : Promise.resolve([]),

  role === "admin"
    ? db.class.findMany({
        where: {
          ...(gradeId && { gradeId: Number(gradeId) }),
          ...(branchId && {
            Grade: {
              branchId: Number(branchId),
            },
          }),
        },
      })
    : Promise.resolve([]),
]);

const enrichedData = data.map((item) => {
  let totalPaidAmount = 0;
  let totalDiscountAmount = 0;
  let totalFineAmount = 0;
  let totalFeeAmount = 0;
  let dueAmount = 0;

  for (const fee of item.studentFees ?? []) {
    totalPaidAmount += Number(fee.paidAmount ?? 0);
    totalDiscountAmount += Number(fee.discountAmount ?? 0);
    totalFineAmount += Number(fee.fineAmount ?? 0);
    totalFeeAmount += Number(fee.feeStructure?.amount ?? 0);
    dueAmount += Number(fee.dueAmount ?? 0);
  }

  return {
    ...item,
    totalPaidAmount,
    totalDiscountAmount,
    totalFineAmount,
    totalFeeAmount,
    dueAmount: totalFeeAmount - totalPaidAmount - totalDiscountAmount,
  };
});

const filteredData = enrichedData.filter((item) => {
  const filterStatus = resolvedSearchParams.status;

  if (!filterStatus) return true;

  const { status } = getTermStatus({
    dueAmount: item.dueAmount,
    paidAmount: item.totalPaidAmount,
    abacusAmount: 0,
    totalFeeAmount: item.totalFeeAmount,
    isPreKg:
      item.enrollments[0]?.class.name?.trim().toLowerCase() === "pre kg",
  });

  const normalizedStatus =
    status === "Fully Paid"
      ? "FULLY_PAID"
      : status === "Not Paid"
      ? "NOT_PAID"
      : "PARTIAL";

  return normalizedStatus === filterStatus;
});



  const Path = `/${slug}/list/fees/collect`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          {role === "teacher"
            ? `Fees Collection - ${data[0]?.enrollments[0].class.name ?? "Your Class"
            } (${count})`
            : `Fees Collection (${count})`}
        </h1>

        {role === "admin" && (
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <TableSearch />
            <ClassFilterDropdown
              branches={branches}
              classes={classes}
              grades={grades}
              basePath={Path}
            />
            <GenderFilter basePath={Path} />
            {/* <StatusFilter basePath={Path} /> */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <div className="flex items-center gap-4">
                <ResetFiltersButton basePath={Path} />
                <IconButton icon={Filter} />
                <SortButton sortKey="id" />
                <StudentFeesExcelDownload
  data={JSON.parse(JSON.stringify(exportData))}
/>
              </div>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          No students found
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden lg:block mt-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <Table
                columns={columns}
                renderRow={(item) => renderRow(item, role, slug)}
                data={filteredData}
                sortKey={sortKey}
                sortOrder={sortOrder}
              />
            </div>
          </div>

          {/* ================= MOBILE + TABLET CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:hidden mt-4">
            {filteredData.map((item) => {
              const paidAmount = item.totalPaidAmount;
              const totalFeeAmount = item.totalFeeAmount;
              const discountAmount = item.totalDiscountAmount;
              const dueAmount = item.dueAmount;

              const safeItem = {
                id: item.id,
                name: item.name,
                admissionNo: item.admissionNo,
              };

              return (
                <FeeStudentCard
                  key={item.id}
                  item={safeItem}
                  slug={slug}
                  dueAmount={dueAmount}
                  paidAmount={paidAmount}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default StudentFeeListPage;
