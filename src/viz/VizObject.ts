// Базовый объект визуализации с двумя наследниками
export abstract class Visualization {
  abstract getType(): string;
  abstract describe(): string;
}

// Наследник 1: код реализации — строки которые видит пользователь в компиляторе
export class CodeImpl extends Visualization {
  lines: string[];
  constructor(lines: string[]) {
    super();
    this.lines = lines;
  }
  getType() { return "code"; }
  describe() { return `code: ${this.lines.length} lines`; }
  getLine(i: number) { return this.lines[i] ?? ""; }
}

// Наследник 2: структура переменных — i,j,k,n,m и их текущие значения
export class VarsStruct extends Visualization {
  vars: Record<string, number | string>;
  constructor(vars: Record<string, number | string>) {
    super();
    this.vars = { ...vars };
  }
  getType() { return "vars"; }
  describe() { return `vars: ${Object.keys(this.vars).join(",")}`; }
  set(key: string, value: number | string) { this.vars[key] = value; }
  get(key: string) { return this.vars[key]; }
}

// Объект визуализации объединяет оба наследника
export class VizObject extends Visualization {
  code: CodeImpl;
  vars: VarsStruct;
  chapterId: string;
  constructor(chapterId: string, codeLines: string[], initialVars: Record<string, number | string>) {
    super();
    this.chapterId = chapterId;
    this.code = new CodeImpl(codeLines);
    this.vars = new VarsStruct(initialVars);
  }
  getType() { return "viz"; }
  describe() { return `viz:${this.chapterId} ${this.code.describe()} ${this.vars.describe()}`; }

  // подсветка: обновить vars из строки кода и вернуть их
  highlightFromLine(line: string): Record<string, number | string> {
    const parsed = parseAssignments(line);
    for (const [k, v] of Object.entries(parsed)) this.vars.set(k, v);
    return { ...this.vars.vars };
  }
}

// Парсит строку вида "i, j = 0, 0" или "a, b, c, d = 1, 2, 3, 4" или "ans = min(a,b,c,d)"
export function parseAssignments(line: string): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  // убрать коммент
  const code = line.split("#")[0].trim();
  if (!code) return out;
  if (!code.includes("=")) return out;
  const [left, right] = code.split("=").map(s => s.trim());
  if (!left || !right) return out;
  // левая часть: "i, j" или "a, b, c, d" или "ans"
  const leftVars = left.split(",").map(s => s.trim()).filter(Boolean);
  // правая часть: "0, 0" или "4, 1, 3, 2" или "min(a,b,c,d)" — если не числа, пропускаем
  // пробуем распарсить как числа
  if (right.startsWith("min") || right.startsWith("max") || right.includes("(")) {
    // для конструкции ans = min(a,b,c,d) — не парсим как vars, но можно вычислить
    // оставляем как строку, но подсветка будет по a,b,c,d уже
    return out;
  }
  const rightVals = right.split(",").map(s => s.trim()).filter(Boolean);
  // если одно значение и несколько vars: "a,b,c,d = 1" -> не поддерживаем
  // если количество совпадает
  if (leftVars.length === rightVals.length) {
    for (let i = 0; i < leftVars.length; i++) {
      const k = leftVars[i];
      const vStr = rightVals[i];
      const num = Number(vStr);
      out[k] = Number.isNaN(num) ? vStr : num;
    }
  } else if (leftVars.length === 1 && rightVals.length === 1) {
    const num = Number(rightVals[0]);
    out[leftVars[0]] = Number.isNaN(num) ? rightVals[0] : num;
  } else if (rightVals.length === 1 && leftVars.length > 1) {
    // "i, j = 0" — распарсить как оба = 0?
    const num = Number(rightVals[0]);
    const val = Number.isNaN(num) ? rightVals[0] : num;
    for (const k of leftVars) out[k] = val;
  }
  // поддержка "i,j=0,0" без пробелов уже покрыта
  return out;
}
