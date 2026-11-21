import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { NavBar } from "@/components/layout/nav-bar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "SUPER_ADMIN", "FINANCE"].includes(role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:grid md:grid-cols-[240px_1fr]">
        <AdminSidebar role={role} />
        <main className="min-w-0 flex-1 bg-background p-6 md:p-10">
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  );
}