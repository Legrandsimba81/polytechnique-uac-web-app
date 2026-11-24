"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom complet doit contenir au moins 2 caractères.")
    .max(80, "Le nom est trop long."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+\d{1,4}\d{9}$/,
      "Le numéro doit comporter l'indicatif suivi de 9 chiffres exactement (ex. +243991234567)."
    )
    .optional()
    .or(z.literal("")),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères.")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux nouveaux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ProfileActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export async function updateUserProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { ok: false, error: "Session expirée. Veuillez vous reconnecter." };
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  // phone est @unique dans ton modèle User : une chaîne vide "" causerait un conflit si non convertie en null
  const normalizedPhone = parsed.data.phone ? parsed.data.phone : null;

  if (normalizedPhone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (existingPhone) {
      return {
        ok: false,
        error: "Ce numéro de téléphone est déjà associé à un autre compte.",
      };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: normalizedPhone,
    },
  });

  revalidatePath("/mon-espace");
  revalidatePath("/mon-espace/profil");

  return {
    ok: true,
    message: "Vos informations personnelles ont été mises à jour.",
  };
}

export async function updateUserPassword(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { ok: false, error: "Session expirée. Veuillez vous reconnecter." };
  }

  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!dbUser) {
    return { ok: false, error: "Utilisateur introuvable." };
  }

  if (dbUser.passwordHash) {
    if (!parsed.data.currentPassword) {
      return {
        ok: false,
        error: "Veuillez saisir votre mot de passe actuel.",
      };
    }

    const isMatch = await bcrypt.compare(
      parsed.data.currentPassword,
      dbUser.passwordHash
    );
    if (!isMatch) {
      return {
        ok: false,
        error: "Le mot de passe actuel est incorrect.",
      };
    }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return {
    ok: true,
    message: dbUser.passwordHash
      ? "Votre mot de passe a été modifié avec succès."
      : "Un mot de passe a été défini pour votre compte.",
  };
}