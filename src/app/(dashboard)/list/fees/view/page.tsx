import clsx from "clsx";
import ClassFilterDropdown, {
  GenderFilter,
  StatusFilter,
} from "@/components/FilterDropdown";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getGroupedStudentFees } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { getTermStatus } from "@/lib/utils/getTermStatus";
import { $Enums, Prisma } from "@prisma/client";
import Link from "next/link";
import { FeeColectList, SearchParams } from "../../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { StudentFeeSelect } from "../../../../../../types/query-types";

const renderRow = (
  item: FeeColectList,
  role: string | null,
  feeMap: Map<string, any>
) => {
  const studentFee = feeMap.get(item.id);
  const paidAmount = studentFee?.totalPaidAmount ?? 0;
  const abacusAmount = studentFee?.totalAbacusAmount ?? 0;
  const totalFeeAmount = studentFee?.totalFeeAmount ?? 0;
  const discountAmount = item.totalFees?.totalDiscountAmount ?? 0;
  const dueAmount = totalFeeAmount - paidAmount - abacusAmount - discountAmount;
  const isPreKg = item.Class?.section?.trim().toLowerCase() === "pre kg";

  const { status } = getTermStatus({
    dueAmount,
    paidAmount,
    abacusAmount,
    totalFeeAmount,
    isPreKg,
  });

  return (
    <tr
      key={item.id}
      className="text-sm border-b border-gray-100 dark:border-gray-700 even:bg-slate-50 dark:even:bg-gray-800 hover:bg-LamaPurpleLight dark:hover:bg-gray-700 transition-colors"
    >
      <td className="flex items-center gap-2 p-2 text-gray-800 dark:text-gray-200">
        <img
          src={
            item.img || (item.gender === "Male" ? "/male.png" : "/female.png")
          }
          alt={item.name}
          width={40}
          height={40}
          className="object-cover w-10 h-10 rounded-full md:hidden xl:block"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name} ({item.Class?.Grade?.level}-{item.Class?.section})
          </h3>
          <p className="text-xs">{item.id}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {item.fatherName || "N/A"}
      </td>
      <td className="text-gray-800 dark:text-gray-200">{item.phone}</td>
      <td className="text-gray-800 dark:text-gray-200">
        {item.feeTransactions?.[0]?.receiptNo || "N/A"}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {paidAmount}
      </td>
      <td
        className={clsx(
          "hidden md:table-cell",
          status === "Fully Paid" && "text-LamaGreen dark:text-LamaGreen",
          status === "Not Paid" && "text-red-600 dark:text-red-400",
          status.includes("Term") && "text-LamaYellow dark:text-LamaYellow"
        )}
      >
        {status}
      </td>

      <td className="p-2">
        {role === "admin" && (
          <div className="flex items-center gap-2">
            {/* Collect Fees Button */}
            <Link href={`/list/fees/collect/${item.id}`}>
              <button className="flex items-center justify-center rounded-full w-7 h-7 bg-LamaSky dark:bg-LamaSky">
                <img src="/view.png" alt="View" width={16} height={16} />
              </button>
            </Link>

            {/* Cancel Fees Button */}
            <Link href={`/list/fees/cancel/${item.id}`}>
              <button className="flex items-center justify-center rounded-full w-7 h-7 bg-LamaPurple dark:bg-LamaPurple">
                <img src="/delete.png" alt="Cancel" width={16} height={16} />
              </button>
            </Link>
          </div>
        )}
      </td>
    </tr>
  );
};

const getColumns = (role: string | null) => [
  { header: "Student Name", accessor: "name" },
  {
    header: "Parent Name",
    accessor: "parentName",
    className: "hidden md:table-cell",
  },
  { header: "Mobile", accessor: "phone" },
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
  { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

const StudentFeeListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const { page, gradeId, classId, studentStatus, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role, classId: teacherClassId } = await fetchUserInfo();
  const columns = getColumns(role);

  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "classId";

  const classIdNum = classId ? Number(classId) : undefined;
  const classFilter = gradeId ? { gradeId: Number(gradeId) } : {};

  const query: Prisma.StudentWhereInput = {
    // ✅ Always include status (default to "ACTIVE")
    status: {
      equals: (studentStatus as $Enums.StudentStatus) || "ACTIVE",
    },

    // ✅ If role is teacher and teacherClassId exists, override classId
    ...(role === "teacher" && teacherClassId
      ? { classId: teacherClassId }
      : classIdNum
      ? { classId: classIdNum }
      : {}),

    // ✅ Add grade filter if applicable
    ...(Object.keys(classFilter).length > 0 && { Class: classFilter }),

    // ✅ Add search filters (name or id)
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
          id: {
            contains: Array.isArray(queryParams.search)
              ? queryParams.search[0]
              : queryParams.search,
          },
        },
        {
          feeTransactions: {
            some: {
              receiptNo: {
                contains: Array.isArray(queryParams.search)
                  ? queryParams.search[0]
                  : queryParams.search,
              },
            },
          },
        },
      ],
    }),
  };

  const classes =
    role === "admin"
      ? await prisma.class.findMany({
          where: gradeId ? { gradeId: Number(gradeId) } : {},
        })
      : [];
  const grades = role === "admin" ? await prisma.grade.findMany() : [];

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      orderBy: [
        { [sortKey]: sortOrder },
        { classId: "asc" },
        { gender: "desc" },
        { name: "asc" },
      ],
      where: query,
      select: StudentFeeSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  // ✅ NOW data exists
  const studentIds = data.map((s) => s.id);

  // ✅ Fetch fees ONLY for these students
  const rawGroupedFees = await getGroupedStudentFees(studentIds);

  // ✅ Build map ONCE
  const feeMap = new Map(rawGroupedFees.map((fee) => [fee.studentId, fee]));

  const Path = "/list/fees/collect";

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          {role === "teacher"
            ? `Fees Collection - ${
                data[0]?.Class?.section ?? "Your Class"
              } (${count})`
            : `Fees Collection (${count})`}
        </h1>

        {role === "admin" && (
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <TableSearch />
            <ClassFilterDropdown
              classes={classes}
              grades={grades}
              basePath={Path}
            />
            <GenderFilter basePath={Path} />
            <StatusFilter basePath={Path} />
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <div className="flex items-center gap-4">
                <ResetFiltersButton basePath={Path} />
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:bg-LamaYellow">
                  <img src="/filter.png" alt="" width={14} height={14} />
                </button>
                <SortButton sortKey="id" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role, feeMap)}
        data={data}
      />

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default StudentFeeListPage;
