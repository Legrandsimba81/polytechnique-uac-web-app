import {
  PROJECT_FIELDS,
  type ProjectDepartment,
} from "@/lib/innovations";

export function MetadataDisplay({
  department,
  metadata,
}: {
  department: ProjectDepartment;
  metadata: Record<string, any> | null;
}) {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const fields = PROJECT_FIELDS[department];
  const rows = fields
    .map((f) => ({ label: f.label, value: metadata[f.key] }))
    .filter(
      (r) => r.value !== undefined && r.value !== null && r.value !== ""
    );

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-2 font-semibold text-sm">
        Fiche technique
      </div>
      <dl className="divide-y">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-3 px-4 py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium break-words">
              {Array.isArray(r.value)
                ? r.value.join(", ")
                : String(r.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}