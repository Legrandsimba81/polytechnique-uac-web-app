"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "../actions";

export function DeleteExpenseButton({
  id,
  label,
  amount,
}: {
  id: string;
  label: string;
  amount: number;
}) {
  const [pending, start] = useTransition();

  function onClick() {
    const ok = window.confirm(
      `Supprimer la dépense "${label}" (${amount.toLocaleString("fr-FR")}) ?\n\nLe montant sera recrédité à la caisse.`
    );
    if (!ok) return;

    start(async () => {
      await deleteExpense(id);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label="Supprimer la dépense"
      title="Supprimer"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}