"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";

const ROLES: any = ["ADMIN", "SUPER_ADMIN"];

async function uploadFile(
  file: File,
  articleId: string,
  prefix: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Format d'image non supporté.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image trop volumineuse (5 Mo max).");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "articles",
    articleId
  );
  await fs.mkdir(dir, { recursive: true });

  const name = `${prefix}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/articles/${articleId}/${name}`;
}

const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export async function createArticle(formData: FormData) {
  const { session } = await requireRole(ROLES);
  const userId = (session.user as any).id;

  const parsed = articleSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug") || slugify(String(formData.get("title"))),
    excerpt: (formData.get("excerpt") as string) || "",
    content: formData.get("content"),
    categoryId: (formData.get("categoryId") as string) || undefined,
    status: formData.get("status"),
  });

  // Unicité du slug
  const exists = await prisma.article.findUnique({ where: { slug: parsed.slug } });
  if (exists) throw new Error(`Le slug "${parsed.slug}" est déjà utilisé.`);

  const article = await prisma.article.create({
    data: {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      categoryId: parsed.categoryId || null,
      status: parsed.status as any,
      publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
      authorId: userId,
    },
  });

  // Image principale
  const cover = formData.get("coverImage") as File | null;
  if (cover && cover.size > 0) {
    const url = await uploadFile(cover, article.id, "cover");
    if (url) {
      await prisma.article.update({
        where: { id: article.id },
        data: { coverImage: url },
      });
    }
  }

  // Images secondaires
  const files = formData.getAll("secondaryImages") as File[];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;
    const url = await uploadFile(file, article.id, `img-${i}`);
    if (url) {
      await prisma.articleImage.create({
        data: { articleId: article.id, url, order: i },
      });
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  redirect("/admin/articles");
}

export async function updateArticle(formData: FormData) {
  await requireRole(ROLES);
  const id = String(formData.get("id"));

  const parsed = articleSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: (formData.get("excerpt") as string) || "",
    content: formData.get("content"),
    categoryId: (formData.get("categoryId") as string) || undefined,
    status: formData.get("status"),
  });

  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) throw new Error("Article introuvable");

  await prisma.article.update({
    where: { id },
    data: {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt || null,
      content: parsed.content,
      categoryId: parsed.categoryId || null,
      status: parsed.status as any,
      publishedAt:
        parsed.status === "PUBLISHED" && !current.publishedAt
          ? new Date()
          : current.publishedAt,
    },
  });

  // Nouvelle image principale (optionnelle)
  const cover = formData.get("coverImage") as File | null;
  if (cover && cover.size > 0) {
    const url = await uploadFile(cover, id, "cover");
    if (url) {
      await prisma.article.update({
        where: { id },
        data: { coverImage: url },
      });
    }
  }

  // Images secondaires à conserver
  const keepIds = formData.getAll("keepImages") as string[];
  await prisma.articleImage.deleteMany({
    where: { articleId: id, id: { notIn: keepIds } },
  });

  // Ajouter les nouvelles
  const files = formData.getAll("secondaryImages") as File[];
  const lastOrder = await prisma.articleImage.aggregate({
    where: { articleId: id },
    _max: { order: true },
  });
  let order = (lastOrder._max.order ?? 0) + 1;

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const url = await uploadFile(file, id, `img-${order}`);
    if (url) {
      await prisma.articleImage.create({
        data: { articleId: id, url, order },
      });
      order++;
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/articles/${parsed.slug}`);
  revalidatePath("/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireRole(ROLES);
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  redirect("/admin/articles");
}

export async function deleteArticleImage(imageId: string, articleId: string) {
  await requireRole(ROLES);
  await prisma.articleImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/articles/${articleId}/edit`);
}