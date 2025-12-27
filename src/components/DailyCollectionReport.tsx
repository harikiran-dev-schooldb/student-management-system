"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Transaction = {
  id: number;
  receiptNo?: string;
  amount: number;
  discountAmount?: number;
  receiptDate: string;
  remarks?: string;
  term?: string;
  student: {
    id: string;
    name: string;
    Class: { name: string } | null;
  } | null;
};

export default function DailyCollectionReport() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  /* -------------------------------------------------
     Fetch Transactions
  --------------------------------------------------*/
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (from) params.from = from;
        if (to) params.to = to;

        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`/api/fees/fee-transactions?${qs}`);
        const data = await res.json();
        setTransactions(data ?? []);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [from, to]);

  /* -------------------------------------------------
     Calculations (Memoized)
  --------------------------------------------------*/
  const summary = useMemo(() => {
    const totalCollected = transactions.reduce(
      (sum, t) => sum + (t.amount ?? 0),
      0
    );

    const totalDiscount = transactions.reduce(
      (sum, t) => sum + (t.discountAmount ?? 0),
      0
    );

    return {
      totalCollected,
      totalDiscount,
      netCollection: totalCollected - totalDiscount,
    };
  }, [transactions]);

  /* -------------------------------------------------
     Apply Date Filter
  --------------------------------------------------*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);

    router.push(`/list/reports/daywise-fees?${query.toString()}`);
  };

  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-300">
        Loading fee transactions…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* -------------------------------------------------
          Date Filter
      --------------------------------------------------*/}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
      >
        <div>
          <label className="block text-xs text-gray-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded text-white bg-LamaSkyYellow hover:opacity-90"
        >
          Apply
        </button>
      </form>

      {/* -------------------------------------------------
          Summary Cards
      --------------------------------------------------*/}
      <div className="px-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Collected"
          value={`₹ ${summary.totalCollected.toFixed(2)}`}
        />
        <SummaryCard
          title="Total Discount"
          value={`₹ ${summary.totalDiscount.toFixed(2)}`}
        />
        <SummaryCard
          title="Net Collection"
          value={`₹ ${summary.netCollection.toFixed(2)}`}
        />
      </div>

      {/* -------------------------------------------------
          Transactions Table
      --------------------------------------------------*/}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
            <tr className="text-sm text-gray-700 dark:text-gray-300">
              <Th>ID</Th>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Student ID</Th>
              <Th>Class</Th>
              <Th align="right">Amount</Th>
              <Th>Receipt No</Th>
              <Th>Remarks</Th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="text-sm border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Td>{t.id}</Td>
                <Td>{new Date(t.receiptDate).toLocaleDateString()}</Td>
                <Td>{t.student?.name ?? "-"}</Td>
                <Td>{t.student?.id ?? "-"}</Td>
                <Td>{t.student?.Class?.name ?? "-"}</Td>
                <Td align="right">₹ {t.amount.toFixed(2)}</Td>
                <Td>{t.receiptNo ?? "-"}</Td>
                <Td>{t.remarks ?? "-"}</Td>
              </tr>
            ))}

            {transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Small UI Helpers
--------------------------------------------------*/
function SummaryCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border dark:border-gray-700 ${
        highlight
          ? "bg-LamaSky text-white"
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <p className="text-xs uppercase opacity-80">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-2 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
