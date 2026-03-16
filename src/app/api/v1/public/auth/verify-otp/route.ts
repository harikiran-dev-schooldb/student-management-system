import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { phone, otp, schoolId } = await req.json();

    if (!phone || !otp || !schoolId) {
      return Response.json(
        { error: "Phone, OTP and schoolId are required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    /* --------------------------------
       1️⃣ Normalize phone number
    -------------------------------- */

    const normalizedPhone = phone
      .replace(/\D/g, "")   // remove non-digits
      .replace(/^91/, "");  // remove country code

    /* --------------------------------
       2️⃣ Verify OTP
    -------------------------------- */

    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: normalizedPhone,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    /* --------------------------------
       3️⃣ Find school
    -------------------------------- */

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

    /* --------------------------------
       4️⃣ Find user profile
    -------------------------------- */

    const profile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
      include: {
        users: {
          where: {
            schoolId: school.id,
          },
        },
      },
    });

    if (!profile || profile.users.length === 0) {
      return Response.json(
        { error: "User not registered for this school" },
        { status: 404 }
      );
    }

    /* --------------------------------
       5️⃣ Ensure Clerk user exists
    -------------------------------- */

    let clerkId = profile.clerk_id;

    if (!clerkId) {
      const newUser = await client.users.createUser({
        externalId: normalizedPhone,
      });

      clerkId = newUser.id;

      await prisma.profile.update({
        where: { id: profile.id },
        data: { clerk_id: clerkId },
      });
    }

    /* --------------------------------
       6️⃣ Create Clerk sign-in token
    -------------------------------- */

    const signInToken =
      await client.signInTokens.createSignInToken({
        userId: clerkId,
        expiresInSeconds: 60 * 5,
      });

    /* --------------------------------
       7️⃣ Delete used OTP
    -------------------------------- */

    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    /* --------------------------------
       8️⃣ Return token
    -------------------------------- */

    return Response.json({
      success: true,
      token: signInToken.token,
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
