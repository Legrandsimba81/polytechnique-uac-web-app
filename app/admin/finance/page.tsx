import Link from "next/link";
import {
  Wallet,
  Users,
  GraduationCap,
  Calendar,
  PiggyBank,
  TrendingDown,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FinanceDashboard() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const [
    openMonth,
    promotions,
    students,
    collected,
    expected,
    expenses,
  ] = await Promise.all([
    prisma.month.findFirst({ where: { status: "OPEN" } }),
    prisma.promotion.count(),
    prisma.student.count(),
    prisma.studentContribution.aggregate({ _sum: { paidAmount: true } }),
    prisma.studentContribution.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalCollected = Number(collected._sum.paidAmount ?? 0);
  const totalExpected = Number(expected._sum.amount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);
  const resteAPayer = totalExpected - totalCollected;
  const caisse = totalCollected - totalExpenses;
  const tauxGlobal =
    totalExpected > 0
      ? Math.round((totalCollected / totalExpected) * 100)
      : 0;

  const stats = [
    {
      label: "Promotions",
      value: promotions.toString(),
      icon: GraduationCap,
      color: "text-primary",
    },
    {
      label: "Étudiants",
      value: students.toString(),
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Collecté",
      value: totalCollected.toLocaleString("fr-FR"),
      icon: Wallet,
      color: "text-emerald-500",
    },
    {
      label: "Reste à payer",
      value: resteAPayer.toLocaleString("fr-FR"),
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Dépenses",
      value: totalExpenses.toLocaleString("fr-FR"),
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Caisse",
      value: caisse.toLocaleString("fr-FR"),
      icon: PiggyBank,
      color: caisse >= 0 ? "text-emerald-500" : "text-destructive",
    },
    {
      label: "Taux global",
      value: `${tauxGlobal}%`,
      icon: Wallet,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/finance/months">Mois</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/finance/contributions">Contributions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/finance/depenses">Dépenses</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/finance/promotions">Promotions</Link>
          </Button>
        </div>
      </div>

      {openMonth ? (
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">
              Mois en cours : {openMonth.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Toutes les nouvelles contributions seront rattachées à ce mois.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-destructive/10 p-4">
          <p className="text-sm font-medium">Aucun mois ouvert</p>
          <p className="text-xs text-muted-foreground">
            Ouvrez un mois pour créer de nouvelles contributions.
          </p>
        </div>
      )}

      {/* KPIs — 7 cartes */}
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
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bloc caisse détaillé */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-500" />
            État de la caisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-emerald-500/5 p-4">
              <p className="text-xs text-muted-foreground">Entrées (collecté)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{totalCollected.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="rounded-lg border bg-destructive/5 p-4">
              <p className="text-xs text-muted-foreground">Sorties (dépenses)</p>
              <p className="text-xl font-bold text-destructive">
                −{totalExpenses.toLocaleString("fr-FR")}
              </p>
            </div>
            <div
              className={`rounded-lg border p-4 ${
                caisse >= 0
                  ? "bg-primary/5"
                  : "bg-destructive/10 border-destructive/50"
              }`}
            >
              <p className="text-xs text-muted-foreground">Solde</p>
              <p
                className={`text-xl font-bold ${
                  caisse >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {caisse.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}