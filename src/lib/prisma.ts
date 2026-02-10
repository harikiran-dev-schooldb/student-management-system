import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/* --------------------------------------------------
   Environment
-------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* --------------------------------------------------
   PostgreSQL Pool (Neon / Local)
-------------------------------------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(pool);

/* --------------------------------------------------
   Base Prisma Client (NO EXTENSIONS)
-------------------------------------------------- */
const createBasePrismaClient = () =>
  new PrismaClient({
    adapter,
    log: isProd
      ? [{ level: "error", emit: "stdout" }]
      : [{ level: "query", emit: "event" }],
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
              data.name = `${grade.level} - ${data.section}`;
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

          if (data.gradeId || data.section) {
            const current = await base.class.findUnique({
              where: args.where as any,
              select: { gradeId: true, section: true },
            });

            const gradeId = data.gradeId ?? current?.gradeId;
            const section = data.section ?? current?.section;

            if (gradeId && section) {
              const grade = await base.grade.findUnique({
                where: { id: gradeId },
                select: { level: true },
              });

              if (grade?.level) {
                data.name = `${grade.level} - ${section}`;
              }
            }
          }

          return query(args);
        },
      },
    },
  });

type ExtendedPrisma = ReturnType<typeof extendPrisma>;

/* --------------------------------------------------
   Global Singleton (Type-Safe)
-------------------------------------------------- */
declare global {
  // eslint-disable-next-line no-var
  var prismaBase: BasePrisma | undefined;

  // eslint-disable-next-line no-var
  var prisma: ExtendedPrisma | undefined;
}

/* --------------------------------------------------
   Instantiate
-------------------------------------------------- */
const base = globalThis.prismaBase ?? createBasePrismaClient();

if (!isProd) {
  globalThis.prismaBase = base;
}

const prisma = globalThis.prisma ?? extendPrisma(base);

if (!isProd) {
  globalThis.prisma = prisma;
}

/* --------------------------------------------------
   Optional Slow Query Logging (ENV-CONTROLLED)
-------------------------------------------------- */
if (process.env.LOG_SLOW_QUERIES === "true") {
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
