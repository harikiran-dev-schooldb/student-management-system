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
  const [activeTerm, setActiveTerm] = useState<TermKey | null>(null);
  const [flipped, setFlipped] = useState<TermKey | null>(null);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [from, to]);

  /* ---------------- SUMMARY ---------------- */

  const summary = useMemo(() => {
    const totalCollected = transactions.reduce((s, t) => s + t.amount, 0);
    const totalDiscount = transactions.reduce(
      (s, t) => s + (t.discountAmount ?? 0),
      0
    );
    return {
      count: transactions.length,
      totalCollected,
      totalDiscount,
    };
  }, [transactions]);

  /* ---------------- TERM SUMMARY ---------------- */

  const termSummary = useMemo(() => {
    const map: Record<TermKey, number> = {
      TERM_1: 0,
      TERM_2: 0,
      TERM_3: 0,
      TERM_4: 0,
    };
    transactions.forEach((t) => t.term && (map[t.term] += t.amount));
    return TERM_ORDER.filter((t) => map[t] > 0).map((t) => ({
      term: t,
      amount: map[t],
      percent: Math.round((map[t] / summary.totalCollected) * 100),
    }));
  }, [transactions, summary.totalCollected]);

  /* ---------------- SORT ---------------- */

  const filteredTransactions = useMemo(() => {
    const base = activeTerm
      ? transactions.filter((t) => t.term === activeTerm)
      : transactions;

    return [...base].sort(
      (a, b) =>
        new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime()
    );
  }, [transactions, activeTerm]);

  /* ---------------- FILTER ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    router.push(`?${q.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col gap-6 px-3 py-3">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Day-wise Fee Collection
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Audit transactions by date and term
        </p>
      </div>

      {/* ================= FILTER ================= */}
      <form
        onSubmit={handleSubmit}
        className="
    flex items-end gap-4
    p-4 rounded-xl border
    bg-white dark:bg-[#121727]
    border-gray-200 dark:border-white/10
  "
      >
        {/* LEFT: Date Inputs */}
        <div className="flex flex-col gap-4 md:flex-row">
          <DateInput label="From" value={from} onChange={setFrom} />
          <DateInput label="To" value={to} onChange={setTo} />
        </div>

        {/* RIGHT: Apply Button (hidden on mobile) */}
        <button
          type="submit"
          className="
    w-full md:w-auto
    h-11 px-6 md:px-8
    rounded-md
    bg-LamaSkyYellow text-black dark:text-white
    font-semibold

    ring-2 ring-gray-300
    ring-offset-2
    ring-offset-white dark:ring-offset-[#121727]

    shadow-sm
    hover:bg-LamaSkyYellow/90
    hover:ring-gray-400
    active:scale-[0.98]
    transition
  "
        >
          Apply
        </button>
      </form>

      {/* ================= 3D SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Summary3D title="Transactions" value={summary.count} />
        <Summary3D title="Discount" value={`₹ ${summary.totalDiscount}`} />
        <Summary3D
          title="Collected"
          value={`₹ ${summary.totalCollected}`}
          highlight
        />
      </div>

      {/* ================= 3D TERM CARDS ================= */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {termSummary.map(({ term, amount, percent }) => (
          <div key={term} className="[perspective:1200px]">
            <div
              onClick={() => {
                setActiveTerm(term === activeTerm ? null : term);
                setFlipped(term === flipped ? null : term);
              }}
              className={`
                relative rounded-xl border p-5 cursor-pointer
                bg-white dark:bg-[#121727]
                border-gray-200 dark:border-white/10
                transition-all duration-500 transform-gpu
                ${term === activeTerm ? "ring-2 ring-LamaSkyYellow" : ""}
                [transform-style:preserve-3d]
                ${term === flipped ? "[transform:rotateY(180deg)]" : ""}
              `}
            >
              {/* FRONT */}
              <div className="[backface-visibility:hidden]">
                <p className="text-xs uppercase text-gray-500">
                  {term.replace("_", " ")}
                </p>
                <p className="text-2xl font-semibold mt-2">₹ {amount}</p>
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 p-5 rounded-xl bg-LamaSkyYellow text-black
                              [transform:rotateY(180deg)]
                              [backface-visibility:hidden]"
              >
                <p className="text-sm font-semibold dark:text-white">
                  Contribution
                </p>
                <p className="text-2xl font-bold mt-2 dark:text-white">
                  {percent}% of total collection
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredTransactions.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border p-4
                 bg-white dark:bg-[#121727]
                 border-gray-200 dark:border-white/10"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Adm No: {t.student?.id ?? "-"}
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ₹ {t.amount}
              </span>
            </div>

            {/* Name */}
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {t.student?.name ?? "-"}{" "}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({t.student?.Class?.name ?? "-"})
              </span>
            </p>

            {/* Term */}
            <div className="mt-1">
              <span
                className="inline-block px-2 py-0.5 rounded-full
                         bg-gray-100 dark:bg-white/10
                         text-xs text-gray-600 dark:text-gray-300"
              >
                {t.term?.replace("_", " ") ?? "-"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div
        className="hidden md:block rounded-lg border overflow-hidden
                      bg-white dark:bg-[#121727]
                      border-gray-200 dark:border-white/10"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-white/5">
            <tr>
              <Th>Date</Th>
              <Th>Adm No</Th>
              <Th>Student</Th>
              <Th>Class</Th>
              <Th>Term</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <Td>{new Date(t.receiptDate).toLocaleDateString()}</Td>
                <Td>{t.student?.id}</Td>
                <Td>{t.student?.name}</Td>
                <Td>{t.student?.Class?.name}</Td>
                <Td>{t.term}</Td>
                <Td className="font-semibold">₹ {t.amount}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const DateInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-500">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
    h-10 w-full px-3 rounded-md border
    bg-transparent
    text-gray-900 dark:text-gray-100
    border-gray-300 dark:border-white/10
    focus:outline-none
    focus:ring-2 focus:ring-LamaSkyYellow
  "
    />
  </div>
);

const Summary3D = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="[perspective:1200px]">
    <div
      className={`rounded-xl border p-5 transform-gpu transition-all
        bg-white dark:bg-[#121727]
        border-gray-200 dark:border-white/10
        hover:-translate-y-1 hover:shadow-xl
        ${highlight ? "ring-2 ring-LamaSkyYellow" : ""}`}
    >
      <p className="text-xs uppercase text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  </div>
);

const Th = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) => (
  <th
    className={`px-4 py-3 text-xs uppercase ${
      align === "right" ? "text-right" : ""
    }`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) => (
  <td
    className={`px-4 py-2 ${
      align === "right" ? "text-right" : ""
    } ${className}`}
  >
    {children}
  </td>
);
