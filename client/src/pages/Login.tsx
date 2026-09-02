import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CivicMark } from "@/components/CivicMark";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const USERNAME_DOMAIN = "conselhoos.local";
function toEmail(username: string) {
  return `${username}@${USERNAME_DOMAIN}`;
}

const loginSchema = z.object({
  username: z.string().min(3, "O usuário deve ter ao menos 3 caracteres.").regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto ou hífen."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  remember: z.boolean().optional().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) as any, defaultValues: { username: "", password: "", remember: false } });
  const remember = watch("remember");

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    const email = toEmail(values.username);
    const { error } = await signIn(email, values.password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bem-vindo de volta");
      setLocation("/dashboard");
    }
    setIsLoading(false);
  }

  async function onSubmitReset(values: LoginValues) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (!values.username?.trim()) {
      toast.error("Informe seu usuário para recuperar o acesso.");
    } else {
      toast.success("Solicitação de recuperação enviada em modo de demonstração.");
    }
    setIsLoading(false);
    setShowReset(false);
  }

  const fieldError = (field: keyof LoginValues) =>
    errors[field] ? <p role="alert" className="mt-1 text-xs font-medium text-[#A9533A]">{errors[field]?.message}</p> : null;

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CivicMark className="mx-auto" label={false} />
          <CardTitle className="mt-4 font-editorial text-2xl font-semibold tracking-tight text-[#173F34]">Acesso à gestão</CardTitle>
          <CardDescription className="text-base text-[#536358]">
            {showReset ? "Recupere o acesso à sua conta" : "Entre com seu usuário e senha"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit(showReset ? onSubmitReset : onSubmit)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-[#294038]">Usuário</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                aria-invalid={errors.username ? true : undefined}
                aria-describedby={errors.username ? "username-error" : "username-hint"}
                className="text-base h-11"
                placeholder="admin"
                disabled={isLoading}
                {...register("username")}
              />
              <p id="username-hint" className="text-xs text-[#8A958B]">Seu nome de usuário institucional</p>
              <div id="username-error">{fieldError("username")}</div>
            </div>
            {!showReset && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-[#294038]">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="text-base h-11"
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <div id="password-error">{fieldError("password")}</div>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#536358]">
                    <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setValue("remember", Boolean(v))} />
                    Manter conectado
                  </label>
                  <button type="button" onClick={() => setShowReset(true)} className="text-[12px] font-bold text-[#A9533A] hover:text-[#173F34] focus-visible:outline-none">
                    Esqueci a senha
                  </button>
                </div>
              </>
            )}
            {showReset && (
              <p className="text-[13px] leading-5 text-[#657268]">
                Informe seu usuário. Enviaremos instruções para recuperar o acesso. Como a recuperação por e-mail será ativada com o backend, você retornará ao login para tentar novamente.
              </p>
            )}
            <div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {showReset ? "Recuperar acesso" : "Entrar"}
              </Button>
              {showReset && (
                <button type="button" onClick={() => setShowReset(false)} className="mt-2 w-full text-center text-[12px] font-bold text-[#536358] hover:text-[#173F34] focus-visible:outline-none">
                  Voltar ao login
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}