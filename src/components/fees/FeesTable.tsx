"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { StudentFee } from "../../../types";

interface FeesTableProps {
  data: StudentFee[];
  mode: "collect" | "cancel" | "view";
}

// ✅ Date formatter
function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB").replace(/\//g, "-");
}

const FeesTable: React.FC<FeesTableProps> = ({ data, mode }) => {
  const router = useRouter();

  const [rowData, setRowData] = useState<StudentFee[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudentFee, setCurrentStudentFee] = useState<StudentFee | null>(
    null
  );
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [fine, setFine] = useState<number>(0);
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<string>("CASH");

  const academicYears = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.academicYear))).sort((a, b) => {
      // Extract start year from Y2024_2025
      const startA = Number(a.slice(1, 5));
      const startB = Number(b.slice(1, 5));
      return startA - startB; // latest year first
    });
  }, [data]);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    string | null
  >(null);

  // Helpers
  function getTotalFees(fee: StudentFee) {
    return (
      (fee.feeStructure?.termFees ?? 0) + (fee.feeStructure?.abacusFees ?? 0)
    );
  }

  function calculateDueAmount(fee: StudentFee) {
    return (
      getTotalFees(fee) -
      (fee.paidAmount ?? 0) -
      (fee.discountAmount ?? 0) +
      (fee.fineAmount ?? 0)
    );
  }

  function getFeeStatus(fee: StudentFee) {
    const dueAmount = calculateDueAmount(fee);
    return {
      paidAmount: fee.paidAmount ?? 0,
      totalFees: getTotalFees(fee),
      isCollectDisabled: dueAmount <= 0,
      isZero: (fee.paidAmount ?? 0) === 0,
    };
  }

  // ✅ Collect action
  const handleCollect = useCallback((fee: StudentFee) => {
    if (mode === "view") return;
    const dueAmount = calculateDueAmount(fee);

    setCurrentStudentFee(fee);
    setAmount(dueAmount > 0 ? dueAmount : 0);
    setDiscount(0);
    setFine(0);
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setReceiptNo(fee.receiptNo || fee.feeTransactions?.[0]?.receiptNo || "");
    setRemarks(
      fee.remarks ||
        `Collected Fees for ${fee.term} on ${formatDate(
          new Date().toISOString()
        )}`
    );
    setIsModalOpen(true);
  }, []);

  // ✅ Cancel action
  const handleCancel = useCallback(
    async (fee: StudentFee, remarks: string) => {
      if (mode === "view") return;
      if (!fee.studentId || !fee.term) {
        toast.error("Missing studentId or term");
        return;
      }

      const confirmed = window.confirm(
        `Cancel fees for ${fee.term} for ${fee.academicYear}?`
      );
      if (!confirmed) return;

      try {
        const cancelRes = await fetch("/api/fees/cancel-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: fee.studentId,
            term: fee.term,
            academicYear: fee.academicYear, // ✅ ensure correct year
          }),
        });

        if (!cancelRes.ok) {
          const { message } = await cancelRes.json();
          toast.error(`Cancel failed: ${message}`);
          return;
        }

        setRowData((prev) =>
          prev.map((f) =>
            f.studentId === fee.studentId && f.term === fee.term
              ? {
                  ...f,
                  paidAmount: 0,
                  discountAmount: 0,
                  fineAmount: 0,
                  remarks: "Cancelled",
                }
              : f
          )
        );

        toast.success("Fees cancelled successfully!");
        router.push(`/list/fees/cancel/${fee.studentId}`);
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Error cancelling fees.");
      }
    },
    [router]
  );

  // ✅ Submit form
  const handleFormSubmit = async () => {
    if (!currentStudentFee) return;
    const dueAmount = calculateDueAmount(currentStudentFee);
    if (amount + discount > dueAmount) {
      toast.error("Payment + discount exceeds due amount.");
      return;
    }

    try {
      const updatedFeeData = {
        studentId: currentStudentFee.studentId,
        term: currentStudentFee.term,
        amount,
        discountAmount: discount,
        fineAmount: fine,
        receiptDate,
        receiptNo,
        remarks,
        academicYear: currentStudentFee.academicYear, // ✅ ensure correct year
        paymentMode: selectedPaymentMode, // ✅ added
      };

      const res = await fetch("/api/fees/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFeeData),
      });

      if (!res.ok) throw new Error("Failed to update fee");

      setRowData((prev) =>
        prev.map((f) =>
          f.id === currentStudentFee.id
            ? {
                ...f,
                paidAmount: (f.paidAmount ?? 0) + amount,
                discountAmount: (f.discountAmount ?? 0) + discount,
                fineAmount: (f.fineAmount ?? 0) + fine,
                receiptNo,
                remarks,
              }
            : f
        )
      );

      toast.success("Payment collected successfully!");
      setIsModalOpen(false);
      router.push(`/list/fees/collect/${currentStudentFee.studentId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error collecting fees.");
    }
  };

  // ✅ Columns
  const columns = useMemo<ColumnDef<StudentFee>[]>(() => {
    const baseColumns: ColumnDef<StudentFee>[] = [
      { accessorKey: "term", header: "Term" },
      {
        accessorFn: (row) => row.feeStructure?.dueDate,
        id: "dueDate",
        header: "Due Date",
        cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        accessorFn: (row) => getTotalFees(row),
        id: "totalFees",
        header: "Total Fees",
        cell: ({ cell }) => `₹${(cell.getValue<number>() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "paidAmount",
        header: "Paid Amount",
        cell: ({ cell }) => `₹${(cell.getValue<number>() ?? 0).toFixed(2)}`,
      },
      {
        accessorKey: "discountAmount",
        header: "Discount",
        cell: ({ cell }) => `₹${(cell.getValue<number>() ?? 0).toFixed(2)}`,
      },
      {
        id: "dueAmount",
        header: "Due Amount",
        cell: ({ row }) => {
          const dueAmount = calculateDueAmount(row.original);
          return (
            <span className={dueAmount > 0 ? "text-red-500" : "text-green-500"}>
              ₹{dueAmount.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.feeTransactions?.[0]?.receiptNo || "-",
        id: "receiptNo",
        header: "FB No",
      },
      {
        accessorFn: (row) => row.receiptDate,
        id: "receiptDate",
        header: "Receipt Date",
        cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        accessorFn: (row) => row.feeTransactions?.[0]?.remarks || "-",
        id: "remarks",
        header: "Remarks",
      },
      { accessorKey: "paymentMode", header: "Payment Mode" },
    ];

    // ✅ ADD ACTIONS ONLY FOR collect / cancel
    if (mode !== "view") {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { isCollectDisabled, isZero } = getFeeStatus(row.original);

          if (mode === "collect") {
            return (
              !isCollectDisabled && (
                <button
                  onClick={() => handleCollect(row.original)}
                  className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                >
                  Collect
                </button>
              )
            );
          }

          if (mode === "cancel") {
            return (
              !isZero && (
                <button
                  onClick={() => handleCancel(row.original, remarks)}
                  className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Cancel
                </button>
              )
            );
          }

          return null;
        },
      });
    }

    return baseColumns;
  }, [mode, handleCollect, handleCancel, remarks]);

  const TERM_ORDER: Record<string, number> = {
    TERM_1: 1,
    TERM_2: 2,
    TERM_3: 3,
    FINAL: 4,
  };

  const filteredData = useMemo(() => {
    const baseData =
      selectedAcademicYear === null
        ? rowData
        : rowData.filter((row) => row.academicYear === selectedAcademicYear);

    return [...baseData].sort((a, b) => {
      // 1️⃣ Sort by academic year (oldest → latest)
      const yearA = Number(a.academicYear.slice(1, 5)); // Y2024_2025 → 2024
      const yearB = Number(b.academicYear.slice(1, 5));

      if (yearA !== yearB) {
        return yearA - yearB;
      }

      // 2️⃣ If same academic year, sort by term
      return (TERM_ORDER[a.term] ?? 99) - (TERM_ORDER[b.term] ?? 99);
    });
  }, [rowData, selectedAcademicYear]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const summary = useMemo(() => {
    const totalFees = filteredData.reduce(
      (sum, f) =>
        sum +
        (f.feeStructure?.termFees ?? 0) +
        (f.feeStructure?.abacusFees ?? 0),
      0
    );

    const totalPaid = filteredData.reduce(
      (sum, f) => sum + (f.paidAmount ?? 0),
      0
    );

    const totalDiscount = filteredData.reduce(
      (sum, f) => sum + (f.discountAmount ?? 0),
      0
    );

    const totalDue = totalFees - (totalPaid + totalDiscount);

    return {
      totalFees,
      totalPaid,
      totalDiscount,
      totalDue,
    };
  }, [filteredData]);

  return (
    <div className="overflow-x-auto">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4 text-lg font-semibold">
        <div className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shadow">
          Total Fees: ₹{summary.totalFees}
        </div>
        <div className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 shadow">
          Total Paid: ₹{summary.totalPaid}
        </div>
        <div className="px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 shadow">
          Total Discount: ₹{summary.totalDiscount}
        </div>
        <div className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 shadow">
          Total Due: ₹{summary.totalDue}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Academic Year
        </span>

        <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 shadow-inner">
          {/* ALL */}
          <button
            onClick={() => setSelectedAcademicYear(null)}
            className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200
        ${
          selectedAcademicYear === null
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        }`}
          >
            All
          </button>

          {academicYears.map((year) => {
            const isActive = selectedAcademicYear === year;

            return (
              <button
                key={year}
                onClick={() => setSelectedAcademicYear(year)}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200
            ${
              isActive
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
              >
                {year.replace("_", " - ")}
              </button>
            );
          })}
        </div>
      </div>

      {/*TABLE*/}
      <div className="min-w-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider bg-LamaSky dark:bg-gray-900 text-black dark:text-gray-100"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && currentStudentFee && mode !== "view" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-96 space-y-4 shadow-lg">
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
              Collect Fees
            </h2>

            {/* Summary */}
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Total Fees:</strong> ₹{getTotalFees(currentStudentFee)}
              </p>
              <p>
                <strong>Paid:</strong> ₹{currentStudentFee.paidAmount || 0}
              </p>
              <p>
                <strong>Balance:</strong> ₹
                {calculateDueAmount(currentStudentFee)}
              </p>
            </div>

            {/* Inputs */}
            <div className="w-full space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Discount
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">FB No</label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Payment Mode
                </label>
                <select
                  value={selectedPaymentMode}
                  onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="ONLINE">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Receipt Date
                </label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full border p-2 rounded dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleFormSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-500 text-black dark:text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesTable;
