import prisma from "@/lib/prisma";
import { fetchUserInfo } from "@/lib/utils/server-utils";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";
import ServiceSwitch from "@/components/ServiceSwitch";
import ClassFilterDropdown from "@/components/FilterDropdown";
import ResetFiltersButton from "@/components/ResetFiltersButton";
import { buildEnrollmentFilter } from "@/lib/filters/buildHierarchyFilter";
import { Prisma } from "@prisma/client";

const columns = [
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Transport",
    accessor: "transport",
  },
  {
    header: "Hostel",
    accessor: "hostel",
  },
];

const renderRow = (item: any, slug: string) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 dark:border-gray-700 dark:even:bg-gray-800"
  >
    {/* Student */}
    <td className="flex items-center gap-3 p-4">
      <Avatar src={item.img} name={item.name} gender={item.gender} />

      <div className="flex flex-col">
        <span className="font-medium dark:text-white">{item.name}</span>

        <span className="text-xs text-gray-500">{item.admissionNo}</span>
      </div>
    </td>

    {/* Class */}
    <td>
      <div className="inline-block rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
        {item.enrollments?.[0]?.class?.Grade?.level} -
        {item.enrollments?.[0]?.class?.section}
      </div>
    </td>

    {/* Transport */}
    <td>
      <ServiceSwitch
        studentId={item.id}
        type="transportRequired"
        value={item.transportRequired}
        slug={slug}
      />
    </td>

    {/* Hostel */}
    <td>
      <ServiceSwitch
        studentId={item.id}
        type="hostelRequired"
        value={item.hostelRequired}
        slug={slug}
      />
    </td>
  </tr>
);

const StudentServicesPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    branchId?: string;
    gradeId?: string;
    classId?: string;
  }>;

  params: Promise<{
    schoolId: string;
  }>;
}) => {
  /* -------------------------------------------------------
     1️⃣ Params
  ------------------------------------------------------- */

  const { schoolId: slug } = await params;

  const resolvedSearchParams = await searchParams;

  const { page, search, branchId, gradeId, classId } = resolvedSearchParams;

  const currentPage = Number(page || "1");

  /* -------------------------------------------------------
     2️⃣ Auth
  ------------------------------------------------------- */

  const { role } = await fetchUserInfo(slug);

  if (role !== "admin") {
    return notFound();
  }

  /* -------------------------------------------------------
     3️⃣ School
  ------------------------------------------------------- */

  const school = await prisma.schoolInfo.findUnique({
    where: {
      schoolId: slug,
    },

    select: {
      id: true,
    },
  });

  if (!school) {
    return notFound();
  }

  /* -------------------------------------------------------
     4️⃣ Filters
  ------------------------------------------------------- */

  const enrollmentFilter = buildEnrollmentFilter({
    branchId,
    gradeId,
    classId,
  });

  const query: Prisma.StudentWhereInput = {
    schoolId: school.id,

    enrollments: {
      some: {
        ...enrollmentFilter,

        academicYear: {
          isActive: true,
        },
      },
    },

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          admissionNo: {
            contains: search,
          },
        },
      ],
    }),
  };

  /* -------------------------------------------------------
     5️⃣ Dropdown Data
  ------------------------------------------------------- */

  const [branches, grades, classes] = await Promise.all([
    prisma.branch.findMany({
      where: {
        schoolId: school.id,
      },
    }),

    prisma.grade.findMany({
      where: {
        schoolId: school.id,
      },
    }),

    prisma.class.findMany({
      where: {
        schoolId: school.id,
      },
    }),
  ]);

  /* -------------------------------------------------------
     6️⃣ Students
  ------------------------------------------------------- */

  const [students, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,

      orderBy: {
        name: "asc",
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (currentPage - 1),

      select: {
        id: true,
        name: true,
        admissionNo: true,
        img: true,
        gender: true,

        transportRequired: true,
        hostelRequired: true,

        enrollments: {
          where: {
            academicYear: {
              isActive: true,
            },
          },

          take: 1,

          select: {
            class: {
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
        },
      },
    }),

    prisma.student.count({
      where: query,
    }),
  ]);

  return (
    <div className="flex-1 bg-white p-4 dark:bg-darkbg">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="hidden text-lg font-semibold dark:text-white md:block">
          Student Services
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <TableSearch />

          <ClassFilterDropdown
            classes={classes}
            grades={grades}
            branches={branches}
            basePath={`/${slug}/list/student-services`}
          />

          <ResetFiltersButton basePath={`/${slug}/list/student-services`} />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <Table
          columns={columns}
          data={students}
          renderRow={(item) => renderRow(item, slug)}
          sortKey="name"
          sortOrder="asc"
        />
      </div>

      {/* Pagination */}
      <Pagination page={currentPage} count={count} />
    </div>
  );
};

export default StudentServicesPage;
