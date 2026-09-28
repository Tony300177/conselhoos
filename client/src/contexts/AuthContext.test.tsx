import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// O AuthContext lê VITE_DEMO_ADMIN_PASSWORD no carregamento do módulo, então
// cada caso importa uma cópia nova. O mock do Supabase existe para o caminho de
// fallback não tocar a rede: quando o bypass local está desligado, o signIn
// delega para o auth de verdade.
const { signInWithPassword } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(async () => ({ error: null })),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword,
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
      }),
    }),
  },
}));

const SESSAO_LOCAL = "delibera.admin.session";
const EMAIL_ADMIN = "admin@delibera.local";
// Valor arbitrário: com o bypass desligado, nenhuma senha pode criar sessão.
const SENHA_SEM_ENV = "senha-que-exige-a-variavel-de-ambiente";

async function montarAuth(senhaDemo: string | undefined) {
  vi.resetModules();
  vi.stubEnv("VITE_DEMO_ADMIN_PASSWORD", senhaDemo);
  const { AuthProvider, useAuth } = await import("./AuthContext");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );
  return renderHook(() => useAuth(), { wrapper });
}

async function entrar(
  resultado: {
    current: { signIn: (e: string, s: string) => Promise<unknown> };
  },
  senha: string
) {
  await act(async () => {
    await resultado.current.signIn(EMAIL_ADMIN, senha);
  });
}

beforeEach(() => {
  localStorage.clear();
  signInWithPassword.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("login admin de demonstracao", () => {
  it("recusa qualquer senha quando a variavel de ambiente nao esta definida", async () => {
    const { result } = await montarAuth(undefined);

    await entrar(result, SENHA_SEM_ENV);

    expect(localStorage.getItem(SESSAO_LOCAL)).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(signInWithPassword).toHaveBeenCalled();
  });

  it("libera o acesso local quando a variavel de ambiente esta definida", async () => {
    const { result } = await montarAuth("senha-de-teste");

    await entrar(result, "senha-de-teste");

    expect(localStorage.getItem(SESSAO_LOCAL)).not.toBeNull();
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user?.id).toBe("admin-local");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("nao cria sessao local com a senha errada", async () => {
    const { result } = await montarAuth("senha-de-teste");

    await entrar(result, SENHA_SEM_ENV);

    expect(localStorage.getItem(SESSAO_LOCAL)).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(signInWithPassword).toHaveBeenCalled();
  });

  it("trata a variavel vazia como bypass desligado", async () => {
    const { result } = await montarAuth("");

    await entrar(result, SENHA_SEM_ENV);

    expect(localStorage.getItem(SESSAO_LOCAL)).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});
