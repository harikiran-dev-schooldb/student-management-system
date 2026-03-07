"use client";

import { Receipt } from "lucide-react";
import { StudentFee } from "../../../types";

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

export default function TransactionHistory({
  fee,
  isMobile = false,
}: {
  fee: StudentFee;
  isMobile?: boolean;
}) {
  return (
    <div className={isMobile ? "mt-2" : "ml-10"}>
      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
        <Receipt size={14} /> Transaction History
      </h4>

      {fee.feeTransactions && fee.feeTransactions.length > 0 ? (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs bg-white dark:bg-slate-800">
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Receipt #</th>
                <th className="px-3 py-2 text-left">Mode</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {fee.feeTransactions.map((tx: any, i: number) => (
                <tr key={i}>
                  <td className="px-3 py-2">{formatDate(tx.receiptDate)}</td>
                  <td className="px-3 py-2">{tx.receiptNo || "-"}</td>
                  <td className="px-3 py-2">{tx.paymentMode || "CASH"}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic border border-dashed rounded p-2 text-center">
          No transactions recorded yet.
        </p>
      )}
    </div>
  );
}