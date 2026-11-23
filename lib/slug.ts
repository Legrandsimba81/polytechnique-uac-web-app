// lib/slug.ts
import { prisma } from "./prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueProjectSlug(base: string): Promise<string> {
  const root = slugify(base) || "projet";
  let slug = root;
  let i = 2;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${root}-${i++}`;
  }
  return slug;
}