import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UsersList } from "./users-list";
import { NewUserForm } from "./new-user-form";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const selfId = (session?.user as any)?.id;

  if (role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role as "USER" | "FINANCE" | "ADMIN" | "SUPER_ADMIN",
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <NewUserForm />
      </div>

      <UsersList users={rows} selfId={selfId} />
    </div>
  );
}