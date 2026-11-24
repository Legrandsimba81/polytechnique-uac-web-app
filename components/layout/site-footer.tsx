import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Lightbulb,
  Wallet,
  Newspaper,
  Users,
  Mail,
  UserRound,
  LogIn,
} from "lucide-react";

const exploreLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/innovation", label: "Innovation", icon: Lightbulb },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/articles", label: "Articles", icon: Newspaper },
];

const committeeLinks = [
  { href: "/comite", label: "Comité", icon: Users },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/profil", label: "Mon profil", icon: UserRound },
  { href: "/login", label: "Connexion", icon: LogIn },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur">
      <div className="container py-10 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identité & Logo */}
          <div className="space-y-3 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-semibold tracking-tight"
            >
              <Image
                src="/logo.JPG"
                alt="Logo Polytechnique"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-contain"
              />
              <span className="text-base font-bold">
                Poly<span className="text-primary">technique</span>
              </span>
            </Link>

            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              Plateforme officielle du comité des étudiants de Polytechnique :
              projets d&apos;innovation, transparence financière, articles et
              vie facultaire.
            </p>
          </div>

          {/* Navigation principale */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Explorer
            </h2>
            <ul className="space-y-2">
              {exploreLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full py-1 text-sm text-foreground transition hover:text-primary"
                    >
                      <Icon size={15} className="text-primary" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Comité & Accès */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Comité &amp; Compte
            </h2>
            <ul className="space-y-2">
              {committeeLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full py-1 text-sm text-foreground transition hover:text-primary"
                    >
                      <Icon size={15} className="text-primary" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <p>
            © {currentYear} Poly<span className="text-primary font-semibold">technique</span>. Tous droits réservés.
          </p>
          <p className="font-mono">Comité des Étudiants</p>
        </div>
      </div>
    </footer>
  );
}