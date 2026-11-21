"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Wallet,
  TrendingDown,
  Calendar,
  Receipt,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  UserCog,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "FINANCE" | "ADMIN" | "SUPER_ADMIN";

type NavLeaf = {
  href: string;
  label: string;
  icon: any;
  roles: Role[];
};

type NavGroup = {
  label: string;
  icon: any;
  roles: Role[];
  /** Préfixe d'URL pour déterminer si le groupe est actif */
  matchPrefix: string;
  children: NavLeaf[];
};

type NavEntry = NavLeaf | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return (entry as NavGroup).children !== undefined;
}

const navEntries: NavEntry[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    href: "/admin/articles",
    label: "Articles",
    icon: FileText,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    href: "/admin/comite",
    label: "Comité",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: MessageSquare,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Finance",
    icon: Wallet,
    roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
    matchPrefix: "/admin/finance",
    children: [
      {
        href: "/admin/finance",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
      },
      {
        href: "/admin/finance/months",
        label: "Mois",
        icon: Calendar,
        roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
      },
      {
        href: "/admin/finance/promotions",
        label: "Promotions",
        icon: GraduationCap,
        roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
      },
      {
        href: "/admin/finance/contributions",
        label: "Contributions",
        icon: Receipt,
        roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
      },
      {
        href: "/admin/finance/depenses",
        label: "Dépenses",
        icon: TrendingDown,
        roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];

const superAdminEntries: NavLeaf[] = [
  {
    href: "/admin/utilisateurs",
    label: "Utilisateurs",
    icon: UserCog,
    roles: ["SUPER_ADMIN"],
  },
  {
    href: "/admin/parametres",
    label: "Paramètres",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
];

function NavContent({
  role,
  pathname,
  onNavigate,
}: {
  role: Role;
  pathname: string;
  onNavigate?: () => void;
}) {
  // État d'ouverture des groupes (ouvert par défaut si la route active est dedans)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const entry of navEntries) {
      if (isGroup(entry)) {
        const active = pathname.startsWith(entry.matchPrefix);
        if (active) init[entry.label] = true;
      }
    }
    setOpenGroups((prev) => ({ ...init, ...prev }));
  }, [pathname]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isLeafActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/finance") return pathname === "/admin/finance";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const visibleEntries = navEntries.filter((e) =>
    isGroup(e)
      ? e.roles.includes(role)
      : e.roles.includes(role)
  );
  const visibleSuper = superAdminEntries.filter((e) => e.roles.includes(role));

  return (
    <div className="flex flex-col gap-1">
      <div className="px-2 py-3 text-sm font-semibold tracking-tight text-foreground">
        Admin Panel
      </div>

      {visibleEntries.map((entry) => {
        if (!isGroup(entry)) {
          const Icon = entry.icon;
          const active = isLeafActive(entry.href);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{entry.label}</span>
            </Link>
          );
        }

        // GROUPE (Finance)
        const GroupIcon = entry.icon;
        const isOpen = !!openGroups[entry.label];
        const hasActiveChild = pathname.startsWith(entry.matchPrefix);

        return (
          <div key={entry.label} className="flex flex-col">
            <button
              type="button"
              onClick={() => toggleGroup(entry.label)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                hasActiveChild
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <GroupIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{entry.label}</span>
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="mt-1 flex flex-col gap-0.5 pl-3">
                {entry.children
                  .filter((child) => child.roles.includes(role))
                  .map((child) => {
                    const ChildIcon = child.icon;
                    const active = isLeafActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/5 font-medium text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}

      {visibleSuper.length > 0 && (
        <>
          <div className="mt-4 px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Super admin
          </div>
          {visibleSuper.map((entry) => {
            const Icon = entry.icon;
            const active = isLeafActive(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{entry.label}</span>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        <span className="text-xs font-medium text-muted-foreground">
          Administration
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-3/4 max-w-xs flex-col overflow-y-auto border-r border-border bg-card p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1.5 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavContent
              role={role}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside className="hidden border-r border-border bg-card p-4 md:flex md:flex-col md:overflow-y-auto">
        <NavContent role={role} pathname={pathname} />
      </aside>
    </>
  );
}