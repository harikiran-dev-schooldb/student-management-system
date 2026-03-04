export const dynamic = "force-dynamic";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { Prisma } from "@prisma/client";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { Events, SearchParams } from "../../../../../../types";
import { tenantPrisma } from "@/lib/tenant-prisma";

const renderRow = (item: Events, role: string | null) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-LamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td>
      {item.Class
        ? `${item.Class.name ?? ""}`
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
  // Fetch user info and role
  const { userId, role } = await fetchUserInfo(slug);
  const db = tenantPrisma(school.id);

  const columns = getColumns(role); // Get dynamic columns

  // Fixing the 'page' parameter issue
  const pageParam = resolvedSearchParams.page;
  const currentPage = Array.isArray(pageParam)
    ? parseInt(pageParam[0])
    : parseInt(pageParam || "1");

  const { ...queryParams } = resolvedSearchParams;
  const p = currentPage;

  // Initialize Prisma query object
  const query: Prisma.EventWhereInput = { schoolId: school.id };


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
  if (role === "teacher") {
    query.OR = [
      { classId: null },
      {
        Class: {
          lessons: {
            some: {
              teacherId: userId!,
            },
          },
        },
      },
    ];
  } else if (role === "student") {
    query.OR = [
      { classId: null },
      {
        Class: {
          studentEnrollments: {
            some: {
              studentId: userId!,   // ✅ correct field
            },
          },
        },
      },
    ];
  } else {
    query.OR = [{ classId: null }];
  }

  // Fetch events and count
  const [data, count] = await db.$transaction([
    db.event.findMany({
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
    db.event.count({ where: query }),
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
