import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { archiveProject, restoreProject, adminDeleteProject } from "./actions";
import { DEPARTMENT_LABEL, type ProjectDepartment } from "@/lib/innovations";

export default async function AdminInnovationPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Innovation — Modération</h1>
      <div className="rounded-lg border divide-y">
        {projects.length === 0 && <p className="p-4 text-sm text-muted-foreground">Aucun projet.</p>}
        {projects.map((p) => (
          <div key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/innovation/${p.slug}`} className="font-medium hover:text-primary truncate block">{p.title}</Link>
              <p className="text-xs text-muted-foreground">
                {DEPARTMENT_LABEL[p.department as ProjectDepartment]} · par {p.author.name ?? p.author.email} · {p.createdAt.toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={p.status === "PUBLISHED" ? "default" : p.status === "ARCHIVED" ? "secondary" : "outline"}>
                {p.status === "PUBLISHED" ? "Publié" : p.status === "ARCHIVED" ? "Archivé" : "Brouillon"}
              </Badge>
              {p.status === "PUBLISHED" ? (
                <form action={archiveProject.bind(null, p.id)}>
                  <Button type="submit" size="sm" variant="outline"><Archive className="h-3.5 w-3.5 mr-1" />Archiver</Button>
                </form>
              ) : (
                <form action={restoreProject.bind(null, p.id)}>
                  <Button type="submit" size="sm" variant="outline"><RotateCcw className="h-3.5 w-3.5 mr-1" />Restaurer</Button>
                </form>
              )}
              <form action={adminDeleteProject.bind(null, p.id)}>
                <Button type="submit" size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}