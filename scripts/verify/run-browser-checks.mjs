/**
 * DOM-проверки приложения: jsdom + настоящий Pyodide из node_modules.
 *
 *   npm run verify:dom
 *
 * Фильтры:
 *   HAR_CHAPTERS=floyd,dijkstra   только эти страницы (группа A)
 *   HAR_SKIP=A,E                  пропустить группы (A страницы, B Флойд,
 *                                 C матрицы, D графы, E эталонный код,
 *                                 F редактор, G lite, H доступность)
 *   HAR_SYNC=floyd,mst#prim       только эти записи эталонного кода
 *
 * Оркестратор: грузит CPython ДО создания jsdom (иначе Pyodide решает, что он
 * в браузере, и лезет за wasm на CDN), кладёт runtime в
 * window.__algv0PythonRuntime и собирает реальные компоненты esbuild'ом.
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync } from "fs";
import { loadPyodide } from "pyodide";
import { createDom } from "./dom-env.mjs";

const OUT_DIR = "tmp/verify";
const t0 = Date.now();
const jsdomErrors = [];

log("гружаю CPython (pyodide из node_modules)…");
const py = await loadPyodide({ indexURL: "node_modules/pyodide/" });
log(`  Python готов за ${Date.now() - t0} мс`);

log("поднимаю jsdom…");
const { window, document, consoleErrors } = createDom({ onError: (e) => jsdomErrors.push(e?.message ?? String(e)) });
window.__algv0PythonRuntime = py;

log("собираю приложение esbuild'ом…");
mkdirSync(OUT_DIR, { recursive: true });
await esbuild.build({
  entryPoints: ["scripts/verify/browser-checks.tsx"],
  bundle: true,
  outfile: `${OUT_DIR}/bundle.mjs`,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  sourcemap: true,
  // Vite-специфичные глобалы, которых нет вне dev-сервера
  define: {
    "process.env.NODE_ENV": '"development"',
    "import.meta.env.BASE_URL": '"/"',
    "import.meta.env.MODE": '"development"',
    "import.meta.env.DEV": "true",
    "import.meta.env.PROD": "false",
    "import.meta.env.SSR": "false",
  },
  loader: { ".css": "empty", ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".svg": "dataurl", ".woff2": "dataurl" },
  logLevel: "warning",
});
const mod = await import(`${process.cwd()}/${OUT_DIR}/bundle.mjs?run=${Date.now()}`);

process.on("unhandledRejection", (reason) => {
  jsdomErrors.push(`unhandledRejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
});

log("прогоняю сценарии…\n");
const results = await mod.runSuite({ py, window, document });
const sum = mod.summary();

writeFileSync(`${OUT_DIR}/report.json`, JSON.stringify({ results, sum, jsdomErrors }, null, 2));

const failed = results.filter((r) => !r.ok);
console.log("\n" + "=".repeat(96));
console.log("СВОДКА");
console.log("=".repeat(96));
for (const [group, g] of Object.entries(sum.byGroup)) {
  console.log(`  ${group.padEnd(26)} ok: ${String(g.ok).padStart(3)}   провалено: ${g.fail}`);
}
console.log(`\n  ВСЕГО ${sum.total}:  прошло ${sum.passed},  провалено ${sum.failed}`);
if (failed.length) {
  console.log("\nПРОВАЛЫ:");
  for (const f of failed) console.log(`  ✗ [${f.group}] ${f.name}\n      ${f.detail.split("\n").join("\n      ").slice(0, 900)}`);
}
if (jsdomErrors.length) {
  console.log("\nОШИБКИ ОКРУЖЕНИЯ (jsdom/неперехваченные):");
  for (const e of [...new Set(jsdomErrors)].slice(0, 10)) console.log(`  ! ${String(e).slice(0, 400)}`);
}
const stray = consoleErrors.filter((e) => !/not wrapped in act/.test(e));
if (stray.length) {
  console.log(`\nCONSOLE.ERROR вне тестов (${stray.length}):`);
  for (const e of [...new Set(stray)].slice(0, 10)) console.log(`  ! ${e.slice(0, 400)}`);
}
console.log(`\nотчёт: ${OUT_DIR}/report.json  |  время: ${((Date.now() - t0) / 1000).toFixed(1)} с`);
process.exit(sum.failed > 0 || jsdomErrors.length > 0 ? 1 : 0);

function log(message) {
  process.stdout.write(`[verify:dom] ${message}\n`);
}
