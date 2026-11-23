import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import {
  sendAdminAccountActivityEmail,
  sendWelcomeEmail,
} from "@/lib/mail";

const credentialsSchema = z.object({
  identifier: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(255),
});

// Hash factice pour éviter les attaques par analyse de temps de réponse (timing attack)
const DUMMY_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.6J1p5zF5l9k2tG8q1eR7yU4iO6aW";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        identifier: { label: "Email ou téléphone" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;
        const normalizedEmail = identifier.toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: normalizedEmail }, { phone: identifier }],
          },
        });

        // Toujours exécuter bcrypt.compare pour un temps d'exécution constant
        const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
        const ok = await bcrypt.compare(password, hashToCompare);

        if (!user || !user.passwordHash || !ok) return null;
        if (!user.isActive) return null;
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
        } as any;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Refuser si Google indique explicitement que l'e-mail n'est pas vérifié
        if (profile && "email_verified" in profile && profile.email_verified === false) {
          return false;
        }

        const normalizedEmail = user.email?.trim().toLowerCase() ?? null;
        if (!normalizedEmail) return false;

        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            isActive: true,
            emailVerified: true,
            name: true,
            email: true,
            phone: true,
          },
        });

        // Compte désactivé : bloquer la connexion
        if (existing && !existing.isActive) {
          return false;
        }

        if (!existing) {
          // Premier compte Google : e-mail de bienvenue + notification admin
          sendWelcomeEmail(normalizedEmail, user.name).catch(() => {});
          sendAdminAccountActivityEmail({
            eventType: "NEW_ACCOUNT",
            provider: "google",
            userName: user.name,
            userEmail: normalizedEmail,
          }).catch(() => {});
        } else {
          // Vérification e-mail automatique si le compte existait sans validation de code
          if (!existing.emailVerified) {
            await prisma.user
              .update({
                where: { id: existing.id },
                data: { emailVerified: new Date() },
              })
              .catch(() => {});
          }

          sendAdminAccountActivityEmail({
            eventType: "GOOGLE_SIGNIN",
            provider: "google",
            userName: existing.name ?? user.name,
            userEmail: existing.email ?? normalizedEmail,
            userPhone: existing.phone,
          }).catch(() => {});
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (authConfig.callbacks?.jwt) {
        token = await authConfig.callbacks.jwt({ token, user } as any);
      }

      if (user) {
        token.uid = user.id;
        token.role = (user as any).role ?? "USER";
        token.isActive = (user as any).isActive ?? true;
      } else if (token.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.uid) },
          select: { role: true, isActive: true },
        });

        // Si l'utilisateur a été supprimé ou désactivé entre-temps
        if (!dbUser || !dbUser.isActive) {
          token.isActive = false;
          return token;
        }

        token.role = dbUser.role;
        token.isActive = dbUser.isActive;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.isActive === false) {
        return { ...session, user: undefined } as any;
      }

      if (authConfig.callbacks?.session) {
        session = await authConfig.callbacks.session({ session, token } as any);
      }

      if (session.user) {
        (session.user as any).id = String(token.uid ?? "");
        (session.user as any).role = String(token.role ?? "USER");
        (session.user as any).isActive = token.isActive ?? true;
      }

      return session;
    },
  },
});