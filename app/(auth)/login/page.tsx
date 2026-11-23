import { Suspense } from "react";
import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1.5">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            Connexion
          </CardTitle>
          <CardDescription>
            Connectez-vous avec Google ou avec vos identifiants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-6 text-center text-sm text-muted-foreground">Chargement…</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}