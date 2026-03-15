import prisma from "@/lib/prisma";
import { randomInt } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  const { phone } = await req.json();
  const { schoolId: slug } = await params;

  const normalizedPhone = phone.replace("+91", "");

  console.log("Incoming phone:", phone);
  console.log("Normalized phone:", normalizedPhone);

  /* --------------------------------
     1️⃣ Find school
  -------------------------------- */

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
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
     4️⃣ Send SMS via MSG91
  -------------------------------- */

  const smsRes = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: process.env.MSG91_KEY!,
    },
    body: JSON.stringify({
      mobile: `91${normalizedPhone}`,
      template_id: process.env.MSG91_TEMPLATE_ID,
      otp,
    }),
  });

  const smsData = await smsRes.json();

  console.log("MSG91:", smsData);

  return Response.json({ success: true });
}