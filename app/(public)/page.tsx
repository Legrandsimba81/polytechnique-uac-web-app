import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  FileText,
  Lightbulb,
  FolderGit2,
  Heart,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Bienvenue en Science et Technologies | Polytechnique",
  description:
    "Plateforme du Comité des Étudiants de Polytechnique : articles scientifiques, projets d'innovation et vie académique.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    publishedArticlesCount,
    publishedProjectsCount,
    membersCount,
    latestArticle,
    latestProject,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.committeeMember.count(),
    prisma.article.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
        author: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.project.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
  ]);

  const metrics = [
    {
      label: "Articles publiés",
      value: publishedArticlesCount,
      icon: FileText,
    },
    {
      label: "Projets d'innovation",
      value: publishedProjectsCount,
      icon: FolderGit2,
    },
    {
      label: "Membres du comité",
      value: membersCount,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Section de présentation avec dégradé Light & Dark mode accordé au design system */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-accent/30 to-accent/70 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#182208]">
        {/* Halos radiaux d'ambiance (Light & Dark) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-accent blur-3xl dark:bg-primary/15"
        />

        {/* Grille technique subtile */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.55)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.55)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_20%,#000_65%,transparent_100%)]"
        />

        <div className="container relative py-14 md:py-24 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl space-y-5">

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Bienvenue en <br />
                <span className="bg-gradient-to-r from-primary via-lime-600 to-emerald-600 bg-clip-text text-transparent dark:from-primary dark:via-lime-400 dark:to-lime-300">
                  Science et Technologies
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Explorez les publications techniques, les prototypes et projets
                d&apos;ingénierie développés par la communauté étudiante, et
                participez à l&apos;innovation de la faculté.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button asChild size="lg">
                  <Link href="/innovation">
                    Explorer l&apos;innovation
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-card/80 backdrop-blur-sm"
                >
                  <Link href="/articles">Lire les articles</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-card/80 backdrop-blur-sm">
                  <Link href="/mon-espace/projets/new">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Publier un projet
                  </Link>
                </Button>
              </div>
            </div>

            {/* Encadré lien vers réalisations, projets à vendre ou d'inspiration */}
            <Link
              href="/innovation"
              className="group block w-full lg:max-w-sm rounded-xl border bg-card/90 p-5 shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-md bg-accent px-2.5 py-1 text-[11px] font-mono font-medium text-accent-foreground">
                    <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>VITRINE PROJETS</span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
                    Découvrez des réalisations innovantes et des projets à vendre
                    ou d&apos;inspiration
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[11px] font-mono text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Prototypes · Vente &amp; inspiration</span>
                  </div>
                </div>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:bg-accent group-hover:text-accent-foreground">
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Barre d'indicateurs clés */}
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.label}
                  className="bg-card/85 backdrop-blur-md border-border"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums">{m.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dernier article & Dernier projet */}
      <section className="container py-14 md:py-20 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-primary">
              À la une · Flux récent
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dernier article et dernier projet
            </h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Colonne 1 : Dernier article */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                01 / Dernier article
              </span>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Tous les articles
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {latestArticle ? (
              <Link
                href={`/articles/${latestArticle.slug}`}
                className="group flex flex-col h-full rounded-xl border bg-card overflow-hidden hover:shadow-lg transition"
              >
                {latestArticle.coverImage ? (
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    <img
                      src={latestArticle.coverImage}
                      alt={latestArticle.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-muted text-muted-foreground text-sm font-mono">
                    [ ARTICLE · SANS IMAGE ]
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] font-mono">
                        ARTICLE
                      </Badge>
                      {latestArticle.category && (
                        <Badge variant="secondary" className="text-xs">
                          {latestArticle.category.name}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {latestArticle.title}
                    </h3>

                    {latestArticle.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {latestArticle.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <span>{latestArticle.author?.name ?? "—"}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-medium">
                        <Heart className="h-3.5 w-3.5 text-primary" />
                        {latestArticle._count.likes}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        {latestArticle._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Aucun article publié pour le moment.
              </div>
            )}
          </div>

          {/* Colonne 2 : Dernier projet */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                02 / Dernier projet
              </span>
              <Link
                href="/innovation"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Tous les projets
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {latestProject ? (
              <Link
                href={`/innovation/${latestProject.slug}`}
                className="group flex flex-col h-full rounded-xl border bg-card overflow-hidden hover:shadow-lg transition"
              >
                {latestProject.coverImage ? (
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    <img
                      src={latestProject.coverImage}
                      alt={latestProject.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-muted text-muted-foreground text-sm font-mono">
                    [ PROJET · SANS IMAGE ]
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[11px] font-mono">
                        PROJET
                      </Badge>
                      {latestProject.department && (
                        <Badge variant="secondary" className="text-xs">
                          {latestProject.department}
                        </Badge>
                      )}
                      {latestProject.projectType && (
                        <Badge variant="secondary" className="text-xs">
                          {latestProject.projectType}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {latestProject.title}
                    </h3>

                    {latestProject.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {latestProject.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <span>{latestProject.author?.name ?? "Étudiant"}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-medium">
                        <Heart className="h-3.5 w-3.5 text-primary" />
                        {latestProject._count.likes}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        {latestProject._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Aucun projet publié pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}