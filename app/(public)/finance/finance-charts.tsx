"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";

export function FinanceCharts({
  monthStats,
  selected,
}: {
  monthStats: { id: string; label: string; due: number; paid: number; debt: number; count: number }[];
  selected: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="font-semibold mb-4">
        Vue par mois — {selected} en surbrillance
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={monthStats}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Legend />
          <Bar dataKey="due" name="Dû" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="paid" name="Payé" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="debt" name="Dette reportée" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}