"use client";

import { useState } from "react";
import { ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canEmbedInIframe, extractHostname } from "@/lib/innovations";

export function SitePreview({ url }: { url: string }) {
  const [showIframe, setShowIframe] = useState(false);
  const embeddable = canEmbedInIframe(url);
  const hostname = extractHostname(url);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Aperçu du site : <strong>{hostname}</strong></p>
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Ouvrir le site
          </a>
        </Button>
      </div>

      {embeddable ? (
        showIframe ? (
          <div className="rounded-lg border overflow-hidden bg-muted">
            <iframe
              src={url}
              className="w-full h-[500px]"
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="lazy"
              title={`Aperçu de ${hostname}`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowIframe(true)}
            className="w-full rounded-lg border-2 border-dashed p-12 text-center hover:bg-accent transition"
          >
            <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Charger l'aperçu intégré</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cliquez pour afficher le site dans cette page
            </p>
          </button>
        )
      ) : (
        <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Ce site ne peut pas être affiché intégré.
          </p>
          <Button asChild size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Visiter {hostname}
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}