import { VizCode, VizVars } from "../VizObject";

/**
 * Разреженная таблица — пример отдельного объекта с двумя наследниками.
 *  - SparseTableVars: структура переменных i,j,k,n,m,r,c,kx,ky
 *  - SparseTableCode: код реализации (1D и 2D)
 */

// Наследник структура переменных
export class SparseTableVars extends VizVars {
  title = "Разреженная таблица — переменные";
  chapterId = "sparse-table";
  // текущие значения шага (как в отладчике)
  constructor(public i: number = 0, public j: number = 0, public kx: number = 0, public ky: number = 0) {
    super();
  }
  getVars() {
    return { n: 8, m: 4, i: this.i, j: this.j, kx: this.kx, ky: this.ky };
  }
  getCode() {
    return "";
  }
  getHighlight() {
    return { i: this.i, j: this.j };
  }
}

// Наследник код реализации
export class SparseTableCode extends VizCode {
  title = "Разреженная таблица — код";
  chapterId = "sparse-table";
  getVars() {
    return {};
  }
  getCode() {
    return [
      "i, j = 0, 0  # 1D: первый блок длины 1",
      "a, b, c, d = 4, 1, 3, 2  # 2D: блок 2×2",
      "ans = min(a, b, c, d)  # 4 → 1",
      "",
      "# ——— показать код ———",
      "for j in range(1, LOG):",
      "    for i in range(n - (1<<j) + 1):",
      "        ST[i][j] = min(ST[i][j-1], ST[i + (1<<(j-1))][j-1])",
      "",
      "for kx in range(4):",
      "  for ky in range(4):",
      "    ST[r][c][kx][ky] = min(",
      "        ST[r][c][kx-1][ky], ST[r+(1<<(kx-1))][c][kx-1][ky])",
    ].join("\n");
  }
  getHighlight() {
    return null;
  }
}

// Сборка: визуализация как единый объект, внутри два наследника
export class SparseTableVizObject {
  vars = new SparseTableVars();
  code = new SparseTableCode();
  /** Текущий шаг подсветки — движок для компилятора и визуализации */
  step = 0;
  next() {
    this.step++;
    this.vars.i = this.step % 8;
    this.vars.j = Math.floor(this.step / 8) % 4;
  }
  reset() {
    this.step = 0;
    this.vars.i = 0;
    this.vars.j = 0;
  }
}
