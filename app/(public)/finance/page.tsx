import { prisma } from "@/lib/prisma";
import { FinanceCharts } from "./finance-charts";
import { StudentsList } from "./students-list";

export const metadata = { title: "Finance" };

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ monthId?: string; promotionId?: string }>;
}) {
  const { monthId, promotionId } = await searchParams;

  const months = await prisma.month.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
    include: {
      contributions: {
        include: { attributions: true },
      },
    },
  });

  if (months.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground mt-4">Aucune donnée disponible.</p>
      </div>
    );
  }

  const selected =
    months.find((m) => m.id === monthId) ??
    months.find((m) => m.status === "OPEN") ??
    months[months.length - 1];

  // ── Chart : évolution par mois
  const monthStats = months.map((m) => {
    const all = m.contributions.flatMap((c) => c.attributions);
    const due = all.reduce((s, a) => s + Number(a.amount), 0);
    const paid = all.reduce((s, a) => s + Number(a.paidAmount), 0);
    const debt = all.reduce((s, a) => s + Number(a.carriedDebt), 0);
    return { id: m.id, label: m.label, due, paid, debt, count: all.length };
  });

  // ── KPIs du mois sélectionné
  const selectedAttributions = selected.contributions.flatMap(
    (c) => c.attributions
  );
  const totalDue = selectedAttributions.reduce(
    (s, a) => s + Number(a.amount),
    0
  );
  const totalPaid = selectedAttributions.reduce(
    (s, a) => s + Number(a.paidAmount),
    0
  );

  // ── Vue globale tous mois + dépenses
  const [globalCollected, expensesSum, expenseList] = await Promise.all([
    prisma.studentContribution.aggregate({
      _sum: { paidAmount: true, amount: true },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const totalAllCollected = Number(globalCollected._sum.paidAmount ?? 0);
  const totalAllExpected = Number(globalCollected._sum.amount ?? 0);
  const totalExpenses = Number(expensesSum._sum.amount ?? 0);
  const resteTotal = totalAllExpected - totalAllCollected;
  const caisse = totalAllCollected - totalExpenses;

  // ── Promotions + étudiants + contributions du mois
  const promotions = await prisma.promotion.findMany({
    orderBy: { academicYear: "desc" },
    include: {
      departments: {
        orderBy: { name: "asc" },
        include: {
          students: {
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            include: {
              contributions: {
                where: { contribution: { monthId: selected.id } },
              },
            },
          },
        },
      },
    },
  });

  // ── Stats par promotion
  const promotionStats = promotions.map((p) => {
    const allStudents = p.departments.flatMap((d) => d.students);
    const total = allStudents.length;
    const contributed = allStudents.filter(
      (s) =>
        s.contributions.reduce((sum, c) => sum + Number(c.paidAmount), 0) > 0
    ).length;
    const expected = allStudents.reduce(
      (sum, s) =>
        sum + s.contributions.reduce((acc, c) => acc + Number(c.amount), 0),
      0
    );
    const collected = allStudents.reduce(
      (sum, s) =>
        sum + s.contributions.reduce((acc, c) => acc + Number(c.paidAmount), 0),
      0
    );
    return {
      id: p.id,
      name: p.name,
      academicYear: p.academicYear,
      total,
      contributed,
      expected,
      collected,
    };
  });

  // ── Promotion affichée pour la liste étudiants
  const currentPromotion =
    promotions.find((p) => p.id === promotionId) ?? promotions[0];

  const allStudents = currentPromotion
    ? currentPromotion.departments.flatMap((d) =>
        d.students.map((s) => {
          const due = s.contributions.reduce(
            (sum, c) => sum + Number(c.amount),
            0
          );
          const paid = s.contributions.reduce(
            (sum, c) => sum + Number(c.paidAmount),
            0
          );
          const status: "PENDING" | "PARTIAL" | "PAID" | "NA" =
            due === 0
              ? "NA"
              : paid <= 0
              ? "PENDING"
              : paid >= due
              ? "PAID"
              : "PARTIAL";
          return {
            id: s.id,
            lastName: s.lastName,
            middleName: s.middleName,
            firstName: s.firstName,
            department: d.name,
            due,
            paid,
            status,
          };
        })
      )
    : [];

  const departmentNames = currentPromotion
    ? currentPromotion.departments.map((d) => d.name)
    : [];

  return (
    <div className="container py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground mt-1">
          Contributions étudiantes — transparence et suivi par mois
        </p>
      </div>

      {/* Sélecteur de mois */}
      <form method="GET" className="flex items-center gap-2">
        <label className="text-sm font-medium">Mois :</label>
        <select
          name="monthId"
          defaultValue={selected.id}
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

      {/* KPIs du mois */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Total dû ({selected.label})
          </p>
          <p className="text-3xl font-bold">{totalDue.toLocaleString("fr-FR")}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total payé</p>
          <p className="text-3xl font-bold text-primary">
            {totalPaid.toLocaleString("fr-FR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Taux</p>
          <p className="text-3xl font-bold">
            {totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0}%
          </p>
        </div>
      </div>

      <FinanceCharts monthStats={monthStats} selected={selected.label} />

      

      {/* Stats par promotion */}
      <section className="space-y-4 pt-8 border-t">
        <h2 className="text-xl font-semibold">
          Statistiques par promotion — {selected.label}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotionStats.map((p) => {
            const percent =
              p.total > 0 ? Math.round((p.contributed / p.total) * 100) : 0;
            const moneyPercent =
              p.expected > 0 ? Math.round((p.collected / p.expected) * 100) : 0;
            return (
              <div key={p.id} className="rounded-xl border bg-card p-5 space-y-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.academicYear}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Étudiants</p>
                    <p className="text-xl font-bold">{p.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Ont contribué
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {p.contributed}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Participation</span>
                    <span className="font-medium">
                      {p.contributed}/{p.total} · {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Collecte</span>
                    <span className="font-medium">
                      {p.collected.toLocaleString("fr-FR")} /{" "}
                      {p.expected.toLocaleString("fr-FR")} · {moneyPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${moneyPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filtre promotion + liste étudiants */}
      <section className="space-y-4 pt-8 border-t">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Étudiants</h2>
            <p className="text-sm text-muted-foreground">
              Statuts de paiement pour {selected.label}
            </p>
          </div>

          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="monthId" value={selected.id} />
            <label className="text-sm font-medium">Promotion :</label>
            <select
              name="promotionId"
              defaultValue={currentPromotion?.id}
              className="rounded-md border px-3 py-1.5 text-sm bg-background"
            >
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.academicYear}
                </option>
              ))}
            </select>
            <button type="submit" className="text-sm underline">
              Afficher
            </button>
          </form>
        </div>

        {currentPromotion && (
          <StudentsList
            students={allStudents}
            departments={departmentNames}
            promotionName={`${currentPromotion.name} — ${currentPromotion.academicYear}`}
          />
        )}
      </section>

      {/* ── SECTION CAISSE GLOBALE + DÉPENSES ── */}
      <section className="space-y-6 pt-8 border-t">
        <div>
          <h2 className="text-2xl font-semibold">Gestion de la caisse</h2>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble des finances du comité (tous mois confondus)
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total collecté</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalAllCollected.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Reste à payer</p>
            <p className="text-2xl font-bold text-orange-500">
              {resteTotal.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total dépenses</p>
            <p className="text-2xl font-bold text-destructive">
              {totalExpenses.toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Caisse disponible</p>
            <p
              className={`text-2xl font-bold ${
                caisse >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              }`}
            >
              {caisse.toLocaleString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Dernières dépenses */}
        {expenseList.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Dernières dépenses ({expenseList.length})
            </h3>
            <div className="rounded-lg border divide-y">
              {expenseList.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {e.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-destructive shrink-0">
                    −{Number(e.amount).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {expenseList.length === 0 && (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Aucune dépense enregistrée pour le moment.
          </div>
        )}
      </section>
    </div>
  );
}