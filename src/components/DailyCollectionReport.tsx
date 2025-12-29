"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ================= CONSTANTS ================= */

const TERM_ORDER = ["TERM_1", "TERM_2", "TERM_3", "TERM_4"] as const;
type TermKey = (typeof TERM_ORDER)[number];

/* ================= TYPES ================= */

type Transaction = {
  id: number;
  receiptNo?: string;
  amount: number;
  discountAmount?: number;
  receiptDate: string;
  remarks?: string;
  term?: TermKey;
  student: {
    id: string;
    name: string;
    Class: { name: string } | null;
  } | null;
};

/* ================= COMPONENT ================= */

export default function DailyCollectionReport() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const qs = new URLSearchParams(
          Object.fromEntries(Object.entries({ from, to }).filter(([, v]) => v))
        ).toString();

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

  /* ---------------- SUMMARY ---------------- */

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
      count: transactions.length,
      totalCollected,
      totalDiscount,
      netCollection: totalCollected - totalDiscount,
    };
  }, [transactions]);

  /* ---------------- TERM SUMMARY (SORTED) ---------------- */

  const termSummary = useMemo(() => {
    const map = transactions.reduce<Record<TermKey, number>>(
      (acc, t) => {
        if (t.term) acc[t.term] += t.amount ?? 0;
        return acc;
      },
      {
        TERM_1: 0,
        TERM_2: 0,
        TERM_3: 0,
        TERM_4: 0,
      }
    );

    return TERM_ORDER.filter((t) => map[t] > 0).map((t) => ({
      term: t,
      amount: map[t],
    }));
  }, [transactions]);

  /* ---------------- SORTED TRANSACTIONS ---------------- */

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const termDiff =
        TERM_ORDER.indexOf(a.term ?? "TERM_4") -
        TERM_ORDER.indexOf(b.term ?? "TERM_4");

      if (termDiff !== 0) return termDiff;

      return (
        new Date(a.receiptDate).getTime() -
        new Date(b.receiptDate).getTime()
      );
    });
  }, [transactions]);

  /* ---------------- FILTER ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    router.push(`/list/reports/daywise-fees?${query.toString()}`);
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        Loading fee transactions…
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Day-wise Fee Collection</h1>
        <p className="text-sm text-gray-500">
          View and audit fee transactions by date and term
        </p>
      </div>

      {/* FILTER */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-4 p-4 border rounded-lg"
      >
        <DateInput label="From" value={from} onChange={setFrom} />
        <DateInput label="To" value={to} onChange={setTo} />

        <button
          type="submit"
          className="h-10 px-6 rounded-md text-sm font-semibold
                     bg-LamaSkyYellow text-black border border-black/20
                     hover:bg-LamaSkyYellow/90"
        >
          Apply Filter
        </button>
      </form>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Transactions" value={summary.count} />
        <SummaryCard title="Collected" value={`₹ ${summary.totalCollected}`} />
        <SummaryCard title="Discount" value={`₹ ${summary.totalDiscount}`} />
        <SummaryCard title="Net" value={`₹ ${summary.netCollection}`} highlight />
      </div>

      {/* TERM SUMMARY */}
      {termSummary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {termSummary.map(({ term, amount }) => (
            <div key={term} className="p-4 border rounded-lg">
              <p className="text-xs uppercase text-gray-500">
                {term.replace("_", " ")}
              </p>
              <p className="text-lg font-semibold">₹ {amount}</p>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <Th>ID</Th>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Class</Th>
              <Th>Term</Th>
              <Th align="right">Amount</Th>
              <Th>Receipt</Th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <Td>{t.id}</Td>
                <Td>{new Date(t.receiptDate).toLocaleDateString()}</Td>
                <Td>{t.student?.name ?? "-"}</Td>
                <Td>{t.student?.Class?.name ?? "-"}</Td>
                <Td>{t.term?.replace("_", " ") ?? "-"}</Td>
                <Td align="right" className="font-semibold">
                  ₹ {t.amount}
                </Td>
                <Td>{t.receiptNo ?? "-"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 border rounded-md"
      />
    </div>
  );
}

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
      className={`p-4 rounded-lg border ${
        highlight ? "bg-LamaSkyYellow text-black" : ""
      }`}
    >
      <p className="text-xs uppercase text-gray-500">{title}</p>
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
      className={`px-4 py-3 text-xs font-semibold uppercase ${
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
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-2 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}
