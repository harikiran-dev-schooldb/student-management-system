import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { schoolId: slug } = await params;
  const { phone, otp } = await req.json();
  const normalizedPhone = phone.replace("+91", "");


  const clerk = await clerkClient();

  /* --------------------------------
     1️⃣ Verify OTP
  -------------------------------- */

  const record = await prisma.otp.findFirst({
    where: {
      phone: normalizedPhone,
      otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return Response.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  /* --------------------------------
     2️⃣ Get school
  -------------------------------- */

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true },
  });

  if (!school) {
    return Response.json({ error: "Invalid school" }, { status: 400 });
  }

  /* --------------------------------
     3️⃣ Find profile
  -------------------------------- */

  const profile = await prisma.profile.findFirst({
    where: { phone: normalizedPhone, },
    include: {
      users: {
        where: { schoolId: school.id },
      },
    },
  });

  if (!profile || profile.users.length === 0) {
    return Response.json(
      { error: "User not registered for this school" },
      { status: 404 }
    );
  }

  console.log("Creating / finding Clerk user for:", phone);

  /* --------------------------------
     4️⃣ Ensure Clerk user
  -------------------------------- */

  let clerkId = profile.clerk_id;

  if (!clerkId) {
    const newUser = await clerk.users.createUser({
      externalId: normalizedPhone,
    });

    clerkId = newUser.id;

    await prisma.profile.update({
      where: { id: profile.id },
      data: { clerk_id: clerkId },
    });
  }

  console.log("Clerk user:", profile.id, "->", clerkId);

  /* --------------------------------
     5️⃣ Create sign-in token
  -------------------------------- */

  const token = await clerk.signInTokens.createSignInToken({
    userId: clerkId,
    expiresInSeconds: 60 * 5,
  });

  /* --------------------------------
     6️⃣ Cleanup OTP
  -------------------------------- */

  await prisma.otp.deleteMany({
    where: { phone: phone },
  });

  return Response.json({
    token: token.token,
  });
}