/**
 * Контракт «эталонный код ↔ страница ↔ визуализация».
 *
 *   npm run verify:code
 *
 * Каждый референсный Python-код из PAGE_SYNC выполняется НАСТОЯЩИМ CPython
 * (pyodide из node_modules) под тем же трейсером, что и панель компилятора, и
 * проверяется:
 *   1. код не падает и не обрывается по лимиту шагов;
 *   2. трасса не пустая (иначе панель показала бы пустой листинг);
 *   3. каждая переменная, обещанная странице, реально создаётся кодом —
 *      иначе визуализация не может за ним следовать;
 *   4. в снимках нет «мусорных» значений, которые уронят компонент.
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { loadPyodide } from "pyodide";

const OUT_DIR = "tmp/verify";
const t0 = Date.now();
mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(
  `${OUT_DIR}/contract-entry.ts`,
  `import { buildDebugRunner } from "../../src/data/debugRunner";
import { PAGE_SYNC } from "../../src/data/vizSync";
import { chapters } from "../../src/data/content";
export const runnerOf = (src: string) => buildDebugRunner(src);
export const sync = Object.fromEntries(Object.entries(PAGE_SYNC).filter(([, v]) => v.code));
export const declared = Object.fromEntries(Object.entries(PAGE_SYNC).map(([k, v]) => [k, v.variables.map((x) => x.name)]));
export const chapterIds = chapters.map((c) => c.id);
`
);

const built = await esbuild.build({
  entryPoints: [`${OUT_DIR}/contract-entry.ts`],
  bundle: true,
  outfile: `${OUT_DIR}/contract-bundle.mjs`,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  sourcemap: false,
  loader: { ".css": "empty", ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".svg": "dataurl" },
  logLevel: "warning",
});
void built;
const mod = await import(`${process.cwd()}/${OUT_DIR}/contract-bundle.mjs?run=${Date.now()}`);

const py = await loadPyodide({ indexURL: "node_modules/pyodide/" });
const printed = [];
py.setStdout({ batched: (m) => printed.push(m) });
py.setStderr({ batched: (m) => printed.push("[stderr] " + m) });

const only = process.argv.slice(2);
const ident = (t) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(t);
/** «xk / x», «dist[v]», «(i−1)//2», «π» → набор python-идентификаторов. */
const alts = (raw) => raw.split(/[\/[\],]|\s+или\s+/).map((p) => p.trim()).filter(Boolean);

const rows = [];
let problems = 0;
for (const [key, entry] of Object.entries(mod.sync)) {
  if (only.length && !only.some((o) => key.includes(o))) continue;
  printed.length = 0;
  let result;
  try {
    result = JSON.parse(String(await py.runPythonAsync(mod.runnerOf(entry.code))));
  } catch (error) {
    problems++;
    rows.push({ key, steps: 0, status: `СБОЙ ЗАПУСКА: ${String(error).slice(0, 120)}` });
    continue;
  }
  const seen = new Set();
  for (const step of result.steps) for (const name of Object.keys(step.values ?? {})) seen.add(name);
  for (const name of Object.keys(result.finalValues ?? {})) seen.add(name);

  const issues = [];
  if (result.error) issues.push(`ошибка Python: ${result.error.split("\n").filter(Boolean).slice(-1)[0].slice(0, 90)}`);
  if (result.truncated) issues.push("трасса оборвана по лимиту шагов");
  if (result.steps.length === 0) issues.push("нет ни одного шага — панель показала бы пустой листинг");
  const missing = (mod.declared[key] ?? [])
    .map(alts)
    .filter((a) => a.some(ident))
    .filter((a) => !a.some((x) => ident(x) && seen.has(x)))
    .map((a) => a.join(" / "));
  if (missing.length) issues.push(`код не создаёт обещанные переменные: ${missing.join(", ")}`);
  /*
   * Обещанная переменная не должна быть пустой на ВСЕХ шагах: значит, код её
   * объявил и не наполнил — визуализации нечего показывать, а читатель видит
   * «зашитый» результат вместо работы алгоритма. Именно так выглядел эталон
   * Косарайю: order был дан готовым списком, а comp так и оставался {}.
   */
  const isEmpty = (v) =>
    Array.isArray(v) ? v.length === 0
    : typeof v === "string" ? v.length === 0
    : typeof v === "object" && v !== null ? Object.keys(v).length === 0
    : false;
  const neverFilled = (mod.declared[key] ?? [])
    .map(alts)
    .filter((a) => a.some(ident))
    .map((a) => a.find((x) => ident(x) && seen.has(x)))
    .filter(Boolean)
    .filter((name) => {
      let sawValue = false;
      let sawNonEmpty = false;
      for (const step of [...result.steps, { values: result.finalValues ?? {} }]) {
        const v = step.values?.[name];
        if (v === undefined || v === null) continue;
        sawValue = true;
        if (!isEmpty(v)) sawNonEmpty = true;
      }
      return sawValue && !sawNonEmpty;
    });
  if (neverFilled.length) issues.push(`объявлены, но ни разу не наполнены: ${neverFilled.join(", ")}`);

  const stderr = printed.filter((p) => p.startsWith("[stderr]"));
  if (stderr.length) issues.push(`предупреждения: ${stderr[0].slice(0, 90)}`);

  if (issues.length) problems++;
  rows.push({ key, steps: result.steps.length, vars: seen.size, status: issues.length ? issues.join("; ") : "ок" });
}

rows.sort((a, b) => (a.status === "ок") - (b.status === "ок") || b.steps - a.steps);
console.log("ЭТАЛОННЫЕ КОДЫ СТРАНИЦ (настоящий CPython под трейсером панели)");
console.log("=".repeat(96));
for (const r of rows) {
  const mark = r.status === "ок" ? "  ok " : "  ✗  ";
  console.log(`${mark}${r.key.padEnd(34)} шагов ${String(r.steps).padStart(4)}  переменных ${String(r.vars ?? 0).padStart(3)}  ${r.status === "ок" ? "" : r.status}`);
}
console.log("=".repeat(96));
console.log(`всего: ${rows.length}  |  с проблемами: ${problems}  |  время: ${((Date.now() - t0) / 1000).toFixed(1)} с`);
writeFileSync(`${OUT_DIR}/reference-code.json`, JSON.stringify(rows, null, 2));
process.exit(problems > 0 ? 1 : 0);
