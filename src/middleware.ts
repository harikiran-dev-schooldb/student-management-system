import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  /**
   * ---------------------------------------
   * 1️⃣ Handle Tenant APIs
   * /api/v1/tenants/{schoolId}/*
   * ---------------------------------------
   */
  if (
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "tenants"
  ) {
    const { userId } = await auth();
    console.log("Authenticated userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 🔐 enforce authentication

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
   * ---------------------------------------
   * 2️⃣ Public APIs
   * /api/v1/public/*
   * ---------------------------------------
   */
  if (
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "public"
  ) {
    return NextResponse.next();
  }

  /**
   * ---------------------------------------
   * 3️⃣ Frontend Pages (if still using slug routes)
   * ---------------------------------------
   */

  const schoolSlug = segments[0];

  if (!schoolSlug || schoolSlug === "api") {
    return NextResponse.next();
  }

  const schoolExists = await prisma.schoolInfo.findUnique({
    where: { schoolId: schoolSlug },
    select: { id: true },
  });

  if (!schoolExists) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-school-id", schoolSlug);

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
