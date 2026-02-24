import { MessageType } from "../../../types";

type Student = {
  name: string;
  className: string;
  amount?: number;
  term?: string;
};

export function getMessageContent(
  type: MessageType,
  student: Student,
  schoolName: string = "KOTAK SALESIAN SCHOOL"
): string {
  const { name, className, amount, term } = student;

  const formattedAmount =
    typeof amount === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(amount)
      : "";

  const baseFooter = ` - ${schoolName}`;

  switch (type) {
    case "ABSENT":
      return `Dear Parent, ${name} (${className}) was marked absent today. Kindly ensure regular attendance to support academic progress.${baseFooter}`;

    case "FEE_RELATED":
      return `Dear Parent, this is a reminder that the fee for ${
        term ?? "the current term"
      } is due for ${name} (${className}).${
        formattedAmount ? ` Amount payable: ${formattedAmount}.` : ""
      } Kindly arrange payment at the earliest.${baseFooter}`;

    case "FEE_COLLECTION":
      return `Dear Parent, we have successfully received the fee payment for ${
        term ?? "the current term"
      } for ${name} (${className}).${
        formattedAmount ? ` Amount received: ${formattedAmount}.` : ""
      } Thank you for your cooperation.${baseFooter}`;

    case "ANNOUNCEMENT":
      return `Dear Parent, please note that ${name}'s (${className}) class will remain closed tomorrow due to a holiday.${baseFooter}`;

    case "GENERAL":
      return `Dear Parent, an important update has been issued regarding ${name} (${className}). Kindly stay informed.${baseFooter}`;

    default:
      return `Dear Parent, a notification has been generated regarding ${name} (${className}). Please review the details.${baseFooter}`;
  }
}