import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { ArticleForm } from "@/components/admin/article-form";
import { updateArticle, deleteArticle } from "../../actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        secondaryImages: { orderBy: { order: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  async function handleDelete() {
    "use server";
    await deleteArticle(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier : {article.title}</h1>
        <form action={handleDelete}>
          <Button type="submit" variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-1 text-destructive" />
            Supprimer
          </Button>
        </form>
      </div>

      <ArticleForm
        categories={categories}
        action={updateArticle}
        isEdit
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          categoryId: article.categoryId,
          status: article.status as any,
          images: article.secondaryImages.map((i) => ({
            id: i.id,
            url: i.url,
            caption: i.caption,
          })),
        }}
      />
    </div>
  );
}