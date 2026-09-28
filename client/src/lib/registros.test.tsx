import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { limparCacheRegistros, useRegistros } from "@/lib/registros";

type Linha = { id: string; nome: string };

const semente: Linha[] = [{ id: "s-1", nome: "Semente A" }];

function Probe({ rotulo }: { rotulo: string }) {
  const { registros, adicionar } = useRegistros<Linha>("atas", semente);
  return (
    <div>
      <span data-testid={`len-${rotulo}`}>{registros.length}</span>
      <span data-testid={`nomes-${rotulo}`}>
        {registros.map(r => r.nome).join(",")}
      </span>
      <button
        data-testid={`add-${rotulo}`}
        onClick={() => adicionar({ nome: `Novo de ${rotulo}` })}
      >
        add
      </button>
    </div>
  );
}

function montar() {
  return render(
    <>
      <Probe rotulo="A" />
      <Probe rotulo="B" />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  limparCacheRegistros();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  limparCacheRegistros();
});

describe("useRegistros", () => {
  it("semeia na primeira visita, quando a chave nunca foi gravada", () => {
    montar();
    expect(screen.getByTestId("len-A").textContent).toBe("1");
    expect(screen.getByTestId("nomes-A").textContent).toBe("Semente A");
  });

  it("propaga a escrita de uma instancia para a outra da mesma chave", () => {
    montar();

    act(() => {
      screen.getByTestId("add-A").click();
    });

    // Este era o defeito: B nascia com a propria useState e so via o valor apos F5.
    expect(screen.getByTestId("len-B").textContent).toBe("2");
    expect(screen.getByTestId("nomes-B").textContent).toBe(
      "Novo de A,Semente A"
    );
  });

  it("nao deixa uma instancia sobrescrever o estado da outra", () => {
    montar();

    act(() => {
      screen.getByTestId("add-A").click();
    });
    act(() => {
      screen.getByTestId("add-B").click();
    });

    // As duas escritas acumulam: 1 semente + A + B.
    expect(screen.getByTestId("len-A").textContent).toBe("3");
    expect(screen.getByTestId("len-B").textContent).toBe("3");
    expect(screen.getByTestId("nomes-A").textContent).toBe(
      "Novo de B,Novo de A,Semente A"
    );
  });

  it("preserva uma lista vazia gravada pelo usuario em vez de ressuscitar a semente", () => {
    render(<Probe rotulo="A" />);
    act(() => {
      screen.getByTestId("add-A").click();
    });
    expect(screen.getByTestId("len-A").textContent).toBe("2");

    // Simula recarregar a pagina: sai da memoria, permanece no armazenamento.
    // A versao anterior descartava listas vazias e voltava a semear.
    cleanup();
    localStorage.setItem("delibera.registros.atas", "[]");
    limparCacheRegistros();

    render(<Probe rotulo="B" />);

    expect(screen.getByTestId("len-B").textContent).toBe("0");
    expect(screen.getByTestId("nomes-B").textContent).toBe("");
  });

  it("acompanha a gravacao feita em outra aba", () => {
    montar();
    expect(screen.getByTestId("len-A").textContent).toBe("1");

    // O evento `storage` e o que outra aba dispara; o cache em memoria precisa acompanhar.
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "delibera.registros.atas",
          newValue: JSON.stringify([
            { id: "x-1", nome: "Vinda de outra aba" },
            { id: "x-2", nome: "Segunda" },
          ]),
        })
      );
    });

    expect(screen.getByTestId("len-A").textContent).toBe("2");
    expect(screen.getByTestId("nomes-A").textContent).toBe(
      "Vinda de outra aba,Segunda"
    );
    expect(screen.getByTestId("len-B").textContent).toBe("2");
  });

  it("volta a semear quando outra aba apaga a chave", () => {
    montar();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "delibera.registros.atas",
          newValue: null,
        })
      );
    });

    expect(screen.getByTestId("nomes-A").textContent).toBe("Semente A");
  });

  it("le a persistencia existente em vez da semente", () => {
    localStorage.setItem(
      "delibera.registros.atas",
      JSON.stringify([{ id: "p-9", nome: "Persistida" }])
    );

    montar();

    expect(screen.getByTestId("len-A").textContent).toBe("1");
    expect(screen.getByTestId("nomes-A").textContent).toBe("Persistida");
  });

  it("atualizar e remover afetam todas as instancias", () => {
    function Editor() {
      const { registros, atualizar, remover } = useRegistros<Linha>(
        "atas",
        semente
      );
      return (
        <div>
          <span data-testid="len-A">{registros.length}</span>
          <span data-testid="nomes-A">
            {registros.map(r => r.nome).join(",")}
          </span>
          <span data-testid="len-B">{registros.length}</span>
          <span data-testid="nomes-B">
            {registros.map(r => r.nome).join(",")}
          </span>
          <button
            data-testid="renomear"
            onClick={() => atualizar("s-1", { nome: "Renomeada" })}
          >
            renomear
          </button>
          <button data-testid="remover" onClick={() => remover("s-1")}>
            remover
          </button>
        </div>
      );
    }

    render(<Editor />);

    act(() => {
      screen.getByTestId("renomear").click();
    });
    expect(screen.getByTestId("nomes-A").textContent).toBe("Renomeada");
    expect(screen.getByTestId("nomes-B").textContent).toBe("Renomeada");

    act(() => {
      screen.getByTestId("remover").click();
    });
    expect(screen.getByTestId("len-A").textContent).toBe("0");
    expect(screen.getByTestId("len-B").textContent).toBe("0");
  });
});

describe("payload corrompido no localStorage", () => {
  it("cai na semente quando a chave guarda um objeto em vez de lista", () => {
    localStorage.setItem(
      "delibera.registros.atas",
      JSON.stringify({ naoSouLista: true })
    );

    montar();

    expect(screen.getByTestId("len-A").textContent).toBe("1");
    expect(screen.getByTestId("nomes-A").textContent).toBe("Semente A");
  });

  it("cai na semente quando a chave guarda uma lista invalida em JSON", () => {
    localStorage.setItem("delibera.registros.atas", "{isto nao e json");

    montar();

    expect(screen.getByTestId("len-A").textContent).toBe("1");
    expect(screen.getByTestId("nomes-A").textContent).toBe("Semente A");
  });

  it("se recupera gravando por cima do payload corrompido", () => {
    localStorage.setItem(
      "delibera.registros.atas",
      JSON.stringify({ naoSouLista: true })
    );
    montar();

    act(() => {
      screen.getByTestId("add-A").click();
    });

    const persistido = JSON.parse(
      localStorage.getItem("delibera.registros.atas") as string
    ) as Linha[];
    expect(Array.isArray(persistido)).toBe(true);
    expect(persistido[0]?.nome).toBe("Novo de A");
    expect(screen.getByTestId("len-B").textContent).toBe("2");
  });

  it("ignora gravacao de outra aba que viola o formato da chave", () => {
    montar();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "delibera.registros.atas",
          newValue: JSON.stringify({ naoSouLista: true }),
        })
      );
    });

    expect(screen.getByTestId("len-A").textContent).toBe("1");
    expect(screen.getByTestId("nomes-A").textContent).toBe("Semente A");
  });

  it("mantem componentes montados vivos apos limpar o cache", () => {
    montar();
    limparCacheRegistros();

    act(() => {
      screen.getByTestId("add-A").click();
    });

    expect(screen.getByTestId("len-A").textContent).toBe("2");
    expect(screen.getByTestId("len-B").textContent).toBe("2");
  });
});
