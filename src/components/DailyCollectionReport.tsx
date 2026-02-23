"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { tenantFetch } from "@/lib/tenantFetch";

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
  paymentMode?: "CASH" | "UPI" | "CARD" | "CHEQUE" | "NET_BANKING";
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
  const { schoolId } = useParams<{ schoolId: string }>();

  // -- PAGINATION STATE --
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(25);

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
          Object.fromEntries(Object.entries({ from, to }).filter(([, v]) => v)),
        ).toString();

        const data = await tenantFetch(
          schoolId,
          `/fees/transactions?${qs}`,
        );
        setTransactions(data?.data ?? []);
        setPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [from, to]);

  /* ---------------- SUMMARIES ---------------- */

  const summary = useMemo(() => {
    const totalCollected = transactions.reduce((s, t) => s + t.amount, 0);
    const totalDiscount = transactions.reduce(
      (s, t) => s + (t.discountAmount ?? 0),
      0,
    );
    return {
      count: transactions.length,
      totalCollected,
      totalDiscount,
    };
  }, [transactions]);

  // Payment Mode Breakdown
  const paymentModeSummary = useMemo(() => {
    const modes = {
      CASH: 0,
      UPI: 0,
      BANK: 0, // Card + Cheque + Net Banking
    };

    transactions.forEach((t) => {
      const mode = t.paymentMode || "CASH";
      if (mode === "CASH") {
        modes.CASH += t.amount;
      } else if (mode === "UPI") {
        modes.UPI += t.amount;
      } else {
        modes.BANK += t.amount;
      }
    });

    return modes;
  }, [transactions]);

  const termSummary = useMemo(() => {
    const map: Record<TermKey, number> = {
      TERM_1: 0,
      TERM_2: 0,
      TERM_3: 0,
      TERM_4: 0,
    };
    transactions.forEach((t) => t.term && (map[t.term] += t.amount));

    // Avoid division by zero
    const total = summary.totalCollected || 1;

    return TERM_ORDER.filter((t) => map[t] > 0).map((t) => ({
      term: t,
      amount: map[t],
      percent: Math.round((map[t] / total) * 100),
    }));
  }, [transactions, summary.totalCollected]);

  /* ---------------- SORT & FILTER ---------------- */

  const filteredTransactions = useMemo(() => {
    const base = activeTerm
      ? transactions.filter((t) => t.term === activeTerm)
      : transactions;

    return [...base].sort(
      (a, b) =>
        new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime(), // Descending by default is usually better for logs
    );
  }, [transactions, activeTerm]);

  useEffect(() => {
    setPage(1);
  }, [activeTerm]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  /* ---------------- ACTIONS ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    router.push(`?${q.toString()}`);
  };

  /* ---------------- EXCEL EXPORT ---------------- */
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daily Collection");

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Adm No", key: "admNo", width: 12 },
      { header: "Student Name", key: "student", width: 25 },
      { header: "Class", key: "class", width: 10 },
      { header: "Term", key: "term", width: 15 },
      { header: "Payment Mode", key: "mode", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Discount", key: "discount", width: 15 },
    ];

    filteredTransactions.forEach((t) => {
      worksheet.addRow({
        date: new Date(t.receiptDate).toLocaleDateString(),
        admNo: t.student?.id || "-",
        student: t.student?.name || "Unknown",
        class: t.student?.Class?.name || "-",
        term: t.term || "-",
        mode: t.paymentMode || "CASH",
        amount: t.amount,
        discount: t.discountAmount || 0,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName =
      from && to
        ? `Fee_Report_${from}_to_${to}.xlsx`
        : `Fee_Report_${new Date().toISOString().split("T")[0]}.xlsx`;

    saveAs(blob, fileName);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500 animate-pulse">
        Loading data...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-3 py-3">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Daily Collection Report
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and audit fee transactions
          </p>
        </div>

        <button
          onClick={downloadExcel}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-LamaBlue dark:bg-LamaBLue text-white rounded-lg hover:bg-LamaBLue disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Export Excel
        </button>
      </div>

      {/* FILTER */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-4 p-4 rounded-xl border bg-white dark:bg-darkMode border-gray-200 dark:border-white/10"
      >
        <div className="flex flex-col gap-4 md:flex-row w-full md:w-auto">
          <DateInput label="From Date" value={from} onChange={setFrom} />
          <DateInput label="To Date" value={to} onChange={setTo} />
        </div>
      </form>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Summary3D title="Total Transactions" value={summary.count} />
        <Summary3D
          title="Total Discount"
          value={`₹ ${summary.totalDiscount}`}
        />
        <Summary3D
          title="Total Collected"
          value={`₹ ${summary.totalCollected}`}
          highlight
        />

        {/* Payment Modes */}
        <div className="rounded-xl border p-4 bg-gray-50 dark:bg-darkMode border-gray-200 dark:border-white/10 flex flex-col justify-center gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Banknote size={14} /> Cash
            </span>
            <span className="font-semibold dark:text-white">
              ₹{paymentModeSummary.CASH}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Wallet size={14} /> UPI
            </span>
            <span className="font-semibold dark:text-white">
              ₹{paymentModeSummary.UPI}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CreditCard size={14} /> Bank
            </span>
            <span className="font-semibold dark:text-white">
              ₹{paymentModeSummary.BANK}
            </span>
          </div>
        </div>
      </div>

      {/* TERM BREAKDOWN */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {termSummary.map(({ term, amount, percent }) => (
          <div key={term} className="[perspective:1200px]">
            <div
              onClick={() => {
                setActiveTerm(term === activeTerm ? null : term);
                setFlipped(term === flipped ? null : term);
              }}
              className={`relative rounded-xl border p-5 cursor-pointer bg-white dark:bg-darkMode border-gray-200 dark:border-white/10 transition-all duration-500 transform-gpu [transform-style:preserve-3d] ${
                term === activeTerm ? "ring-2 ring-yellow-400" : ""
              } ${term === flipped ? "[transform:rotateY(180deg)]" : ""}`}
            >
              <div className="[backface-visibility:hidden]">
                <p className="text-xs uppercase text-gray-500">
                  {term.replace("_", " ")}
                </p>
                <p className="text-2xl font-semibold mt-2">₹ {amount}</p>
              </div>
              <div className="absolute inset-0 p-5 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 text-black dark:text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <p className="text-sm font-semibold">Contribution</p>
                <p className="text-2xl font-bold mt-2">{percent}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden flex flex-col gap-3">
        {paginatedTransactions.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border p-4 bg-white dark:bg-darkMode border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t.paymentMode || "CASH"}
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ₹ {t.amount}
              </span>
            </div>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {t.student?.name ?? "-"}{" "}
              <span className="text-xs text-gray-500">
                ({t.student?.Class?.name ?? "-"})
              </span>
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {new Date(t.receiptDate).toLocaleDateString()}
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs text-gray-600 dark:text-gray-300">
                {t.term?.replace("_", " ") ?? "-"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block rounded-lg border overflow-hidden bg-white dark:bg-darkMode border-gray-200 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-white/5">
            <tr>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Class</Th>
              <Th>Term</Th>
              <Th>Mode</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Td>{new Date(t.receiptDate).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-medium">{t.student?.name}</span>
                      <span className="text-xs text-gray-400">
                        {t.student?.id}
                      </span>
                    </div>
                  </Td>
                  <Td>{t.student?.Class?.name}</Td>
                  <Td>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs">
                      {t.term}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        t.paymentMode === "UPI"
                          ? "bg-blue-100 text-blue-700"
                          : t.paymentMode === "CASH"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.paymentMode || "CASH"}
                    </span>
                  </Td>
                  <Td className="font-semibold text-right">₹ {t.amount}</Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-2 border-t dark:border-white/10">
          <div className="text-xs text-gray-500">
            Showing {(page - 1) * rowsPerPage + 1} -{" "}
            {Math.min(page * rowsPerPage, filteredTransactions.length)} of{" "}
            {filteredTransactions.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
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
  <div className="flex flex-col gap-1 w-full md:w-auto">
    <label className="text-xs text-gray-500 font-semibold uppercase">
      {label}
    </label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full md:w-40 px-3 rounded-md border bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      className={`rounded-xl border p-5 transform-gpu transition-all h-full flex flex-col justify-center bg-white dark:bg-darkMode border-gray-200 dark:border-white/10 hover:-translate-y-1 hover:shadow-xl ${
        highlight ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <p className="text-xs uppercase text-gray-500 font-bold">{title}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-xs uppercase text-gray-500 bg-gray-50 dark:bg-white/5 font-bold text-left tracking-wider">
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
  <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </td>
);
