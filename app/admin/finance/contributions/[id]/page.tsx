import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { updateAllContributionAmounts } from "../../actions";
import { AttributionsList } from "./attributions-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ContributionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const contribution = await prisma.contribution.findUnique({
    where: { id },
    include: {
      month: true,
      promotion: true,
      department: true,
      attributions: {
        include: {
          student: { include: { department: true, promotion: true } },
        },
        orderBy: { student: { lastName: "asc" } },
      },
    },
  });
  if (!contribution) notFound();

  const totalDue = contribution.attributions.reduce(
    (s, a) => s + Number(a.amount),
    0
  );
  const totalPaid = contribution.attributions.reduce(
    (s, a) => s + Number(a.paidAmount),
    0
  );
  const closed = contribution.month.status === "CLOSED";

  const attributions = contribution.attributions.map((a) => ({
    id: a.id,
    studentName: `${a.student.lastName} ${a.student.middleName ?? ""} ${
      a.student.firstName
    }`.trim(),
    departmentName: a.student.department.name,
    promotionName: a.student.promotion.name,
    baseAmount: Number(a.baseAmount),
    carriedDebt: Number(a.carriedDebt),
    amount: Number(a.amount),
    paidAmount: Number(a.paidAmount),
    status: a.status as "PENDING" | "PARTIAL" | "PAID",
    rolledOver: Boolean(a.rolledOverAt),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{contribution.label}</h1>
        <p className="text-sm text-muted-foreground">
          {contribution.month.label} ·{" "}
          {Number(contribution.amount).toLocaleString("fr-FR")} ·{" "}
          {totalPaid.toLocaleString("fr-FR")} payés sur{" "}
          {totalDue.toLocaleString("fr-FR")} ·{" "}
          {closed ? "mois clôturé" : "mois ouvert"}
        </p>
      </div>

      {!closed && (
        <Card>
          <CardHeader>
            <CardTitle>Modifier collectivement</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={updateAllContributionAmounts}
              className="flex gap-2 items-end"
            >
              <input
                type="hidden"
                name="contributionId"
                value={contribution.id}
              />
              <Input
                name="baseAmount"
                type="number"
                step="0.01"
                defaultValue={Number(contribution.amount)}
              />
              <Button type="submit">Appliquer à tous</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Le montant appliqué exclut la dette reportée. Total dû = nouveau
              montant + dette.
            </p>
          </CardContent>
        </Card>
      )}

      <AttributionsList
        attributions={attributions}
        contributionId={contribution.id}
        closed={closed}
      />
    </div>
  );
}