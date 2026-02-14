import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { profileId } = await req.json();

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "activeProfileId",
    value: profileId,
    path: "/",
    httpOnly: true,
  });

  return response;
}
