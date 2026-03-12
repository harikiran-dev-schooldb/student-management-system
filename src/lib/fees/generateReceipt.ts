export function buildReceiptNumber(
  academicYearName: string,
  sequence: number
) {
  return `${academicYearName}-${sequence}`;
}