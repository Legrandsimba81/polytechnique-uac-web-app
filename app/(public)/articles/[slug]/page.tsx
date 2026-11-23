import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { LikeButton } from "./like-button";
import { ShareMenu } from "@/components/shared/share-menu";
import { CommentSection } from "./comment-section";
import { Pencil } from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  if (!article) {
    return {
      title: "Article introuvable",
      robots: { index: false, follow: false },
    };
  }

  const articleUrl = `${BASE_URL}/articles/${article.slug}`;
  const cover = article.coverImage
    ? article.coverImage.startsWith("http")
      ? article.coverImage
      : `${BASE_URL}${article.coverImage}`
    : `${BASE_URL}/og-default.jpg`;
  const authorName = article.author.name ?? article.author.email ?? "Comité";

  // Ne pas indexer les brouillons
  const isPublished = article.status === "PUBLISHED";

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: {
      canonical: articleUrl,
    },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    authors: [{ name: authorName }],
    keywords: article.category?.name
      ? [article.category.name, "Polytechnique", "Comité des Étudiants"]
      : undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt ?? undefined,
      url: articleUrl,
      siteName: "Comité des Étudiants — Polytechnique",
      locale: "fr_FR",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [authorName],
      section: article.category?.name,
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: [cover],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { name: true, email: true, image: true } },
      secondaryImages: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
    },
  });

  if (!article) notFound();
  if (article.status !== "PUBLISHED" && !isAdmin) notFound();

  const liked = userId ? (article as any).likes?.length > 0 : false;
  const likeCount = article._count.likes;

  const recent = await prisma.article.findMany({
    where: { status: "PUBLISHED", id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { category: true },
  });

  const authorName = article.author.name ?? article.author.email ?? "Auteur";
  const articleUrl = `${BASE_URL}/articles/${article.slug}`;

  const coverSrc = article.coverImage ?? null;
  const isRemoteCover =
    coverSrc?.startsWith("http") ?? false;

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt ?? ""}
        url={articleUrl}
        imageUrl={coverSrc ?? undefined}
        datePublished={article.publishedAt?.toISOString()}
        dateModified={article.updatedAt.toISOString()}
        authorName={authorName}
        section={article.category?.name}
      />

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="space-y-6 min-w-0">
            {article.status !== "PUBLISHED" && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm">
                ⚠️ Cet article n'est pas publié ({article.status}) — visible
                uniquement par les admins.
              </div>
            )}

            {coverSrc && (
              <div className="relative w-full overflow-hidden rounded-xl">
                {isRemoteCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverSrc}
                    alt={article.title}
                    className="w-full max-h-[500px] object-cover"
                  />
                ) : (
                  <Image
                    src={coverSrc}
                    alt={article.title}
                    width={1200}
                    height={630}
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="w-full max-h-[500px] object-cover"
                  />
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {article.category && (
                  <Badge variant="secondary">{article.category.name}</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {article.publishedAt?.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {isAdmin && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                  >
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Modifier
                    </Link>
                  </Button>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg text-muted-foreground">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2 border-t">
                <Avatar
                  name={authorName}
                  src={article.author.image}
                  size={40}
                />
                <div>
                  <p className="text-sm font-medium">{authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {article.publishedAt
                      ? `Publié le ${article.publishedAt.toLocaleDateString(
                          "fr-FR"
                        )}`
                      : "Brouillon"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.secondaryImages.length > 0 && (
              <section className="space-y-3 pt-6 border-t">
                <h2 className="text-lg font-semibold">Galerie</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {article.secondaryImages.map((img) => {
                    const remote = img.url.startsWith("http");
                    return (
                      <figure key={img.id} className="space-y-1">
                        <div className="relative h-48 w-full overflow-hidden rounded-lg">
                          {remote ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img.url}
                              alt={img.caption ?? ""}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Image
                              src={img.url}
                              alt={img.caption ?? ""}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                            />
                          )}
                        </div>
                        {img.caption && (
                          <figcaption className="text-xs text-muted-foreground">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="flex items-center gap-3 pt-4 border-t">
              <LikeButton
                articleId={article.id}
                slug={article.slug}
                initialLiked={liked}
                initialCount={likeCount}
                isAuthenticated={!!userId}
              />
              <ShareMenu url={articleUrl} title={article.title} />
            </div>

            <CommentSection articleId={article.id} slug={article.slug} />
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <h2 className="font-semibold text-lg">Articles récents</h2>
            <div className="space-y-3">
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun article.</p>
              )}
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="block rounded-lg border bg-card p-3 hover:bg-accent transition"
                >
                  <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.category?.name ??
                      r.publishedAt?.toLocaleDateString("fr-FR") ??
                      ""}
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}