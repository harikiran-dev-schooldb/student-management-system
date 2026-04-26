"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Loader2, Save, Trash2 } from "lucide-react";
import { tenantFetch } from "@/lib/tenantFetch";

/* ---------------- Types ---------------- */
type Grade = {
  id: number;
  level: string;
};

type Branch = {
  id: number;
  name: string;
};

type Mapping = {
  gradeId: number;
  branchId: number;
  accountId: string;
};

/* ---------------- Component ---------------- */
export default function PaymentAccountPage() {
  const { schoolId } = useParams<{ schoolId: string }>();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [accountId, setAccountId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------- Load Data ---------------- */
  const loadData = async () => {
    if (!schoolId) return;

    try {
      const [gradesData, mappingsData, branchesData] = await Promise.all([
        tenantFetch<Grade[]>(schoolId, "/grades"),
        tenantFetch<Mapping[]>(schoolId, "/payment-accounts"),
        tenantFetch<Branch[]>(schoolId, "/branches"),
      ]);

      setGrades(gradesData);
      setMappings(mappingsData);
      setBranches(branchesData);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  /* ---------------- Helpers ---------------- */
  const getGradeName = (id: number) =>
    grades.find((g) => g.id === id)?.level || id;

  const getBranchName = (id: number) =>
    branches.find((b) => b.id === id)?.name || id;

  /* ---------------- Duplicate Check ---------------- */
  const mappingExists = useMemo(() => {
    return mappings.some(
      (m) =>
        m.gradeId === selectedGrade &&
        m.branchId === selectedBranch
    );
  }, [mappings, selectedGrade, selectedBranch]);

  /* ---------------- Save Mapping ---------------- */
  const handleSave = async () => {
    if (!selectedGrade || !selectedBranch || !accountId) return;

    if (mappingExists) {
      alert("Mapping already exists for this branch + grade");
      return;
    }

    setLoading(true);

    try {
      await tenantFetch(
        schoolId,
        "/payment-accounts",
        {
          method: "POST",
          body: JSON.stringify({
            gradeId: selectedGrade,
            branchId: selectedBranch,
            accountId,
          }),
        }
      );

      setAccountId("");
      setSelectedGrade(null);
      setSelectedBranch(null);

      await loadData();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (gradeId: number, branchId: number) => {
    try {
      await tenantFetch(
        schoolId,
        "/payment-accounts",
        {
          method: "DELETE",
          body: JSON.stringify({ gradeId, branchId }),
        }
      );

      await loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ---------------- Styles ---------------- */
  const inputClass =
    "w-full h-10 px-3 rounded-lg text-sm border bg-white dark:bg-darkfg border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5";

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkMode p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="text-indigo-600" />
          Payment Account Mapping
        </h1>
        <p className="text-sm text-slate-500">
          Route payments based on branch + grade (EasySplit ready)
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-darkfg p-5 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

          {/* Branch */}
          <div>
            <label className={labelClass}>Branch</label>
            <select
              value={selectedBranch ?? ""}
              onChange={(e) =>
                setSelectedBranch(Number(e.target.value))
              }
              className={inputClass}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className={labelClass}>Grade</label>
            <select
              value={selectedGrade ?? ""}
              onChange={(e) =>
                setSelectedGrade(Number(e.target.value))
              }
              className={inputClass}
            >
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.level}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className={labelClass}>Account ID</label>
            <input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="ac1 / ac2 / ac3"
              className={inputClass}
            />
          </div>

          {/* Save */}
          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={
                !selectedGrade ||
                !selectedBranch ||
                !accountId ||
                loading ||
                mappingExists
              }
              className="w-full h-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mappings.map((m) => (
          <div
            key={`${m.branchId}-${m.gradeId}`}
            className="p-4 bg-white dark:bg-darkfg border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {getBranchName(m.branchId)} → {getGradeName(m.gradeId)}
              </p>
              <p className="text-sm text-slate-500">
                Account: {m.accountId}
              </p>
            </div>

            <button
              onClick={() =>
                handleDelete(m.gradeId, m.branchId)
              }
              className="text-red-500 hover:bg-red-50 p-2 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty */}
      {mappings.length === 0 && (
        <p className="text-center text-slate-500">
          No mappings created yet
        </p>
      )}
    </div>
  );
}