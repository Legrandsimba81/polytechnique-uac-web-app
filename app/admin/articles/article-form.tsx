"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };
type ExistingImage = { id: string; url: string; caption: string | null };

export function ArticleForm({
  categories,
  action,
  initial,
  isEdit = false,
}: {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    categoryId: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    images: ExistingImage[];
  };
  isEdit?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [keptImages, setKeptImages] = useState<ExistingImage[]>(
    initial?.images ?? []
  );

  function handleTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  return (
    <form
      action={action}
      className="space-y-4 max-w-4xl"
      encType="multipart/form-data"
    >
      {isEdit && initial && (
        <input type="hidden" name="id" value={initial.id} />
      )}

      <div className="space-y-1">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
          required
          placeholder="Titre de l'article"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
        />
        <p className="text-xs text-muted-foreground">
          /articles/<strong>{slug || "…"}</strong>
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="excerpt">Résumé (optionnel)</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={initial?.excerpt ?? ""}
          placeholder="Court résumé affiché dans la liste"
          className="w-full rounded-md border px-3 py-2 text-sm min-h-16 bg-background"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="categoryId">Catégorie</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>

      {/* Image principale */}
      <div className="space-y-1">
        <Label htmlFor="coverImage">Image principale</Label>
        {initial?.coverImage && (
          <div className="mb-2">
            <img
              src={initial.coverImage}
              alt="Couverture"
              className="rounded-lg max-h-40 object-cover"
            />
          </div>
        )}
        <Input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          className="text-xs"
        />
        <p className="text-xs text-muted-foreground">
          {initial?.coverImage
            ? "Laissez vide pour conserver l'image actuelle."
            : "Format JPEG, PNG, WEBP ou GIF (5 Mo max)."}
        </p>
      </div>

      {/* Contenu */}
      <div className="space-y-1">
        <Label>Contenu</Label>
        <TiptapEditor name="content" defaultValue={initial?.content ?? ""} />
      </div>

      {/* Images secondaires existantes */}
      {isEdit && keptImages.length > 0 && (
        <div className="space-y-2">
          <Label>Images secondaires actuelles</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {keptImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt=""
                  className="rounded-md h-24 w-full object-cover"
                />
                <input
                  type="hidden"
                  name="keepImages"
                  value={img.id}
                />
                <button
                  type="button"
                  onClick={() =>
                    setKeptImages((prev) =>
                      prev.filter((i) => i.id !== img.id)
                    )
                  }
                  className="absolute top-1 right-1 rounded-full bg-destructive text-white p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Retirer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nouvelles images secondaires */}
      <div className="space-y-1">
        <Label htmlFor="secondaryImages">
          Ajouter des images secondaires
        </Label>
        <Input
          id="secondaryImages"
          name="secondaryImages"
          type="file"
          accept="image/*"
          multiple
          className="text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Affichées à la fin de l'article en galerie.
        </p>
      </div>

      <Button type="submit" className="w-full">
        {isEdit ? "Enregistrer les modifications" : "Créer l'article"}
      </Button>
    </form>
  );
}