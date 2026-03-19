import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { phone, otp, schoolId } = await req.json();

    /* ================================
       1️⃣ Validate input
    ================================ */
    if (!phone || !otp || !schoolId) {
      return Response.json(
        { error: "Phone, OTP and schoolId are required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    /* ================================
       2️⃣ Normalize phone
    ================================ */
    const normalizedPhone = phone
      .replace(/\D/g, "")
      .replace(/^91/, "");

    /* ================================
       3️⃣ Verify OTP
    ================================ */
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    /* ================================
       4️⃣ Validate school
    ================================ */
    const school = await prisma.schoolInfo.findUnique({
      where: { schoolId },
      select: { id: true },
    });

    if (!school) {
      return Response.json(
        { error: "Invalid school" },
        { status: 400 }
      );
    }

    /* ================================
       5️⃣ Fetch profile + role
    ================================ */
    const profile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
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

    /* ================================
       6️⃣ Ensure Clerk user (safe)
    ================================ */
    let clerkId = profile.clerk_id;

    if (!clerkId) {
      const existing = await client.users.getUserList({
        externalId: [normalizedPhone],
      });

      if (existing.data.length > 0) {
        clerkId = existing.data[0].id;
      } else {
        const user = await client.users.createUser({
          externalId: normalizedPhone,
        });
        clerkId = user.id;
      }

      await prisma.profile.update({
        where: { id: profile.id },
        data: { clerk_id: clerkId },
      });
    }

    /* ================================
       7️⃣ Merge metadata safely
    ================================ */
    const existingUser = await client.users.getUser(clerkId);

    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        ...existingUser.publicMetadata,
        schoolId,
        role: profile.users[0].role,
      },
    });

    /* ================================
       8️⃣ Create short-lived sign-in token
    ================================ */
    const { token } = await client.signInTokens.createSignInToken({
      userId: clerkId,
      expiresInSeconds: 60, // 🔥 important (avoid reuse conflicts)
    });

    /* ================================
       9️⃣ Cleanup OTP (one-time use)
    ================================ */
    await prisma.otp.delete({ where: { id: otpRecord.id }, });

    /* ================================
       🔟 Response
    ================================ */
    return Response.json({
      success: true,
      token,
    });

  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error);

    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}