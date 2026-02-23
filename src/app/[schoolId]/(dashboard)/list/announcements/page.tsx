import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { Filter, SlidersHorizontal } from "lucide-react"; // Import Icons
import IconButton from "@/components/IconButton";
import { AnnouncementList, SearchParams } from "../../../../../../types";
import { AnnouncementSelect } from "../../../../../../types/query-types";
import { tenantPrisma } from "@/lib/tenant-prisma";
import prisma from "@/lib/prisma";

// --- Utility: Modern Date Formatter ---
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

// --- Render Row (Modernized) ---
const renderRow = (item: AnnouncementList, role: string | null) => (
  <tr
    key={item.id}
    className="group border-b border-gray-100 dark:border-gray-800 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
  >
    {/* Date */}
    <td className="hidden md:table-cell py-4 px-4 text-gray-500 dark:text-gray-400">
      {formatDate(item.date)}
    </td>

    {/* Class Badge */}
    <td className="hidden md:table-cell py-4 px-4">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        {item.Class?.name || "All"}
      </span>
    </td>

    {/* Title */}
    <td className="table-cell py-4 px-4 font-medium text-gray-900 dark:text-gray-100">
      {item.title}
    </td>

    {/* Description (Truncated for cleaner table view) */}
    <td className="hidden md:table-cell py-4 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
      {item.description}
    </td>

    {/* Actions */}
    <td className="table-cell py-4 px-4">
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="announcement" type="update" data={item} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const getColumns = (role: string | null) => [
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  { header: "Class", accessor: "classname", className: "hidden md:table-cell" },
  { header: "Title", accessor: "title" },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  ...(role === "admin" || role === "teacher"
    ? [{ header: "Actions", accessor: "action" }]
    : []),
];

const AnnouncementsList = async ({
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
  // 🔐 Create tenant-scoped prisma
  const db = tenantPrisma(school.id);
  const columns = getColumns(role);

  // Pagination
  const page = resolvedSearchParams.page;
  const pageValue = Array.isArray(page) ? page[0] : page;
  const p = pageValue ? parseInt(pageValue) : 1;

  // Query
  const query: Prisma.AnnouncementWhereInput = {
    schoolId: school.id,
  };

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    const val = Array.isArray(value) ? value[0] : value;

    if (val && key === "search") {
      query.title = { contains: val, mode: "insensitive" };
    }
  }

  const [data, count] = await db.$transaction([
    db.announcement.findMany({
      where: query,
      select: AnnouncementSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    db.announcement.count({ where: query }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 ">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between ">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white ">
            Announcements
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and view school-wide updates.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Modernized Filter Buttons */}
            <ResetFiltersButton basePath="/list/announcements" />

            {/* Reusable Buttons */}
            <IconButton icon={Filter} />
            <IconButton icon={SlidersHorizontal} />

            {role === "admin" && (
              <div className="ml-2">
                <FormContainer table="announcement" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-zinc-950 dark:border-gray-800 overflow-hidden ">
        {data.length > 0 ? (
          <>
            <Table
              columns={columns}
              renderRow={(item) => renderRow(item, role)}
              data={data}
            />
            {/* Pagination Container */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <Pagination page={p} count={count} />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No announcements found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              We couldn't find any announcements matching your current filters.
              Try adjusting your search.
            </p>
            <div className="mt-6">
              <ResetFiltersButton basePath="/list/announcements" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsList;
