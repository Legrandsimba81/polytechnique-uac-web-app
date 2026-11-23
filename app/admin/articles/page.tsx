import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus } from "lucide-react";

export default async function AdminArticlesPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-1" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        {articles.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Aucun article.</p>
        )}
        {articles.map((a) => (
          <div
            key={a.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                {a.author?.name ?? "—"} ·{" "}
                {a.updatedAt.toLocaleDateString("fr-FR")}
                {a.category && ` · ${a.category.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  a.status === "PUBLISHED"
                    ? "default"
                    : a.status === "DRAFT"
                    ? "secondary"
                    : "outline"
                }
              >
                {a.status === "PUBLISHED"
                  ? "Publié"
                  : a.status === "DRAFT"
                  ? "Brouillon"
                  : "Archivé"}
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/articles/${a.id}/edit`}>
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