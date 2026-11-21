import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") redirect("/admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <p className="text-sm text-muted-foreground">Module à venir.</p>
    </div>
  );
}