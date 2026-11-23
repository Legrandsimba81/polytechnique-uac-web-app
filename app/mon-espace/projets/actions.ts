"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify, uniqueProjectSlug } from "@/lib/slug";

const STUDENT_ROLES: any = ["STUDENT", "ADMIN", "SUPER_ADMIN"];

async function requireStudent() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || !STUDENT_ROLES.includes(user.role)) {
    throw new Error("Accès refusé. Seuls les étudiants peuvent publier.");
  }
  return user;
}

async function uploadProjectImage(file: File, projectId: string, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Format d'image non supporté.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image trop volumineuse (5 Mo max).");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
  await fs.mkdir(dir, { recursive: true });
  const name = `${prefix}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/projects/${projectId}/${name}`;
}

const projectSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  department: z.enum(["GENIE_INFORMATIQUE", "ARCHITECTURE", "GENIE_CIVIL", "GENIE_ELECTRIQUE"]),
  projectType: z.string().min(1),
  tags: z.string().optional(),
  metadata: z.string().optional(), // JSON stringifié
  githubUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

function parseMetadata(raw: string | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    // nettoie les valeurs vides
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
  } catch {
    return {};
  }
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createProject(formData: FormData) {
  const user = await requireStudent();

  const parsed = projectSchema.parse({
    title: formData.get("title"),
    excerpt: (formData.get("excerpt") as string) || "",
    content: formData.get("content"),
    department: formData.get("department"),
    projectType: formData.get("projectType"),
    tags: (formData.get("tags") as string) || "",
    metadata: (formData.get("metadata") as string) || "",
    githubUrl: (formData.get("githubUrl") as string) || "",
    websiteUrl: (formData.get("websiteUrl") as string) || "",
    demoUrl: (formData.get("demoUrl") as string) || "",
    videoUrl: (formData.get("videoUrl") as string) || "",
  });

  const slug = await uniqueProjectSlug(parsed.title);

  const links = {
    github: parsed.githubUrl || null,
    website: parsed.websiteUrl || null,
    demo: parsed.demoUrl || null,
    video: parsed.videoUrl || null,
  };
  const hasLinks = Object.values(links).some((v) => v);

  const project = await prisma.project.create({
    data: {
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      department: parsed.department,
      projectType: parsed.projectType,
      tags: parseTags(parsed.tags),
      metadata: parseMetadata(parsed.metadata),
      links: hasLinks ? links : undefined,
      authorId: user.id,
      status: "PUBLISHED",
    },
  });

  // Image principale
  const cover = formData.get("coverImage") as File | null;
  if (cover && cover.size > 0) {
    const url = await uploadProjectImage(cover, project.id, "cover");
    if (url) {
      await prisma.project.update({ where: { id: project.id }, data: { coverImage: url } });
    }
  }

  // Images secondaires
  const files = formData.getAll("secondaryImages") as File[];
  let order = 0;
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const url = await uploadProjectImage(file, project.id, `img-${order}`);
    if (url) {
      await prisma.projectImage.create({
        data: { projectId: project.id, url, order },
      });
      order++;
    }
  }

  revalidatePath("/innovation");
  revalidatePath("/mon-espace/projets");
  redirect(`/innovation/${slug}`);
}

export async function updateProject(formData: FormData) {
  const user = await requireStudent();
  const id = String(formData.get("id"));

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Projet introuvable");
  if (project.authorId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new Error("Vous ne pouvez modifier que vos propres projets.");
  }

  const parsed = projectSchema.parse({
    title: formData.get("title"),
    excerpt: (formData.get("excerpt") as string) || "",
    content: formData.get("content"),
    department: formData.get("department"),
    projectType: formData.get("projectType"),
    tags: (formData.get("tags") as string) || "",
    metadata: (formData.get("metadata") as string) || "",
    githubUrl: (formData.get("githubUrl") as string) || "",
    websiteUrl: (formData.get("websiteUrl") as string) || "",
    demoUrl: (formData.get("demoUrl") as string) || "",
    videoUrl: (formData.get("videoUrl") as string) || "",
  });

  const links = {
    github: parsed.githubUrl || null,
    website: parsed.websiteUrl || null,
    demo: parsed.demoUrl || null,
    video: parsed.videoUrl || null,
  };

  await prisma.project.update({
    where: { id },
    data: {
      title: parsed.title,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      department: parsed.department,
      projectType: parsed.projectType,
      tags: parseTags(parsed.tags),
      metadata: parseMetadata(parsed.metadata),
      links,
    },
  });

  // Nouvelle image principale
  const cover = formData.get("coverImage") as File | null;
  if (cover && cover.size > 0) {
    const url = await uploadProjectImage(cover, id, "cover");
    if (url) {
      await prisma.project.update({ where: { id }, data: { coverImage: url } });
    }
  }

  // Images à conserver
  const keepIds = formData.getAll("keepImages") as string[];
  await prisma.projectImage.deleteMany({
    where: { projectId: id, id: { notIn: keepIds } },
  });

  // Ajouter les nouvelles
  const lastOrder = await prisma.projectImage.aggregate({
    where: { projectId: id },
    _max: { order: true },
  });
  let order = (lastOrder._max.order ?? 0) + 1;

  const files = formData.getAll("secondaryImages") as File[];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const url = await uploadProjectImage(file, id, `img-${order}`);
    if (url) {
      await prisma.projectImage.create({
        data: { projectId: id, url, order },
      });
      order++;
    }
  }

  revalidatePath("/innovation");
  revalidatePath(`/innovation/${project.slug}`);
  revalidatePath("/mon-espace/projets");
  redirect(`/innovation/${project.slug}`);
}

export async function deleteOwnProject(id: string) {
  const user = await requireStudent();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Projet introuvable");
  if (project.authorId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new Error("Vous ne pouvez supprimer que vos propres projets.");
  }
  await prisma.project.delete({ where: { id } });
  revalidatePath("/innovation");
  revalidatePath("/mon-espace/projets");
  redirect("/mon-espace/projets");
}

// Likes
export async function toggleProjectLike(projectId: string, slug: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const existing = await prisma.projectLike.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (existing) {
    await prisma.projectLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.projectLike.create({ data: { projectId, userId } });
  }

  revalidatePath(`/innovation/${slug}`);
}

// Commentaires
const commentSchema = z.object({ content: z.string().min(1).max(2000) });

export async function addProjectComment(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const projectId = String(formData.get("projectId"));
  const slug = String(formData.get("slug"));
  const parsed = commentSchema.parse({ content: formData.get("content") });

  await prisma.projectComment.create({
    data: { projectId, authorId: userId, content: parsed.content },
  });
  revalidatePath(`/innovation/${slug}`);
}

export async function deleteProjectComment(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));

  const comment = await prisma.projectComment.findUnique({ where: { id } });
  if (!comment) return;

  const isAuthor = comment.authorId === userId;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isAuthor && !isAdmin) return;

  await prisma.projectComment.delete({ where: { id } });
  revalidatePath(`/innovation/${slug}`);
}