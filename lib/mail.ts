import nodemailer from "nodemailer";

const ADMIN_NOTIFICATION_EMAIL = "legransimba81@gmail.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCodeEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: `Code de vérification : ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Vérification de votre adresse e-mail</h2>
        <p>Voici votre code de vérification à 4 chiffres (valable 15 minutes) :</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${code}
        </p>
        <p style="color: #666; font-size: 13px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const displayName = name?.trim() || "Membre";
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Bienvenue dans la planteforme de Polytechnique/uac",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Bienvenue, ${displayName} !</h2>
        <p>Votre adresse e-mail est vérifiée et votre compte est maintenant actif.</p>
        <p>Vous pouvez dès à présent accéder à la plateforme et explorer ou publier les projets et actualités.</p>
      </div>
    `,
  });
}

export async function sendAdminAccountActivityEmail(params: {
  eventType: "NEW_ACCOUNT" | "GOOGLE_SIGNIN";
  provider: "credentials" | "google";
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
}) {
  const { eventType, provider, userName, userEmail, userPhone } = params;
  const isNewAccount = eventType === "NEW_ACCOUNT";

  const subject = isNewAccount
    ? `Nouveau compte créé (${provider === "google" ? "Google" : "Email/Tél"}) : ${userEmail ?? userPhone ?? userName ?? "Utilisateur"}`
    : `Connexion Google : ${userEmail ?? userName ?? "Utilisateur"}`;

  const title = isNewAccount
    ? "Création d'un nouveau compte"
    : "Connexion via Google";

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2>${title}</h2>
        <ul>
          <li><strong>Méthode :</strong> ${provider === "google" ? "Google OAuth" : "Inscription classique"}</li>
          <li><strong>Nom :</strong> ${userName ?? "—"}</li>
          <li><strong>E-mail :</strong> ${userEmail ?? "—"}</li>
          <li><strong>Téléphone :</strong> ${userPhone ?? "—"}</li>
          <li><strong>Date :</strong> ${new Date().toLocaleString("fr-FR", { timeZone: "Africa/Lubumbashi" })}</li>
        </ul>
      </div>
    `,
  });
}