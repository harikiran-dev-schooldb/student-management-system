import { MessageType } from "../../../types";

type MessageContext = {
  studentName: string;
  className?: string | null;
  schoolName: string;

  amount?: number;
  term?: string;
  date?: Date;

  additionalInfo?: string;
};

function formatCurrency(amount?: number): string {
  if (typeof amount !== "number") return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date?: Date): string {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMessageContent(
  type: MessageType,
  ctx: MessageContext
): string {
  const {
    studentName,
    className,
    schoolName,
    amount,
    term,
    date,
    additionalInfo,
  } = ctx;

  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(date);

  const classLabel = className ? ` (${className})` : "";
  const footer = ` - ${schoolName}`;

  switch (type) {
    /* ---------------- ABSENT ---------------- */
    case "ABSENT":
      return `Dear Parent, ${studentName}${classLabel} was marked absent on ${
        formattedDate || "today"
      }. Kindly ensure regular attendance to support academic progress.${footer}`;

    /* ---------------- FEE DUE ---------------- */
    case "FEE_RELATED":
      return `Dear Parent, the fee for ${
        term ?? "the current term"
      } is pending for ${studentName}${classLabel}.${
        formattedAmount ? ` Amount payable: ${formattedAmount}.` : ""
      } Kindly arrange payment at the earliest.${footer}`;

    /* ---------------- FEE RECEIVED ---------------- */
    case "FEE_COLLECTION":
      return `Dear Parent, we have successfully received the fee payment for ${
        term ?? "the current term"
      } for ${studentName}${classLabel}.${
        formattedAmount ? ` Amount received: ${formattedAmount}.` : ""
      } Receipt date: ${
        formattedDate || "today"
      }. Thank you for your cooperation.${footer}`;

    /* ---------------- ANNOUNCEMENT ---------------- */
    case "ANNOUNCEMENT":
      return `Dear Parent, please note the following announcement regarding ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;

    /* ---------------- GENERAL ---------------- */
    case "GENERAL":
      return `Dear Parent, an important update has been issued for ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;

    /* ---------------- DEFAULT SAFETY ---------------- */
    default:
      return `Dear Parent, a notification has been generated for ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;
  }
}