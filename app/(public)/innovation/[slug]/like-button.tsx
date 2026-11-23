"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleProjectLike } from "@/app/mon-espace/projets/actions";
import { cn } from "@/lib/utils";

export function ProjectLikeButton({
  projectId, slug, initialLiked, initialCount, isAuthenticated,
}: {
  projectId: string; slug: string; initialLiked: boolean; initialCount: number; isAuthenticated: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function onClick() {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    setLiked((v) => !v);
    setCount((c) => (liked ? c - 1 : c + 1));
    start(async () => { await toggleProjectLike(projectId, slug); });
  }

  return (
    <button type="button" onClick={onClick} disabled={pending}
      className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
        liked ? "border-rose-500/30 bg-rose-500/10 text-rose-500" : "hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-500")}>
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      <span>{count}</span>
    </button>
  );
}