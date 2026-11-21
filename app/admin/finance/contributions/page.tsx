import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { markAllContributionsPaid } from "../actions";
import { DeleteContributionButton } from "./delete-contribution-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FREQ: Record<string, string> = {
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuelle",
  ANNUAL: "Annuelle",
};

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ monthId?: string }>;
}) {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);
  const { monthId } = await searchParams;

  const months = await prisma.month.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  const current =
    monthId ?? months.find((m) => m.status === "OPEN")?.id ?? months[0]?.id;

  const contributions = current
    ? await prisma.contribution.findMany({
        where: { monthId: current },
        orderBy: { createdAt: "desc" },
        include: {
          month: true,
          promotion: true,
          department: true,
          attributions: {
            select: { status: true, amount: true, paidAmount: true },
          },
        },
      })
    : [];

  const openMonth = months.find((m) => m.status === "OPEN");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Contributions</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/finance/months">Mois</Link>
          </Button>
          <Button asChild disabled={!openMonth}>
            <Link href="/admin/finance/contributions/new">
              Nouvelle contribution
            </Link>
          </Button>
        </div>
      </div>

      <form method="GET" className="flex gap-2 items-center">
        <label className="text-sm font-medium">Mois :</label>
        <select
          name="monthId"
          defaultValue={current}
          className="rounded-md border px-3 py-1.5 text-sm bg-background"
        >
          {months.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} {m.status === "OPEN" ? "· (ouvert)" : "· (clôturé)"}
            </option>
          ))}
        </select>
        <button type="submit" className="text-sm underline">
          Afficher
        </button>
      </form>

      <div className="rounded-lg border divide-y">
        {contributions.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucune contribution pour ce mois.
          </p>
        )}

        {contributions.map((c) => {
          const total = c.attributions.length;
          const paid = c.attributions.filter((a) => a.status === "PAID").length;
          const dueAmount = c.attributions.reduce(
            (s, a) => s + Number(a.amount),
            0
          );
          const paidAmount = c.attributions.reduce(
            (s, a) => s + Number(a.paidAmount),
            0
          );
          const closed = c.month.status === "CLOSED";
          const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

          const scope = c.promotion
            ? c.department
              ? `${c.promotion.name} · ${c.department.name}`
              : c.promotion.name
            : "Toutes promotions";

          return (
            <div key={c.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(c.amount).toLocaleString("fr-FR")} ·{" "}
                    {FREQ[c.frequency]} · {scope}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {closed && (
                    <Badge variant="secondary" className="text-xs">
                      Clôturé
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {paid}/{total} payés
                  </Badge>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {paidAmount.toLocaleString("fr-FR")} /{" "}
                    {dueAmount.toLocaleString("fr-FR")} collectés
                  </span>
                  <span>{percent}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {!closed && paid < total && (
                  <form action={markAllContributionsPaid}>
                    <input
                      type="hidden"
                      name="contributionId"
                      value={c.id}
                    />
                    <Button size="sm" type="submit">
                      Marquer tout payé ({total - paid})
                    </Button>
                  </form>
                )}
                {!closed && paid === total && total > 0 && (
                  <Badge variant="default" className="text-xs">
                    Tous payés ✓
                  </Badge>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/finance/contributions/${c.id}`}>
                    Détails
                  </Link>
                </Button>
                <DeleteContributionButton id={c.id} label={c.label} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}