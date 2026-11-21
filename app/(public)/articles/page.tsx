import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Articles" };

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Articles</h1>

      {articles.length === 0 && (
        <p className="text-muted-foreground">Aucun article pour le moment.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`}>
            <Card className="h-full hover:bg-accent/50 transition-colors">
              <CardHeader>
                {a.category && (
                  <Badge className="w-fit mb-2">{a.category.name}</Badge>
                )}
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>{a.excerpt}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}