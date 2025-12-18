import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Welcome to School DB API",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
}

// IMPORTANT: allow HEAD requests for uptime monitors
export function HEAD() {
  return new NextResponse(null, { status: 200 });
}
