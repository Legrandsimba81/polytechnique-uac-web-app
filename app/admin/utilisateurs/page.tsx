import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "SUPER_ADMIN") redirect("/admin");

  const users: User[] = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <div className="rounded-lg border divide-y">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-medium">{u.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {u.email} · {u.phone ?? "—"}
              </p>
            </div>
            <span className="text-xs rounded-full border px-2 py-0.5">
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}