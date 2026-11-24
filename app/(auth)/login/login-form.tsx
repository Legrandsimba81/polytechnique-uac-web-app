"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GoogleLogo() {
  return (
    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/innovation";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  function handleGoogleSignIn() {
    setGooglePending(true);
    signIn("google", { callbackUrl });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    start(async () => {
      const res = await signIn("credentials", {
        identifier: cleanIdentifier,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Identifiants invalides ou compte non vérifié.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. Authentification Google en priorité */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={googlePending || pending}
        onClick={handleGoogleSignIn}
      >
        <GoogleLogo />
        {googlePending ? "Redirection vers Google…" : "Continuer avec Google"}
      </Button>

      <div className="relative text-center">
        <span className="relative z-10 bg-card px-2 text-xs text-muted-foreground">
          ou avec vos identifiants
        </span>
        <div className="absolute inset-0 top-1/2 border-t" />
      </div>

      {/* 2. Connexion par email/téléphone + mot de passe */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">
            Email ou téléphone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="identifier"
            placeholder="nom@exemple.com ou +243..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            Mot de passe <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={pending || googlePending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}