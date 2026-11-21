import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { NewContributionForm } from "./new-contribution-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewContributionPage() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const openMonth = await prisma.month.findFirst({ where: { status: "OPEN" } });
  if (!openMonth) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Nouvelle contribution</h1>
        <Card>
          <CardHeader>
            <CardTitle>Aucun mois ouvert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vous devez ouvrir un mois avant de créer une contribution.
            </p>
            <Button asChild>
              <Link href="/admin/finance/months">Gérer les mois</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [promotions, students] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: { academicYear: "desc" },
      include: {
        departments: {
          orderBy: { name: "asc" },
          include: {
            students: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }] },
          },
        },
      },
    }),
    prisma.student.findMany({
      include: {
        department: true,
        promotion: true,
      },
    }),
  ]);

  const flatPromotions = promotions.map((p) => ({
    id: p.id,
    name: p.name,
    academicYear: p.academicYear,
    departments: p.departments.map((d) => ({
      id: d.id,
      name: d.name,
      students: d.students.map((s) => ({
        id: s.id,
        lastName: s.lastName,
        middleName: s.middleName,
        firstName: s.firstName,
      })),
    })),
  }));

  const flatStudents = students.map((s) => ({
    id: s.id,
    lastName: s.lastName,
    middleName: s.middleName,
    firstName: s.firstName,
    departmentName: s.department.name,
    promotionName: s.promotion.name,
  }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle contribution</h1>
        <p className="text-sm text-muted-foreground">
          Mois en cours : <strong>{openMonth.label}</strong>
        </p>
      </div>
      <NewContributionForm
        monthId={openMonth.id}
        promotions={flatPromotions}
        students={flatStudents}
      />
    </div>
  );
}