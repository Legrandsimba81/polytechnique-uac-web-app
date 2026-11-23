"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

const ADMIN_ROLES: any = ["ADMIN", "SUPER_ADMIN"];

export async function archiveProject(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.project.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/innovation");
  revalidatePath("/innovation");
}

export async function restoreProject(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.project.update({ where: { id }, data: { status: "PUBLISHED" } });
  revalidatePath("/admin/innovation");
  revalidatePath("/innovation");
}

export async function adminDeleteProject(id: string) {
  await requireRole(ADMIN_ROLES);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/innovation");
  revalidatePath("/innovation");
}