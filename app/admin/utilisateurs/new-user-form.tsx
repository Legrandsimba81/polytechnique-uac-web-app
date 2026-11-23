"use client";

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "./actions";

export function NewUserForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Nouvel utilisateur
      </Button>
    );
  }

  return (
    <form
      action={async (fd) => {
        try {
          setError(null);
          await createUser(fd);
          setOpen(false);
        } catch (e: any) {
          setError(e?.message ?? "Erreur lors de la création.");
        }
      }}
      className="rounded-lg border bg-card p-4 space-y-3 max-w-lg"
    >
      <p className="font-medium text-sm">Nouvel utilisateur</p>

      <div className="space-y-1">
        <Label htmlFor="new-name" className="text-xs">
          Nom complet
        </Label>
        <Input id="new-name" name="name" required placeholder="Nom" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="new-email" className="text-xs">
            Email (optionnel)
          </Label>
          <Input
            id="new-email"
            name="email"
            type="email"
            placeholder="email@exemple.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-phone" className="text-xs">
            Téléphone (optionnel)
          </Label>
          <Input id="new-phone" name="phone" placeholder="+243…" />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="new-password" className="text-xs">
            Mot de passe
          </Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-role" className="text-xs">
            Rôle
          </Label>
          <select
            id="new-role"
            name="role"
            defaultValue="USER"
            className="flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="USER">Utilisateur</option>
            <option value="FINANCE">Finance</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Créer
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}