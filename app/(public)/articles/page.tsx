import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare } from "lucide-react";

export const metadata = { title: "Articles" };

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      category: true,
      author: { select: { name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Articles</h1>

      {articles.length === 0 && (
        <p className="text-muted-foreground">Aucun article publié.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition"
          >
            {a.coverImage && (
              <img
                src={a.coverImage}
                alt={a.title}
                className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="p-4 space-y-2">
              {a.category && (
                <Badge variant="secondary" className="text-xs">
                  {a.category.name}
                </Badge>
              )}
              <h2 className="font-semibold text-lg line-clamp-2">{a.title}</h2>
              {a.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {a.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span>{a.author?.name ?? "—"}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {a._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {a._count.comments}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}