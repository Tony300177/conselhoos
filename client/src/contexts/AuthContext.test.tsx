import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// O AuthContext lê VITE_DEMO_ADMIN_PASSWORD no carregamento do módulo, então
// cada caso importa uma cópia nova. O mock do Supabase existe para o caminho de
// fallback não tocar a rede: quando o bypass local está desligado, o signIn
// delega para o auth de verdade.
const { signInWithPassword, estado, criarCliente } = vi.hoisted(() => {
  const signInWithPassword = vi.fn(async () => ({ error: null }));
  return {
    signInWithPassword,
    estado: { cliente: null as unknown },
    criarCliente: () => ({
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
    }),
  };
});

// `supabase` e null quando o projeto nao esta configurado; o mock expoe os dois
// como getters para que cada teste escolha o cenario sem recarregar o modulo.
vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return estado.cliente;
  },
  get supabaseConfigurado() {
    return estado.cliente !== null;
  },
}));

const SESSAO_LOCAL = "delibera.admin.session";
const EMAIL_ADMIN = "admin@delibera.local";
// Valor arbitrário: com o bypass desligado, nenhuma senha pode criar sessão.
const SENHA_SEM_ENV = "senha-que-exige-a-variavel-de-ambiente";

async function montarAuth(senhaDemo: string | undefined, comSupabase = true) {
  vi.resetModules();
  estado.cliente = comSupabase ? criarCliente() : null;
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

describe("projeto sem configuracao do Supabase", () => {
  it("libera o acesso local mesmo sem backend configurado", async () => {
    const { result } = await montarAuth("senha-de-teste", false);

    await entrar(result, "senha-de-teste");

    expect(result.current.isAdmin).toBe(true);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("recusa o acesso local quando a variavel de ambiente nao esta definida", async () => {
    const { result } = await montarAuth(undefined, false);

    const { error: erro } = await act(async () =>
      result.current.signIn(EMAIL_ADMIN, SENHA_SEM_ENV)
    );

    expect(erro).toBeInstanceOf(Error);
    expect(result.current.isAdmin).toBe(false);
    expect(localStorage.getItem(SESSAO_LOCAL)).toBeNull();
  });

  it("recusa credenciais de usuario comum em vez de fingir sucesso", async () => {
    const { result } = await montarAuth(undefined, false);

    const { error: erro } = await act(async () =>
      result.current.signIn("alguem@delibera.local", SENHA_SEM_ENV)
    );

    expect(erro).toBeInstanceOf(Error);
    expect(erro?.message).toContain("Supabase não configurado");
    expect(result.current.user).toBeNull();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("nao fica preso em carregando", async () => {
    const { result } = await montarAuth(undefined, false);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
  });

  it("restaura a sessao local gravada sem consultar o backend", async () => {
    localStorage.setItem(
      SESSAO_LOCAL,
      JSON.stringify({
        user: { id: "admin-local" },
        profile: {
          id: "admin-local",
          full_name: "Administrador",
          email: EMAIL_ADMIN,
          avatar_url: null,
          role: "administrador",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      })
    );

    const { result } = await montarAuth("senha-de-teste", false);

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it("recusa o cadastro, que exige o backend", async () => {
    const { result } = await montarAuth(undefined, false);

    const { error: erro } = await act(async () =>
      result.current.signUp("novo@delibera.local", SENHA_SEM_ENV, "Nova")
    );

    expect(erro).toBeInstanceOf(Error);
    expect(erro?.message).toContain("Supabase não configurado");
  });

  it("encerra a sessao local sem tentar o signOut remoto", async () => {
    const { result } = await montarAuth("senha-de-teste", false);
    await entrar(result, "senha-de-teste");
    expect(result.current.isAdmin).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(SESSAO_LOCAL)).toBeNull();
  });
});
