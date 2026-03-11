import { processIdentityJobs } from "@/lib/services/identity.worker";
import { NextResponse } from "next/server";

export async function POST() {

    await processIdentityJobs();

    return NextResponse.json({
        message: "Identity jobs processed"
    });

}