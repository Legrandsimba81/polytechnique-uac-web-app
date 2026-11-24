import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, memberSortKey } from "@/lib/committee";
import { Mail, Phone, MessageCircle } from "lucide-react";

export const metadata = { title: "Le Comité" };
export const dynamic = "force-dynamic";

export default async function ComitePage() {
  const active = await prisma.committee.findFirst({
    where: { status: "ACTIVE" },
    include: {
      ministries: {
        orderBy: { displayOrder: "asc" },
        include: {
          members: {
            orderBy: [{ role: "asc" }, { fullName: "asc" }],
          },
        },
      },
      members: { where: { ministryId: null } },
    },
  });

  const archived = await prisma.committee.findMany({
    where: { status: "ARCHIVED" },
    orderBy: { year: "desc" },
    include: { _count: { select: { members: true } } },
  });

  if (!active) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold">Le Comité</h1>
        <p className="text-muted-foreground mt-4">
          Aucun comité actif pour le moment.
        </p>
      </div>
    );
  }

  const topMembers = [...active.members].sort(
    (a, b) =>
      memberSortKey(a as any)[0] - memberSortKey(b as any)[0] ||
      a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="container py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Le Comité des Étudiants</h1>
        <p className="text-muted-foreground mt-1">
          {active.name} · Mandat {active.year}
        </p>
      </div>

      {/* Bureau */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Bureau exécutif</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topMembers.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </section>

      {/* Ministères */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Ministères</h2>
        {active.ministries.map((ministry) => {
          const sorted = [...ministry.members].sort((a, b) => {
            const ministres = a.role === "MINISTRE" ? 0 : 1;
            const ministresB = b.role === "MINISTRE" ? 0 : 1;
            return ministres - ministresB || a.fullName.localeCompare(b.fullName);
          });
          if (sorted.length === 0) return null;

          return (
            <div key={ministry.id} className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">
                {ministry.name}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((m) => (
                  <MemberCard key={m.id} member={m} compact />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Archives */}
      {archived.length > 0 && (
        <section className="space-y-4 pt-8 border-t">
          <h2 className="text-2xl font-semibold">Archives</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-4">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  Mandat {c.year} · {c._count.members} membres
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberCard({
  member,
  compact = false,
}: {
  member: {
    fullName: string;
    role: string;
    roleLabel: string | null;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    bio: string | null;
  };
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex gap-3 items-start">
      <Avatar name={member.fullName} src={member.photoUrl} size={compact ? 48 : 64} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{member.fullName}</p>
        <Badge variant="secondary" className="mt-1 text-xs">
          {member.roleLabel ?? ROLE_LABEL[member.role]}
        </Badge>
        {member.bio && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {member.bio}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <Mail className="h-3 w-3" /> Email
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              <Phone className="h-3 w-3" /> Appeler
            </a>
          )}
          {member.whatsapp && (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-emerald-500"
            >
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}