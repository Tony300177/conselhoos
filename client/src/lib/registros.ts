import { useCallback, useSyncExternalStore, type SetStateAction } from "react";

const PREFIXO = "delibera.registros.";

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Entrada = {
  valor: unknown;
  /** `true` quando ja existe persistencia valida para a chave; `false` na primeira visita. */
  carregada: boolean;
  semente: unknown;
  /** Formato aceito para a chave. Payload fora do formato cai na semente. */
  valido: (valor: unknown) => boolean;
};

const cache = new Map<string, Entrada>();
const assinantes = new Map<string, Set<() => void>>();

/** As colecoes de `useRegistros` sao listas; um objeto gravado por engano quebraria `.map`. */
const ehLista = (valor: unknown): boolean => Array.isArray(valor);

/** A configuracao institucional e um objeto; `null` e lista nao sao um config valido. */
const ehObjeto = (valor: unknown): boolean =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

function notificar(chave: string) {
  const conjunto = assinantes.get(chave);
  if (!conjunto) return;
  for (const cb of conjunto) cb();
}

function lerDoStorage(chave: string): unknown | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    if (!bruto) return null;
    return JSON.parse(bruto) as unknown;
  } catch {
    return null;
  }
}

function gravarNoStorage(chave: string, valor: unknown) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* cota excedida ou modo privado: segue apenas em memoria */
  }
}

function obter(
  chave: string,
  semente: unknown,
  valido: (valor: unknown) => boolean
): Entrada {
  const existente = cache.get(chave);
  if (existente) return existente;
  const persistido = lerDoStorage(chave);
  // Payload fora do formato esperado (edicao manual no devtools, versao antiga
  // do schema) cai na semente em vez de vazar para os hooks, que assumem o
  // formato e quebrariam a tela num `.map`.
  const utilizavel = persistido !== null && valido(persistido);
  const entrada: Entrada = utilizavel
    ? { valor: persistido, carregada: true, semente, valido }
    : { valor: semente, carregada: false, semente, valido };
  cache.set(chave, entrada);
  return entrada;
}

function assinar(chave: string, cb: () => void) {
  let conjunto = assinantes.get(chave);
  if (!conjunto) {
    conjunto = new Set();
    assinantes.set(chave, conjunto);
    instalarEscutaDeStorage();
  }
  conjunto.add(cb);
  return () => {
    conjunto.delete(cb);
    if (conjunto.size === 0) assinantes.delete(chave);
  };
}

let escutaInstalada = false;

/**
 * Mantem o cache em memoria alinhado com o `localStorage` quando outra aba grava.
 * Sem isso, uma segunda aba continuaria vendo a lista antiga ate recarregar.
 */
function instalarEscutaDeStorage() {
  if (escutaInstalada || typeof window === "undefined") return;
  escutaInstalada = true;
  window.addEventListener("storage", evento => {
    if (!evento.key || !evento.key.startsWith(PREFIXO)) return;
    const chave = evento.key.slice(PREFIXO.length);
    const atual = cache.get(chave);
    const semente = atual?.semente;
    const valido = atual?.valido;

    if (evento.newValue === null) {
      // Chave apagada em outra aba: volta ao valor semeado.
      if (semente === undefined || !valido) return;
      cache.set(chave, { valor: semente, carregada: false, semente, valido });
      notificar(chave);
      return;
    }

    let valor: unknown;
    try {
      valor = JSON.parse(evento.newValue) as unknown;
    } catch {
      return;
    }
    // Sem entrada previa nao ha formato conhecido para a chave: aceita e adota
    // o valor como proprio formato, para nao descartar a gravacao alheia.
    if (valido && !valido(valor)) return;
    cache.set(chave, {
      valor,
      carregada: true,
      semente: semente ?? valor,
      valido: valido ?? ehLista,
    });
    notificar(chave);
  });
}

/**
 * Descarta o cache em memoria. Usado por testes para simular um carregamento
 * limpo da aplicacao; na aplicacao o cache vive enquanto a aba estiver aberta.
 *
 * Os assinantes sao preservados de proposito:_component ainda montado precisa
 * continuar recebendo notificacoes, e o proximo `getSnapshot` repovoa o cache
 * a partir do storage.
 */
export function limparCacheRegistros() {
  cache.clear();
}

/**
 * Ponto unico de escrita. Serializa a gravacao e notifica todos os assinantes da
 * chave, de modo que instancias concorrentes nunca sobrescrevam o estado uma da
 * outra.
 */
