import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DEPARTMENT_LABEL } from "@/lib/innovations";

export default async function MyProjectsPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } },
  });

  return (
    <div className="container py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <Button asChild>
          <Link href="/mon-espace/projets/new">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border p-12 text-center space-y-3">
          <p className="text-lg font-medium">Aucun projet publié</p>
          <p className="text-sm text-muted-foreground">
            Publiez votre premier projet pour le partager avec la communauté.
          </p>
          <Button asChild>
            <Link href="/mon-espace/projets/new">Créer mon premier projet</Link>
          </Button>
        </div>
      )}

      <div className="rounded-lg border divide-y">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/innovation/${p.slug}`}
                className="font-medium hover:text-primary truncate block"
              >
                {p.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {DEPARTMENT_LABEL[p.department]} · {p._count.likes} likes ·{" "}
                {p._count.comments} commentaires
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={p.status === "PUBLISHED" ? "default" : "secondary"}
              >
                {p.status === "PUBLISHED"
                  ? "Publié"
                  : p.status === "ARCHIVED"
                  ? "Archivé"
                  : "Brouillon"}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/mon-espace/projets/${p.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Modifier
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}