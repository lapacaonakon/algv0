/**
 * Визуализация как отдельный объект с двумя наследниками:
 *  - CodeImpl — как считается (код реализации)
 *  - VarsStruct — какие переменные на текущем шаге (структура переменных)
 *
 * Шаг в компиляторе === шаг в визуализации: строка кода ↔ подсветка в теории.
 */

export abstract class VizObject {
  abstract readonly id: string;
  /** Код — те же строки, что в компиляторе (i,j=0,0 и a,b,c,d=... ) */
  abstract getCode(): string[];
  /** Переменные на шаге step (0-index) */
  abstract getVars(step: number): Record<string, number | string>;
  /** Сколько шагов = сколько строк кода */
  getStepCount(): number {
    return this.getCode().length;
  }
  /** Подсветка: какие ячейки/рёбра светить на шаге */
  abstract getHighlight(step: number): { cells?: string[]; note?: string };
}

/** Наследник 1: код реализации */
export abstract class VizCode extends VizObject {}
/** Наследник 2: структура переменных */
export abstract class VizVars extends VizObject {}

// ── Sparse Table: 1D i,j и 2D a,b,c,d → new ──
export class SparseTableVars extends VizVars {
  readonly id = "sparse-table";
  getCode(): string[] {
    return ["i, j = 0, 0  # 1D: первый блок", "a, b, c, d = 4, 1, 3, 2  # 2D: 2×2 → new", "ans = min(a, b, c, d)  # new"];
  }
  getVars(step: number): Record<string, number | string> {
    if (step === 0) return { i: 0, j: 0, n: 8, k: 0 };
    if (step === 1) return { a: 4, b: 1, c: 3, d: 2, k: 1 };
    return { ans: 1, i: 0, j: 0, a: 4, b: 1, c: 3, d: 2 };
  }
  getHighlight(step: number) {
    if (step === 0) return { cells: ["st[0][0]"], note: "i=0 j=0 — первый блок длины 1" };
    if (step === 1) return { cells: ["2×2 блок"], note: "a,b,c,d — четыре ячейки → new" };
    return { cells: ["ans"], note: "new = min(4,1,3,2)=1" };
  }
}

export class SparseTableCode extends VizCode {
  readonly id = "sparse-table";
  getCode(): string[] {
    return new SparseTableVars().getCode();
  }
  getVars(step: number) {
    return new SparseTableVars().getVars(step);
  }
  getHighlight(step: number) {
    return new SparseTableVars().getHighlight(step);
  }
}

// ── Префиксные суммы: тоже i,j и 4→1 ──
export class PrefixSumVars extends VizVars {
  readonly id = "prefix-sums-2d";
  getCode(): string[] {
    return ["i, j = 0, 0  # 1D", "a, b, c, d = 1, 2, 3, 4  # 2D блок", "s = a + b + c + d  # 4 → 1"];
  }
  getVars(step: number): Record<string, string | number> {
    if (step === 0) return { i: 0, j: 0 };
    if (step === 1) return { a: 1, b: 2, c: 3, d: 4 };
    return { s: 10, a: 1, b: 2, c: 3, d: 4 } as Record<string, string | number>;
  }
  getHighlight(step: number) {
    if (step === 0) return { cells: ["pref[0][0]"] };
    if (step === 1) return { cells: ["2×2"] };
    return { cells: ["sum"] };
  }
}
export class PrefixSumCode extends VizCode {
  readonly id = "prefix-sums-2d";
  getCode() { return new PrefixSumVars().getCode(); }
  getVars(step: number): Record<string, string | number> { return new PrefixSumVars().getVars(step); }
  getHighlight(step: number) { return new PrefixSumVars().getHighlight(step); }
}

// ── Флойд: 8 строк как в FloydViz ──
export class FloydVars extends VizVars {
  readonly id = "floyd";
  getCode(): string[] {
    return [
      "def floyd_warshall(matrix, V):",
      "    dist = copy(matrix)",
      "    for k in range(V):  # промежут. k",
      "        for i in range(V):",
      "            for j in range(V):",
      "                if dist[i][k] + dist[k][j] < dist[i][j]:",
      "                    dist[i][j] = dist[i][k] + dist[k][j]",
      "    return dist",
    ];
  }
  getVars(step: number) {
    const k = step % 7;
    const i = Math.floor(step / 7) % 7;
    const j = step % 7;
    return { k, i, j, n: 7 };
  }
  getHighlight(step: number) {
    return { cells: [`k=${step % 7}`] };
  }
}
export class FloydCode extends VizCode {
  readonly id = "floyd";
  getCode() { return new FloydVars().getCode(); }
  getVars(s: number) { return new FloydVars().getVars(s); }
  getHighlight(s: number) { return new FloydVars().getHighlight(s); }
}

const REGISTRY: Record<string, VizObject> = {
  "sparse-table": new SparseTableVars(),
  "prefix-sums-2d": new PrefixSumVars(),
  "floyd": new FloydVars(),
};

export function getVizObject(id: string): VizObject | undefined {
  return REGISTRY[id];
}
