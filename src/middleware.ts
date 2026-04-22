import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const PUBLIC_ROUTES = [
  "/",
  "/select-school",
  "/features",
  "/demo",
  "/platform",
  "/pricing",
  "/unauthorized",
  "/privacy-policy",

];

const PUBLIC_TENANT_ROUTES = [
  ["payment", "success"],
  ["payment", "failed"],
];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip static & next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  /**
   * 1️⃣ Public marketing routes
   */
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  /**
 * 🟢 Payment success should be public (no auth)
 */
if (
  segments.length >= 3 &&
  PUBLIC_TENANT_ROUTES.some(
    ([a, b]) => segments[1] === a && segments[2] === b
  )
) {
  return NextResponse.next();
}

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    (segments.length >= 2 &&
      (segments[1] === "login" || segments[1] === "auth"))
  ) {
    return NextResponse.next();
  }

  /**
   * 2️⃣ Public APIs
   */
  if (
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "public"
  ) {
    return NextResponse.next();
  }

  /**
   * 3️⃣ Tenant APIs
   * /api/v1/tenants/{schoolId}/*
   */
  if (
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "tenants"
  ) {

    if (segments[4] === "jobs") {
      return NextResponse.next();
    }

    // 🔧 DEV LOAD TEST BYPASS
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = segments[3];

    if (!schoolId) {
      return NextResponse.json({ error: "Tenant missing" }, { status: 400 });
    }

    const schoolExists = await prisma.schoolInfo.findUnique({
      where: { schoolId },
      select: { id: true },
    });

    if (!schoolExists) {
      return NextResponse.json({ error: "Invalid tenant" }, { status: 404 });
    }

    return NextResponse.next();
  }

  /**
 * 4️⃣ Tenant Frontend Routes
 * /{schoolId}/...
 */

  // Must have at least 1 segment
  if (segments.length === 0) {
    return NextResponse.next();
  }

  const schoolSlug = segments[0];

  // Prevent system routes from being treated as tenant
  const SYSTEM_ROUTES = ["login", "auth", "features", "demo", "platform", "pricing", "unauthorized"];

  if (SYSTEM_ROUTES.includes(schoolSlug)) {
    return NextResponse.next();
  }

  // Validate tenant
  const schoolExists = await prisma.schoolInfo.findUnique({
    where: { schoolId: schoolSlug },
    select: { id: true },
  });

  if (!schoolExists) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL(`/${schoolSlug}/login`, req.url)
    );
  }

  const response = NextResponse.next();
  response.headers.set("x-school-id", schoolSlug);

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
