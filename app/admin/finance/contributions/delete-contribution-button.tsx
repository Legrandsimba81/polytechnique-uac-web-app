"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteContribution } from "../actions";

export function DeleteContributionButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [pending, start] = useTransition();

  function onClick() {
    const ok = window.confirm(
      `Supprimer la contribution "${label}" ?\n\nToutes les attributions associées (paiements, dettes) seront définitivement supprimées.`
    );
    if (!ok) return;

    start(async () => {
      await deleteContribution(id);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={pending}
      aria-label={`Supprimer la contribution ${label}`}
      title="Supprimer"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}