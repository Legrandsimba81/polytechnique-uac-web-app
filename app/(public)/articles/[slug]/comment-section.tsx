import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { addComment, deleteComment } from "./actions";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export async function CommentSection({
  articleId,
  slug,
}: {
  articleId: string;
  slug: string;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const comments = await prisma.articleComment.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true, image: true } } },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">
        Commentaires ({comments.length})
      </h2>

      {/* Formulaire */}
      {session ? (
        <form action={addComment} className="space-y-2">
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="content"
            placeholder="Votre commentaire…"
            required
            className="w-full rounded-lg border px-3 py-2 text-sm min-h-20 bg-background"
          />
          <Button type="submit" size="sm">
            Publier
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline">
            Connectez-vous
          </Link>{" "}
          pour commenter.
        </p>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun commentaire.
          </p>
        )}
        {comments.map((c) => {
          const name = c.author.name ?? c.author.email ?? "Anonyme";
          const canDelete = c.authorId === userId || isAdmin;

          return (
            <div
              key={c.id}
              className="rounded-lg border bg-card p-3 flex gap-3"
            >
              <Avatar name={name} src={c.author.image} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-sm">{name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {c.createdAt.toLocaleDateString("fr-FR")}
                    </span>
                    {canDelete && (
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="slug" value={slug} />
                        <button
                          type="submit"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-1">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}