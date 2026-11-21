"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X, AlertCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMember, updateMember } from "../actions";
import { ROLE_LABEL } from "@/lib/committee";

type Ministry = { id: string; name: string };
type Member = {
  id: string;
  fullName: string;
  role: string;
  roleLabel: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  ministryId: string | null;
};

const ROLES = [
  "DELEGUE",
  "DIR_CAB",
  "VICE_DELEGUE",
  "SECRETAIRE_GENERAL",
  "TRESORIER",
  "MINISTRE",
  "VICE_MINISTRE",
];

export function MemberCard({
  member,
  committeeId,
  ministries,
  archived,
}: {
  member: Member;
  committeeId: string;
  ministries: Ministry[];
  archived: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer ${member.fullName} du comité ?`)) return;
    setError(null);
    start(async () => {
      try {
        await deleteMember(member.id, committeeId);
      } catch (e: any) {
        setError(e?.message ?? "Erreur lors de la suppression.");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await updateMember(fd);
        setEditing(false); // ← ferme le formulaire après succès
      } catch (err: any) {
        setError(err?.message ?? "Erreur lors de la mise à jour.");
      }
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-card p-4 space-y-3"
      >
        <input type="hidden" name="id" value={member.id} />
        <input type="hidden" name="committeeId" value={committeeId} />

        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">Modifier {member.fullName}</p>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="rounded p-1 hover:bg-accent"
            aria-label="Annuler"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Nom complet</Label>
          <Input name="fullName" defaultValue={member.fullName} required />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Rôle</Label>
            <select
              name="role"
              defaultValue={member.role}
              className="flex h-9 w-full rounded-md border px-2 text-sm bg-background"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ministère</Label>
            <select
              name="ministryId"
              defaultValue={member.ministryId ?? ""}
              className="flex h-9 w-full rounded-md border px-2 text-sm bg-background"
            >
              <option value="">— Aucun —</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            name="email"
            type="email"
            defaultValue={member.email ?? ""}
            placeholder="Email"
          />
          <Input
            name="phone"
            defaultValue={member.phone ?? ""}
            placeholder="Téléphone"
          />
        </div>
        <Input
          name="whatsapp"
          defaultValue={member.whatsapp ?? ""}
          placeholder="WhatsApp"
        />
        <textarea
          name="bio"
          defaultValue={member.bio ?? ""}
          placeholder="Bio…"
          className="w-full rounded-md border px-3 py-2 text-sm min-h-16 bg-background"
        />

        <div className="space-y-1">
          <Label className="text-xs">
            Nouvelle photo (laisser vide pour conserver l'actuelle)
          </Label>
          <Input type="file" name="photo" accept="image/*" className="text-xs" />
        </div>

        {error && (
          <div className="flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-3 flex gap-3">
      <Avatar name={member.fullName} src={member.photoUrl} size={56} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{member.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {member.roleLabel ?? ROLE_LABEL[member.role]}
        </p>
        {member.email && (
          <p className="text-xs text-muted-foreground truncate">
             {member.email}
          </p>
        )}
        {member.phone && (
          <p className="text-xs text-muted-foreground">{member.phone}</p>
        )}
      </div>
      {!archived && (
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditing(true);
              setError(null);
            }}
            aria-label="Modifier"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={pending}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}