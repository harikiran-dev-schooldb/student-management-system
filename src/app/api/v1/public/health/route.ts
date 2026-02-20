import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const startTime = Date.now();

export async function GET() {
  try {
    /* ---------- DB Check ---------- */
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "School DB API",
      environment: process.env.NODE_ENV,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

/* -------- HEAD for Uptime Monitors -------- */
export function HEAD() {
  return new Response(null, { status: 200 });
}
