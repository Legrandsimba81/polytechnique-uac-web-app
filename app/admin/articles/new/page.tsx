import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvel article</h1>
      <ArticleForm categories={categories} action={createArticle} />
    </div>
  );
}