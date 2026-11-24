import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  Compass,
  FileText,
  FolderGit2,
  LayoutDashboard,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ProfileForms } from "./profile-forms";

export const metadata = {
  title: "Mon profil | Espace Étudiant",
};

export const dynamic = "force-dynamic";

export default async function UserProfilePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/mon-espace/profil");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
      passwordHash: true,
      _count: {
        select: {
          projects: true,
          articles: true,
          projectLikes: true,
          articleLikes: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalLikes = user._count.projectLikes + user._count.articleLikes;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isFinance = isAdmin || user.role === "FINANCE";

  const quickLinks = [
    {
      title: "Publier un projet",
      description: "Soumettre un prototype ou une réalisation",
      href: "/mon-espace/projets/new",
      icon: Plus,
    },
    {
      title: "Mon espace",
      description: "Suivre mes projets et activités",
      href: "/mon-espace",
      icon: FolderGit2,
    },
    {
      title: "Explorer l'innovation",
      description: "Voir les projets de la faculté",
      href: "/innovation",
      icon: Compass,
    },
    {
      title: "Lire les articles",
      description: "Publications scientifiques et techniques",
      href: "/articles",
      icon: FileText,
    },
    ...(isFinance
      ? [
          {
            title: "Finance du comité",
            description: "Cotisations, promotions et dépenses",
            href: "/admin/finance",
            icon: Wallet,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Administration",
            description: "Gérer les articles, membres et utilisateurs",
            href: "/admin",
            icon: LayoutDashboard,
          },
        ]
      : []),
  ];

  return (
    <div className="container py-10 md:py-14 space-y-8">
      {/* En-tête de profil */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-accent/25 to-accent/60 dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#182208] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "Avatar"}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-primary/40"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
                {initials}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user.name ?? "Utilisateur"}
                </h1>
                <Badge
                  variant={isAdmin ? "default" : "secondary"}
                  className="font-mono text-xs"
                >
                  {user.role}
                </Badge>
                {user.emailVerified && (
                  <Badge
                    variant="outline"
                    className="gap-1 text-xs border-primary/40 text-primary"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Vérifié
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                {user.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {user._count.projects}
              </p>
              <p className="text-xs font-mono uppercase text-muted-foreground">
                Projets
              </p>
            </div>
            <div className="border-l pl-4 sm:pl-6">
              <p className="text-2xl font-bold tabular-nums">
                {user._count.articles}
              </p>
              <p className="text-xs font-mono uppercase text-muted-foreground">
                Articles
              </p>
            </div>
            <div className="border-l pl-4 sm:pl-6">
              <p className="text-2xl font-bold tabular-nums">{totalLikes}</p>
              <p className="text-xs font-mono uppercase text-muted-foreground">
                Likes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale : Formulaires + Liens rapides */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <ProfileForms
            initialName={user.name ?? ""}
            email={user.email ?? ""}
            initialPhone={user.phone}
            hasPassword={Boolean(user.passwordHash)}
          />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-mono uppercase tracking-wider">
                Liens rapides
              </CardTitle>
              <CardDescription>
                Accès direct aux fonctionnalités de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3.5 transition-all hover:border-primary/60 hover:bg-accent/40"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}