export function requireSchool(params: { schoolId: string }) {
  if (!params.schoolId) {
    throw new Error("School ID missing");
  }
  return params.schoolId;
}
