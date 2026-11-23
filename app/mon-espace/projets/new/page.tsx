import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "./project-form";

const ALLOWED_ROLES = new Set(["STUDENT", "ADMIN", "SUPER_ADMIN"]);

export const metadata = {
  title: "Nouveau projet",
};

export default async function NewProjectPage() {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string }
    | undefined;

  if (!user?.id) {
    redirect("/login");
  }

  if (!user.role || !ALLOWED_ROLES.has(user.role)) {
    return (
      <div className="container max-w-2xl py-12 space-y-4">
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 space-y-2">
          <h1 className="text-xl font-semibold text-destructive">
            Accès réservé aux étudiants
          </h1>
          <p className="text-sm text-muted-foreground">
            Votre compte n&apos;a pas le rôle requis pour publier un projet
            d&apos;innovation.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/mon-espace/projets">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à mes projets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Publier un projet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Partagez votre réalisation académique ou technique avec la
            communauté.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/mon-espace/projets">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Mes projets
          </Link>
        </Button>
      </div>

      <ProjectForm />
    </div>
  );
}