"use client";

import React, { useCallback, useMemo, useState } from "react";
import Script from "next/script";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Receipt,
  ChevronRight,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import { StudentFee } from "../../../types";

// --- Types ---
interface FeesTableProps {
  data: StudentFee[];
  mode: "collect" | "cancel" | "view";
  role?: "admin" | "student";
  studentName?: string;
  studentEmail?: string;
  studentMobile?: string;
}

// --- Helper Functions ---
function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- UI Sub-Components ---

const StatusBadge = ({ status }: { status: "Paid" | "Partial" | "Unpaid" }) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    Partial:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    Unpaid:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
  const percentage =
    total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 100;
  return (
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          percentage === 100 ? "bg-emerald-500" : "bg-indigo-500"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const StatCard = ({
  title,
  amount,
  icon,
  color,
  isDestructive,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  isDestructive?: boolean;
}) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
        {title}
      </span>
      <div className={`p-1.5 rounded-full ${color}`}>{icon}</div>
    </div>
    <div
      className={`text-xl font-bold ${
        isDestructive ? "text-rose-600" : "text-slate-900 dark:text-white"
      }`}
    >
      {formatCurrency(amount)}
    </div>
  </div>
);

const InputGroup = ({
  label,
  value,
  onChange,
  type,
  icon,
  autoFocus,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full pl-3 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
      />
      {icon && (
        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// --- Transaction History Component ---
const TransactionHistory = ({
  fee,
  isMobile = false,
}: {
  fee: StudentFee;
  isMobile?: boolean;
}) => {
  return (
    <div className={isMobile ? "mt-2" : "ml-10"}>
      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
        <Receipt size={14} /> Transaction History
      </h4>
      {fee.feeTransactions && fee.feeTransactions.length > 0 ? (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs bg-white dark:bg-slate-800">
            <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Receipt #</th>
                <th className="px-3 py-2 text-left">Mode</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {fee.feeTransactions.map((tx: any, i: number) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {formatDate(tx.receiptDate || new Date())}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-500">
                    {tx.receiptNo || "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {tx.paymentMode || "CASH"}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-600">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic border border-dashed border-gray-300 rounded p-2 text-center">
          No transactions recorded yet.
        </p>
      )}
    </div>
  );
};

// --- Main Component ---
const FeesTable: React.FC<FeesTableProps> = ({
  data,
  mode,
  role = "admin",
  studentName = "Student",
  studentEmail = "",
  studentMobile = "",
}) => {
  const router = useRouter();

  // --- State ---
  const [rowData, setRowData] = useState<StudentFee[]>(data);
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selection State (Single or Bulk)
  const [selectedFees, setSelectedFees] = useState<StudentFee[]>([]);

  // Modal Form State
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [fine, setFine] = useState<number>(0);
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<string>("CASH");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    string | null
  >(null);

  // --- Calculations Helpers ---
  const academicYears = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.academicYear))).sort((a, b) => {
      const startA = Number(a.slice(1, 5));
      const startB = Number(b.slice(1, 5));
      return startA - startB;
    });
  }, [data]);

  function getTotalFees(fee: StudentFee) {
    return (
      (fee.feeStructure?.termFees ?? 0) + (fee.feeStructure?.abacusFees ?? 0)
    );
  }

  function calculateDueAmount(fee: StudentFee) {
    const total = getTotalFees(fee);
    const paid = fee.paidAmount ?? 0;
    const discountAmt = fee.discountAmount ?? 0;
    // Fine is usually added to the total payable, but typically database stores 'fineAmount' separately.
    // Assuming standard logic: Due = (Total + Fine) - (Paid + Discount)
    // Or if Fine is just recorded: Due = Total - Paid - Discount + Fine
    return total - paid - discountAmt + (fee.fineAmount ?? 0);
  }

  function getFeeStatus(fee: StudentFee) {
    const due = calculateDueAmount(fee);
    const paid = fee.paidAmount ?? 0;
    const total = getTotalFees(fee);

    let status: "Paid" | "Partial" | "Unpaid" = "Unpaid";
    if (due <= 0) status = "Paid";
    else if (paid > 0) status = "Partial";

    return {
      status,
      paidAmount: paid,
      totalFees: total,
      isCollectDisabled: due <= 0,
      isZero: paid === 0,
      dueAmount: due,
    };
  }

  // --- Razorpay Logic ---
  const initiateOnlinePayment = async (
    feesToPay: StudentFee[],
    totalAmount: number
  ) => {
    setIsProcessing(true);
    try {
      // 1. Create Order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const orderData = await res.json();

      if (!orderData.orderId) throw new Error("Failed to create order");

      // 2. Initialize Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "School Fees",
        description:
          feesToPay.length > 1
            ? `Bulk Payment (${feesToPay.length} terms)`
            : `Fee Payment: ${feesToPay[0].term}`,
        order_id: orderData.orderId,
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentMobile,
        },
        theme: { color: "#4F46E5" },
        handler: async function (response: any) {
          // 3. On Success
          await processSuccessfulPayment(
            feesToPay,
            totalAmount,
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error("Online payment initialization failed");
      setIsProcessing(false);
    }
  };

  const processSuccessfulPayment = async (
    feesToPay: StudentFee[],
    totalAmountPaid: number,
    transactionId: string,
    orderId: string,
    signature: string
  ) => {
    try {
      const studentId = feesToPay[0]?.studentId;
      if (!studentId) throw new Error("No student ID found in selection");

      // --- STEP 1: Verify and Record Main Transaction ---
      const paymentRecordResponse = await fetch("/api/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCreationId: orderId, // Backend expects: orderCreationId
          razorpayPaymentId: transactionId, // Backend expects: razorpayPaymentId
          razorpaySignature: signature, // Backend expects: razorpaySignature
          studentId: studentId,
          amount: totalAmountPaid,
        }),
      });

      if (!paymentRecordResponse.ok) {
        const errorData = await paymentRecordResponse.json();
        console.error("Payment Record API Error:", errorData);
        throw new Error(errorData.error || "Failed to create payment record");
      }

      // --- STEP 2: Update Individual Fee Terms ---
      for (const fee of feesToPay) {
        const feeDue = calculateDueAmount(fee);
        const amountForThisFee =
          feesToPay.length > 1 ? feeDue : totalAmountPaid;

        const payload = {
          studentId: fee.studentId,
          term: fee.term,
          amount: amountForThisFee,
          discountAmount: 0,
          fineAmount: 0,
          receiptDate: new Date().toISOString(),
          receiptNo: `ONL-${transactionId.slice(-6)}`,
          remarks: `Online Payment: ${transactionId}`,
          academicYear: fee.academicYear,
          paymentMode: "ONLINE",
          transactionId: transactionId,
          orderId: orderId,
        };

        const updateResponse = await fetch("/api/fees/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // FIX: Check if the update actually succeeded
        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          console.error(`Failed to update term ${fee.term}:`, updateError);
          throw new Error(`Failed to update fee for term: ${fee.term}`);
        }
      }

      // --- STEP 3: Optimistic UI Update ---
      setRowData((prev) =>
        prev.map((f) => {
          const matched = feesToPay.find((sf) => sf.id === f.id);
          if (matched) {
            const paidNow =
              feesToPay.length > 1 ? calculateDueAmount(f) : totalAmountPaid;
            return {
              ...f,
              paidAmount: (f.paidAmount ?? 0) + paidNow,
              receiptNo: `ONL-${transactionId.slice(-6)}`,
              // Update status badge logic will handle the rest based on amounts
            };
          }
          return f;
        })
      );

      toast.success("Payment Successful!");
      if (isModalOpen) setIsModalOpen(false);
      setRowSelection({});
      router.refresh();
    } catch (error: any) {
      console.error("Transaction Failed:", error);
      // Show the actual error message from the backend if available
      toast.error(
        error.message ||
          "Payment verified but database update failed. Contact Admin."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Admin Manual Collection Handlers ---

  const openCollectModal = useCallback((fees: StudentFee[]) => {
    // Filter strictly unpaid
    const payables = fees.filter((f) => calculateDueAmount(f) > 0);

    if (payables.length === 0) {
      toast.info("Selected fees are already fully paid.");
      return;
    }

    const totalDue = payables.reduce(
      (sum, f) => sum + calculateDueAmount(f),
      0
    );

    // Defaults
    const defaultReceipt =
      payables.length === 1
        ? payables[0].receiptNo ||
          payables[0].feeTransactions?.[0]?.receiptNo ||
          ""
        : "";
    const defaultRemarks =
      payables.length === 1
        ? payables[0].remarks || ""
        : `Bulk payment for ${payables.length} terms`;

    setSelectedFees(payables);
    setAmount(totalDue);
    setDiscount(0);
    setFine(0);
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setReceiptNo(defaultReceipt);
    setRemarks(defaultRemarks);
    setSelectedPaymentMode("CASH");
    setIsModalOpen(true);
  }, []);

  const handleManualFormSubmit = async () => {
    if (selectedFees.length === 0) return;

    // Check payment mode
    if (selectedPaymentMode === "ONLINE") {
      // Redirect manual "ONLINE" selection to Razorpay flow
      await initiateOnlinePayment(selectedFees, amount);
      return;
    }

    // Manual Cash/UPI Logic
    try {
      for (const fee of selectedFees) {
        const feeDue = calculateDueAmount(fee);

        // Strategy: If bulk, pay exact due. If single, allow partial (user input amount).
        const amountToPay = selectedFees.length > 1 ? feeDue : amount;

        const payload = {
          studentId: fee.studentId,
          term: fee.term,
          amount: amountToPay,
          discountAmount: selectedFees.length === 1 ? discount : 0, // No custom discount on bulk
          fineAmount: selectedFees.length === 1 ? fine : 0,
          receiptDate,
          receiptNo,
          remarks,
          academicYear: fee.academicYear,
          paymentMode: selectedPaymentMode,
        };

        await fetch("/api/fees/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Optimistic Update
      setRowData((prev) =>
        prev.map((f) => {
          const matched = selectedFees.find((sf) => sf.id === f.id);
          if (matched) {
            // Logic for amount addition
            const addedAmount =
              selectedFees.length > 1 ? calculateDueAmount(f) : amount;
            return {
              ...f,
              paidAmount: (f.paidAmount ?? 0) + addedAmount,
              discountAmount:
                (f.discountAmount ?? 0) +
                (selectedFees.length === 1 ? discount : 0),
              fineAmount:
                (f.fineAmount ?? 0) + (selectedFees.length === 1 ? fine : 0),
              receiptNo,
              remarks,
            };
          }
          return f;
        })
      );

      toast.success("Payment collected successfully!");
      setIsModalOpen(false);
      setRowSelection({});
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error collecting fees.");
    }
  };

  // --- Student Direct Pay Handler ---
  const handleStudentPayClick = (fee: StudentFee) => {
    const due = calculateDueAmount(fee);
    if (due <= 0) return;
    initiateOnlinePayment([fee], due);
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = [
      "Term",
      "Year",
      "Total Fees",
      "Paid Amount",
      "Due Amount",
      "Status",
      "Receipt No",
    ];
    const rows = rowData.map((row) => [
      row.term,
      row.academicYear,
      getTotalFees(row),
      row.paidAmount || 0,
      calculateDueAmount(row),
      getFeeStatus(row).status,
      row.receiptNo || row.feeTransactions?.[0]?.receiptNo || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fees_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Cancellation ---
  const handleCancel = useCallback(
    async (fee: StudentFee) => {
      if (
        !window.confirm(
          `Are you sure you want to cancel fees for ${fee.term}? This cannot be undone.`
        )
      )
        return;
      try {
        const res = await fetch("/api/fees/cancel-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: fee.studentId,
            term: fee.term,
            academicYear: fee.academicYear,
          }),
        });
        if (!res.ok) throw new Error("Failed");

        setRowData((prev) =>
          prev.map((f) =>
            f.id === fee.id
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
        toast.success("Transaction cancelled.");
        router.refresh();
      } catch (e) {
        toast.error("Failed to cancel");
      }
    },
    [router]
  );

  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<StudentFee>[]>(() => {
    const cols: ColumnDef<StudentFee>[] = [];

    // 1. Selection Column (Admin Only)
    if (mode === "collect" && role === "admin") {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={getFeeStatus(row.original).status === "Paid"}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ),
      });
    }

    // 2. Data Columns
    cols.push(
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 transition-colors"
          >
            {row.getIsExpanded() ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        ),
      },
      {
        accessorKey: "term",
        header: "Term",
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "academicYear",
        header: "Year",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {(getValue() as string).replace("Y", "").replace("_", "-")}
          </span>
        ),
      },
      {
        id: "totalFees",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-slate-700 dark:text-slate-300">
            {formatCurrency(getTotalFees(row.original))}
          </span>
        ),
      },
      {
        accessorKey: "paidAmount",
        header: "Paid",
        cell: ({ cell, row }) => {
          const paid = cell.getValue<number>() || 0;
          const total = getTotalFees(row.original);
          return (
            <div className="w-28">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-emerald-600">
                  {formatCurrency(paid)}
                </span>
              </div>
              <ProgressBar paid={paid} total={total} />
            </div>
          );
        },
      },
      {
        id: "dueAmount",
        header: "Due",
        cell: ({ row }) => {
          const due = calculateDueAmount(row.original);
          return (
            <span
              className={`font-bold ${
                due > 0 ? "text-rose-500" : "text-slate-400"
              }`}
            >
              {formatCurrency(due)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={getFeeStatus(row.original).status} />
        ),
      }
    );

    // 3. Actions Column
    if (mode !== "view" || role === "student") {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { isCollectDisabled, isZero } = getFeeStatus(row.original);

          return (
            <div className="flex items-center gap-2">
              {/* Admin Pay */}
              {mode === "collect" && role === "admin" && !isCollectDisabled && (
                <button
                  onClick={() => openCollectModal([row.original])}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition shadow-sm"
                >
                  Collect
                </button>
              )}

              {/* Student Pay */}
              {role === "student" && !isCollectDisabled && (
                <button
                  onClick={() => handleStudentPayClick(row.original)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-bold uppercase text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-sm flex items-center gap-1 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    "..."
                  ) : (
                    <>
                      Pay <CreditCard size={12} />
                    </>
                  )}
                </button>
              )}

              {/* Print */}
              {!isZero && (
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                  title="Print Receipt"
                >
                  <Printer size={16} />
                </button>
              )}

              {/* Cancel (Admin Only) */}
              {mode === "cancel" && role === "admin" && !isZero && (
                <button
                  onClick={() => handleCancel(row.original)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition"
                  title="Cancel Transaction"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [
    mode,
    role,
    isProcessing,
    openCollectModal,
    handleCancel,
    handleStudentPayClick,
  ]);

  // --- Filtering & Sorting Data ---
  const filteredData = useMemo(() => {
    const baseData = selectedAcademicYear
      ? rowData.filter((row) => row.academicYear === selectedAcademicYear)
      : rowData;

    // Custom Sort: Year then Term
    const TERM_ORDER: Record<string, number> = {
      TERM_1: 1,
      TERM_2: 2,
      TERM_3: 3,
      FINAL: 4,
    };
    return [...baseData].sort((a, b) => {
      const yearA = Number(a.academicYear.slice(1, 5));
      const yearB = Number(b.academicYear.slice(1, 5));
      if (yearA !== yearB) return yearA - yearB;
      return (TERM_ORDER[a.term] ?? 99) - (TERM_ORDER[b.term] ?? 99);
    });
  }, [rowData, selectedAcademicYear]);

  // --- Table Instance ---
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection, expanded },
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: (row) => getFeeStatus(row.original).status !== "Paid",
  });

  // --- Summary Statistics ---
  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        const total = getTotalFees(curr);
        const paid = curr.paidAmount ?? 0;
        const discountAmt = curr.discountAmount ?? 0;
        const fineAmt = curr.fineAmount ?? 0;
        // Calculation logic
        const due = total - paid - discountAmt + fineAmt;

        return {
          total: acc.total + total,
          paid: acc.paid + paid,
          discount: acc.discount + discountAmt,
          due: acc.due + (due > 0 ? due : 0),
        };
      },
      { total: 0, paid: 0, discount: 0, due: 0 }
    );
  }, [filteredData]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Fees"
          amount={summary.total}
          icon={<Banknote className="w-5 h-5 text-indigo-500" />}
          color="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          title="Collected"
          amount={summary.paid}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          title="Discount"
          amount={summary.discount}
          icon={<Receipt className="w-5 h-5 text-amber-500" />}
          color="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          title="Due Amount"
          amount={summary.due}
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
          color="bg-rose-50 dark:bg-rose-900/20"
          isDestructive={summary.due > 0}
        />
      </div>

      {/* --- Controls Bar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Year Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap flex items-center">
            <Filter size={14} className="mr-1" /> Year:
          </span>
          <button
            onClick={() => setSelectedAcademicYear(null)}
            className={`text-xs px-3 py-1.5 rounded-full transition border ${
              selectedAcademicYear === null
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {academicYears.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedAcademicYear(y)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition border ${
                selectedAcademicYear === y
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {y.replace("Y", "").replace("_", "-")}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Admin Bulk Pay */}
          {selectedCount > 0 && mode === "collect" && role === "admin" && (
            <button
              onClick={() => {
                const selectedRows = table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original);
                openCollectModal(selectedRows);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg shadow-md hover:bg-indigo-700 animate-in fade-in slide-in-from-right-4"
            >
              Pay Selected ({selectedCount})
            </button>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-indigo-600 transition"
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No fee records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`transition-colors ${
                      row.getIsExpanded()
                        ? "bg-slate-50 dark:bg-slate-800/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-slate-700 dark:text-slate-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {/* Expanded Row */}
                  {row.getIsExpanded() && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="bg-gray-50 dark:bg-slate-900/50 p-4 border-b border-gray-100"
                      >
                        <TransactionHistory fee={row.original} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed">
            No records found.
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const {
              status,
              dueAmount,
              paidAmount,
              totalFees,
              isCollectDisabled,
              isZero,
            } = getFeeStatus(row.original);
            const isSelected = row.getIsSelected();
            const isExpanded = row.getIsExpanded();

            return (
              <div
                key={row.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-indigo-400 ring-1 ring-indigo-400"
                    : "border-slate-200 dark:border-slate-800"
                } shadow-sm overflow-hidden`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    {mode === "collect" &&
                      role === "admin" &&
                      status !== "Paid" && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={row.getToggleSelectedHandler()}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {row.original.term}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {row.original.academicYear
                          .replace("Y", "")
                          .replace("_", "-")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">
                      Total Amount
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(totalFees)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">
                        Paid Amount
                      </span>
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(paidAmount)}
                      </span>
                    </div>
                    <ProgressBar paid={paidAmount} total={totalFees} />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">
                      Due Amount
                    </span>
                    <span
                      className={`font-bold ${
                        dueAmount > 0 ? "text-rose-500" : "text-slate-400"
                      }`}
                    >
                      {formatCurrency(dueAmount)}
                    </span>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2 pt-2 mt-2">
                    {/* Admin Pay */}
                    {mode === "collect" &&
                      role === "admin" &&
                      !isCollectDisabled && (
                        <button
                          onClick={() => openCollectModal([row.original])}
                          className="flex-1 py-2 text-xs font-bold uppercase text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
                        >
                          Collect
                        </button>
                      )}

                    {/* Student Pay */}
                    {role === "student" && !isCollectDisabled && (
                      <button
                        onClick={() => handleStudentPayClick(row.original)}
                        disabled={isProcessing}
                        className="flex-1 py-2 text-xs font-bold uppercase text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm flex justify-center items-center gap-2"
                      >
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            Pay Now <CreditCard size={14} />
                          </>
                        )}
                      </button>
                    )}

                    {!isZero && (
                      <button
                        onClick={() => window.print()}
                        className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-indigo-600"
                      >
                        <Printer size={16} />
                      </button>
                    )}

                    <button
                      onClick={row.getToggleExpandedHandler()}
                      className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        isExpanded
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-slate-500"
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Expanded History */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800">
                    <TransactionHistory fee={row.original} isMobile />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- Admin Collection Modal --- */}
      {isModalOpen && role === "admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Collect Payment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedFees.length > 1
                    ? `Bulk Payment (${selectedFees.length} items)`
                    : `${selectedFees[0]?.term} • ${selectedFees[0]?.academicYear}`}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-lg p-4 text-center">
                <span className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-bold tracking-wider">
                  Total Payable Amount
                </span>
                <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-200 mt-1">
                  {formatCurrency(amount)}
                </div>
              </div>

              <div className="space-y-4">
                <InputGroup
                  label="Payment Amount"
                  value={amount}
                  onChange={(v) => setAmount(Number(v))}
                  type="number"
                  icon={<Banknote size={16} />}
                  autoFocus
                />

                {selectedFees.length === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Discount"
                      value={discount}
                      onChange={(v) => setDiscount(Number(v))}
                      type="number"
                    />
                    <InputGroup
                      label="Fine"
                      value={fine}
                      onChange={(v) => setFine(Number(v))}
                      type="number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["CASH", "UPI", "ONLINE", "BANK_TRANSFER"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedPaymentMode(m)}
                        className={`text-xs py-2.5 px-2 rounded-lg border transition-all font-medium ${
                          selectedPaymentMode === m
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {m.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Receipt No"
                    value={receiptNo}
                    onChange={(v) => setReceiptNo(String(v))}
                    type="text"
                    icon={<Receipt size={16} />}
                  />
                  <InputGroup
                    label="Date"
                    value={receiptDate}
                    onChange={(v) => setReceiptDate(String(v))}
                    type="date"
                  />
                </div>

                <InputGroup
                  label="Remarks"
                  value={remarks}
                  onChange={(v) => setRemarks(String(v))}
                  type="text"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-gray-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleManualFormSubmit}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg disabled:opacity-70 transition flex justify-center items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesTable;
