"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

const SUPER_ONLY: any = ["SUPER_ADMIN"];

// Supprimer un utilisateur
export async function deleteUser(id: string) {
  const { session } = await requireRole(SUPER_ONLY);
  const selfId = (session.user as any)?.id;

  if (id === selfId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Utilisateur introuvable.");

  // Garde-fou : ne pas supprimer le dernier SUPER_ADMIN
  if (user.role === "SUPER_ADMIN") {
    const superCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true },
    });
    if (superCount <= 1) {
      throw new Error("Impossible de supprimer le dernier super administrateur actif.");
    }
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/utilisateurs");
}

// Activer / désactiver
export async function toggleUserActive(id: string) {
  const { session } = await requireRole(SUPER_ONLY);
  const selfId = (session.user as any)?.id;

  if (id === selfId) {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Utilisateur introuvable.");

  // Garde-fou dernier super admin actif
  if (user.role === "SUPER_ADMIN" && user.isActive) {
    const count = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true },
    });
    if (count <= 1) {
      throw new Error("Impossible de désactiver le dernier super administrateur actif.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/utilisateurs");
}

// Changer le rôle
const roleSchema = z.enum(["USER", "STUDENT", "FINANCE", "ADMIN", "SUPER_ADMIN"]);

export async function updateUserRole(id: string, newRole: string) {
  const { session } = await requireRole(SUPER_ONLY);
  const selfId = (session.user as any)?.id;

  if (id === selfId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  const parsed = roleSchema.parse(newRole);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Utilisateur introuvable.");

  // Garde-fou : ne pas rétrograder le dernier super admin
  if (
    user.role === "SUPER_ADMIN" &&
    parsed !== "SUPER_ADMIN" &&
    user.isActive
  ) {
    const count = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true },
    });
    if (count <= 1) {
      throw new Error("Impossible de rétrograder le dernier super administrateur.");
    }
  }

  await prisma.user.update({ where: { id }, data: { role: parsed } });
  revalidatePath("/admin/utilisateurs");
}

// Créer un utilisateur (bonus)
const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.enum(["USER", "STUDENT", "FINANCE", "ADMIN", "SUPER_ADMIN"]),
});

export async function createUser(formData: FormData) {
  await requireRole(SUPER_ONLY);
  const bcrypt = (await import("bcryptjs")).default;

  const parsed = createSchema.parse({
    name: formData.get("name"),
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.email && !parsed.phone) {
    throw new Error("Un email ou un téléphone est requis.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email || null,
      phone: parsed.phone || null,
      passwordHash,
      role: parsed.role as any,
      emailVerified: parsed.email ? new Date() : null,
    },
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}