"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, KeyRound, Lock, Save, UserCog } from "lucide-react";
import {
  updateUserProfile,
  updateUserPassword,
  type ProfileActionState,
} from "./actions";

const initialState: ProfileActionState = {};

function parsePhoneParts(fullPhone?: string | null) {
  if (!fullPhone) return { code: "+243", digits: "" };
  const match = fullPhone.match(/^(\+\d{1,4})(\d{1,9})$/);
  if (match) {
    return { code: match[1], digits: match[2] };
  }
  return { code: "+243", digits: fullPhone.replace(/\D/g, "").slice(-9) };
}

export function ProfileForms({
  initialName,
  email,
  initialPhone,
  hasPassword,
}: {
  initialName: string;
  email: string;
  initialPhone?: string | null;
  hasPassword: boolean;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateUserProfile,
    initialState
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateUserPassword,
    initialState
  );

  const parsed = parsePhoneParts(initialPhone);
  const [countryCode, setCountryCode] = useState(parsed.code);
  const [phoneDigits, setPhoneDigits] = useState(parsed.digits);
  const [phoneClientError, setPhoneClientError] = useState<string | null>(null);

  function handleCountryCodeChange(value: string) {
    const cleaned = value.replace(/[^\d+]/g, "");
    const normalized = cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "").slice(0, 4)
      : "+" + cleaned.replace(/\+/g, "").slice(0, 4);
    setCountryCode(normalized);
  }

  function handlePhoneDigitsChange(value: string) {
    const onlyNineDigits = value.replace(/\D/g, "").slice(0, 9);
    setPhoneDigits(onlyNineDigits);
    if (phoneClientError) setPhoneClientError(null);
  }

  function handleProfileSubmit(formData: FormData) {
    setPhoneClientError(null);

    if (phoneDigits.length > 0) {
      if (!/^\+\d{1,4}$/.test(countryCode)) {
        setPhoneClientError("L'indicatif pays est invalide (ex. +243).");
        return;
      }
      if (phoneDigits.length !== 9) {
        setPhoneClientError(
          "Le numéro de téléphone doit contenir exactement 9 chiffres après l'indicatif."
        );
        return;
      }
      formData.set("phone", `${countryCode}${phoneDigits}`);
    } else {
      formData.set("phone", "");
    }

    profileAction(formData);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </div>
          <CardDescription>
            Mettez à jour votre nom d&apos;affichage et votre numéro de contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialName}
                minLength={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <span>Adresse e-mail</span>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted/60 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;adresse e-mail est liée à votre compte et ne peut pas être
                modifiée ici.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="tel"
                  value={countryCode}
                  onChange={(e) => handleCountryCodeChange(e.target.value)}
                  className="w-24 text-center font-medium"
                  aria-label="Indicatif pays"
                />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="991234567"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                9 chiffres après l&apos;indicatif ({phoneDigits.length}/9).
              </p>
              <input
                type="hidden"
                name="phone"
                value={phoneDigits ? `${countryCode}${phoneDigits}` : ""}
              />
            </div>

            {(phoneClientError || profileState.error) && (
              <p className="text-sm text-destructive">
                {phoneClientError ?? profileState.error}
              </p>
            )}

            {profileState.ok && profileState.message && (
              <p className="flex items-center gap-1.5 text-sm text-primary font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {profileState.message}
              </p>
            )}

            <Button type="submit" disabled={profilePending}>
              <Save className="h-4 w-4 mr-2" />
              {profilePending
                ? "Enregistrement…"
                : "Enregistrer les modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {hasPassword
                ? "Changer le mot de passe"
                : "Définir un mot de passe"}
            </CardTitle>
          </div>
          <CardDescription>
            {hasPassword
              ? "Renforcez la sécurité de votre compte en mettant à jour votre mot de passe."
              : "Votre compte utilise Google. Vous pouvez aussi définir un mot de passe pour vous connecter avec vos identifiants."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {passwordState.error && (
              <p className="text-sm text-destructive">{passwordState.error}</p>
            )}

            {passwordState.ok && passwordState.message && (
              <p className="flex items-center gap-1.5 text-sm text-primary font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {passwordState.message}
              </p>
            )}

            <Button type="submit" variant="outline" disabled={passwordPending}>
              {passwordPending
                ? "Mise à jour…"
                : hasPassword
                ? "Mettre à jour le mot de passe"
                : "Enregistrer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}