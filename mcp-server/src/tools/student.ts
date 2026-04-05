import sql from "../db.js";

export async function getStudents(args: {
  class?: string;
  schoolId: string;
}) {
  

  return await sql`
    SELECT id, name FROM "Student"
    WHERE "schoolId" = ${args.schoolId}
  `;
}