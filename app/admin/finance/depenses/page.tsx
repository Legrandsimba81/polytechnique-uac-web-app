import Link from "next/link";
import { Wallet, TrendingDown, PiggyBank, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { NewExpenseForm } from "./new-expense-form";
import { DeleteExpenseButton } from "./delete-expense-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DepensesPage() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const [collected, expected, expensesSum, expenses] = await Promise.all([
    prisma.studentContribution.aggregate({ _sum: { paidAmount: true } }),
    prisma.studentContribution.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: { createdBy: { select: { name: true } } },
    }),
  ]);

  const totalCollected = Number(collected._sum.paidAmount ?? 0);
  const totalExpected = Number(expected._sum.amount ?? 0);
  const totalExpenses = Number(expensesSum._sum.amount ?? 0);
  const resteAPayer = totalExpected - totalCollected;
  const caisse = totalCollected - totalExpenses;

  const stats = [
    {
      label: "Total collecté",
      value: totalCollected,
      icon: Wallet,
      color: "text-primary",
    },
    {
      label: "Reste à payer",
      value: resteAPayer,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Total dépenses",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Caisse actuelle",
      value: caisse,
      icon: PiggyBank,
      color: caisse >= 0 ? "text-emerald-500" : "text-destructive",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dépenses</h1>
          <p className="text-sm text-muted-foreground">
            Gestion de la caisse et des sorties
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/finance/contributions">Contributions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/finance">Tableau de bord</Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {s.value.toLocaleString("fr-FR")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulaire */}
      <div>
        <NewExpenseForm caisse={caisse} />
      </div>

      {/* Liste */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Historique ({expenses.length})
        </h2>
        <div className="rounded-lg border divide-y">
          {expenses.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Aucune dépense enregistrée.
            </p>
          )}

          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{e.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  {e.createdBy?.name && ` · par ${e.createdBy.name}`}
                </p>
                {e.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {e.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-destructive">
                  −{Number(e.amount).toLocaleString("fr-FR")}
                </p>
                <DeleteExpenseButton
                  id={e.id}
                  label={e.label}
                  amount={Number(e.amount)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}