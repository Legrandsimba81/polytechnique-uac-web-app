import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="relative">
        <p className="text-[6rem] font-black leading-none text-primary/10 select-none">
          404
        </p>
        <Search className="h-12 w-12 text-primary absolute inset-0 m-auto" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Ressource introuvable</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Cet élément n'existe plus, a été supprimé, ou vous n'avez pas les
          permissions nécessaires.
        </p>
      </div>
      <Button asChild>
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>
      </Button>
    </div>
  );
}