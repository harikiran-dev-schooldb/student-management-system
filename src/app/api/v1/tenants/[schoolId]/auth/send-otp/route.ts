import { tenantPrisma } from "@/lib/tenant-prisma";
import prisma from "@/lib/prisma";
import { randomInt } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  const { phone } = await req.json();
  const { schoolId: slug } = await params;

  const school = await prisma.schoolInfo.findUnique({
    where: { schoolId: slug },
    select: { id: true }
  });

  if (!school) {
    return Response.json({ error: "Invalid school" }, { status: 400 });
  }
  

  const otp = randomInt(100000, 999999).toString();

  await prisma.otp.create({
    data: {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  });

  console.log("OTP:", otp);

  const smsRes = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: process.env.MSG91_KEY!,
    },
    body: JSON.stringify({
      mobile: phone,
      template_id: process.env.MSG91_TEMPLATE_ID,
      otp,
    }),
  });

  const smsData = await smsRes.json();

  console.log("MSG91 Response:", smsData);

  return Response.json({ success: true });
}