import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/admin/articles/new">Nouvel article</Link>
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        {articles.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Aucun article.</p>
        )}
        {articles.map((a) => (
          <div
            key={a.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">
                {a.author?.name ?? "—"} ·{" "}
                {a.updatedAt.toLocaleDateString("fr-FR")}
              </p>
            </div>
            <Badge
              variant={a.status === "PUBLISHED" ? "default" : "secondary"}
            >
              {a.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}