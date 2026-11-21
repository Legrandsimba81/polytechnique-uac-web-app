"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  markContributionPaid,
  markContributionsPaidByIds,
  updatePaidAmount,
  updateStudentContributionAmount,
} from "../../actions";

type Status = "PENDING" | "PARTIAL" | "PAID";
type StatusFilter = "ALL" | Status;

export type Attribution = {
  id: string;
  studentName: string;
  departmentName: string;
  promotionName: string;
  baseAmount: number;
  carriedDebt: number;
  amount: number;
  paidAmount: number;
  status: Status;
  rolledOver: boolean;
};

export function AttributionsList({
  attributions,
  contributionId,
  closed,
}: {
  attributions: Attribution[];
  contributionId: string;
  closed: boolean;
}) {
  const [q, setQ] = useState("");
  const [promotion, setPromotion] = useState<string>("ALL");
  const [department, setDepartment] = useState<string>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [pending, start] = useTransition();

  // Liste des promotions présentes
  const promotions = useMemo(() => {
    const set = new Set(attributions.map((a) => a.promotionName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [attributions]);

  // Départements filtrés par promotion
  const departments = useMemo(() => {
    const source =
      promotion === "ALL"
        ? attributions
        : attributions.filter((a) => a.promotionName === promotion);
    const set = new Set(source.map((a) => a.departmentName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [attributions, promotion]);

  const handlePromotionChange = (value: string) => {
    setPromotion(value);
    if (value === "ALL") {
      setDepartment("ALL");
    } else {
      const valid = new Set(
        attributions
          .filter((a) => a.promotionName === value)
          .map((a) => a.departmentName)
      );
      if (department !== "ALL" && !valid.has(department)) {
        setDepartment("ALL");
      }
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return attributions.filter((a) => {
      if (promotion !== "ALL" && a.promotionName !== promotion) return false;
      if (department !== "ALL" && a.departmentName !== department) return false;
      if (status !== "ALL" && a.status !== status) return false;
      if (s) {
        const full = `${a.studentName} ${a.departmentName} ${a.promotionName}`.toLowerCase();
        if (!full.includes(s)) return false;
      }
      return true;
    });
  }, [attributions, q, promotion, department, status]);

  const counts = useMemo(
    () => ({
      total: filtered.length,
      paid: filtered.filter((a) => a.status === "PAID").length,
      partial: filtered.filter((a) => a.status === "PARTIAL").length,
      pending: filtered.filter((a) => a.status === "PENDING").length,
    }),
    [filtered]
  );

  const filteredUnpaid = filtered.filter((a) => a.status !== "PAID");
  const hasActiveFilter =
    q.trim() !== "" ||
    promotion !== "ALL" ||
    department !== "ALL" ||
    status !== "ALL";

  function handleMarkFilteredPaid() {
    const ids = filteredUnpaid.map((a) => a.id);
    if (ids.length === 0) return;
    start(async () => {
      await markContributionsPaidByIds(ids, contributionId);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, département ou promotion…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            aria-label="Rechercher"
          />
        </div>

        {promotions.length > 1 && (
          <select
            value={promotion}
            onChange={(e) => handlePromotionChange(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-background"
            aria-label="Filtrer par promotion"
          >
            <option value="ALL">Toutes les promotions</option>
            {promotions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

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

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded-md border px-3 py-2 text-sm bg-background"
          aria-label="Filtrer par statut"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PAID">Payé</option>
          <option value="PARTIAL">Partiel</option>
          <option value="PENDING">En attente</option>
        </select>
      </div>

      {/* Compteurs + bouton filtré */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Total : {counts.total}</Badge>
          <Badge variant="default">Payés : {counts.paid}</Badge>
          <Badge variant="outline">Partiels : {counts.partial}</Badge>
          <Badge variant="destructive">En attente : {counts.pending}</Badge>
        </div>

        {!closed && (
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleMarkFilteredPaid}
            disabled={pending || filteredUnpaid.length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            {pending
              ? "Traitement…"
              : filteredUnpaid.length === 0
              ? "Tous payés ✓"
              : hasActiveFilter
              ? `Marquer ${filteredUnpaid.length} filtré(s) payé(s)`
              : `Tout marquer payé (${filteredUnpaid.length})`}
          </Button>
        )}
      </div>

      {/* Liste filtrée */}
      <div className="rounded-lg border divide-y">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucune attribution ne correspond aux filtres.
          </p>
        )}

        {filtered.map((a) => {
          const remaining = a.amount - a.paidAmount;
          return (
            <div
              key={a.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm">{a.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {a.promotionName} · {a.departmentName} · Base{" "}
                  {a.baseAmount.toLocaleString("fr-FR")} + Dette{" "}
                  {a.carriedDebt.toLocaleString("fr-FR")} = Total{" "}
                  {a.amount.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Payé {a.paidAmount.toLocaleString("fr-FR")} · Reste{" "}
                  <span
                    className={
                      remaining > 0 ? "text-destructive font-medium" : ""
                    }
                  >
                    {remaining.toLocaleString("fr-FR")}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!closed && (
                  <form
                    action={updateStudentContributionAmount}
                    className="flex gap-2 items-center"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      type="hidden"
                      name="contributionId"
                      value={contributionId}
                    />
                    <Input
                      name="baseAmount"
                      type="number"
                      step="0.01"
                      defaultValue={a.baseAmount}
                      className="w-24"
                      aria-label="Montant de base"
                    />
                    <Button size="sm" variant="outline" type="submit">
                      OK
                    </Button>
                  </form>
                )}

                {!closed && a.status !== "PAID" && (
                  <form action={markContributionPaid}>
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      type="hidden"
                      name="contributionId"
                      value={contributionId}
                    />
                    <Button size="sm" type="submit" variant="default">
                      Marquer payé
                    </Button>
                  </form>
                )}

                <form
                  action={updatePaidAmount}
                  className="flex gap-2 items-center"
                >
                  <input type="hidden" name="id" value={a.id} />
                  <input
                    type="hidden"
                    name="contributionId"
                    value={contributionId}
                  />
                  <Input
                    name="paidAmount"
                    type="number"
                    step="0.01"
                    defaultValue={a.paidAmount}
                    className="w-24"
                    aria-label="Montant payé"
                  />
                  <Button size="sm" variant="outline" type="submit">
                    Paiement
                  </Button>
                </form>

                <Badge
                  variant={
                    a.status === "PAID"
                      ? "default"
                      : a.status === "PARTIAL"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {a.status === "PAID"
                    ? "Payé"
                    : a.status === "PARTIAL"
                    ? "Partiel"
                    : "En attente"}
                </Badge>

                {a.rolledOver && (
                  <Badge
                    variant="secondary"
                    title="Dette déjà reportée au mois suivant"
                  >
                    Reportée
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}