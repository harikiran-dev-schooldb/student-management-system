"use client";

import { useEffect, useMemo, useState } from "react";
import { tenantFetch } from "@/lib/tenantFetch";
import { useSchoolSlug } from "@/components/hooks/getschool";
import { Summary3D } from "@/components/ui/summaryCards";
import CustomSelect from "@/components/ui/CustomSelect";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ================= TYPES ================= */

type Defaulter = {
  id: number;
  dueAmount: string;
  totalPaidAmount: string;
  totalFeeAmount: string;
  student: {
    id: string;
    name: string;
    phone?: string;
    className?: string;
    admissionNumber?: string;
  };
};

/* ================= COMPONENT ================= */

export default function DefaultersPage() {
  const schoolId = useSchoolSlug();
  console.log("SCHOOL ID:", schoolId);
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
  
  /* ---------------- LOAD FILTER DATA ---------------- */
  
  useEffect(() => {
  if (!schoolId) return;

  tenantFetch(schoolId, "/branches").then((res) =>
    setBranches(Array.isArray(res) ? res : [])
  );
}, [schoolId]);

useEffect(() => {
  if (!branchId) return;

  tenantFetch(schoolId, `/grades?branchId=${branchId}`).then((res) => {
    setGrades(Array.isArray(res) ? res : []);
    setGradeId("");
    setClasses([]);
  });
}, [branchId]);

useEffect(() => {
  if (!gradeId) return;

  tenantFetch(schoolId, `/classes?gradeId=${gradeId}`).then((res) => {
    setClasses(Array.isArray(res) ? res : []);
    setClassId("");
  });
}, [gradeId]);

/* ---------------- FETCH DATA ---------------- */

useEffect(() => {
  if (!schoolId) return;
  
  const controller = new AbortController();
  
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
  `/reports/fees/defaulters?${qs.toString()}`,
  { signal: controller.signal }
);

setData(res?.items ?? []);

setTotalPages(res?.pagination?.totalPages ?? 1);

setSummary(
  res?.summary ?? {
    totalStudents: 0,
    totalDue: 0,
    halfPaid: 0,
    severe: 0,
  }
);
    } catch (err) {
      if ((err as any).name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [schoolId, page, search, branchId, gradeId, classId]);

  const downloadExcel = async () => {
  try {
    const qs = new URLSearchParams({
      page: "1",
      limit: "100000",
      ...(search && { search }),
      ...(branchId && { branchId }),
      ...(gradeId && { gradeId }),
      ...(classId && { classId }),
    });

    const res = await tenantFetch(
      schoolId,
      `/reports/fees/defaulters?${qs.toString()}`
    );

    const rows = res?.items ?? [];

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Defaulters");

    worksheet.columns = [
      { header: "Admission No", key: "admissionNo", width: 18 },
      { header: "Student Name", key: "name", width: 30 },
      { header: "Class", key: "className", width: 18 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Total Fee", key: "totalFee", width: 18 },
      { header: "Paid Amount", key: "paidAmount", width: 18 },
      { header: "Due Amount", key: "dueAmount", width: 18 },
    ];

    rows.forEach((row: Defaulter) => {
      worksheet.addRow({
        admissionNo: row.student?.admissionNumber || "-",
        name: row.student?.name || "-",
        className: row.student?.className || "-",
        phone: row.student?.phone || "-",
        totalFee: Number(row.totalFeeAmount),
        paidAmount: Number(row.totalPaidAmount),
        dueAmount: Number(row.dueAmount),
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `Defaulters_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (err) {
    console.error(err);
  }
};

  /* ---------------- UI ---------------- */

  return (
    <div className="flex flex-col gap-6 px-3 py-3">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div>
    <h1 className="text-xl font-semibold">
      Defaulters Report
    </h1>

    <p className="text-sm text-gray-500">
      Students with pending dues
    </p>
  </div>

  <button
    onClick={downloadExcel}
    disabled={data.length === 0}
    className="flex items-center gap-2 px-4 py-2 bg-LamaBlue text-white rounded-lg hover:opacity-90 disabled:opacity-50"
  >
    <Download size={16} />
    Export Excel
  </button>
</div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-white dark:bg-darkMode">

        <input
          type="text"
          placeholder="Search name / phone / adm no"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="h-10 px-3 border rounded-md w-full md:w-64"
        />

        <CustomSelect
          label="Branch"
          value={branchId}
          onChange={(v) => {
            setPage(1);
            setBranchId(v);
            setGradeId("");
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Summary3D title="Total Defaulters" value={summary.totalStudents} />
        <Summary3D title="Total Due Amount" value={`₹ ${summary.totalDue ?? 0}`} highlight />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="h-40 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      ) : (
        <>
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
                {data.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 dark:hover:bg-white/5">
                    <Td>{row.student?.admissionNumber}</Td>
                    <Td>{row.student?.name}</Td>
                    <Td>{row.student?.className}</Td>
                    <Td>{row.student?.phone || "-"}</Td>
                    <Td>₹ {Number(row.totalFeeAmount).toLocaleString()}</Td>

<Td className="text-green-600">
  ₹ {Number(row.totalPaidAmount).toLocaleString()}
</Td>

<Td className="font-bold text-red-600">
  ₹ {Number(row.dueAmount).toLocaleString()}
</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded"
              >
                Prev
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
}
/* ---------------- UI ---------------- */

const Th = ({ children }: any) => (
  <th className="px-4 py-3 text-xs text-left uppercase text-gray-500">
    {children}
  </th>
);

const Td = ({ children, className = "" }: any) => (
  <td className={`px-4 py-3 ${className}`}>{children}</td>
);