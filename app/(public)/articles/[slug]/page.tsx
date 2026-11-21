import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  return { title: article?.title ?? "Article" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true, author: true },
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  return (
    <article className="container py-12 max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <div className="text-sm text-muted-foreground">
        {article.publishedAt?.toLocaleDateString("fr-FR")}
        {article.author?.name && ` · ${article.author.name}`}
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {article.content}
      </div>
    </article>
  );
}