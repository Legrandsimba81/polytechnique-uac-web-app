import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { createPromotion } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function PromotionsPage() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { departments: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Promotions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Créer une promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPromotion} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" required placeholder="Promotion 2025-2026" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="academicYear">Année académique</Label>
              <Input
                id="academicYear"
                name="academicYear"
                required
                placeholder="2025-2026"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">Créer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune promotion.</p>
        )}
        {promotions.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{p.academicYear}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm">{p._count.departments} département(s)</span>
              <Button asChild size="sm">
                <Link href={`/admin/finance/promotions/${p.id}`}>Ouvrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}