import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId } = await params;
  const { phone, otp } = await req.json();

  const clerk = await clerkClient();

  const record = await prisma.otp.findFirst({
    where: {
      phone,
      otp,
      expiresAt: { gt: new Date() }
    }
  });

  if (!record) {
    return Response.json({ error: "Invalid OTP" }, { status: 401 });
  }

  // Find or create Clerk user
  const users = await clerk.users.getUserList({
    externalId: [phone],
  });

  let user;

  if (users.data.length === 0) {
    user = await clerk.users.createUser({
      externalId: phone,
    });
  } else {
    user = users.data[0];
  }

  // Create sign-in token
  const token = await clerk.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 60 * 5,
  });

  return Response.json({
    token: token.token,
  });
}