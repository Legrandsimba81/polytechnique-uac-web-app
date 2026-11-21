"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpense } from "../actions";

export function NewExpenseForm({ caisse }: { caisse: number }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      try {
        await createExpense(fd);
        form.reset();
        setOpen(false);
      } catch (err: any) {
        setError(err?.message ?? "Erreur lors de l'enregistrement.");
      }
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={caisse <= 0}
        title={caisse <= 0 ? "Caisse vide" : undefined}
      >
        <Plus className="h-4 w-4 mr-1" />
        Nouvelle dépense
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <p className="font-medium text-sm">Nouvelle dépense</p>

      <div className="space-y-1">
        <Label htmlFor="label" className="text-xs">
          Motif
        </Label>
        <Input
          id="label"
          name="label"
          required
          placeholder="Achat de fournitures, transport, événement…"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="amount" className="text-xs">
            Montant
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="date" className="text-xs">
            Date
          </Label>
          <Input id="date" name="date" type="date" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs">
          Description (optionnel)
        </Label>
        <textarea
          id="description"
          name="description"
          placeholder="Détails…"
          className="w-full rounded-md border px-3 py-2 text-sm min-h-16 bg-background"
        />
      </div>

      {error && (
        <div className="flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la dépense"}
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