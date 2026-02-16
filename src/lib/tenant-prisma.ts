import prisma from "@/lib/prisma";

/**
 * Models that should NOT be tenant scoped
 */
const EXCLUDED_MODELS = new Set(["SchoolInfo", "Profile"]);

function isPrismaModel(value: any) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.findMany === "function" &&
    typeof value.create === "function"
  );
}

export function tenantPrisma(schoolId: string) {
  if (!schoolId) {
    throw new Error("tenantPrisma requires schoolId");
  }

  return new Proxy(prisma, {
    get(target, key: string) {
      const original = (target as any)[key];

      // Skip prisma internals
      if (key.startsWith("$")) {
        return original;
      }

      // Only wrap real Prisma model delegates
      if (!isPrismaModel(original)) {
        return original;
      }

      if (EXCLUDED_MODELS.has(key)) {
        return original;
      }

      return new Proxy(original, {
        get(modelTarget, operation: string) {
          const originalOperation = (modelTarget as any)[operation];

          if (typeof originalOperation !== "function") {
            return originalOperation;
          }

          return (args: any = {}) => {
            switch (operation) {
              case "create":
                return originalOperation({
                  ...args,
                  data: {
                    ...args?.data,
                    schoolId,
                  },
                });

              case "createMany":
                return originalOperation({
                  ...args,
                  data: (args?.data || []).map((item: any) => ({
                    ...item,
                    schoolId,
                  })),
                });

              case "findMany":
              case "findFirst":
              case "count":
              case "update":
              case "updateMany":
              case "delete":
              case "deleteMany":
                return originalOperation({
                  ...args,
                  where: {
                    AND: [
                      args?.where || {},
                      { schoolId },
                    ],
                  },
                });

              default:
                return originalOperation(args);
            }
          };
        },
      });
    },
  });
}

