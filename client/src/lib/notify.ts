import { toast } from "sonner";

export function notifyAction(message: string, mode: "success" | "info" = "success") {
  if (mode === "success") toast.success(message);
  else toast.message(message);
}

export function notifyPlaceholder(message: string) {
  toast.message(message, {
    description: "Acessível no modo de demonstração. A integração com o banco será o próximo passo.",
  });
}