import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["client/src/**/*.test.{ts,tsx}"],
    globals: false,
    // lib/supabase.ts lança na importação se o projeto não estiver configurado.
    // Stub mínimo para que os testes possam importar módulos que o consomem.
    env: {
      VITE_SUPABASE_URL: "https://exemplo.supabase.co",
      VITE_SUPABASE_ANON_KEY: "chave-de-teste",
    },
  },
});
