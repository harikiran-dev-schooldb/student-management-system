import clsx from "clsx";

const STATUS_STYLES: Record<string, string> = {
  "Fully Paid":
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Not Paid":
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function StatusBadge({ status }: { status: string }) {
  const isTermPaid = status.includes("Term");

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
        isTermPaid &&
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      )}
    >
      {status}
    </span>
  );
}
