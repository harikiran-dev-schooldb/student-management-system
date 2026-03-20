"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";

type LedgerItem = {
  id: number;
  receiptDate: string;
  amount: number;
  discountAmount: number;
  fineAmount: number;
  paymentMode: string;
  balance: number;
};

type Student = {
  id: string;
  name: string;
};

export default function LedgerPage() {
  const { schoolId } = useParams<{ schoolId: string }>();

  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await tenantFetch(schoolId, "/students");
        setStudents(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStudents();
  }, []);

  /* ================= FETCH LEDGER ================= */
  useEffect(() => {
    if (!studentId) return;

    async function fetchLedger() {
      setLoading(true);
      try {
        const res = await tenantFetch(
          schoolId,
          `/reports/fees/ledger?studentId=${studentId}`
        );

        setLedger(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLedger();
  }, [studentId]);

  return (
    <div className="flex flex-col gap-6 px-3 py-3">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Student Ledger</h1>
        <p className="text-sm text-gray-500">
          Complete transaction history with running balance
        </p>
      </div>

      {/* STUDENT SELECT */}
      <div className="p-4 border rounded-xl bg-white dark:bg-darkMode">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Select Student
        </label>

        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="mt-2 w-full md:w-80 h-10 px-3 rounded-md border bg-transparent"
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading ledger...
        </div>
      )}

      {/* TABLE */}
      {!loading && ledger.length > 0 && (
        <div className="rounded-lg border overflow-hidden bg-white dark:bg-darkMode">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs">Date</th>
                <th className="px-4 py-3 text-left text-xs">Mode</th>
                <th className="px-4 py-3 text-left text-xs">Amount</th>
                <th className="px-4 py-3 text-left text-xs">Discount</th>
                <th className="px-4 py-3 text-left text-xs">Fine</th>
                <th className="px-4 py-3 text-left text-xs">Balance</th>
              </tr>
            </thead>

            <tbody>
              {ledger.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(tx.receiptDate).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                      {tx.paymentMode}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-green-600">
                    ₹ {tx.amount}
                  </td>

                  <td className="px-4 py-3 text-yellow-600">
                    ₹ {tx.discountAmount || 0}
                  </td>

                  <td className="px-4 py-3 text-red-600">
                    ₹ {tx.fineAmount || 0}
                  </td>

                  <td className="px-4 py-3 font-bold text-blue-600">
                    ₹ {tx.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EMPTY */}
      {!loading && studentId && ledger.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  );
}