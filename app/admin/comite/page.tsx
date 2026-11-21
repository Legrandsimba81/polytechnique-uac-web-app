import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { archiveCommittee, createCommittee } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, CheckCircle } from "lucide-react";

export default async function AdminComitePage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const committees = await prisma.committee.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { members: true, ministries: true } } },
  });

  const active = committees.find((c) => c.status === "ACTIVE");
  const archived = committees.filter((c) => c.status === "ARCHIVED");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Comité</h1>

      {/* Comité actif */}
      {active ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                {active.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Mandat {active.year} · {active._count.members} membres ·{" "}
                {active._count.ministries} ministères
              </p>
            </div>
            <div className="flex gap-2">
              <form action={archiveCommittee.bind(null, active.id)}>
                <Button type="submit" variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-1" />
                  Archiver
                </Button>
              </form>
              <Button asChild size="sm">
                <Link href={`/admin/comite/${active.id}`}>Gérer</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau comité</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createCommittee}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-1">
                <Label htmlFor="name">Nom du comité</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Comité des Étudiants 2025-2026"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="year">Mandat (année)</Label>
                <Input
                  id="year"
                  name="year"
                  required
                  placeholder="2025-2026"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full sm:w-auto">
                  Créer
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              Les 9 ministères standards seront créés automatiquement. Vous
              pourrez en ajouter d'autres.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Archives */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Archives ({archived.length})
        </h2>
        <div className="rounded-lg border divide-y">
          {archived.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun comité archivé.
            </p>
          )}
          {archived.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  Mandat {c.year} · {c._count.members} membres ·{" "}
                  {c.archivedAt
                    ? `archivé le ${c.archivedAt.toLocaleDateString("fr-FR")}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Archivé</Badge>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/comite/${c.id}`}>Consulter</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}