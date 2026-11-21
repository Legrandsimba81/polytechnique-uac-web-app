import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { createDepartment } from "../../actions";
import { DepartmentBlock } from "./department-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      departments: {
        include: {
          students: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }] },
        },
      },
    },
  });
  if (!promotion) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{promotion.name}</h1>
        <p className="text-sm text-muted-foreground">{promotion.academicYear}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un département</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDepartment} className="flex gap-2">
            <input type="hidden" name="promotionId" value={promotion.id} />
            <Input name="name" placeholder="Génie Civil, Informatique…" required />
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {promotion.departments.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun département.</p>
        )}
        {promotion.departments.map((d) => (
          <DepartmentBlock
            key={d.id}
            departmentId={d.id}
            departmentName={d.name}
            promotionId={promotion.id}
            students={d.students.map((s) => ({
              id: s.id,
              firstName: s.firstName,
              middleName: s.middleName,
              lastName: s.lastName,
            }))}
          />
        ))}
      </div>
    </div>
  );
}