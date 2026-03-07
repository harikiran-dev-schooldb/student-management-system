"use client";

export const StatusBadge = ({
  status,
}: {
  status: "Paid" | "Partial" | "Unpaid";
}) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700",
    Partial: "bg-amber-100 text-amber-700",
    Unpaid: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded ${styles[status]}`}>
      {status}
    </span>
  );
};

export const ProgressBar = ({
  paid,
  total,
}: {
  paid: number;
  total: number;
}) => {
  const percentage =
    total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 100;

  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full">
      <div
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};