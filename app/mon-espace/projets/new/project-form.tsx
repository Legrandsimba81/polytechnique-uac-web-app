"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEPARTMENT_LABEL } from "@/lib/innovations";
import { createProject } from "@/app/mon-espace/projets/actions";

type Department =
  | "GENIE_INFORMATIQUE"
  | "ARCHITECTURE"
  | "GENIE_CIVIL"
  | "GENIE_ELECTRIQUE";

const DEPARTMENTS: readonly Department[] = [
  "GENIE_INFORMATIQUE",
  "ARCHITECTURE",
  "GENIE_CIVIL",
  "GENIE_ELECTRIQUE",
];

const DEFAULT_PROJECT_TYPES: Record<Department, readonly string[]> = {
  GENIE_INFORMATIQUE: ["Application Web", "Application Mobile", "IA / Data", "Système / Réseau"],
  ARCHITECTURE: ["Urbanisme", "Habitat durable", "Design intérieur", "Maquette / 3D"],
  GENIE_CIVIL: ["Structure", "Hydraulique", "Voirie / Transport", "Géotechnique"],
  GENIE_ELECTRIQUE: ["Énergie solaire", "Automatisme", "Électronique", "Réseaux électriques"],
};

export function ProjectForm() {
  const [department, setDepartment] = useState<Department>("GENIE_INFORMATIQUE");
  const [projectType, setProjectType] = useState<string>(
    DEFAULT_PROJECT_TYPES.GENIE_INFORMATIQUE[0]
  );
  const [metadataJson, setMetadataJson] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableTypes = useMemo(
    () => DEFAULT_PROJECT_TYPES[department],
    [department]
  );

  function handleDepartmentChange(nextDept: Department) {
    setDepartment(nextDept);
    setProjectType(DEFAULT_PROJECT_TYPES[nextDept][0] ?? "");
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    if (metadataJson.trim()) {
      try {
        const parsed = JSON.parse(metadataJson);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          setError("Les métadonnées doivent être un objet JSON valide (ex. {\"année\": \"2026\"}).");
          return;
        }
      } catch {
        setError("Le format JSON des métadonnées est invalide.");
        return;
      }
    }

    startTransition(async () => {
      try {
        await createProject(formData);
      } catch (err) {
        // Next.js `redirect()` lève une erreur spéciale : on la laisse remonter
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as { digest?: unknown }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la publication."
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded-xl border bg-card p-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Titre & Résumé */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            Titre du projet <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            name="title"
            required
            minLength={3}
            placeholder="Ex. Système intelligent de suivi énergétique"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="excerpt" className="text-sm font-medium">
            Résumé court (extrait)
          </label>
          <Input
            id="excerpt"
            name="excerpt"
            placeholder="Une phrase ou deux pour résumer l'objectif du projet..."
          />
        </div>
      </div>

      {/* Département & Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="department" className="text-sm font-medium">
            Département <span className="text-destructive">*</span>
          </label>
          <select
            id="department"
            name="department"
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value as Department)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {DEPARTMENT_LABEL[dept]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectType" className="text-sm font-medium">
            Type de projet <span className="text-destructive">*</span>
          </label>
          <select
            id="projectType"
            name="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu détaillé */}
      <div className="space-y-1.5">
        <label htmlFor="content" className="text-sm font-medium">
          Description détaillée (HTML accepté){" "}
          <span className="text-destructive">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          minLength={10}
          rows={8}
          placeholder="<p>Décrivez le contexte, la méthodologie, les outils utilisés et les résultats...</p>"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label htmlFor="tags" className="text-sm font-medium">
          Mots-clés / Tags
        </label>
        <Input
          id="tags"
          name="tags"
          placeholder="Ex. iot, react, solaire, capteur (séparés par des virgules)"
        />
      </div>

      {/* Liens externes */}
      <div className="space-y-3 pt-2 border-t">
        <h2 className="text-sm font-semibold">Liens associés (optionnels)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="githubUrl" className="text-xs font-medium text-muted-foreground">
              Dépôt GitHub / Code source
            </label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/..."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="websiteUrl" className="text-xs font-medium text-muted-foreground">
              Site web du projet
            </label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="demoUrl" className="text-xs font-medium text-muted-foreground">
              Lien Démo live
            </label>
            <Input
              id="demoUrl"
              name="demoUrl"
              type="url"
              placeholder="https://demo...."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="videoUrl" className="text-xs font-medium text-muted-foreground">
              Lien vidéo de présentation
            </label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4 pt-2 border-t">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Upload className="h-4 w-4" />
          Visuels (JPEG, PNG, WebP, GIF — 5 Mo max par fichier)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="coverImage" className="text-xs font-medium text-muted-foreground">
              Image de couverture
            </label>
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="secondaryImages" className="text-xs font-medium text-muted-foreground">
              Images supplémentaires (galerie)
            </label>
            <Input
              id="secondaryImages"
              name="secondaryImages"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </div>
        </div>
      </div>

      {/* Métadonnées JSON optionnelles */}
      <div className="space-y-1.5 pt-2 border-t">
        <label htmlFor="metadata" className="text-sm font-medium">
          Métadonnées techniques (JSON optionnel)
        </label>
        <textarea
          id="metadata"
          name="metadata"
          rows={3}
          value={metadataJson}
          onChange={(e) => setMetadataJson(e.target.value)}
          placeholder='{"promotion": "L3", "encadrant": "Prof. Dupont"}'
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Bouton de soumission */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isPending ? "Publication en cours..." : "Publier le projet"}
        </Button>
      </div>
    </form>
  );
}