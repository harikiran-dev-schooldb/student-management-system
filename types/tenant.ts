/* ==================================================
   TENANT PAGE TYPES (Next.js 15 Compatible)
================================================== */

export type TenantParams = {
  schoolId: string;
};

/**
 * For pages under /app/[schoolId]/*
 */
export type TenantPageProps = {
  params: Promise<TenantParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * For API routes under /app/[schoolId]/api/*
 */
export type TenantRouteContext = {
  params: Promise<TenantParams>;
};
