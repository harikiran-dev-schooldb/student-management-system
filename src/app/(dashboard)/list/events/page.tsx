export const dynamic = "force-dynamic";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import { Events, SearchParams } from "../../../../../types";
import ResetFiltersButton from "@/components/ResetFiltersButton";

const renderRow = (item: Events, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-LamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td>
      {item.class
        ? `${item.class.grade?.level ?? ""}${item.class.section ?? ""}`
        : "-"}
    </td>
    <td className="hidden md:table-cell">
      {""}
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    </td>
    <td className="hidden md:table-cell">
      {item.startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </td>
    <td className="hidden md:table-cell">
      {item.endTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" ||
          (role === "teacher" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          ))}
      </div>
    </td>
  </tr>
);

const getColumns = (role: string | null) => [
  {
    header: "Title",
    accessor: "title",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Time",
    accessor: "startTime",
    className: "hidden md:table-cell",
  },
  {
    header: "End Time",
    accessor: "endTime",
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

const EventsList = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  // Fetch user info and role
  const { userId, role } = await fetchUserInfo();

  const columns = getColumns(role); // Get dynamic columns

  // Await the searchParams first
  const params = await searchParams;
  // Fixing the 'page' parameter issue
  const pageParam = params.page;
  const currentPage = Array.isArray(pageParam)
    ? parseInt(pageParam[0])
    : parseInt(pageParam || "1");

  const { ...queryParams } = params;
  const p = currentPage;

  // Initialize Prisma query object
  const query: Prisma.EventWhereInput = {};

  // Dynamically add filters based on query parameters
  for (const [key, value] of Object.entries(queryParams)) {
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

  // ROLE CONDITIONS
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
  };

  query.OR = [
    { classId: null },
    {
      Class: roleConditions[role as keyof typeof roleConditions] || {},
    },
  ];

  // Fetch events and count
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      select: {
        Class: {
          select: {
            section: true,
            Grade: {
              select: {
                level: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="flex-1 p-4 bg-white">
      {/* TOP: Description */}
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">All Events</h1>
        <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
          <TableSearch />
          {/* 🔄 Reset Filters Button */}
          <ResetFiltersButton basePath="/list/events" />
          <div className="flex items-center self-end gap-4">
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-LamaYellow">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" ||
              (role === "teacher" && (
                <FormContainer table="event" type="create" />
              ))}
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

export default EventsList;
