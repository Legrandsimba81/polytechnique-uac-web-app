"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEPARTMENT_LABEL,
  PROJECT_FIELDS,
  PROJECT_TYPES,
  type ProjectDepartment,
} from "@/lib/innovations";

type ExistingImage = { id: string; url: string; caption: string | null };

export function ProjectForm({
  action,
  initial,
  isEdit = false,
}: {
  action: (fd: FormData) => void | Promise<void>;
  initial?: {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    department: ProjectDepartment;
    projectType: string;
    tags: string[];
    metadata: Record<string, any> | null;
    links: {
      github?: string;
      website?: string;
      demo?: string;
      video?: string;
    } | null;
    images: ExistingImage[];
  };
  isEdit?: boolean;
}) {
  const [department, setDepartment] = useState<ProjectDepartment | "">(
    initial?.department ?? ""
  );
  const [metadata, setMetadata] = useState<Record<string, any>>(
    initial?.metadata ?? {}
  );
  const [keptImages, setKeptImages] = useState<ExistingImage[]>(
    initial?.images ?? []
  );
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [projectType, setProjectType] = useState(initial?.projectType ?? "");

  const fields = department ? PROJECT_FIELDS[department] : [];
  const types = department ? PROJECT_TYPES[department] : [];
  const metadataJson = useMemo(() => JSON.stringify(metadata), [metadata]);

  function updateField(key: string, value: any) {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {isEdit && initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="metadata" value={metadataJson} />

      {/* Département */}
      <div className="space-y-2">
        <Label>Département</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DEPARTMENT_LABEL) as ProjectDepartment[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDepartment(d);
                setProjectType("");
                setMetadata({});
              }}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition ${
                department === d
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {DEPARTMENT_LABEL[d]}
            </button>
          ))}
        </div>
        <input type="hidden" name="department" value={department} />
      </div>

      {department && (
        <>
          <div className="space-y-1">
            <Label htmlFor="title">Titre du projet</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initial?.title ?? ""}
              required
              placeholder="Mon projet…"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="excerpt">Description courte</Label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={initial?.excerpt ?? ""}
              required
              placeholder="Résumé en 1-2 phrases pour la carte"
              className="w-full rounded-md border px-3 py-2 text-sm min-h-16 bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="projectType">Type de projet</Label>
            <select
              id="projectType"
              name="projectType"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background"
            >
              <option value="">— Sélectionner —</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tags">Tags (séparés par virgules)</Label>
            <Input
              id="tags"
              name="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="IoT, React, mobile…"
            />
          </div>

          <div className="space-y-1">
            <Label>Contenu détaillé</Label>
            <TiptapEditor name="content" defaultValue={initial?.content ?? ""} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="coverImage">Image principale</Label>
            {initial?.coverImage && (
              <div className="mb-2">
                <img
                  src={initial.coverImage}
                  alt=""
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
          </div>

          {/* Champs spécifiques au département */}
          {fields.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-semibold">Informations spécifiques</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((f) => (
                  <div
                    key={f.key}
                    className={f.type === "textarea" ? "sm:col-span-2" : ""}
                  >
                    <Label htmlFor={`meta-${f.key}`} className="text-xs">
                      {f.label}
                    </Label>
                    {f.type === "tags" ? (
                      <Input
                        id={`meta-${f.key}`}
                        value={
                          Array.isArray(metadata[f.key])
                            ? metadata[f.key].join(", ")
                            : metadata[f.key] ?? ""
                        }
                        onChange={(e) =>
                          updateField(
                            f.key,
                            e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder={f.placeholder}
                      />
                    ) : f.type === "textarea" ? (
                      <textarea
                        id={`meta-${f.key}`}
                        value={metadata[f.key] ?? ""}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full rounded-md border px-3 py-2 text-sm min-h-20 bg-background"
                      />
                    ) : (
                      <Input
                        id={`meta-${f.key}`}
                        type={f.type === "number" ? "number" : "text"}
                        value={metadata[f.key] ?? ""}
                        onChange={(e) =>
                          updateField(
                            f.key,
                            f.type === "number"
                              ? e.target.value
                              : e.target.value
                          )
                        }
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liens */}
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-semibold">Liens (optionnels)</p>
            <Input
              name="githubUrl"
              type="url"
              defaultValue={initial?.links?.github ?? ""}
              placeholder="https://github.com/…"
            />
            <Input
              name="websiteUrl"
              type="url"
              defaultValue={initial?.links?.website ?? ""}
              placeholder="https://mon-site.com"
            />
            <Input
              name="demoUrl"
              type="url"
              defaultValue={initial?.links?.demo ?? ""}
              placeholder="https://demo.mon-site.com"
            />
            <Input
              name="videoUrl"
              type="url"
              defaultValue={initial?.links?.video ?? ""}
              placeholder="https://youtube.com/…"
            />
          </div>

          {/* Images secondaires */}
          {isEdit && keptImages.length > 0 && (
            <div className="space-y-2">
              <Label>Images actuelles</Label>
              <div className="grid grid-cols-3 gap-2">
                {keptImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt=""
                      className="rounded-md h-24 w-full object-cover"
                    />
                    <input type="hidden" name="keepImages" value={img.id} />
                    <button
                      type="button"
                      onClick={() =>
                        setKeptImages((p) => p.filter((i) => i.id !== img.id))
                      }
                      className="absolute top-1 right-1 rounded-full bg-destructive text-white p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="secondaryImages">Images secondaires</Label>
            <Input
              id="secondaryImages"
              name="secondaryImages"
              type="file"
              accept="image/*"
              multiple
              className="text-xs"
            />
          </div>

          <Button type="submit" className="w-full">
            {isEdit ? "Enregistrer" : "Publier le projet"}
          </Button>
        </>
      )}
    </form>
  );
}