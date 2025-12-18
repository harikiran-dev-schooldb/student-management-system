export const dynamic = "force-dynamic";
import DownloadExcelButton from "@/components/DownloadExcelButton";
import ClassFilterDropdown, {
  StudentStatusFilter,
} from "@/components/FilterDropdown";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getGroupedStudentFees } from "@/lib/fees";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { SearchParams, StudentsFeeReportList } from "../../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";

// Render each row
const renderRow = (
  item: StudentsFeeReportList,
  role: string | null,
  feeMap: Map<string, any>
) => {
  const studentFee = feeMap.get(item.id);

  const totalFees =
    item.Class?.Grade?.feestructure?.reduce((acc, fee) => {
      return acc + (fee.termFees ?? 0) + (fee.abacusFees ?? 0);
    }, 0) || 0;

  const paidAmount = studentFee?.totalPaidAmount ?? 0;
  const discountAmount = studentFee?.totalDiscountAmount ?? 0;
  const dueAmount = Math.max(totalFees - paidAmount - discountAmount, 0);

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
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs">{item.id}</p>
        </div>
      </td>
      <td className="text-gray-700 dark:text-gray-200">
        {item.Class?.name ?? "N/A"}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {item.fatherName || "N/A"}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {totalFees}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {paidAmount}
      </td>
      <td className="hidden md:table-cell text-gray-700 dark:text-gray-200">
        {discountAmount}
      </td>
      <td
        className={`hidden md:table-cell ${
          dueAmount > 0
            ? "text-red-500 dark:text-red-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {dueAmount}
      </td>
    </tr>
  );
};

// Columns
const getColumns = (role: string | null) => [
  { header: "Student Name", accessor: "name" },
  { header: "Class", accessor: "class" },
  {
    header: "Parent Name",
    accessor: "fatherName",
    className: "hidden md:table-cell",
  },
  {
    header: "Total Fees",
    accessor: "totalFees",
    className: "hidden md:table-cell",
  },
  { header: "Paid", accessor: "paidAmount", className: "hidden md:table-cell" },
  {
    header: "Discount Amount",
    accessor: "discountAmount",
    className: "hidden md:table-cell",
  },
  {
    header: "Due Amount",
    accessor: "dueAmount",
    className: "hidden md:table-cell",
  },
];

// Main page
const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const { role } = await fetchUserInfo();
  const params = await searchParams;
  const { page, gradeId, classId, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const query: Prisma.StudentWhereInput = { status: "ACTIVE" };
  if (classId) query.classId = Number(classId);
  if (gradeId) query.Class = { gradeId: Number(gradeId) };
  if (queryParams.search) {
    const searchValue = Array.isArray(queryParams.search)
      ? queryParams.search[0]
      : queryParams.search;
    query.OR = [
      { name: { contains: searchValue, mode: "insensitive" } },
      { id: { contains: searchValue } },
    ];
  }

  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "classId";

  const classes = await prisma.class.findMany({
    where: gradeId ? { gradeId: Number(gradeId) } : {},
  });
  const grades = await prisma.grade.findMany();

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        Class: { include: { Grade: { include: { feestructure: true } } } },
        totalFees: true,
        studentFees: { include: { feeStructure: true } },
      },
      orderBy: [
        { [sortKey]: sortOrder },
        { classId: "asc" },
        { gender: "desc" },
        { name: "asc" },
      ],
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  const columns = getColumns(role);
  // ✅ NOW data exists
  const studentIds = data.map((s) => s.id);

  // ✅ Fetch fees ONLY for these students
  const rawGroupedFees = await getGroupedStudentFees(studentIds);

  // ✅ Build map ONCE
  const feeMap = new Map(rawGroupedFees.map((fee) => [fee.studentId, fee]));

  const Path = "/list/reports/student-fees";

  return (
    <div className="flex-1 p-4 m-4 mt-0 bg-white dark:bg-gray-900 rounded-md text-black dark:text-white">
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          All Students ({count})
        </h1>

        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          <ClassFilterDropdown
            classes={classes}
            grades={grades}
            basePath={Path}
          />
          <StudentStatusFilter basePath={Path} />
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow dark:bg-LamaYellow">
                <img src="/filter.png" alt="filter" width={14} height={14} />
              </button>
              <SortButton sortKey="id" />
              <DownloadExcelButton />
            </div>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role, feeMap)}
        data={data}
      />
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default StudentListPage;
