/**
 * Модульные проверки разбора «живых» данных компилятора.
 *
 *   npm run verify:unit
 *
 * liveMatrix() — то, благодаря чему визуализации матриц (Флойд, префиксные
 * суммы 2D, разреженная таблица) принимают данные ЛЮБОЙ размерности из кода
 * пользователя вместо захардкоженной демо-сетки.
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync } from "fs";

const OUT_DIR = "tmp/verify";
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  `${OUT_DIR}/unit-entry.ts`,
  `export { liveMatrix, pickLiveVar, clampIndex } from "../../src/data/vizStepBus";`
);
await esbuild.build({
  entryPoints: [`${OUT_DIR}/unit-entry.ts`],
  bundle: true,
  outfile: `${OUT_DIR}/unit-bundle.mjs`,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  loader: { ".css": "empty" },
  logLevel: "warning",
});
const { liveMatrix, pickLiveVar, clampIndex } = await import(`${process.cwd()}/${OUT_DIR}/unit-bundle.mjs?run=${Date.now()}`);

let passed = 0;
const failures = [];
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else failures.push(`${name}\n      получено: ${a}\n      ожидалось: ${e}`);
}
const m = (v) => liveMatrix(v);
const shape = (v) => {
  const r = m(v);
  return r ? { rows: r.rows, cols: r.cols, label: r.sizeLabel, numbers: r.hasNumbers } : null;
};
const cells = (v) => {
  const r = m(v);
  if (!r) return null;
  return Array.from({ length: r.rows }, (_, i) => Array.from({ length: r.cols }, (_, j) => r.at(i, j)));
};

/* ── liveMatrix: формы данных ─────────────────────────────────────── */
check("квадратная 3×3 (список списков)", shape([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), { rows: 3, cols: 3, label: "3×3", numbers: true });
check("не квадратная 2×4", shape([[1, 2, 3, 4], [5, 6, 7, 8]]), { rows: 2, cols: 4, label: "2×4", numbers: true });
check("значения ячеек 2×2", cells([[0, 1], [2, 3]]), [[0, 1], [2, 3]]);
check("рваные строки: cols = максимум", shape([[1, 2, 3], [4], [5, 6]]), { rows: 3, cols: 3, label: "3×3", numbers: true });
check("рваные строки: дырка = null", cells([[1, 2, 3], [4], [5, 6]]), [[1, 2, 3], [4, null, null], [5, 6, null]]);
check("at() вне диапазона → null", m([[1, 2], [3, 4]]).at(5, 5), null);
check("at() с отрицательным индексом → null", m([[1, 2], [3, 4]]).at(-1, 0), null);
check("список словарей с числовыми ключами", cells([{ "0": 1, "1": 2 }, { "0": 3, "1": 4 }]), [[1, 2], [3, 4]]);
check("словарь списков", cells({ 0: [1, 2], 1: [3, 4] }), [[1, 2], [3, 4]]);
check("словарь словарей", cells({ 0: { 0: 7, 1: 8 }, 1: { 0: 9, 1: 10 } }), [[7, 8], [9, 10]]);
check('ключи-пары "(i, j)" после снапшота tuple', cells({ "(0, 0)": 1, "(0, 1)": 2, "(1, 0)": 3, "(1, 1)": 4 }), [[1, 2], [3, 4]]);
check('ключи-пары без скобок "0, 1"', cells({ "0, 0": 5, "1, 1": 6 }), [[5, null], [null, 6]]);

/* ── liveMatrix: что матрицей НЕ является ─────────────────────────── */
check("плоский список чисел → null", m([1, 2, 3, 4, 5]), null);
check("словарь по именам → null", m({ dist: 1, prev: 2 }), null);
check("пустой список → null", m([]), null);
check("пустой словарь → null", m({}), null);
check("undefined → null", m(undefined), null);
check("null → null", m(null), null);
check("число → null", m(42), null);
check("строка → null", m("abc"), null);
check("массив строк-мусора → null", m([["a", "b"], ["c", "d"]]), null);

/* ── liveMatrix: особые значения ──────────────────────────────────── */
check('"inf" → +Infinity', cells([["inf", 1], [2, "-inf"]]), [[Infinity, 1], [2, -Infinity]]);
check('числа-строки "42" → 42', cells([["1", "2"], ["3", "4"]]), [[1, 2], [3, 4]]);
check("булевы значения ячейкой не считаются", m([[true, false], [true, false]]), null);
check("обрывок до 64×64", shape(Array.from({ length: 80 }, () => Array.from({ length: 80 }, () => 1))), { rows: 64, cols: 64, label: "64×64", numbers: true });
check("hasNumbers=false невозможна для живой матрицы", m([[null, null], [null, null]]), null);

/* ── pickLiveVar ──────────────────────────────────────────────────── */
check("первое найденное имя по приоритету", pickLiveVar({ dist: 1, d: 2 }, ["d", "dist"]), { name: "d", value: 2 });
check("берёт следующее имя, если первого нет", pickLiveVar({ dist: 1 }, ["d", "dist"]), { name: "dist", value: 1 });
check("ничего не найдено → null", pickLiveVar({ x: 1 }, ["d", "dist"]), null);
check("нет снимка → null", pickLiveVar(undefined, ["d"]), null);
check("ключ со значением undefined всё равно считается", pickLiveVar({ d: undefined }, ["d"]), { name: "d", value: undefined });

/* ── clampIndex ───────────────────────────────────────────────────── */
check("null остаётся null", clampIndex(null, 5), null);
check("размер 0 → null", clampIndex(2, 0), null);
check("обрезка сверху", clampIndex(99, 5), 4);
check("обрезка снизу", clampIndex(-7, 5), 0);
check("дробный индекс усекается", clampIndex(2.9, 5), 2);
check("NaN → null", clampIndex(Number.NaN, 5), null);
check("Infinity → null", clampIndex(Number.POSITIVE_INFINITY, 5), null);

console.log("=".repeat(72));
console.log(`liveMatrix / pickLiveVar / clampIndex:  прошло ${passed},  провалено ${failures.length}`);
for (const f of failures) console.log(`  ✗ ${f}`);
console.log("=".repeat(72));
process.exit(failures.length ? 1 : 0);
