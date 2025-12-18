// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "alive",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
}
