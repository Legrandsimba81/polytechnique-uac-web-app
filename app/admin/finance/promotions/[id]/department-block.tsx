"use client";

import { useState } from "react";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createStudent,
  deleteDepartment,
  deleteStudent,
  updateStudent,
} from "../../actions";

type Student = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
};

export function DepartmentBlock({
  departmentId,
  departmentName,
  promotionId,
  students,
}: {
  departmentId: string;
  departmentName: string;
  promotionId: string;
  students: Student[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <CardTitle className="text-lg">{departmentName}</CardTitle>
          <Badge variant="secondary" className="ml-2">{students.length}</Badge>
        </button>
        <form action={() => deleteDepartment(departmentId, promotionId)}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Supprimer">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </form>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          <div className="rounded-lg border divide-y">
            {students.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">Aucun étudiant.</p>
            )}
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">
                    {s.lastName} {s.middleName ?? ""} {s.firstName}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                    Modifier
                  </Button>
                  <form action={() => deleteStudent(s.id, promotionId)}>
                    <Button type="submit" variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter un étudiant */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <Plus className="h-4 w-4" /> Ajouter un étudiant
            </p>
            <form action={createStudent} className="grid gap-2 sm:grid-cols-4">
              <input type="hidden" name="promotionId" value={promotionId} />
              <input type="hidden" name="departmentId" value={departmentId} />
              <Input name="lastName" placeholder="Nom" required />
              <Input name="middleName" placeholder="Postnom" />
              <Input name="firstName" placeholder="Prénom" required />
              <Button type="submit">Ajouter</Button>
            </form>
          </div>

          {editing && (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-2">Modifier {editing.lastName}</p>
              <form
                action={(fd) => {
                  updateStudent(fd);
                  setEditing(null);
                }}
                className="grid gap-2 sm:grid-cols-4"
              >
                <input type="hidden" name="id" value={editing.id} />
                <input type="hidden" name="promotionId" value={promotionId} />
                <input type="hidden" name="departmentId" value={departmentId} />
                <Input name="lastName" defaultValue={editing.lastName} required />
                <Input name="middleName" defaultValue={editing.middleName ?? ""} />
                <Input name="firstName" defaultValue={editing.firstName} required />
                <div className="flex gap-2">
                  <Button type="submit">Enregistrer</Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}