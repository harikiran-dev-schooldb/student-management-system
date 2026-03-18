import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import prisma from "@/lib/prisma";
import { randomInt } from "crypto";

export async function POST(req: Request) {
  try {
    console.log("OTP API HIT");

    const { phone, schoolId } = await req.json();

    if (!phone || !schoolId) {
      return Response.json(
        { error: "Phone and schoolId are required" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.replace("+91", "");

    /* -----------------------------
       1️⃣ Find School
    ----------------------------- */

    const school = await prisma.schoolInfo.findFirst({
      where: { schoolId },
      select: { id: true },
    });

    if (!school) {
      return Response.json({ error: "Invalid school" }, { status: 400 });
    }

    /* -----------------------------
       2️⃣ Check User Profile
    ----------------------------- */

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

    /* -----------------------------
       3️⃣ Generate OTP
    ----------------------------- */

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

    if (process.env.NODE_ENV === "development") {
      console.log("Generated OTP:", otp);
    }

    /* -----------------------------
       4️⃣ Send WhatsApp OTP
    ----------------------------- */

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const waResponse = await fetch(
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
          type: "template",
          template: {
            name: "otp_login",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: otp,
                  },
                ],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                  {
                    type: "text",
                    text: otp,
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    clearTimeout(timeout);

    const waData = await waResponse.json();

    console.log("WhatsApp status:", waResponse.status);

    if (!waResponse.ok) {
      console.error("WhatsApp API error:", waData);
      return Response.json(
        { error: "Failed to send OTP via WhatsApp" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "OTP sent via WhatsApp",
      messageId: waData?.messages?.[0]?.id || null,
    });

  } catch (error) {
    console.error("Server error:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}