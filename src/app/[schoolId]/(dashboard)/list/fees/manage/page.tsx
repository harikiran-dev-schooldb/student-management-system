export const dynamic = "force-dynamic";
import ClassFilterDropdown from "@/components/FilterDropdown";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import AcademicYearDropdown from "@/components/dropdowns/AcademicYearDropdown";
import { AcademicYear } from "@prisma/client";
import { Filter } from "lucide-react";
import IconButton from "@/components/IconButton";
import { FeesList, SearchParams } from "../../../../../../../types";
import { FeeGradeSelect } from "../../../../../../../types/query-types";

// Row Renderer
const renderRow = (grade: FeesList, role: string | null) => {
  if (!grade.feestructure?.length) return null;

  return grade.feestructure.map((fee) => {
    const total = (fee.termFees ?? 0) + (fee.abacusFees ?? 0);

    return (
      <tr
        key={fee.id}
        className="text-sm border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 
                   dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-700"
      >
        <td className="p-2">{grade.level}</td>
        <td>{fee.term}</td>
        <td>{total}</td>
        <td className="hidden md:table-cell">
          {fee.startDate
            ? new Intl.DateTimeFormat("en-GB").format(new Date(fee.startDate))
            : "-"}
        </td>
        <td className="hidden md:table-cell">
          {fee.dueDate
            ? new Intl.DateTimeFormat("en-GB").format(new Date(fee.dueDate))
            : "-"}
        </td>
        {role === "admin" && (
          <td className="p-2">
            <div className="flex items-center gap-2">
              <FormContainer table="fees" type="update" data={fee} />
              <FormContainer table="fees" type="delete" id={fee.id} />
            </div>
          </td>
        )}
      </tr>
    );
  });
};

// Columns
const getColumns = (role: string | null) => [
  { header: "Grade", accessor: "level" },
  { header: "Term", accessor: "feestructure.term" },
  { header: "Term Fees", accessor: "feestructure.termFees" },
  { header: "Start Date", accessor: "feestructure.startDate", className: "hidden md:table-cell" },
  { header: "Due Date", accessor: "feestructure.dueDate", className: "hidden md:table-cell" },
  ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
];

// Main Page
const FeesListPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const page = Number(
    Array.isArray(params.page) ? params.page[0] : params.page || "1"
  );
  const academicYear = params.academicYear || undefined;
  const gradeId = Array.isArray(params.gradeId)
    ? params.gradeId[0]
    : params.gradeId;
  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey)
    ? params.sortKey[0]
    : params.sortKey || "id";

  const { role } = await fetchUserInfo();
  const columns = getColumns(role);

  const whereClause: any = {};

  if (gradeId) whereClause.id = Number(gradeId);

  // Cast to enum if it's a valid value
  const parsedAcademicYear =
    academicYear &&
    Object.values(AcademicYear).includes(academicYear as AcademicYear)
      ? (academicYear as AcademicYear)
      : undefined;

  if (parsedAcademicYear) {
    whereClause.feestructure = {
      some: { academicYear: parsedAcademicYear },
    };
  }

  const [grades, totalCount] = await Promise.all([
    prisma.grade.findMany({
      where: whereClause,
      select: {
        ...FeeGradeSelect,
        feestructure: {
          where: parsedAcademicYear
            ? { academicYear: parsedAcademicYear }
            : undefined,
          select: FeeGradeSelect.feestructure.select,
        },
      },
      orderBy: { [sortKey || "id"]: sortOrder || "asc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * ((page ?? 1) - 1),
    }),
    prisma.grade.count({ where: whereClause }),
  ]);

  const allGrades = await prisma.grade.findMany({
    select: { id: true, level: true },
  });

  const Path = `/list/fees/feemanagement`;

  return (
    <div className="flex-1 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">
          Fees Management
        </h1>

        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          {/* Academic Year Dropdown */}
          <AcademicYearDropdown basePath={Path} />
          <ClassFilterDropdown
            classes={[]}
            grades={allGrades}
            basePath={Path}
            showClassFilter={false}
          />
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <div className="flex items-center self-end gap-4">
              <ResetFiltersButton basePath={Path} />
              <IconButton icon={Filter}/>
              <SortButton sortKey="level" />
              {role === "admin" && <FormContainer table="fees" type="create" />}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={grades}
      />

      {/* Pagination */}
      <Pagination page={page} count={totalCount} />
    </div>
  );
};

export default FeesListPage;
