import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { closeMonth, openNextMonth } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function MonthsPage() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const months = await prisma.month.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { _count: { select: { contributions: true } } },
  });

  const openMonth = months.find((m) => m.status === "OPEN");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mois</h1>
        {!openMonth && (
          <form action={openNextMonth}>
            <Button type="submit">Ouvrir un nouveau mois</Button>
          </form>
        )}
      </div>

      {openMonth && (
        <Card>
          <CardHeader>
            <CardTitle>Mois en cours : {openMonth.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Toutes les contributions créées seront rattachées à ce mois.
            </p>
            <form action={closeMonth.bind(null, openMonth.id)}>
              <Button type="submit" variant="destructive">
                Clôturer le mois
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border divide-y">
        {months.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun mois. Ouvrez-en un pour commencer.
          </p>
        )}
        {months.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">
                {m._count.contributions} contribution(s) ·{" "}
                {m.closedAt
                  ? `clôturé le ${m.closedAt.toLocaleDateString("fr-FR")}`
                  : "ouvert"}
              </p>
            </div>
            <Badge variant={m.status === "OPEN" ? "default" : "secondary"}>
              {m.status === "OPEN" ? "Ouvert" : "Clôturé"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}