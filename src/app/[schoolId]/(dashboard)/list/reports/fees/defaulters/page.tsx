"use client";

import { useEffect, useMemo, useState } from "react";
import { tenantFetch } from "@/lib/tenantFetch";
import { useSchoolSlug } from "@/components/hooks/getschool";
import { Summary3D } from "@/components/ui/summaryCards";
import CustomSelect from "@/components/ui/CustomSelect";

type Defaulter = {
  id: number;
  dueAmount: number;
  totalPaidAmount: number;
  totalFeeAmount: number;
  student: {
    id: string;
    name: string;
    phone?: string;
    className?: string;
    admissionNumber?: string;
  };
};

export default function DefaultersPage() {
  const schoolId = useSchoolSlug();

  const [data, setData] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [classId, setClassId] = useState("");

  const [branches, setBranches] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalDue: 0,
    halfPaid: 0,
    severe: 0,
  });

  const limit = 50;

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    async function loadBranches() {
      const res = await tenantFetch(schoolId, "/branches");
      setBranches(res?.data || []);
    }

    if (schoolId) loadBranches();
  }, [schoolId]);

  useEffect(() => {
    if (!branchId) return;

    async function loadGrades() {
      const res = await tenantFetch(
        schoolId,
        `/grades?branchId=${branchId}`
      );

      setGrades(res?.data || []);
      setGradeId("");
      setClasses([]);
    }

    loadGrades();
  }, [branchId]);

  useEffect(() => {
    if (!gradeId) return;

    async function loadClasses() {
      const res = await tenantFetch(
        schoolId,
        `/classes?gradeId=${gradeId}`
      );
      setClasses(res?.data || []);
      setClassId("");
    }

    loadClasses();
  }, [gradeId]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(branchId && { branchId }),
          ...(gradeId && { gradeId }),
          ...(classId && { classId }),
        });

        const res = await tenantFetch(
          schoolId,
          `/reports/fees/defaulters?${qs.toString()}`
        );

        setData(res?.data || []);
        setTotalPages(res?.pagination?.totalPages || 1);
        setSummary(res?.summary || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (schoolId) fetchData();
  }, [schoolId, page, search, branchId, gradeId, classId]);


  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-6 px-3 py-3">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Defaulters Report</h1>
        <p className="text-sm text-gray-500">
          Students with pending dues
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-white dark:bg-darkMode">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="h-10 px-3 border rounded-md w-full md:w-64"
        />

        {/* BRANCH */}
        <CustomSelect
          label="Branch"
          value={branchId}
          onChange={(v) => {
            setPage(1);
            setBranchId(v);
            setGradeId("");   // 🔥 RESET
  setClassId("");
          }}
          options={[
            { value: "", label: "All Branches" },
            ...branches.map((b) => ({
              value: b.id,
              label: b.name,
            })),
          ]}
        />

        {/* GRADE */}
        <CustomSelect
          label="Grade"
          value={gradeId}
          onChange={(v) => {
            setPage(1);
            setGradeId(v);
            setClassId("");

          }}
          options={[
            { value: "", label: "All Grades" },
            ...grades.map((g) => ({
              value: g.id,
              label: g.level,
            })),
          ]}
        />

        {/* CLASS */}
        <CustomSelect
          label="Class"
          value={classId}
          onChange={(v) => {
            setPage(1);
            setClassId(v);
          }}
          options={[
            { value: "", label: "All Classes" },
            ...classes.map((c) => ({
              value: c.id,
              label: c.section,
            })),
          ]}
        />

      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Summary3D
          title="Total Defaulters"
          value={summary.totalStudents}
        />

        <Summary3D
          title="Total Due Amount"
          value={`₹ ${summary.totalDue ?? 0}`}
          highlight
        />

        <Summary3D
          title="Half Paid Students"
          value={summary.halfPaid}
        />

        <Summary3D
          title="Severe Pending"
          value={summary.severe}
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="h-40 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      ) : (
        <>
          {/* TABLE */}
          <div className="rounded-lg border overflow-hidden bg-white dark:bg-darkMode">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-white/5">
                <tr>
                  <Th>Adm No</Th>
                  <Th>Student</Th>
                  <Th>Class</Th>
                  <Th>Phone</Th>
                  <Th>Total Fee</Th>
                  <Th>Paid</Th>
                  <Th>Due</Th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((row) => {
                    const isSevere = Number(row.dueAmount) > 10000;

                    return (
                      <tr
                        key={row.id}
                        className={`border-t ${isSevere
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                      >
                        <Td>{row.student?.admissionNumber}</Td>
                        <Td>{row.student?.name}</Td>
                        <Td>{row.student?.className || "-"}</Td>
                        <Td>{row.student?.phone || "-"}</Td>
                        <Td>₹ {row.totalFeeAmount}</Td>
                        <Td className="text-green-600">
                          ₹ {row.totalPaidAmount}
                        </Td>
                        <Td className="font-bold text-red-600">
                          ₹ {row.dueAmount}
                        </Td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs text-left uppercase text-gray-500">
    {children}
  </th>
);

const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);