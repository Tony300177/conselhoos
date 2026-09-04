import type { UserProfile } from "@/lib/supabase";

export type Acao = "criar" | "publicar" | "editar" | "excluir";

export const LABEL_PERMISSAO: Record<UserProfile["role"], string> = {
  administrador: "Administrador",
  presidente: "Presidente",
  secretario: "Secretário",
  membro: "Membro",
  observador: "Observador",
};

const REGRAS: Record<UserProfile["role"], Acao[]> = {
  administrador: ["criar", "publicar", "editar", "excluir"],
  secretario: ["criar", "publicar", "editar"],
  presidente: ["criar", "publicar"],
  membro: ["criar"],
  observador: [],
};

export function pode(role: UserProfile["role"] | null | undefined, acao: Acao): boolean {
  if (!role) return false;
  return REGRAS[role].includes(acao);
}

export function podePublicarPagina(role: UserProfile["role"] | null | undefined, isAdmin: boolean): boolean {
  return isAdmin || pode(role, "publicar");
}

export function podeCriarPagina(role: UserProfile["role"] | null | undefined, isAdmin: boolean): boolean {
  return isAdmin || pode(role, "criar");
}