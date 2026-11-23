import { RegisterForm } from "./register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            Créer un compte
          </CardTitle>
          <CardDescription>
            Inscrivez-vous avec Google ou renseignez vos informations ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}