// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(() => {
  // Auth only — no role logic here
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|unauthorized|sign-in|sign-up).*)",
    "/api/(.*)",
  ],
};
