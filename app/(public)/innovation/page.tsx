import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/project/project-card";
import { InnovationFilters } from "./filters";
import type { ProjectDepartment } from "@/lib/innovations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Innovation" };

export default async function InnovationPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    dept?: string;
    type?: string;
    sort?: string;
  }>;
}) {
  const { q, dept, type, sort } = await searchParams;

  const where: any = { status: "PUBLISHED" };

  if (dept && dept !== "ALL") where.department = dept as ProjectDepartment;
  if (type && type !== "ALL") where.projectType = type;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? { likes: { _count: "desc" as const } }
      : { publishedAt: "desc" as const };

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="container py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Innovation</h1>
          <p className="text-muted-foreground mt-1">
            Découvrez les projets des étudiants de la Faculté de Polytechnique
          </p>
        </div>
        {/* Bouton visible pour TOUS — la page cible redirige vers /login si non connecté */}
        <Button asChild>
          <Link href="/mon-espace/projets/new">
            <Plus className="h-4 w-4 mr-1" />
            Publier un projet
          </Link>
        </Button>
      </div>

      <InnovationFilters
        initialQ={q ?? ""}
        initialDept={dept ?? "ALL"}
        initialType={type ?? "ALL"}
        initialSort={sort ?? "recent"}
      />

      {projects.length === 0 && (
        <div className="rounded-xl border p-12 text-center space-y-2">
          <p className="text-lg font-medium">Aucun projet trouvé</p>
          <p className="text-sm text-muted-foreground">
            Essayez un autre département ou modifiez votre recherche.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={{
              slug: p.slug,
              title: p.title,
              excerpt: p.excerpt,
              coverImage: p.coverImage,
              department: p.department,
              projectType: p.projectType,
              authorName: p.author.name ?? "Étudiant",
              _count: p._count,
              viewCount: p.viewCount,
            }}
          />
        ))}
      </div>
    </div>
  );
}