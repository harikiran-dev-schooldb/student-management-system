import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Admin, Prisma } from "@prisma/client";
import { SearchParams } from "../../../../../../types";
import { GenderFilter } from "@/components/FilterDropdown";
import ResetFiltersButton from "@/components/ResetFiltersButton";

type AdminList = Admin;

const renderRow = (item: AdminList, role: string | null) => (
  <>
  
    <td className="flex items-center gap-2 p-2">
      <img
        src={item.img || "/profile.png"}
        alt={item.name}
        width={40}
        height={40}
        className="object-cover w-10 h-10 rounded-full md:hidden xl:block"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-300">{item.username}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.gender}</td>
    <td className="hidden md:table-cell">{item.parentName || 'N/A'}</td>
    <td>{item.dob ? new Date(item.dob).toLocaleDateString("en-GB").replace(/\//g, '-') : 'Not Available'}</td>
    <td>{item.phone}</td>
    {role === "admin" && (
      <td className="p-2">
        <div className="flex items-center gap-2">
          <FormContainer table="admin" type="update" data={item} />
          <FormContainer table="admin" type="delete" id={item.id} />
        </div>
      </td>
    )}
  </>
);

const AdminListPage = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const params = await searchParams;
  const { page, ...queryParams } = params;
  const p = page ? (Array.isArray(page) ? page[0] : page) : "1";

  const { role } = await fetchUserInfo();
  const sortOrder = params.sort === "desc" ? "desc" : "asc";
  const sortKey = Array.isArray(params.sortKey) ? params.sortKey[0] : params.sortKey || "id";

  const columns = [
    { header: "Admin Name", accessor: "full_name" },
    { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
    { header: "Parent Name", accessor: "parentName", className: "hidden md:table-cell" },
    { header: "DOB", accessor: "dob" },
    { header: "Mobile", accessor: "phone" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const query: Prisma.AdminWhereInput = {};
  const normalize = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

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
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.admin.findMany({
      orderBy: { [sortKey]: sortOrder },
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (parseInt(p) - 1),
    }),
    prisma.admin.count({ where: query }),
  ]);

  const Path = "/list/users/admin";

  return (
    <div className="flex-1 p-4 m-4 mt-0 bg-white dark:bg-gray-900 rounded-md text-black dark:text-white">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="hidden text-lg font-semibold md:block">Admins List ({count})</h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          <GenderFilter basePath={Path} />
          <ResetFiltersButton basePath={Path} />
          <div className="flex items-center self-end gap-4">
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <SortButton sortKey="id" />
            <FormContainer table="admin" type="create" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3 w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr
                key={item.id}
                className="text-sm border-b border-gray-200 bg-white even:bg-slate-50 dark:bg-gray-900 hover:bg-LamaPurpleLight"
              >
                {renderRow(item, role)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={parseInt(p)} count={count} />
    </div>
  );
};

export default AdminListPage;
