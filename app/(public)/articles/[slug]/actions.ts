"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function toggleLike(articleId: string, slug: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const existing = await prisma.articleLike.findUnique({
    where: { articleId_userId: { articleId, userId } },
  });

  if (existing) {
    await prisma.articleLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.articleLike.create({ data: { articleId, userId } });
  }

  revalidatePath(`/articles/${slug}`);
}

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function addComment(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const articleId = String(formData.get("articleId"));
  const slug = String(formData.get("slug"));
  const parsed = commentSchema.parse({
    content: formData.get("content"),
  });

  await prisma.articleComment.create({
    data: { articleId, authorId: userId, content: parsed.content },
  });

  revalidatePath(`/articles/${slug}`);
}

export async function deleteComment(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));

  const comment = await prisma.articleComment.findUnique({ where: { id } });
  if (!comment) return;

  const isAuthor = comment.authorId === userId;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isAuthor && !isAdmin) return;

  await prisma.articleComment.delete({ where: { id } });
  revalidatePath(`/articles/${slug}`);
}