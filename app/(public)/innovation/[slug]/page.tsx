import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MetadataDisplay } from "@/components/project/metadata-display";
import { SitePreview } from "@/components/project/site-preview";
import {
  DEPARTMENT_LABEL,
  DEPARTMENT_COLOR,
  PROJECT_TYPE_LABEL,
} from "@/lib/innovations";
import { Pencil, Github, ExternalLink, Play } from "lucide-react";
import { ProjectLikeButton } from "./like-button";
import { ProjectCommentSection } from "./comment-section";
import { ShareMenu } from "@/components/shared/share-menu";
import { cn } from "@/lib/utils";
import { DeleteOwnProjectButton } from "./delete-button";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) return { title: "Projet introuvable" };
  const url = `${BASE_URL}/innovation/${p.slug}`;
  return {
    title: p.title,
    description: p.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.excerpt ?? undefined,
      url,
      images: p.coverImage
        ? [
            {
              url: p.coverImage.startsWith("http")
                ? p.coverImage
                : `${BASE_URL}${p.coverImage}`,
              width: 1200,
              height: 630,
              alt: p.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
    },
  });

  if (!project) notFound();
  if (
    project.status !== "PUBLISHED" &&
    !isAdmin &&
    project.authorId !== userId
  )
    notFound();

  prisma.project
    .update({ where: { id: project.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const liked = userId ? (project as any).likes?.length > 0 : false;
  const isAuthor = project.authorId === userId;
  const canEdit = isAuthor || isAdmin;

  const authorName =
    project.author.name ?? project.author.email ?? "Étudiant";
  const links = (project.links as any) ?? {};
  const metadata = (project.metadata as any) ?? null;

  const related = await prisma.project.findMany({
    where: {
      department: project.department,
      status: "PUBLISHED",
      id: { not: project.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const projectUrl = `${BASE_URL}/innovation/${project.slug}`;

  return (
    <div className="container py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-6 min-w-0">
          {project.status !== "PUBLISHED" && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm">
              ⚠️ Ce projet est{" "}
              {project.status === "ARCHIVED" ? "archivé" : "en brouillon"} —
              visible uniquement par l'auteur et les admins.
            </div>
          )}

          {project.coverImage && (
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full rounded-xl max-h-[500px] object-cover"
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  DEPARTMENT_COLOR[project.department]
                )}
              >
                {DEPARTMENT_LABEL[project.department]}
              </span>
              <Badge variant="secondary">
                {PROJECT_TYPE_LABEL[project.department]?.[project.projectType] ??
                  project.projectType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {project.publishedAt.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {canEdit && (
                <div className="ml-auto flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/mon-espace/projets/${project.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                    </Link>
                  </Button>
                  {isAuthor && (
                    <DeleteOwnProjectButton
                      id={project.id}
                      label={project.title}
                    />
                  )}
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {project.title}
            </h1>
            {project.excerpt && (
              <p className="text-lg text-muted-foreground">
                {project.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2 border-t">
              <Avatar name={authorName} src={project.author.image} size={40} />
              <div>
                <p className="text-sm font-medium">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  Publié le {project.publishedAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />

          <MetadataDisplay
            department={project.department}
            metadata={metadata}
          />

          {(links.github || links.website || links.demo || links.video) && (
            <div className="flex flex-wrap gap-2">
              {links.github && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-1" /> Code source
                  </a>
                </Button>
              )}
              {links.website && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" /> Site web
                  </a>
                </Button>
              )}
              {links.demo && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4 mr-1" /> Démo live
                  </a>
                </Button>
              )}
              {links.video && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={links.video}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4 mr-1" /> Vidéo
                  </a>
                </Button>
              )}
            </div>
          )}

          {(links.website || links.demo) && (
            <div className="pt-4 border-t">
              <SitePreview url={links.website ?? links.demo} />
            </div>
          )}

          {project.images.length > 0 && (
            <section className="space-y-3 pt-6 border-t">
              <h2 className="text-lg font-semibold">Galerie</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.images.map((img) => (
                  <figure key={img.id} className="space-y-1">
                    <img
                      src={img.url}
                      alt={img.caption ?? ""}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                    {img.caption && (
                      <figcaption className="text-xs text-muted-foreground">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <ProjectLikeButton
              projectId={project.id}
              slug={project.slug}
              initialLiked={liked}
              initialCount={project._count.likes}
              isAuthenticated={!!userId}
            />
            <ShareMenu url={projectUrl} title={project.title} />
          </div>

          <ProjectCommentSection projectId={project.id} slug={project.slug} />
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <h2 className="font-semibold text-lg">
            Autres projets {DEPARTMENT_LABEL[project.department]}
          </h2>
          <div className="space-y-3">
            {related.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun autre projet.
              </p>
            )}
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/innovation/${r.slug}`}
                className="block rounded-lg border bg-card p-3 hover:bg-accent transition"
              >
                <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.author.name ?? "Étudiant"}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}