"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Search,
  Trash2,
  Power,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deleteUser,
  toggleUserActive,
  updateUserRole,
} from "./actions";

type UserRole = "USER" | "STUDENT" | "FINANCE" | "ADMIN" | "SUPER_ADMIN";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

const ROLE_LABEL: Record<UserRole, string> = {
  USER: "Utilisateur",
  STUDENT: "Étudiant",
  FINANCE: "Finance",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

const ROLE_VARIANT: Record<
  UserRole,
  "default" | "secondary" | "outline" | "destructive"
> = {
  USER: "secondary",
  STUDENT: "outline",
  FINANCE: "outline",
  ADMIN: "default",
  SUPER_ADMIN: "destructive",
};

const ALL_ROLES: readonly UserRole[] = [
  "USER",
  "STUDENT",
  "FINANCE",
  "ADMIN",
  "SUPER_ADMIN",
];

export function UsersList({
  users,
  selfId,
}: {
  users: UserRow[];
  selfId: string;
}) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.isActive) return false;
      if (statusFilter === "INACTIVE" && u.isActive) return false;
      if (!s) return true;
      const hay = `${u.name ?? ""} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [users, q, roleFilter, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: filtered.length,
      active: filtered.filter((u) => u.isActive).length,
      inactive: filtered.filter((u) => !u.isActive).length,
    };
  }, [filtered]);

  function handleDelete(user: UserRow) {
    const ok = window.confirm(
      `Supprimer définitivement "${user.name ?? user.email ?? user.id}" ?\n\nLes articles, likes et commentaires de cet utilisateur seront aussi supprimés.`
    );
    if (!ok) return;

    setError(null);
    start(async () => {
      try {
        await deleteUser(user.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors de la suppression.");
      }
    });
  }

  function handleToggleActive(user: UserRow) {
    setError(null);
    start(async () => {
      try {
        await toggleUserActive(user.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur.");
      }
    });
  }

  function handleRoleChange(user: UserRow, newRole: UserRole) {
    if (newRole === user.role) return;
    setError(null);
    start(async () => {
      try {
        await updateUserRole(user.id, newRole);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Erreur lors du changement de rôle."
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche + filtres */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "ALL" | UserRole)}
          className="rounded-md border px-3 py-2 text-sm bg-background"
        >
          <option value="ALL">Tous les rôles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
          }
          className="rounded-md border px-3 py-2 text-sm bg-background"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INACTIVE">Inactifs</option>
        </select>
      </div>

      {/* Compteurs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary">Total : {counts.total}</Badge>
        <Badge variant="default">Actifs : {counts.active}</Badge>
        <Badge variant="destructive">Inactifs : {counts.inactive}</Badge>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste */}
      <div className="rounded-lg border divide-y">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun utilisateur ne correspond.
          </p>
        )}

        {filtered.map((u) => {
          const isSelf = u.id === selfId;
          return (
            <div
              key={u.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Infos */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">
                    {u.name ?? "—"}
                    {isSelf && (
                      <span className="ml-2 text-xs text-primary font-normal">
                        (vous)
                      </span>
                    )}
                  </p>
                  <Badge variant={ROLE_VARIANT[u.role]} className="text-xs">
                    {ROLE_LABEL[u.role]}
                  </Badge>
                  {!u.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactif
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {u.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {u.email}
                    </span>
                  )}
                  {u.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {u.phone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inscrit le{" "}
                  {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Changement de rôle */}
                <select
                  value={u.role}
                  onChange={(e) =>
                    handleRoleChange(u, e.target.value as UserRole)
                  }
                  disabled={pending || isSelf}
                  className="rounded-md border px-2 py-1 text-xs bg-background disabled:opacity-50"
                  aria-label="Changer le rôle"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>

                {/* Activer / désactiver */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(u)}
                  disabled={pending || isSelf}
                  title={u.isActive ? "Désactiver" : "Activer"}
                  aria-label={u.isActive ? "Désactiver" : "Activer"}
                >
                  <Power
                    className={`h-4 w-4 ${
                      u.isActive ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  />
                </Button>

                {/* Supprimer */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(u)}
                  disabled={pending || isSelf}
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}