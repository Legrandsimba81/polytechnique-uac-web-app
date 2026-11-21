import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AppRole = "USER" | "FINANCE" | "ADMIN" | "SUPER_ADMIN";

export async function requireRole(allowed: AppRole[]) {
  const session = await auth();
  const role = (session?.user as any)?.role as AppRole | undefined;

  if (!session) redirect("/login");
  if (!role || !allowed.includes(role)) {
    if (role === "FINANCE") redirect("/admin/finance");
    redirect("/");
  }
  return { session, role };
}