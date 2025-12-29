import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/* --------------------------------------------------
   PostgreSQL Pool (Neon)
-------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isProd
    ? { rejectUnauthorized: false } // Neon (Vercel)
    : false, // Local Postgres
});

const adapter = new PrismaPg(pool);

/* --------------------------------------------------
   Base Prisma Client (ONLY PrismaClient)
-------------------------------------------------- */

const createBasePrismaClient = () =>
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "production"
        ? [
            { level: "query", emit: "event" },
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : [{ level: "error", emit: "stdout" }],
  });

type BasePrisma = PrismaClient;

/* --------------------------------------------------
   Prisma Extensions
-------------------------------------------------- */

const extendPrisma = (base: BasePrisma) =>
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
              const name = `${grade.level} - ${data.section}`;
              data.name = name;

              const exists = await base.class.findFirst({
                where: {
                  gradeId: data.gradeId,
                  section: data.section,
                },
              });

              if (exists) {
                throw new Error(`Class "${name}" already exists.`);
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
              const name = `${grade.level} - ${section}`;

              const duplicate = await base.class.findFirst({
                where: {
                  gradeId,
                  section,
                  NOT: args.where,
                },
              });

              if (duplicate) {
                throw new Error(`Class "${name}" already exists.`);
              }

              data.name = name;
            }
          }

          return query(args);
        },
      },
    },
  });

type ExtendedPrisma = ReturnType<typeof extendPrisma>;

/* --------------------------------------------------
   Global singletons (TYPE SAFE)
-------------------------------------------------- */

declare global {
  // eslint-disable-next-line no-var
  var prismaBase: BasePrisma | undefined;

  // eslint-disable-next-line no-var
  var prisma: ExtendedPrisma;
}

/* --------------------------------------------------
   Instantiate
-------------------------------------------------- */

const base = globalThis.prismaBase ?? createBasePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaBase = base;
}

const prisma: ExtendedPrisma = globalThis.prisma ?? extendPrisma(base);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/* --------------------------------------------------
   Slow query logging (BASE ONLY)
-------------------------------------------------- */

if (process.env.NODE_ENV === "production") {
  (
    base.$on as unknown as (
      event: "query",
      cb: (e: Prisma.QueryEvent) => void
    ) => void
  )("query", (e) => {
    if (e.duration > 300) {
      console.warn(`⚠️ Slow Query (${e.duration}ms)\n${e.query}`);
    }
  });
}

export default prisma;
