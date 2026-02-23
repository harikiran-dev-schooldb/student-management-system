// src/lib/resolveSchool.ts

import prisma from "@/lib/prisma";

export class SchoolNotFoundError extends Error {
  constructor(message = "School not found") {
    super(message);
    this.name = "SchoolNotFoundError";
  }
}

/**
 * Resolves a public school slug (schoolId)
 * into the internal SchoolInfo.id (cuid).
 *
 * Throws SchoolNotFoundError if not found.
 */
export async function resolveSchoolId(slug: string): Promise<string> {
  if (!slug) {
    throw new SchoolNotFoundError("School slug is required");
  }

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true, schoolId: true },
  });

  if (!school) {
    throw new SchoolNotFoundError();
  }

  return school.id;
}
