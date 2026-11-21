"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

const ADMIN_ROLES: any = ["FINANCE", "ADMIN", "SUPER_ADMIN"];

// ═══════════════════ MOIS ═══════════════════

export async function openNextMonth() {
  await requireRole(ADMIN_ROLES);
  const open = await prisma.month.findFirst({ where: { status: "OPEN" } });
  if (open) return;

  const last = await prisma.month.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  let year: number;
  let month: number;
  if (!last) {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  } else {
    month = last.month + 1;
    year = last.year;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const label = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  await prisma.month.create({ data: { year, month, label } });
  revalidatePath("/admin/finance/months");
  revalidatePath("/admin/finance");
}

export async function closeMonth(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.month.update({
    where: { id },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  revalidatePath("/admin/finance/months");
  revalidatePath("/admin/finance");
}

// ═══════════════════ PROMOTIONS ═══════════════════

const promotionSchema = z.object({
  name: z.string().min(2),
  academicYear: z.string().min(4),
});

export async function createPromotion(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const parsed = promotionSchema.parse({
    name: formData.get("name"),
    academicYear: formData.get("academicYear"),
  });
  await prisma.promotion.create({ data: parsed });
  revalidatePath("/admin/finance/promotions");
}

export async function deletePromotion(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.promotion.delete({ where: { id } });
  redirect("/admin/finance/promotions");
}

// ═══════════════════ DÉPARTEMENTS ═══════════════════

export async function createDepartment(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const promotionId = String(formData.get("promotionId"));
  const name = String(formData.get("name"));
  await prisma.department.create({ data: { name, promotionId } });
  revalidatePath(`/admin/finance/promotions/${promotionId}`);
}

export async function deleteDepartment(id: string, promotionId: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.department.delete({ where: { id } });
  revalidatePath(`/admin/finance/promotions/${promotionId}`);
}

// ═══════════════════ ÉTUDIANTS ═══════════════════

const studentSchema = z.object({
  lastName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  firstName: z.string().min(1),
  departmentId: z.string().min(1),
  promotionId: z.string().min(1),
});

export async function createStudent(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const parsed = studentSchema.parse({
    lastName: formData.get("lastName"),
    middleName: formData.get("middleName") || null,
    firstName: formData.get("firstName"),
    departmentId: formData.get("departmentId"),
    promotionId: formData.get("promotionId"),
  });
  await prisma.student.create({ data: parsed });
  revalidatePath(`/admin/finance/promotions/${parsed.promotionId}`);
}

export async function updateStudent(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id"));
  const promotionId = String(formData.get("promotionId"));
  await prisma.student.update({
    where: { id },
    data: {
      lastName: String(formData.get("lastName")),
      middleName: String(formData.get("middleName") || "") || null,
      firstName: String(formData.get("firstName")),
      departmentId: String(formData.get("departmentId")),
    },
  });
  revalidatePath(`/admin/finance/promotions/${promotionId}`);
}

export async function deleteStudent(id: string, promotionId: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.student.delete({ where: { id } });
  revalidatePath(`/admin/finance/promotions/${promotionId}`);
}

// ═══════════════════ CONTRIBUTIONS ═══════════════════

const contributionSchema = z.object({
  label: z.string().min(2),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "ANNUAL"]),
  monthId: z.string().min(1),
  target: z.enum(["ALL", "PROMOTION", "DEPARTMENT", "STUDENT"]),
  promotionId: z.string().optional(),
  departmentId: z.string().optional(),
  studentId: z.string().optional(),
});

export async function createContribution(formData: FormData) {
  await requireRole(ADMIN_ROLES);

  const raw = contributionSchema.parse({
    label: formData.get("label"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency"),
    monthId: formData.get("monthId"),
    target: formData.get("target"),
    promotionId: (formData.get("promotionId") as string) || undefined,
    departmentId: (formData.get("departmentId") as string) || undefined,
    studentId: (formData.get("studentId") as string) || undefined,
  });

  // 1. Vérifie que le mois est ouvert
  const month = await prisma.month.findUnique({ where: { id: raw.monthId } });
  if (!month) throw new Error("Mois introuvable");
  if (month.status !== "OPEN") throw new Error("Ce mois est clôturé.");

  // 2. Détermine les étudiants concernés
  let studentIds: string[] = [];
  if (raw.target === "STUDENT") {
    if (!raw.studentId) throw new Error("Étudiant manquant");
    studentIds = [raw.studentId];
  } else if (raw.target === "DEPARTMENT") {
    if (!raw.departmentId) throw new Error("Département manquant");
    const rows = await prisma.student.findMany({
      where: { departmentId: raw.departmentId },
      select: { id: true },
    });
    studentIds = rows.map((r) => r.id);
  } else if (raw.target === "PROMOTION") {
    if (!raw.promotionId) throw new Error("Promotion manquante");
    const rows = await prisma.student.findMany({
      where: { promotionId: raw.promotionId },
      select: { id: true },
    });
    studentIds = rows.map((r) => r.id);
  } else {
    const rows = await prisma.student.findMany({ select: { id: true } });
    studentIds = rows.map((r) => r.id);
  }

  if (studentIds.length === 0) {
    throw new Error("Aucun étudiant dans la portée choisie.");
  }

  // 3. Crée la contribution (spread conditionnel pour éviter null/undefined)
  const contribution = await prisma.contribution.create({
    data: {
      label: raw.label,
      amount: raw.amount,
      frequency: raw.frequency,
      monthId: raw.monthId,
      ...(raw.target === "PROMOTION" && raw.promotionId
        ? { promotionId: raw.promotionId }
        : {}),
      ...(raw.target === "DEPARTMENT" && raw.departmentId
        ? { departmentId: raw.departmentId }
        : {}),
    },
  });

  // 4. Pour chaque étudiant : calcule la dette passée + crée l'attribution
  for (const studentId of studentIds) {
    const unpaidPast = await prisma.studentContribution.findMany({
      where: {
        studentId,
        status: { not: "PAID" },
        rolledOverAt: null,
        contribution: {
          month: { status: "CLOSED" },
        },
      },
    });

    const carriedDebt = unpaidPast.reduce(
      (sum, sc) => sum + Number(sc.amount) - Number(sc.paidAmount),
      0
    );

    await prisma.studentContribution.create({
      data: {
        studentId,
        contributionId: contribution.id,
        baseAmount: raw.amount,
        carriedDebt,
        amount: raw.amount + carriedDebt,
      },
    });

    if (unpaidPast.length > 0) {
      await prisma.studentContribution.updateMany({
        where: { id: { in: unpaidPast.map((u) => u.id) } },
        data: { rolledOverAt: new Date() },
      });
    }
  }

  revalidatePath("/admin/finance/contributions");
  redirect("/admin/finance/contributions");
}

export async function updateStudentContributionAmount(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id"));
  const newBase = Number(formData.get("baseAmount"));
  const contributionId = String(formData.get("contributionId"));

  const sc = await prisma.studentContribution.findUnique({ where: { id } });
  if (!sc) return;

  await prisma.studentContribution.update({
    where: { id },
    data: {
      baseAmount: newBase,
      amount: newBase + Number(sc.carriedDebt),
    },
  });
  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

export async function updateAllContributionAmounts(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const contributionId = String(formData.get("contributionId"));
  const newBase = Number(formData.get("baseAmount"));

  const scs = await prisma.studentContribution.findMany({
    where: { contributionId },
  });

  for (const sc of scs) {
    await prisma.studentContribution.update({
      where: { id: sc.id },
      data: {
        baseAmount: newBase,
        amount: newBase + Number(sc.carriedDebt),
      },
    });
  }

  await prisma.contribution.update({
    where: { id: contributionId },
    data: { amount: newBase },
  });

  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

export async function updatePaidAmount(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id"));
  const paidAmount = Number(formData.get("paidAmount"));
  const contributionId = String(formData.get("contributionId"));

  const sc = await prisma.studentContribution.findUnique({ where: { id } });
  if (!sc) return;

  const total = Number(sc.amount);
  const status: "PENDING" | "PARTIAL" | "PAID" =
    paidAmount <= 0 ? "PENDING" : paidAmount >= total ? "PAID" : "PARTIAL";

  await prisma.studentContribution.update({
    where: { id },
    data: {
      paidAmount,
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

export async function deleteContribution(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.contribution.delete({ where: { id } });
  redirect("/admin/finance/contributions");
}

// Marque une attribution comme entièrement payée
export async function markContributionPaid(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const id = String(formData.get("id"));
  const contributionId = String(formData.get("contributionId"));

  const sc = await prisma.studentContribution.findUnique({ where: { id } });
  if (!sc) return;

  await prisma.studentContribution.update({
    where: { id },
    data: {
      paidAmount: sc.amount,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

// Marque TOUTES les attributions d'une contribution comme payées
export async function markAllContributionsPaid(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const contributionId = String(formData.get("contributionId"));

  const scs = await prisma.studentContribution.findMany({
    where: { contributionId },
  });

  for (const sc of scs) {
    await prisma.studentContribution.update({
      where: { id: sc.id },
      data: {
        paidAmount: sc.amount,
        status: "PAID",
        paidAt: new Date(),
      },
    });
  }

  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

// Marque payées uniquement les attributions dont les IDs sont fournis
export async function markContributionsPaidByIds(
  ids: string[],
  contributionId: string
) {
  await requireRole(ADMIN_ROLES);
  if (ids.length === 0) return;

  const scs = await prisma.studentContribution.findMany({
    where: { id: { in: ids } },
  });

  for (const sc of scs) {
    await prisma.studentContribution.update({
      where: { id: sc.id },
      data: {
        paidAmount: sc.amount,
        status: "PAID",
        paidAt: new Date(),
      },
    });
  }

  revalidatePath(`/admin/finance/contributions/${contributionId}`);
}

// ═══════════════════ DÉPENSES ═══════════════════

const expenseSchema = z.object({
  label: z.string().min(2),
  amount: z.coerce.number().positive(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export async function createExpense(formData: FormData) {
  await requireRole(ADMIN_ROLES);

  const parsed = expenseSchema.parse({
    label: formData.get("label"),
    amount: formData.get("amount"),
    date: (formData.get("date") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  });

  // Garde-fou : la dépense ne peut pas dépasser la caisse disponible
  const [collected, expenses] = await Promise.all([
    prisma.studentContribution.aggregate({ _sum: { paidAmount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);
  const caisse = Number(collected._sum.paidAmount ?? 0) - Number(expenses._sum.amount ?? 0);

  if (parsed.amount > caisse) {
    throw new Error(
      `Caisse insuffisante : ${caisse.toLocaleString("fr-FR")} disponible, ${parsed.amount.toLocaleString("fr-FR")} demandé.`
    );
  }

  await prisma.expense.create({
    data: {
      label: parsed.label,
      amount: parsed.amount,
      date: parsed.date ? new Date(parsed.date) : new Date(),
      description: parsed.description || null,
    },
  });

  revalidatePath("/admin/finance/depenses");
  revalidatePath("/admin/finance");
  revalidatePath("/finance");
}

export async function deleteExpense(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/finance/depenses");
  revalidatePath("/admin/finance");
  revalidatePath("/finance");
}