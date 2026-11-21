"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type StudentStatus = "PENDING" | "PARTIAL" | "PAID" | "NA";

type Student = {
  id: string;
  lastName: string;
  middleName: string | null;
  firstName: string;
  department: string;
  due: number;
  paid: number;
  status: StudentStatus;
};

const STATUS_LABEL: Record<StudentStatus, string> = {
  PENDING: "En attente",
  PARTIAL: "Partiel",
  PAID: "À jour",
  NA: "Non concerné",
};

const STATUS_VARIANT: Record<
  StudentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "destructive",
  PARTIAL: "outline",
  PAID: "default",
  NA: "secondary",
};

export function StudentsList({
  students,
  departments,
  promotionName,
}: {
  students: Student[];
  departments: string[];
  promotionName: string;
}) {
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState<string>("ALL");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return students.filter((st) => {
      const matchDept = department === "ALL" || st.department === department;
      if (!matchDept) return false;
      if (!s) return true;
      const full = `${st.lastName} ${st.middleName ?? ""} ${st.firstName} ${st.department}`.toLowerCase();
      return full.includes(s);
    });
  }, [students, q, department]);

  const counts = useMemo(() => {
    const base = { total: filtered.length, paid: 0, partial: 0, pending: 0, na: 0 };
    for (const st of filtered) {
      if (st.status === "PAID") base.paid++;
      else if (st.status === "PARTIAL") base.partial++;
      else if (st.status === "PENDING") base.pending++;
      else base.na++;
    }
    return base;
  }, [filtered]);

  return (
    <div className="space-y-3">
      {/* Barre de filtres */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom ou département…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm bg-background"
          aria-label="Filtrer par département"
        >
          <option value="ALL">Tous les départements</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Résumé */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary">Total : {counts.total}</Badge>
        <Badge variant="default">À jour : {counts.paid}</Badge>
        <Badge variant="outline">Partiel : {counts.partial}</Badge>
        <Badge variant="destructive">En attente : {counts.pending}</Badge>
        {counts.na > 0 && (
          <Badge variant="secondary">Non concernés : {counts.na}</Badge>
        )}
      </div>

      {/* Liste */}
      <div className="rounded-lg border divide-y">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun étudiant ne correspond aux filtres.
          </p>
        )}

        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm">
                {s.lastName} {s.middleName ?? ""} {s.firstName}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.department} · {promotionName}
              </p>
              {s.status !== "NA" && (
                <p className="text-xs text-muted-foreground">
                  {s.paid.toLocaleString("fr-FR")} /{" "}
                  {s.due.toLocaleString("fr-FR")} payés
                </p>
              )}
            </div>

            <Badge variant={STATUS_VARIANT[s.status]} className="self-start sm:self-auto">
              {STATUS_LABEL[s.status]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}