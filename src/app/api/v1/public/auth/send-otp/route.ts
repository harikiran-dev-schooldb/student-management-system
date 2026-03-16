import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import prisma from "@/lib/prisma";
import { randomInt } from "crypto";

export async function POST(req: Request) {
  console.log("API HIT");

  const { phone, schoolId } = await req.json();

  const normalizedPhone = phone.replace("+91", "");

  /* --------------------------------
     1️⃣ Find school
  -------------------------------- */

  const school = await prisma.schoolInfo.findFirst({
    where: { schoolId },
    select: { id: true },
  });

  if (!school) {
    return Response.json({ error: "Invalid school" }, { status: 400 });
  }

  /* --------------------------------
     2️⃣ Check profile exists
  -------------------------------- */

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

  /* --------------------------------
     3️⃣ Generate OTP
  -------------------------------- */

  const otp = randomInt(100000, 999999).toString();

  await prisma.otp.deleteMany({
    where: { phone: normalizedPhone },
  });

  await prisma.otp.create({
    data: {
      phone: normalizedPhone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  console.log("OTP:", otp);

  /* --------------------------------
  4️⃣ Send OTP via WhatsApp Cloud API
 -------------------------------- */

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const waRes = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${normalizedPhone}`,
          type: "text",
          text: {
            body: `SchoolDB OTP: ${otp}\nValid for 5 minutes.`,
          },
        }),
      }
    );

    clearTimeout(timeout);

    const waData = await waRes.json();

    console.log("WhatsApp status:", waRes.status);
    console.log("WhatsApp response:", waData);

    if (!waRes.ok) {
      throw new Error(JSON.stringify(waData));
    }

    return Response.json({
      success: true,
      message: "OTP sent via WhatsApp",
      messageId: waData?.messages?.[0]?.id,
    });

  } catch (error) {
    console.error("WhatsApp API error:", error);

    return Response.json(
      { error: "Failed to send OTP via WhatsApp" },
      { status: 500 }
    );
  }
}