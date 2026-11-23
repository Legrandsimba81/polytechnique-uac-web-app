"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerUser,
  verifyEmailCode,
  resendVerificationCode,
  type RegisterState,
} from "./actions";

const initialState: RegisterState = {};

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

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initialState);
  const [googlePending, setGooglePending] = useState(false);

  // Téléphone : indicatif + 9 chiffres maximum
  const [countryCode, setCountryCode] = useState("+243");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  // Étape de vérification à 4 chiffres
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [verifying, startVerify] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastSubmittedCodeRef = useRef<string>("");

  // Focus automatique sur le 1er chiffre dès l'affichage de l'étape de vérification
  useEffect(() => {
    if (state.verificationEmail) {
      inputRefs.current[0]?.focus();
    }
  }, [state.verificationEmail]);

  // Validation automatique dès que les 4 chiffres sont saisis
  useEffect(() => {
    const email = state.verificationEmail;
    if (!email) return;

    const code = digits.join("");
    if (code.length !== 4 || !/^\d{4}$/.test(code)) return;
    if (lastSubmittedCodeRef.current === code) return;

    lastSubmittedCodeRef.current = code;
    setVerifyError(null);

    startVerify(async () => {
      const res = await verifyEmailCode(email, code);
      if (res.ok) {
        router.push("/login?verified=1");
      } else {
        setVerifyError(res.error ?? "Code invalide.");
        lastSubmittedCodeRef.current = "";
      }
    });
  }, [digits, state.verificationEmail, router]);

  function handleCountryCodeChange(value: string) {
    const cleaned = value.replace(/[^\d+]/g, "");
    const normalized = cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "").slice(0, 4)
      : "+" + cleaned.replace(/\+/g, "").slice(0, 4);
    setCountryCode(normalized);
  }

  function handlePhoneDigitsChange(value: string) {
    // Garde uniquement les chiffres et bloque à 9 chiffres maximum
    const onlyNineDigits = value.replace(/\D/g, "").slice(0, 9);
    setPhoneDigits(onlyNineDigits);
    if (clientError) setClientError(null);
  }

  function handleFormAction(formData: FormData) {
    setClientError(null);

    if (!/^\+\d{1,4}$/.test(countryCode)) {
      setClientError("L'indicatif pays est invalide (ex. +243).");
      return;
    }

    if (phoneDigits.length !== 9) {
      setClientError("Le numéro de téléphone doit contenir exactement 9 chiffres après l'indicatif.");
      return;
    }

    formData.set("phone", `${countryCode}${phoneDigits}`);
    formAction(formData);
  }

  function handleDigitChange(index: number, value: string) {
    const onlyDigits = value.replace(/\D/g, "");
    if (!onlyDigits) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (onlyDigits.length === 4) {
      const next = onlyDigits.split("");
      setDigits(next);
      inputRefs.current[3]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = onlyDigits[onlyDigits.length - 1];
    setDigits(next);

    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    if (!state.verificationEmail) return;
    setResendMessage(null);
    setVerifyError(null);
    setDigits(["", "", "", ""]);
    lastSubmittedCodeRef.current = "";

    startVerify(async () => {
      const res = await resendVerificationCode(state.verificationEmail!);
      if (res.ok) {
        setResendMessage("Un nouveau code à 4 chiffres a été envoyé.");
        inputRefs.current[0]?.focus();
      } else {
        setVerifyError(res.error ?? "Impossible de renvoyer le code.");
      }
    });
  }

  function handleGoogleSignIn() {
    setGooglePending(true);
    signIn("google", { callbackUrl: "/mon-espace" });
  }

  if (state.verificationEmail) {
    return (
      <div className="space-y-5 text-center">
        <div className="space-y-1">
          <h3 className="font-semibold">Vérifiez votre e-mail</h3>
          <p className="text-xs text-muted-foreground">
            Entrez le code à 4 chiffres envoyé à{" "}
            <span className="font-medium text-foreground">
              {state.verificationEmail}
            </span>
            . La validation est automatique.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {digits.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={digit}
              disabled={verifying}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-12 w-12 text-center text-lg font-bold tracking-widest"
              aria-label={`Chiffre ${idx + 1}`}
            />
          ))}
        </div>

        {verifying && (
          <p className="text-xs text-muted-foreground">Vérification en cours…</p>
        )}
        {verifyError && (
          <p className="text-sm text-destructive">{verifyError}</p>
        )}
        {resendMessage && (
          <p className="text-xs text-emerald-600">{resendMessage}</p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={verifying}
          onClick={handleResend}
        >
          Renvoyer un code
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          ou créer un compte
        </span>
        <div className="absolute inset-0 top-1/2 border-t" />
      </div>

      <form action={handleFormAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex. Kasereka Moïse"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Adresse email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nom@exemple.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Numéro de téléphone <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="tel"
              value={countryCode}
              onChange={(e) => handleCountryCodeChange(e.target.value)}
              className="w-24 text-center font-medium"
              aria-label="Indicatif pays"
              required
            />
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="991234567"
              value={phoneDigits}
              onChange={(e) => handlePhoneDigitsChange(e.target.value)}
              maxLength={9}
              pattern="\d{9}"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            9 chiffres après l&apos;indicatif ({phoneDigits.length}/9).
          </p>
          <input type="hidden" name="phone" value={`${countryCode}${phoneDigits}`} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Mot de passe <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </div>

        {(clientError || state.error) && (
          <p className="text-sm text-destructive">{clientError ?? state.error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={pending || googlePending}
        >
          {pending ? "Envoi du code…" : "S'inscrire"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}