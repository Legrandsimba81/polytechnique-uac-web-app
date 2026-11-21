"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMember } from "../actions";
import { ROLE_LABEL } from "@/lib/committee";

const ALL_ROLES = [
  "DELEGUE",
  "DIR_CAB",
  "VICE_DELEGUE",
  "SECRETAIRE_GENERAL",
  "TRESORIER",
  "MINISTRE",
  "VICE_MINISTRE",
];

const TOP_ROLES = [
  "DELEGUE",
  "DIR_CAB",
  "VICE_DELEGUE",
  "SECRETAIRE_GENERAL",
  "TRESORIER",
];

export function NewMemberForm({
  committeeId,
  ministryId,
  ministries,
  defaultRole,
  topOnly = false,
}: {
  committeeId: string;
  ministryId: string | null;
  ministries: { id: string; name: string }[];
  defaultRole: string;
  topOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const roles = topOnly ? TOP_ROLES : ALL_ROLES;

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1" /> Ajouter un membre
      </Button>
    );
  }

  return (
    <form
      action={createMember}
      className="rounded-lg border bg-muted/30 p-3 space-y-2"
    >
      <input type="hidden" name="committeeId" value={committeeId} />
      {ministryId && (
        <input type="hidden" name="ministryId" value={ministryId} />
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Nom complet</Label>
          <Input name="fullName" required placeholder="Nom complet" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rôle</Label>
          <select
            name="role"
            defaultValue={defaultRole}
            className="flex h-10 w-full rounded-md border px-2 text-sm bg-background"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!topOnly && !ministryId && (
        <div className="space-y-1">
          <Label className="text-xs">Ministère (optionnel)</Label>
          <select
            name="ministryId"
            className="flex h-10 w-full rounded-md border px-2 text-sm bg-background"
          >
            <option value="">— Aucun —</option>
            {ministries.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Input name="email" type="email" placeholder="Email" />
        <Input name="phone" placeholder="Téléphone" />
      </div>
      <Input name="whatsapp" placeholder="WhatsApp (optionnel)" />
      <textarea
        name="bio"
        placeholder="Bio (optionnel)"
        className="w-full rounded-md border px-3 py-2 text-sm min-h-16 bg-background"
      />
      <div className="space-y-1">
        <Label className="text-xs">Photo (optionnel)</Label>
        <Input type="file" name="photo" accept="image/*" className="text-xs" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          Ajouter
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}