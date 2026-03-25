import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveSchoolId } from "@/lib/resolveSchool";
import { google } from "google-auth-library";

const PROJECT_ID = "school-db-s2024";

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "config/firebase-service-account.json",
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const resolvedSchoolId = await resolveSchoolId(schoolId);

    const { title, body } = await req.json();

    const tokens = await prisma.deviceToken.findMany({
      where: { schoolId: resolvedSchoolId },
      select: { token: true },
    });

    const accessToken = await getAccessToken();

    const responses = await Promise.all(
      tokens.map(({ token }) =>
        fetch(
          `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token,
                notification: {
                  title,
                  body,
                },
              },
            }),
          }
        )
      )
    );

    return NextResponse.json({
      success: true,
      sent: responses.length,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}