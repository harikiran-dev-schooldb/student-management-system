export function generateFeeRemark(term: string, date: Date) {
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const termLabel = term.replace("_", " ");

  return `${termLabel} Fee Collected on ${formattedDate}`;
}