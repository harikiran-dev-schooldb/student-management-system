import { redirect } from "next/navigation";

export async function requireAdmin() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    redirect("/unauthorized");
  }

  const profile = await res.json();

  const isAdmin = profile.roles?.some(
    (r: { role: string }) => r.role === "admin"
  );

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return profile;
}
