"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Newspaper,
  Users,
  Mail,
  Wallet,
  Lightbulb,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/innovation", label: "Innovation", icon: Lightbulb },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/articles", label: "Articles", icon: Newspaper },
  { href: "/comite", label: "Comité", icon: Users },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu utilisateur au changement de route
  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const userName =
    session?.user?.name || session?.user?.email || "Utilisateur";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <Image
            src="/logo.JPG"
            alt="Logo Polytechnique"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md object-contain"
            priority
          />
          <span className="hidden sm:inline text-base font-bold">
            Poly<span className="text-primary">technique</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-foreground"
                )}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border bg-background px-2 py-1.5 text-sm font-medium transition hover:border-primary hover:text-primary"
                title={userName}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={userName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="hidden sm:inline">{userName}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border bg-card p-2 shadow-xl z-[100]">
                  <div className="rounded-xl border bg-muted p-3">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {userEmail}
                    </p>
                  </div>

                  <div className="mt-2 space-y-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                          isActive("/admin")
                            ? "bg-primary/10 font-medium text-primary"
                            : "hover:bg-accent"
                        )}
                      >
                        <ShieldCheck size={16} className="text-primary" />
                        Administration
                      </Link>
                    )}

                    {role === "STUDENT" && (
                      <Link
                        href="/mon-espace/projets"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                          isActive("/mon-espace/projets")
                            ? "bg-primary/10 font-medium text-primary"
                            : "hover:bg-accent"
                        )}
                      >
                        <Lightbulb size={16} className="text-primary" />
                        Mes projets
                      </Link>
                    )}

                    <Link
                      href="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                        isActive("/profil")
                          ? "bg-primary/10 font-medium text-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <UserRound size={16} className="text-primary" />
                      Mon profil
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent"
                    >
                      <LogOut size={16} className="text-primary" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Barre mobile : uniquement les icônes */}
      <div className="border-t bg-background/90 lg:hidden">
        <nav className="container flex items-center justify-around gap-1 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                title={link.label}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1 text-xs transition",
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}