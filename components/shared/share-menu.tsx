"use client";

import { useState } from "react";
import { Share2, Link2, MessageCircle, Facebook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez le lien :", url);
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        <Share2 className="h-4 w-4 mr-1" />
        Partager
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 rounded-xl border bg-white dark:bg-muted p-2 shadow-xl z-50">
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Link2 className="h-4 w-4 text-primary" />
              )}
              {copied ? "Lien copié !" : "Copier le lien"}
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              WhatsApp
            </a>
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </a>
          </div>
        </>
      )}
    </div>
  );
}