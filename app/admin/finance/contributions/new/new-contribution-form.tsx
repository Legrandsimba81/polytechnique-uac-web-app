"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { createContribution } from "../../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type StudentLite = { id: string; lastName: string; middleName: string | null; firstName: string };
type DepartmentLite = { id: string; name: string; students: StudentLite[] };
type PromotionLite = { id: string; name: string; academicYear: string; departments: DepartmentLite[] };
type FlatStudent = StudentLite & { departmentName: string; promotionName: string };

type Frequency = "WEEKLY" | "MONTHLY" | "ANNUAL";
type Target = "ALL" | "PROMOTION" | "DEPARTMENT" | "STUDENT";

const DEFAULT_AMOUNT_KEY = "finance.defaultAmount";

function defaultLabel(freq: Frequency, date = new Date()): string {
  const year = date.getFullYear();
  if (freq === "WEEKLY") {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `Cotisation semaine du ${dd}/${mm}/${year}`;
  }
  if (freq === "MONTHLY") {
    const m = date.toLocaleDateString("fr-FR", { month: "long" });
    return `Cotisation du mois de ${m} ${year}`;
  }
  return `Cotisation annuelle ${year}`;
}

export function NewContributionForm({
  monthId,
  promotions,
  students,
}: {
  monthId: string;
  promotions: PromotionLite[];
  students: FlatStudent[];
}) {
  const [frequency, setFrequency] = useState<Frequency>("MONTHLY");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState(defaultLabel("MONTHLY"));
  const [labelTouched, setLabelTouched] = useState(false);

  const [target, setTarget] = useState<Target>("ALL");
  const [promotionId, setPromotionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(DEFAULT_AMOUNT_KEY);
    if (saved) setAmount(saved);
  }, []);

  useEffect(() => {
    if (!labelTouched) setLabel(defaultLabel(frequency));
  }, [frequency, labelTouched]);

  useEffect(() => {
    if (amount && Number(amount) > 0)
      window.localStorage.setItem(DEFAULT_AMOUNT_KEY, amount);
  }, [amount]);

  // Départements filtrés
  const departments = useMemo(() => {
    if (target === "DEPARTMENT" && promotionId) {
      return promotions.find((p) => p.id === promotionId)?.departments ?? [];
    }
    if (target === "DEPARTMENT") return promotions.flatMap((p) => p.departments);
    return [];
  }, [target, promotionId, promotions]);

  // Étudiants pour le picker
  const allStudents = useMemo(() => students, [students]);
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allStudents;
    return allStudents.filter((s) =>
      `${s.lastName} ${s.middleName ?? ""} ${s.firstName} ${s.departmentName} ${s.promotionName}`
        .toLowerCase()
        .includes(q)
    );
  }, [allStudents, search]);

  const selectedStudent = allStudents.find((s) => s.id === studentId);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (target === "DEPARTMENT" && !departmentId) {
      e.preventDefault();
      alert("Sélectionnez un département.");
    }
    if (target === "PROMOTION" && !promotionId) {
      e.preventDefault();
      alert("Sélectionnez une promotion.");
    }
    if (target === "STUDENT" && !studentId) {
      e.preventDefault();
      alert("Sélectionnez un étudiant.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createContribution} onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="monthId" value={monthId} />

          <div className="space-y-1">
            <Label htmlFor="label">Libellé</Label>
            <Input
              id="label"
              name="label"
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setLabelTouched(true);
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
              />
              <p className="text-xs text-muted-foreground">
                Montant mémorisé pour les prochaines contributions.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="frequency">Fréquence</Label>
              <select
                id="frequency"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="MONTHLY">Mensuelle</option>
                <option value="ANNUAL">Annuelle</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Portée</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
              {[
                { value: "ALL", label: "Toutes promotions" },
                { value: "PROMOTION", label: "Une promotion" },
                { value: "DEPARTMENT", label: "Un département" },
                { value: "STUDENT", label: "Un étudiant" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${
                    target === opt.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="target"
                    value={opt.value}
                    checked={target === opt.value}
                    onChange={() => {
                      setTarget(opt.value as Target);
                      setPromotionId("");
                      setDepartmentId("");
                      setStudentId("");
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {(target === "PROMOTION" || target === "DEPARTMENT") && (
            <div className="space-y-1">
              <Label>Promotion</Label>
              <select
                name="promotionId"
                value={promotionId}
                onChange={(e) => {
                  setPromotionId(e.target.value);
                  setDepartmentId("");
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required={target === "PROMOTION"}
              >
                <option value="">— Sélectionner —</option>
                {promotions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.academicYear}
                  </option>
                ))}
              </select>
            </div>
          )}

          {target === "DEPARTMENT" && (
            <div className="space-y-1">
              <Label>Département</Label>
              <select
                name="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!promotionId}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">— Sélectionner —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.students.length} étudiants)
                  </option>
                ))}
              </select>
            </div>
          )}

          {target === "STUDENT" && (
            <div className="space-y-1">
              <Label>Étudiant</Label>
              <input type="hidden" name="studentId" value={studentId} />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <span className="truncate text-left">
                  {selectedStudent
                    ? `${selectedStudent.lastName} ${selectedStudent.middleName ?? ""} ${selectedStudent.firstName} · ${selectedStudent.departmentName}`
                    : "Sélectionner un étudiant…"}
                </span>
                <Search className="h-4 w-4 opacity-60 ml-2 shrink-0" />
              </button>
            </div>
          )}

          <Button type="submit" className="w-full">
            Créer et attribuer
          </Button>
        </form>
      </CardContent>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-card p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Choisir un étudiant ({allStudents.length})</h3>
              <button onClick={() => setPickerOpen(false)} className="rounded-md p-1.5 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom, département, promotion…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="mt-3 max-h-80 divide-y overflow-y-auto rounded-lg border">
              {filteredStudents.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">Aucun résultat.</p>
              )}
              {filteredStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStudentId(s.id);
                    setPickerOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-accent ${
                    studentId === s.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {s.lastName} {s.middleName ?? ""} {s.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.departmentName} · {s.promotionName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border px-2 py-1 text-xs">
                    {studentId === s.id ? "Sélectionné ✓" : "Attribuer"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}