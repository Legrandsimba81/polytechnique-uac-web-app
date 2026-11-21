import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { NavBar } from "@/components/layout/nav-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="container max-w-2xl text-center space-y-8">
          {/* 404 stylisé */}
          <div className="relative inline-block">
            <p className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tight text-primary/10 select-none">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Page introuvable
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              La page que vous cherchez n'existe pas, a été déplacée, ou vous
              n'avez pas les droits nécessaires pour y accéder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voir les articles
              </Link>
            </Button>
          </div>

          <div className="pt-8 border-t">
            <p className="text-xs text-muted-foreground">
              Code d'erreur : <code className="font-mono">404 — NOT_FOUND</code>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}