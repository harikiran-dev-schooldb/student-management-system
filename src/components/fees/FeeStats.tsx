"use client";

import { Banknote, CheckCircle2, AlertCircle, Receipt } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  summary: {
    total: number;
    paid: number;
    discount: number;
    due: number;
  };
}

export default function FeeStats({ summary }: Props) {
  const Card = ({
    title,
    amount,
    icon,
    color,
    destructive,
  }: any) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
      <div className="flex justify-between text-xs text-gray-500">
        {title}
        <div className={color}>{icon}</div>
      </div>

      <div
        className={`text-xl font-bold ${
          destructive ? "text-rose-600" : ""
        }`}
      >
        {formatCurrency(amount)}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        title="Total Fees"
        amount={summary.total}
        icon={<Banknote size={18} />}
        color="text-indigo-500"
      />

      <Card
        title="Collected"
        amount={summary.paid}
        icon={<CheckCircle2 size={18} />}
        color="text-emerald-500"
      />

      <Card
        title="Discount"
        amount={summary.discount}
        icon={<Receipt size={18} />}
        color="text-amber-500"
      />

      <Card
        title="Due"
        amount={summary.due}
        icon={<AlertCircle size={18} />}
        color="text-rose-500"
        destructive
      />
    </div>
  );
}