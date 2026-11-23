import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../../project-form";
import { updateProject } from "../../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  if (project.authorId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/mon-espace/projets");

  return (
    <div className="container py-12 space-y-6">
      <h1 className="text-2xl font-bold">Modifier : {project.title}</h1>
      <ProjectForm
        action={updateProject}
        isEdit
        initial={{
          id: project.id,
          title: project.title,
          excerpt: project.excerpt,
          content: project.content,
          coverImage: project.coverImage,
          department: project.department as any,
          projectType: project.projectType,
          tags: project.tags,
          metadata: project.metadata as any,
          links: project.links as any,
          images: project.images.map((i) => ({ id: i.id, url: i.url, caption: i.caption })),
        }}
      />
    </div>
  );
}