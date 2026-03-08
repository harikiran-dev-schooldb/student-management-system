// src/lib/resolveSchool.ts

import prisma from "@/lib/prisma";

export class SchoolNotFoundError extends Error {
  constructor(message = "School not found") {
    super(message);
    this.name = "SchoolNotFoundError";
  }
}

// simple in-memory cache
const schoolCache = new Map<string, string>();

export async function resolveSchoolId(slug: string): Promise<string> {
  if (!slug) {
    throw new SchoolNotFoundError("School slug is required");
  }

  // 1️⃣ Check cache first
  const cached = schoolCache.get(slug);
  if (cached) {
    return cached;
  }

  // 2️⃣ Query database
  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    throw new SchoolNotFoundError();
  }

  // 3️⃣ Store in cache
  schoolCache.set(slug, school.id);

  return school.id;
}