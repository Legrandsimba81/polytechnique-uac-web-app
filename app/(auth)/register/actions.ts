"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  sendVerificationCodeEmail,
  sendWelcomeEmail,
  sendAdminAccountActivityEmail,
} from "@/lib/mail";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Adresse email invalide.")
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Veuillez renseigner un email ou un numéro de téléphone.",
    path: ["email"],
  });

export type RegisterState = {
  error?: string;
  verificationEmail?: string;
};

function generateFourDigitCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function createAndSendCode(email: string) {
  const code = generateFourDigitCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.emailVerificationCode.deleteMany({ where: { email } });
  await prisma.emailVerificationCode.create({
    data: { email, code, expiresAt },
  });
  await sendVerificationCodeEmail(email, code);
}

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const email = parsed.data.email || null;
  const phone = parsed.data.phone || null;

  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { error: "Un compte existe déjà avec cet email." };
    }
  }

  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return { error: "Un compte existe déjà avec ce numéro de téléphone." };
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone,
      passwordHash,
      emailVerified: email ? null : new Date(),
      role: "USER",
      isActive: true,
    },
  });

  // Notification automatique à legransimba81@gmail.com
  sendAdminAccountActivityEmail({
    eventType: "NEW_ACCOUNT",
    provider: "credentials",
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
  }).catch(() => {});

  if (email) {
    await createAndSendCode(email);
    return { verificationEmail: email };
  }

  return { verificationEmail: undefined };
}

export async function verifyEmailCode(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!/^\d{4}$/.test(cleanCode)) {
    return { ok: false as const, error: "Le code doit contenir 4 chiffres." };
  }

  const record = await prisma.emailVerificationCode.findFirst({
    where: { email: normalizedEmail, code: cleanCode },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false as const, error: "Code invalide." };
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationCode.delete({ where: { id: record.id } });
    return { ok: false as const, error: "Ce code a expiré. Renvoyez-en un." };
  }

  const user = await prisma.user.update({
    where: { email: normalizedEmail },
    data: { emailVerified: new Date() },
    select: { email: true, name: true },
  });

  await prisma.emailVerificationCode.deleteMany({
    where: { email: normalizedEmail },
  });

  if (user.email) {
    sendWelcomeEmail(user.email, user.name).catch(() => {});
  }

  return { ok: true as const };
}

export async function resendVerificationCode(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!user) {
    return { ok: false as const, error: "Utilisateur introuvable." };
  }

  await createAndSendCode(normalizedEmail);
  return { ok: true as const };
}