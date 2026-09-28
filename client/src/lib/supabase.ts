import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `null` quando o projeto nao esta configurado.
 *
 * Antes este modulo lancava, o que derrubava o app inteiro na tela branca: como
 * o `AuthContext` importa o cliente, a excecao na carga do modulo impedia
 * qualquer render. Agora a demo sobe sem backend, apoiada no login local e nos
 * registros do `localStorage`, e o aviso no console evita que o estado passe por
 * sucesso silencioso.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const supabaseConfigurado = supabase !== null;

if (!supabaseConfigurado) {
  console.warn(
    "[delibera] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ausentes. O app esta em modo demonstracao: sem Supabase, sem RLS e sem persistencia no servidor. Os registros ficam no localStorage deste navegador. Ver .env.example."
  );
}

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "administrador" | "presidente" | "secretario" | "membro" | "observador";
  created_at: string;
  updated_at: string;
};
