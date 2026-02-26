import { MessageContext, MessageType } from "../../../types";
import { formatDate } from "../FeeUtils";
import { formatCurrency } from "../settings";

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
    leaveType,
    withWhom,
    relation,
    marks,
    examName,
    subject,
    dueDate,
    eventName,
  } = ctx;

  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(date);
  const formattedDueDate = formatDate(dueDate);

  const classLabel = className ? ` (${className})` : "";
  const footer = ` - ${schoolName}`;

  switch (type) {
    /* ---------------- ABSENT ---------------- */
    case "ABSENT":
      return `Dear Parent, ${studentName}${classLabel} was marked absent on ${
        formattedDate || "today"
      }. Kindly ensure regular attendance.${footer}`;

    /* ---------------- FEE DUE ---------------- */
    case "FEE_RELATED":
      return `Dear Parent, the fee for ${
        term ?? "the current term"
      } is pending for ${studentName}${classLabel}.${
        formattedAmount ? ` Amount payable: ${formattedAmount}.` : ""
      } Kindly arrange payment at the earliest.${footer}`;

    /* ---------------- FEE RECEIVED ---------------- */
    case "FEE_COLLECTION":
      return `Dear Parent, fee payment for ${
        term ?? "the current term"
      } has been received for ${studentName}${classLabel}.${
        formattedAmount ? ` Amount received: ${formattedAmount}.` : ""
      } Receipt date: ${
        formattedDate || "today"
      }. Thank you for your cooperation.${footer}`;

    /* ---------------- ANNOUNCEMENT ---------------- */
    case "ANNOUNCEMENT":
      return `Dear Parent, an announcement has been issued for ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;

    /* ---------------- GENERAL ---------------- */
    case "GENERAL":
      return `Dear Parent, an important update has been shared regarding ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;

    /* ---------------- HOMEWORK ---------------- */
    case "HOMEWORK":
      return `Dear Parent, homework has been assigned to ${studentName}${classLabel}${
        subject ? ` for ${subject}` : ""
      }.${
        formattedDueDate ? ` Due date: ${formattedDueDate}.` : ""
      } Kindly ensure timely completion.${footer}`;

    /* ---------------- EXAM RESULT ---------------- */
    case "EXAM_RESULT":
      return `Dear Parent, exam results for ${
        examName ?? "the recent examination"
      } have been published for ${studentName}${classLabel}.${
        marks ? ` Marks/Grade: ${marks}.` : ""
      } Kindly review the performance.${footer}`;

    /* ---------------- EVENT ---------------- */
    case "EVENT":
      return `Dear Parent, ${
        eventName ?? "an upcoming school event"
      } is scheduled${
        formattedDate ? ` on ${formattedDate}` : ""
      }.${
        additionalInfo ? ` ${additionalInfo}` : ""
      } Kindly take note.${footer}`;

    /* ---------------- PERMISSION SLIP ---------------- */
    case "PERMISSION_SLIP":
      return `Dear Parent, a gate pass has been issued for ${studentName}${classLabel} on ${
        formattedDate || "today"
      } for ${leaveType ?? "personal reasons"}.${
        withWhom
          ? ` The student will leave with ${withWhom}${
              relation ? ` (${relation})` : ""
            }.`
          : ""
      } Kindly ensure safe return if applicable.${footer}`;

    /* ---------------- DEFAULT SAFETY ---------------- */
    default:
      return `Dear Parent, a notification has been generated for ${studentName}${classLabel}.${
        additionalInfo ? ` ${additionalInfo}` : ""
      }${footer}`;
  }
}