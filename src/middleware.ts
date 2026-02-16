import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ✅ Skip Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  // ✅ Skip API routes from school validation
  if (segments[0] === "api") {
    return NextResponse.next();
  }

  const schoolSlug = segments[0];

  if (!schoolSlug) {
    return NextResponse.next();
  }

  const schoolExists = await prisma.schoolInfo.findUnique({
    where: { schoolId: schoolSlug },
    select: { id: true },
  });

  if (!schoolExists) {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  const response = NextResponse.next();

  // ✅ Inject schoolId for frontend pages only
  response.headers.set("x-school-id", schoolSlug);

  return response;
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
