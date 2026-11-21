import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const last = await prisma.article.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="container py-12 space-y-16">
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Bienvenue au Comité des Étudiants
        </h1>
        <p className="text-muted-foreground text-lg">
          La voix des étudiants de la Faculté de Polytechnique – Sciences et
          Technologies.
        </p>
      </section>

      {last && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Dernier article</h2>
            <Button asChild variant="link">
              <Link href="/articles">Voir tous les articles</Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              {last.category && (
                <Badge className="w-fit mb-2">{last.category.name}</Badge>
              )}
              <CardTitle className="text-2xl">{last.title}</CardTitle>
              <CardDescription>{last.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/articles/${last.slug}`}>Lire la suite</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}