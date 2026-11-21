import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { createMinistry } from "../actions";
import { MemberCard } from "./member-card";
import { NewMemberForm } from "./new-member-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, memberSortKey } from "@/lib/committee";
import { deleteMinistry } from "../actions";
import { Trash2 } from "lucide-react";

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;

  const committee = await prisma.committee.findUnique({
    where: { id },
    include: {
      ministries: {
        orderBy: { displayOrder: "asc" },
        include: {
          members: true,
        },
      },
      members: {
        where: { ministryId: null },
      },
    },
  });
  if (!committee) notFound();

  const archived = committee.status === "ARCHIVED";

  // Trie les membres du top
  const topMembers = [...committee.members].sort(
    (a, b) =>
      memberSortKey(a as any)[0] - memberSortKey(b as any)[0] ||
      memberSortKey(a as any)[1] - memberSortKey(b as any)[1] ||
      a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{committee.name}</h1>
          <p className="text-sm text-muted-foreground">
            Mandat {committee.year}
          </p>
        </div>
        {archived && <Badge variant="secondary">Archivé (lecture seule)</Badge>}
      </div>

      {/* BUREAU (délégué, dirCab, etc.) */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Bureau exécutif</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun membre du bureau pour le moment.
            </p>
          )}
          {topMembers.map((m) => (
            <MemberCard
              key={m.id}
              member={{
                id: m.id,
                fullName: m.fullName,
                role: m.role,
                roleLabel: m.roleLabel,
                photoUrl: m.photoUrl,
                email: m.email,
                phone: m.phone,
                whatsapp: m.whatsapp,
                bio: m.bio,
                ministryId: m.ministryId,
              }}
              committeeId={committee.id}
              ministries={committee.ministries.map((mi) => ({ id: mi.id, name: mi.name }))}
              archived={archived}
            />
          ))}
        </div>
      </section>

      {/* Ministères */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ministères</h2>
        </div>

        {!archived && (
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un ministère</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createMinistry} className="flex gap-2">
                <input type="hidden" name="committeeId" value={committee.id} />
                <Input
                  name="name"
                  placeholder="Ex : Ministère de l'Environnement"
                  required
                />
                <Button type="submit">Ajouter</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {committee.ministries.map((ministry) => {
          const sorted = [...ministry.members].sort(
            (a, b) =>
              memberSortKey(a as any)[0] - memberSortKey(b as any)[0] ||
              a.fullName.localeCompare(b.fullName)
          );

          return (
            <Card key={ministry.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{ministry.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {sorted.length} membre(s)
                  </p>
                </div>
                {!archived && ministry.kind === "AUTRE" && (
                  <form action={deleteMinistry.bind(null, ministry.id, committee.id)}>
                    <Button type="submit" variant="ghost" size="icon" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {sorted.map((m) => (
                    <MemberCard
                      key={m.id}
                      member={{
                        id: m.id,
                        fullName: m.fullName,
                        role: m.role,
                        roleLabel: m.roleLabel,
                        photoUrl: m.photoUrl,
                        email: m.email,
                        phone: m.phone,
                        whatsapp: m.whatsapp,
                        bio: m.bio,
                        ministryId: m.ministryId,
                      }}
                      committeeId={committee.id}
                      ministries={committee.ministries.map((mi) => ({
                        id: mi.id,
                        name: mi.name,
                      }))}
                      archived={archived}
                    />
                  ))}
                  {sorted.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucun ministre.
                    </p>
                  )}
                </div>

                {!archived && (
                  <NewMemberForm
                    committeeId={committee.id}
                    ministryId={ministry.id}
                    ministries={committee.ministries.map((mi) => ({
                      id: mi.id,
                      name: mi.name,
                    }))}
                    defaultRole="MINISTRE"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Ajouter un membre du bureau */}
      {!archived && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un membre du bureau</CardTitle>
          </CardHeader>
          <CardContent>
            <NewMemberForm
              committeeId={committee.id}
              ministryId={null}
              ministries={committee.ministries.map((mi) => ({
                id: mi.id,
                name: mi.name,
              }))}
              defaultRole="DELEGUE"
              topOnly
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}