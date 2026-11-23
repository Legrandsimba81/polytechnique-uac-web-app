"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DEPARTMENT_LABEL,
  PROJECT_TYPES,
  type ProjectDepartment,
} from "@/lib/innovations";

export function InnovationFilters({
  initialQ,
  initialDept,
  initialType,
  initialSort,
}: {
  initialQ: string;
  initialDept: string;
  initialType: string;
  initialSort: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [dept, setDept] = useState(initialDept);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [, start] = useTransition();

  function apply(next?: Partial<Record<string, string>>) {
    const params = new URLSearchParams(sp.toString());
    const values = { q, dept, type, sort, ...next };
    for (const [k, v] of Object.entries(values)) {
      if (
        !v ||
        v === "ALL" ||
        (k === "sort" && v === "recent") ||
        (k === "q" && v === "")
      ) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }
    start(() => router.push(`/innovation?${params.toString()}`));
  }

  const availableTypes =
    dept === "ALL" ? [] : PROJECT_TYPES[dept as ProjectDepartment] ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="pl-9"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => {
            setDept(e.target.value);
            setType("ALL");
            apply({ dept: e.target.value, type: "ALL" });
          }}
          className="rounded-md border px-3 py-2 text-sm bg-background"
        >
          <option value="ALL">Tous les départements</option>
          {(Object.keys(DEPARTMENT_LABEL) as ProjectDepartment[]).map((d) => (
            <option key={d} value={d}>
              {DEPARTMENT_LABEL[d]}
            </option>
          ))}
        </select>
        {availableTypes.length > 0 && (
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              apply({ type: e.target.value });
            }}
            className="rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="ALL">Tous les types</option>
            {availableTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            apply({ sort: e.target.value });
          }}
          className="rounded-md border px-3 py-2 text-sm bg-background"
        >
          <option value="recent">Plus récents</option>
          <option value="popular">Plus populaires</option>
        </select>
        <Button onClick={() => apply()} type="button">
          Rechercher
        </Button>
      </div>
    </div>
  );
}