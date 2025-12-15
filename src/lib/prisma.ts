import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// --------------------------------------------------
// PostgreSQL Adapter (REQUIRED in Prisma 7)
// --------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// --------------------------------------------------
// Base Prisma Client (used inside extensions)
// --------------------------------------------------
const basePrismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "warn" },
    ],
  });
};

declare global {
  // Base client (real PrismaClient)
  var prismaBaseGlobal:
    | ReturnType<typeof basePrismaClientSingleton>
    | undefined;

  // Extended client (Prisma 7 dynamic type)
  var prismaGlobal:
    | ReturnType<typeof createExtendedPrisma>
    | undefined;
}

const createExtendedPrisma = (base: PrismaClient) =>
  base.$extends({
    query: {
      class: {
        async create({ args, query }) {
          const d = args.data as {
            gradeId?: number;
            section?: string;
            name?: string;
          };

          if (d.gradeId && d.section) {
            const grade = await base.grade.findUnique({
              where: { id: d.gradeId },
              select: { level: true },
            });

            if (grade?.level) {
              d.name = `${grade.level} - ${d.section}`;

              const existing = await base.class.findFirst({
                where: { gradeId: d.gradeId, section: d.section },
              });

              if (existing) {
                throw new Error(`Duplicate class "${d.name}" already exists.`);
              }
            }
          }

          return query(args);
        },

        async update({ args, query }) {
          const d = args.data as {
            gradeId?: number;
            section?: string;
            name?: string;
          };

          let { gradeId, section } = d;

          if (!gradeId || !section) {
            const existing = await base.class.findUnique({
              where: args.where as any,
              select: { gradeId: true, section: true },
            });

            gradeId ??= existing?.gradeId;
            section ??= existing?.section;
          }

          if (gradeId && section) {
            const grade = await base.grade.findUnique({
              where: { id: gradeId },
              select: { level: true },
            });

            if (grade?.level) {
              const newName = `${grade.level} - ${section}`;

              const duplicate = await base.class.findFirst({
                where: {
                  gradeId,
                  section,
                  NOT: args.where,
                },
              });

              if (duplicate) {
                throw new Error(
                  `Cannot rename — class "${newName}" already exists.`
                );
              }

              d.name = newName;
            }
          }

          return query(args);
        },
      },
    },
  });



// --------------------------------------------------
// Reuse base client in dev
// --------------------------------------------------
const base =
  globalThis.prismaBaseGlobal ?? basePrismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaBaseGlobal = base;
}

// --------------------------------------------------
// Prisma Client with Extensions
// --------------------------------------------------
const prisma =
  globalThis.prismaGlobal ??
  createExtendedPrisma(base);

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

// --------------------------------------------------
// Slow Query Logger
// --------------------------------------------------
base.$on("query", (e) => {
  if (e.duration > 100) {
    console.warn(`⚠️ Slow Query (${e.duration}ms): ${e.query}`);
  }
});

export default prisma;
