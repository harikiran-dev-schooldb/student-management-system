import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/* --------------------------------------------------
   PostgreSQL Adapter (Prisma 7)
-------------------------------------------------- */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

/* --------------------------------------------------
   Base Prisma Client
-------------------------------------------------- */

const createBasePrismaClient = () =>
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "production"
        ? [
            { level: "query", emit: "event" }, // required for $on("query")
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : [{ level: "error", emit: "stdout" }], // dev: no query spam
  });

/* --------------------------------------------------
   Global typings (Next.js safe)
-------------------------------------------------- */

declare global {
  var prismaBase:
    | ReturnType<typeof createBasePrismaClient>
    | undefined;

  var prisma:
    | ReturnType<typeof createExtendedPrisma>
    | undefined;
}

/* --------------------------------------------------
   Prisma Extensions
-------------------------------------------------- */

const createExtendedPrisma = (base: PrismaClient) =>
  base.$extends({
    query: {
      class: {
        async create({ args, query }) {
          const data = args.data as {
            gradeId?: number;
            section?: string;
            name?: string;
          };

          if (data.gradeId && data.section) {
            const grade = await base.grade.findUnique({
              where: { id: data.gradeId },
              select: { level: true },
            });

            if (grade?.level) {
              const className = `${grade.level} - ${data.section}`;
              data.name = className;

              const exists = await base.class.findFirst({
                where: {
                  gradeId: data.gradeId,
                  section: data.section,
                },
              });

              if (exists) {
                throw new Error(
                  `Duplicate class "${className}" already exists.`
                );
              }
            }
          }

          return query(args);
        },

        async update({ args, query }) {
          const data = args.data as {
            gradeId?: number;
            section?: string;
            name?: string;
          };

          let { gradeId, section } = data;

          if (!gradeId || !section) {
            const current = await base.class.findUnique({
              where: args.where as any,
              select: { gradeId: true, section: true },
            });

            gradeId ??= current?.gradeId;
            section ??= current?.section;
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

              data.name = newName;
            }
          }

          return query(args);
        },
      },
    },
  });

/* --------------------------------------------------
   Singleton base client
-------------------------------------------------- */

const base =
  globalThis.prismaBase ?? createBasePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaBase = base;
}

/* --------------------------------------------------
   Extended Prisma client
-------------------------------------------------- */

const prisma =
  globalThis.prisma ?? createExtendedPrisma(base);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/* --------------------------------------------------
   Slow Query Logger (production only)
-------------------------------------------------- */

if (process.env.NODE_ENV === "production") {
  base.$on("query", (e: Prisma.QueryEvent) => {
    if (e.duration > 300) {
      console.warn(
        `⚠️ Slow Query (${e.duration}ms)\n${e.query}`
      );
    }
  });
}

export default prisma;
