"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { MINISTRY_KIND_LABEL, ROLE_LABEL } from "@/lib/committee";

const ROLES: any = ["ADMIN", "SUPER_ADMIN"];

// ═══════════════════ COMITÉS ═══════════════════

const committeeSchema = z.object({
  name: z.string().min(2),
  year: z.string().min(4),
});

export async function createCommittee(formData: FormData) {
  await requireRole(ROLES);
  const parsed = committeeSchema.parse({
    name: formData.get("name"),
    year: formData.get("year"),
  });

  // Un seul comité ACTIVE
  const active = await prisma.committee.findFirst({ where: { status: "ACTIVE" } });
  if (active) throw new Error("Un comité actif existe déjà. Archivez-le avant.");

  const committee = await prisma.committee.create({ data: parsed });

  // Crée automatiquement les ministères standards
  const standardMinistries: Array<{ kind: any; name: string; order: number }> = [
    { kind: "PLAN_FINANCE", name: MINISTRY_KIND_LABEL.PLAN_FINANCE, order: 1 },
    { kind: "AFFAIRES_SOCIALES", name: MINISTRY_KIND_LABEL.AFFAIRES_SOCIALES, order: 2 },
    { kind: "COMMUNICATION", name: MINISTRY_KIND_LABEL.COMMUNICATION, order: 3 },
    { kind: "CULTURE_ART", name: MINISTRY_KIND_LABEL.CULTURE_ART, order: 4 },
    { kind: "SPORT_LOISIR", name: MINISTRY_KIND_LABEL.SPORT_LOISIR, order: 5 },
    { kind: "DEFENSE", name: MINISTRY_KIND_LABEL.DEFENSE, order: 6 },
    { kind: "LITURGIE", name: MINISTRY_KIND_LABEL.LITURGIE, order: 7 },
    { kind: "AFFAIRES_SCIENTIFIQUES", name: MINISTRY_KIND_LABEL.AFFAIRES_SCIENTIFIQUES, order: 8 },
    { kind: "LOGISTIQUE", name: MINISTRY_KIND_LABEL.LOGISTIQUE, order: 9 },
  ];

  await prisma.ministry.createMany({
    data: standardMinistries.map((m) => ({
      committeeId: committee.id,
      name: m.name,
      kind: m.kind,
      displayOrder: m.order,
    })),
  });

  revalidatePath("/admin/comite");
  redirect(`/admin/comite/${committee.id}`);
}

export async function archiveCommittee(id: string) {
  await requireRole(ROLES);
  await prisma.committee.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
  revalidatePath("/admin/comite");
  revalidatePath("/comite");
}

// ═══════════════════ MINISTÈRES ═══════════════════

export async function createMinistry(formData: FormData) {
  await requireRole(ROLES);
  const committeeId = String(formData.get("committeeId"));
  const name = String(formData.get("name")).trim();
  if (name.length < 2) throw new Error("Nom trop court");

  await prisma.ministry.create({
    data: { committeeId, name, kind: "AUTRE", displayOrder: 99 },
  });
  revalidatePath(`/admin/comite/${committeeId}`);
  revalidatePath("/comite");
}

export async function deleteMinistry(id: string, committeeId: string) {
  await requireRole(ROLES);
  await prisma.ministry.delete({ where: { id } });
  revalidatePath(`/admin/comite/${committeeId}`);
  revalidatePath("/comite");
}

// ═══════════════════ MEMBRES ═══════════════════

async function uploadPhoto(file: File, committeeId: string, memberId: string) {
  if (!file || file.size === 0) return null;

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Format d'image non supporté (JPEG, PNG, WEBP, GIF).");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Image trop volumineuse (4 Mo max).");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "committee", committeeId);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${memberId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return `/uploads/committee/${committeeId}/${filename}`;
}

const memberSchema = z.object({
  fullName: z.string().min(2),
  role: z.enum([
    "DELEGUE",
    "DIR_CAB",
    "VICE_DELEGUE",
    "SECRETAIRE_GENERAL",
    "TRESORIER",
    "MINISTRE",
    "VICE_MINISTRE",
  ]),
  ministryId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  bio: z.string().optional(),
});

export async function createMember(formData: FormData) {
  await requireRole(ROLES);
  const committeeId = String(formData.get("committeeId"));

  const parsed = memberSchema.parse({
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    ministryId: (formData.get("ministryId") as string) || undefined,
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    whatsapp: (formData.get("whatsapp") as string) || "",
    bio: (formData.get("bio") as string) || "",
  });

  // Contrainte : un délégué (et autres rôles top) unique par comité
  if (["DELEGUE", "DIR_CAB", "VICE_DELEGUE", "SECRETAIRE_GENERAL", "TRESORIER"].includes(parsed.role)) {
    const existing = await prisma.committeeMember.findFirst({
      where: { committeeId, role: parsed.role as any },
    });
    if (existing) {
      throw new Error(`Un ${ROLE_LABEL[parsed.role]} est déjà enregistré pour ce comité.`);
    }
  }

  const member = await prisma.committeeMember.create({
    data: {
      committeeId,
      fullName: parsed.fullName,
      role: parsed.role as any,
      ministryId: parsed.ministryId || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      bio: parsed.bio || null,
    },
  });

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    const url = await uploadPhoto(file, committeeId, member.id);
    if (url) {
      await prisma.committeeMember.update({
        where: { id: member.id },
        data: { photoUrl: url },
      });
    }
  }

  revalidatePath(`/admin/comite/${committeeId}`);
  revalidatePath("/comite");
}

export async function updateMember(formData: FormData) {
  await requireRole(ROLES);
  const id = String(formData.get("id"));
  const committeeId = String(formData.get("committeeId"));

  let parsed;
  try {
    parsed = memberSchema.parse({
      fullName: formData.get("fullName"),
      role: formData.get("role"),
      ministryId: (formData.get("ministryId") as string) || undefined,
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || "",
      whatsapp: (formData.get("whatsapp") as string) || "",
      bio: (formData.get("bio") as string) || "",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(
        "Champs invalides : " +
          err.errors.map((e) => `${e.path.join(".")} (${e.message})`).join(", ")
      );
    }
    throw err;
  }

  try {
    await prisma.committeeMember.update({
      where: { id },
      data: {
        fullName: parsed.fullName,
        role: parsed.role as any,
        ministryId: parsed.ministryId || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        whatsapp: parsed.whatsapp || null,
        bio: parsed.bio || null,
      },
    });
  } catch (err: any) {
    console.error("[updateMember] Prisma error:", err);
    throw new Error(
      "Impossible de mettre à jour le membre. Vérifiez les données et réessayez."
    );
  }

  // Photo : isolée, n'empêche pas le reste de réussir
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      const url = await uploadPhoto(file, committeeId, id);
      if (url) {
        await prisma.committeeMember.update({
          where: { id },
          data: { photoUrl: url },
        });
      }
    } catch (err: any) {
      console.error("[updateMember] photo upload failed:", err);
      throw new Error(
        "Le membre a été enregistré, mais la photo n'a pas pu être uploadée : " +
          (err?.message ?? "erreur inconnue")
      );
    }
  }

  revalidatePath(`/admin/comite/${committeeId}`);
  revalidatePath("/comite");
}

export async function deleteMember(id: string, committeeId: string) {
  await requireRole(ROLES);
  await prisma.committeeMember.delete({ where: { id } });
  revalidatePath(`/admin/comite/${committeeId}`);
  revalidatePath("/comite");
}