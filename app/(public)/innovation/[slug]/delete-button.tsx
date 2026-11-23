"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOwnProject } from "@/app/mon-espace/projets/actions";

export function DeleteOwnProjectButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Supprimer définitivement "${label}" ?`)) return;
    start(async () => { await deleteOwnProject(id); });
  }
  return (
    <Button type="button" size="sm" variant="outline" onClick={onClick} disabled={pending}>
      <Trash2 className="h-3.5 w-3.5 text-destructive" />
    </Button>
  );
}