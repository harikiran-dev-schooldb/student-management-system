"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  Row,
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
  Download,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { StudentFee } from "../../../types";

// --- Types & Helpers ---
interface FeesTableProps {
  data: StudentFee[];
  mode: "collect" | "cancel" | "view";
}

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

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: "Paid" | "Partial" | "Unpaid" }) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    Partial: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    Unpaid: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Progress Bar Component ---
const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
  const percentage = Math.min(100, Math.max(0, (paid / total) * 100));
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

const FeesTable: React.FC<FeesTableProps> = ({ data, mode }) => {
  const router = useRouter();

  // --- State ---
  const [rowData, setRowData] = useState<StudentFee[]>(data);
  const [rowSelection, setRowSelection] = useState({}); // For Checkboxes
  const [expanded, setExpanded] = useState({}); // For Expandable Rows
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selection State (Single or Bulk)
  const [selectedFees, setSelectedFees] = useState<StudentFee[]>([]);

  // Modal Form State
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [fine, setFine] = useState<number>(0);
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("CASH");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);

  // --- Helpers ---
  const academicYears = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.academicYear))).sort((a, b) => {
      const startA = Number(a.slice(1, 5));
      const startB = Number(b.slice(1, 5));
      return startA - startB;
    });
  }, [data]);

  function getTotalFees(fee: StudentFee) {
    return (fee.feeStructure?.termFees ?? 0) + (fee.feeStructure?.abacusFees ?? 0);
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
      dueAmount: due
    };
  }

  // --- Actions ---

  // 1. Export CSV
  const handleExportCSV = () => {
    const headers = ["Term", "Year", "Total Fees", "Paid Amount", "Due Amount", "Receipt No", "Status"];
    const rows = rowData.map(row => [
      row.term,
      row.academicYear,
      getTotalFees(row),
      row.paidAmount || 0,
      calculateDueAmount(row),
      row.feeTransactions?.[0]?.receiptNo || "-",
      getFeeStatus(row).status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fees_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Open Modal (Single or Bulk)
  const openCollectModal = useCallback((fees: StudentFee[]) => {
    if (mode === "view") return;
    
    // Filter out fully paid ones just in case
    const payables = fees.filter(f => calculateDueAmount(f) > 0);
    
    if (payables.length === 0) {
      toast.info("Selected fees are already fully paid.");
      return;
    }

    const totalDue = payables.reduce((sum, f) => sum + calculateDueAmount(f), 0);
    const defaultReceipt = payables.length === 1 ? (payables[0].receiptNo || payables[0].feeTransactions?.[0]?.receiptNo || "") : "";
    const defaultRemarks = payables.length === 1 ? (payables[0].remarks || "") : `Bulk payment for ${payables.length} terms`;

    setSelectedFees(payables);
    setAmount(totalDue);
    setDiscount(0);
    setFine(0);
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setReceiptNo(defaultReceipt);
    setRemarks(defaultRemarks);
    setIsModalOpen(true);
  }, [mode]);

  // 3. Submit Payment (Handles Loop for Bulk)
  const handleFormSubmit = async () => {
    if (selectedFees.length === 0) return;

    const totalDue = selectedFees.reduce((sum, f) => sum + calculateDueAmount(f), 0);
    
    // Basic validation for bulk
    if (selectedFees.length > 1 && amount !== totalDue) {
       toast.warning("For bulk payments, please pay the exact total due amount.");
       return; 
    }

    try {
      // Loop through selected fees and update them one by one
      for (const fee of selectedFees) {
        const feeDue = calculateDueAmount(fee);
        
        const payload = {
          studentId: fee.studentId,
          term: fee.term,
          amount: feeDue, // Allocating exact due per fee
          discountAmount: selectedFees.length === 1 ? discount : 0, // Only apply discount to single
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
          const matched = selectedFees.find(sf => sf.id === f.id);
          if (matched) {
            const feeDue = calculateDueAmount(f);
            return {
              ...f,
              paidAmount: (f.paidAmount ?? 0) + feeDue,
              discountAmount: (f.discountAmount ?? 0) + (selectedFees.length === 1 ? discount : 0),
              receiptNo,
              remarks,
            };
          }
          return f;
        })
      );

      toast.success("Payment collected successfully!");
      setIsModalOpen(false);
      setRowSelection({}); // Clear selection
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error collecting fees.");
    }
  };

  // 4. Cancel Action
  const handleCancel = useCallback(async (fee: StudentFee) => {
      if (!window.confirm(`Cancel fees for ${fee.term}?`)) return;
      try {
        const res = await fetch("/api/fees/cancel-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: fee.studentId, term: fee.term, academicYear: fee.academicYear }),
        });
        if (!res.ok) throw new Error("Failed");
        setRowData(prev => prev.map(f => f.id === fee.id ? { ...f, paidAmount: 0, discountAmount: 0, remarks: "Cancelled" } : f));
        toast.success("Cancelled.");
      } catch (e) { toast.error("Failed to cancel"); }
  }, []);


  // --- Table Configuration ---
  const columns = useMemo<ColumnDef<StudentFee>[]>(() => {
    const cols: ColumnDef<StudentFee>[] = [];

    // 1. Checkbox Column (Hide in View Mode)
    if (mode !== "view") {
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
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          />
        ),
      });
    }

    // 2. Standard Columns (Always Visible)
    cols.push(
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
          >
            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ),
      },
      {
        accessorKey: "term",
        header: "Term",
        cell: ({ getValue }) => <span className="font-semibold text-slate-700 dark:text-slate-200">{getValue() as string}</span>
      },
      {
        accessorKey: "academicYear",
        header: "Year",
        cell: ({ getValue }) => <span className="text-xs text-slate-500">{(getValue() as string).replace("Y", "").replace("_", "-")}</span>,
      },
      {
        accessorFn: (row) => getTotalFees(row),
        header: "Total",
        cell: ({ cell, row }) => (
          <div className="group relative cursor-help">
            <span>{formatCurrency(cell.getValue<number>())}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 bg-gray-900 text-white text-xs rounded p-2 z-10 shadow-lg">
              <div className="flex justify-between"><span>Term:</span><span>₹{row.original.feeStructure?.termFees}</span></div>
              <div className="flex justify-between"><span>Abacus:</span><span>₹{row.original.feeStructure?.abacusFees || 0}</span></div>
              <div className="flex justify-between pt-1 border-t border-gray-700 mt-1"><span>Total:</span><span>{formatCurrency(cell.getValue<number>())}</span></div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "paidAmount",
        header: "Paid",
        cell: ({ cell, row }) => {
          const paid = cell.getValue<number>() || 0;
          const total = getTotalFees(row.original);
          return (
            <div className="w-24">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium text-emerald-600">{formatCurrency(paid)}</span>
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
          return <span className={`font-bold ${due > 0 ? "text-rose-500" : "text-slate-400"}`}>{formatCurrency(due)}</span>;
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={getFeeStatus(row.original).status} />,
      }
    );

    // 3. Actions Column (Hide in View Mode)
    if (mode !== "view") {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { isCollectDisabled, isZero } = getFeeStatus(row.original);
          return (
            <div className="flex items-center gap-2">
              {mode === "collect" && !isCollectDisabled && (
                <button
                  onClick={() => openCollectModal([row.original])}
                  className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Pay
                </button>
              )}
              {/* Print Receipt Button */}
              {!isZero && (
                <button 
                  onClick={() => window.print()} 
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" 
                  title="Print Receipt"
                >
                  <Printer size={16} />
                </button>
              )}
              {mode === "cancel" && !isZero && (
                <button
                  onClick={() => handleCancel(row.original)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
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
  }, [mode, openCollectModal, handleCancel]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    const baseData = selectedAcademicYear
      ? rowData.filter((row) => row.academicYear === selectedAcademicYear)
      : rowData;
    const TERM_ORDER: Record<string, number> = { TERM_1: 1, TERM_2: 2, TERM_3: 3, FINAL: 4 };
    return [...baseData].sort((a, b) => {
      const yearA = Number(a.academicYear.slice(1, 5));
      const yearB = Number(b.academicYear.slice(1, 5));
      if (yearA !== yearB) return yearA - yearB;
      return (TERM_ORDER[a.term] ?? 99) - (TERM_ORDER[b.term] ?? 99);
    });
  }, [rowData, selectedAcademicYear]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection, expanded },
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: (row) => getFeeStatus(row.original).status !== "Paid", // Disable selection if paid
  });

  // Summary
  const summary = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        const total = getTotalFees(curr);
        const paid = curr.paidAmount ?? 0;
        const discount = curr.discountAmount ?? 0;
        return {
          total: acc.total + total,
          paid: acc.paid + paid,
          discount: acc.discount + discount,
          due: acc.due + (total - paid - discount),
        };
      },
      { total: 0, paid: 0, discount: 0, due: 0 }
    );
  }, [filteredData]);

  // Bulk Selection Count
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Fees" amount={summary.total} icon={<Banknote className="w-5 h-5 text-indigo-500" />} color="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard title="Collected" amount={summary.paid} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} color="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard title="Discount" amount={summary.discount} icon={<Receipt className="w-5 h-5 text-amber-500" />} color="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard title="Due Amount" amount={summary.due} icon={<AlertCircle className="w-5 h-5 text-rose-500" />} color="bg-rose-50 dark:bg-rose-900/20" isDestructive={summary.due > 0} />
      </div>

      {/* --- Controls Bar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        
        {/* Academic Year Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
           <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap"><Filter size={14} className="inline mr-1" /> Year:</span>
           <button onClick={() => setSelectedAcademicYear(null)} className={`text-xs px-3 py-1.5 rounded-full transition ${selectedAcademicYear === null ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
           {academicYears.map(y => (
             <button key={y} onClick={() => setSelectedAcademicYear(y)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${selectedAcademicYear === y ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
               {y.replace("Y", "").replace("_", "-")}
             </button>
           ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Bulk Pay Button */}
          {selectedCount > 0 && mode === 'collect' && (
            <button 
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
                openCollectModal(selectedRows);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg shadow-md hover:bg-indigo-700 animate-in fade-in slide-in-from-right-4"
            >
              Pay Selected ({selectedCount})
            </button>
          )}
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
          
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-indigo-600 transition">
            <FileSpreadsheet size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Table View --- */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">No records found.</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  {/* Main Row */}
                  <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${row.getIsExpanded() ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Detail Row (Transaction History) */}
                  {row.getIsExpanded() && (
                    <tr>
                      <td colSpan={columns.length} className="bg-gray-50 dark:bg-black/20 p-4 shadow-inner">
                        <div className="ml-10">
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
                             <Receipt size={14} /> Transaction History
                          </h4>
                          {row.original.feeTransactions && row.original.feeTransactions.length > 0 ? (
                            <table className="w-full max-w-2xl text-xs border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                   <tr>
                                     <th className="px-3 py-2 text-left">Date</th>
                                     <th className="px-3 py-2 text-left">Receipt #</th>
                                     <th className="px-3 py-2 text-left">Mode</th>
                                     <th className="px-3 py-2 text-right">Amount</th>
                                   </tr>
                                </thead>
                                <tbody>
                                  {row.original.feeTransactions.map((tx: any, i: number) => (
                                     <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="px-3 py-2">{formatDate(tx.receiptDate || new Date())}</td>
                                        <td className="px-3 py-2 font-mono">{tx.receiptNo || "-"}</td>
                                        <td className="px-3 py-2">{tx.paymentMode || "CASH"}</td>
                                        <td className="px-3 py-2 text-right font-medium text-emerald-600">{formatCurrency(tx.amount)}</td>
                                     </tr>
                                  ))}
                                </tbody>
                            </table>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No transactions recorded yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Collection Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
               <div>
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white">Collect Payment</h2>
                 <p className="text-sm text-slate-500">
                    {selectedFees.length > 1 ? `Bulk Payment (${selectedFees.length} items)` : `${selectedFees[0]?.term} • ${selectedFees[0]?.academicYear}`}
                 </p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
               <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-lg p-3 text-center">
                  <span className="text-xs text-indigo-600 dark:text-indigo-300 uppercase font-bold">Total Payable Amount</span>
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">{formatCurrency(amount)}</div>
               </div>

               {/* Inputs */}
               <div className="space-y-4">
                  <InputGroup label="Payment Amount" value={amount} onChange={(v) => setAmount(Number(v))} type="number" icon={<Banknote size={16} />} autoFocus />
                  
                  {/* Disable discount/fine for bulk to keep it simple */}
                  {selectedFees.length === 1 && (
                     <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Discount" value={discount} onChange={(v) => setDiscount(Number(v))} type="number" />
                        <InputGroup label="Fine" value={fine} onChange={(v) => setFine(Number(v))} type="number" />
                     </div>
                  )}

                  <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Payment Mode</label>
                     <div className="grid grid-cols-2 gap-2">
                        {["CASH", "UPI", "ONLINE", "BANK_TRANSFER"].map((m) => (
                           <button key={m} onClick={() => setSelectedPaymentMode(m)} className={`text-xs py-2 px-2 rounded-md border transition-all ${selectedPaymentMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'}`}>{m.replace("_", " ")}</button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="Receipt No" value={receiptNo} onChange={(v) => setReceiptNo(String(v))} type="text" />
                     <InputGroup label="Date" value={receiptDate} onChange={(v) => setReceiptDate(String(v))} type="date" />
                  </div>
                  
                  <InputGroup label="Remarks" value={remarks} onChange={(v) => setRemarks(String(v))} type="text" />
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
               <button onClick={handleFormSubmit} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Strictly Typed Sub-components ---

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  isDestructive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  icon,
  color,
  isDestructive,
}) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24">
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

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  type,
  icon,
  autoFocus,
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

export default FeesTable;