function escrever(chave: string, valor: unknown) {
  const atual = cache.get(chave);
  cache.set(chave, {
    valor,
    carregada: true,
    semente: atual?.semente ?? valor,
    valido: atual?.valido ?? ehLista,
  });
  gravarNoStorage(chave, valor);
  notificar(chave);
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

export type Pauta = {
  id: string;
  numero: string;
  title: string;
  council: string;
  relator: string;
  date: string;
  status: string;
};

export type Votacao = {
  id: string;
  tema: string;
  council: string;
  date: string;
  aFavor: number;
  contra: number;
  abstencoes: number;
  resultado: string;
};

export type Membro = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  entidade: string;
  council: string;
  papel: string;
  status: string;
  telefone: string;
  endereco: string;
};

export type Mandato = {
  id: string;
  council: string;
  titular: string;
  cargo: string;
  entidade: string;
  inicio: string;
  fim: string;
  numeroAto: string;
  tipoAto: string;
  dataAto: string;
  documento: string;
  situacao: string;
  observacoes: string;
};

export type Encaminhamento = {
  id: string;
  decisao: string;
  responsavel: string;
  council: string;
  prazo: string;
  status: "Pendente" | "Em andamento" | "Concluído";
};

export type AuditoriaLog = {
  id: string;
  acao: string;
  ator: string;
  modulo: string;
  data: string;
};

export type Conselho = {
  id: string;
  acronym: string;
  name: string;
  area: string;
  segmento: string;
  regulamentacao: string;
  members: number;
  meetings: string;
  updated: string;
  color: string;
};

export type ConfigInstituicao = {
  organizacao: string;
  email: string;
  periodicidade: string;
  modeloAta: string;
  regraPublicacao: string;
};

const CHAVE_CONFIG = "config";

export function useConfigInstituicao(semente: ConfigInstituicao) {
  const assinarCB = useCallback(
    (cb: () => void) => assinar(CHAVE_CONFIG, cb),
    []
  );
  const getSnapshot = useCallback(
    () => obter(CHAVE_CONFIG, semente, ehObjeto).valor as ConfigInstituicao,
    [semente]
  );

  const config = useSyncExternalStore(assinarCB, getSnapshot, getSnapshot);

  const setConfig = useCallback(
    (atualizador: SetStateAction<ConfigInstituicao>) => {
      const base = obter(CHAVE_CONFIG, semente, ehObjeto)
        .valor as ConfigInstituicao;
      const proximo =
        typeof atualizador === "function"
          ? (atualizador as (c: ConfigInstituicao) => ConfigInstituicao)(base)
          : atualizador;
      escrever(CHAVE_CONFIG, proximo);
    },
    [semente]
  );

  return { config, setConfig };
}

export function diaMes(data: string): { day: string; month: string } {
  const d = new Date(`${data}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "MÊS" };
  const meses = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: meses[d.getMonth()] ?? "MÊS",
  };
}

/**
 * Colecao persistida em `localStorage` e compartilhada entre todos os
 * componentes que usam a mesma `chave`.
 *
 * O estado vive em um store modulo-level lido via `useSyncExternalStore`, o que
 * elimina dois defeitos do uso anterior de `useState` + `useEffect` por instancia:
 *
 * 1. instancias da mesma chave enxergavam listas diferentes e precisavam de F5;
 * 2. cada instancia regravava a propria copia, podendo sobrescrever a outra.
 *
 * A semente so e aplicada enquanto a chave nunca foi gravada. Uma lista vazia
 * gravada pelo usuario e preservada, em vez de voltar a semear.
 */
export function useRegistros<T extends { id: string }>(
  chave: string,
  semente: T[]
) {
  const assinarCB = useCallback(
    (cb: () => void) => assinar(chave, cb),
    [chave]
  );
  const getSnapshot = useCallback(
    () => obter(chave, semente, ehLista).valor as T[],
    [chave, semente]
  );

  const registros = useSyncExternalStore(assinarCB, getSnapshot, getSnapshot);

  const adicionar = useCallback(
    (novo: Omit<T, "id">): T => {
      const item = { ...novo, id: novoId() } as T;
      const atual = obter(chave, semente, ehLista).valor as T[];
      escrever(chave, [item, ...atual]);
      return item;
    },
    [chave, semente]
  );

  const atualizar = useCallback(
    (id: string, mudancas: Partial<T>) => {
      const atual = obter(chave, semente, ehLista).valor as T[];
      escrever(
        chave,
        atual.map(r => (r.id === id ? { ...r, ...mudancas } : r))
      );
    },
    [chave, semente]
  );

  const remover = useCallback(
    (id: string) => {
      const atual = obter(chave, semente, ehLista).valor as T[];
      escrever(
        chave,
        atual.filter(r => r.id !== id)
      );
    },
    [chave, semente]
  );

  return { registros, adicionar, atualizar, remover };
}
