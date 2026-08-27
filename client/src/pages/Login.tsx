import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CivicMark } from "@/components/CivicMark";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();

  async function handleSubmit(e: React.FormEvent, mode: "signin" | "signup") {
    e.preventDefault();
    setIsLoading(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, email.split("@")[0]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(mode === "signin" ? "Bem-vindo de volta" : "Conta criada");
      setLocation("/dashboard");
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CivicMark className="mx-auto" label={false} />
          <CardTitle className="mt-4 font-editorial text-[24px]">Acesso à gestão</CardTitle>
          <CardDescription>Entre com seu e-mail institucional</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, "signin")} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@orgao.gov.br"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center text-[12px] text-[#68756B]">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent, "signup");
              }}
              className="font-bold text-[#285A43] hover:underline"
              disabled={isLoading}
            >
              Criar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}