// src/app/api/subjects/upload/route.ts

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type SubjectRow = {
  name: string;
  gradeIds?: number[];
};

export async function POST(req: NextRequest) {
  try {
    const { subjects } = await req.json();
    const errors: string[] = [];

    const validated = subjects
      .map((row: SubjectRow, index: number) => {
        const missing = [];
        if (!row.name) missing.push("name");

        if (missing.length) {
          errors.push(`Row ${index + 2} missing: ${missing.join(", ")}`);
          return null;
        }

        const subjectData: any = {
          name: row.name.trim(),
        };

        if (Array.isArray(row.gradeIds)) {
          subjectData.grades = {
            connect: row.gradeIds
              .map((id) => (isNaN(id) ? null : { id }))
              .filter(Boolean),
          };
        }

        return subjectData;
      })
      .filter(Boolean);

    const insertResults = {
      created: 0,
      failed: 0,
    };

    for (const data of validated) {
      try {
        await prisma.subject.create({ data });
        insertResults.created++;
      } catch (err: any) {
        if (err.code === "P2002") {
          errors.push(`Duplicate subject skipped: ${data.name}`);
        } else {
          errors.push(`Failed to create subject "${data.name}": ${err.message}`);
          insertResults.failed++;
        }
      }
    }

    return NextResponse.json({
      message: "Subject upload completed",
      ...insertResults,
      errors,
    });
  } catch (error) {
    console.error("Subject Bulk Upload Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
