import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { AnnouncementList } from "../../../../../types";
import { AnnouncementSelect } from "../../../../../types/query-types";

const renderRow = (item: AnnouncementList, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-LamaPurpleLight"
  >
    <td className="hidden md:table-cell">
      {new Date(item.date).toLocaleDateString("en-US")}
    </td>

    <td className="hidden md:table-cell">{item.Class.name}</td>
    <td className="flex md:table-cell">{item.title}</td>
    <td className="flex items-left gap-4 p-4">{item.description}</td>
    <td>
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
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "classname",
  },
  {
    header: "Title",
    accessor: "title",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const AnnouncementsList = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams; // Await the promise

  const { role } = await fetchUserInfo();
  const columns = getColumns(role);

  // Handle `page` param safely
  const page = params.page;
  const pageValue = Array.isArray(page) ? page[0] : page;
  const p = pageValue ? parseInt(pageValue) : 1;

  // Build query from searchParams
  const query: Prisma.AnnouncementWhereInput = {};
  for (const [key, value] of Object.entries(params)) {
    const val = Array.isArray(value) ? value[0] : value;

    if (val !== undefined) {
      switch (key) {
        case "search":
          query.title = { contains: val };
          break;
        default:
          break;
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      select: AnnouncementSelect,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="flex-1 p-4 bg-white rounded-md">
      {/* TOP: Description */}
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">
          All Announcements
        </h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          {/* 🔄 Reset Filters Button */}
          <ResetFiltersButton basePath="/list/announcements" />
          <div className="flex items-center self-end gap-4">
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST: Description */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={data}
      />

      {/* PAGINATION: Description */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementsList;
