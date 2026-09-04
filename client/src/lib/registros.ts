import { useEffect, useState } from "react";

const PREFIXO = "delibera.registros.";

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Reuniao = {
  id: string;
  day: string;
  month: string;
  title: string;
  council: string;
  time: string;
  status: string;
  tone: "confirmed" | "review" | "pending";
};

export type Ata = {
  id: string;
  numero: string;
  title: string;
  council: string;
  date: string;
  status: string;
};

export type Resolucao = {
  id: string;
  numero: string;
  title: string;
  council: string;
  date: string;
  status: string;
};

export type Documento = {
  id: string;
  type: "ATA" | "RES" | "PAUTA" | "REL";
  title: string;
  context: string;
  status: "Publicado" | "Em revisão" | "Interno";
  file: string;
};

export function diaMes(data: string): { day: string; month: string } {
  const d = new Date(`${data}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "MÊS" };
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return { day: String(d.getDate()).padStart(2, "0"), month: meses[d.getMonth()] };
}

export function useRegistros<T extends { id: string }>(chave: string, semente: T[]) {
  const [registros, setRegistros] = useState<T[]>(() => {
    try {
      const bruto = localStorage.getItem(PREFIXO + chave);
      if (bruto) {
        const lido = JSON.parse(bruto) as T[];
        if (Array.isArray(lido) && lido.length) return lido;
      }
    } catch {
      /* ignore */
    }
    return semente;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFIXO + chave, JSON.stringify(registros));
    } catch {
      /* ignore */
    }
  }, [chave, registros]);

  const adicionar = (novo: Omit<T, "id">): T => {
    const item = { ...novo, id: novoId() } as T;
    setRegistros((prev) => [item, ...prev]);
    return item;
  };

  const atualizar = (id: string, mudancas: Partial<T>) => {
    setRegistros((prev) => prev.map((r) => (r.id === id ? { ...r, ...mudancas } : r)));
  };

  const remover = (id: string) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  return { registros, adicionar, atualizar, remover };
}