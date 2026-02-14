import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // Required for Prisma

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const schoolId = segments[0];

  if (!schoolId) {
    return NextResponse.next();
  }

  const schoolExists = await prisma.schoolInfo.findUnique({
    where: { schoolId },
    select: { id: true },
  });

  if (!schoolExists) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
