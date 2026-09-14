/**
 * Зонд панели Python: печатает состояние редактора/трассы во времени.
 * Не тест, а диагностика — когда нужно понять, что панель делает ПОСЛЕ
 * ввода кода (автозапуск, переход в листинг, сообщения в футере).
 *
 *   npm run verify:probe
 */
import * as esbuild from "esbuild";
import { mkdirSync } from "fs";
import { loadPyodide } from "pyodide";
import { createDom } from "./dom-env.mjs";

const OUT_DIR = "tmp/verify";
mkdirSync(OUT_DIR, { recursive: true });
const log = (m) => process.stdout.write(`[verify:probe] ${m}\n`);

log("гружаю CPython…");
const py = await loadPyodide({ indexURL: "node_modules/pyodide/" });
log("поднимаю jsdom…");
const { window, document } = createDom();
window.__algv0PythonRuntime = py;

await esbuild.build({
  entryPoints: ["scripts/verify/probe-compiler.tsx"],
  bundle: true,
  outfile: `${OUT_DIR}/probe-bundle.mjs`,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"development"',
    "import.meta.env.BASE_URL": '"/"',
    "import.meta.env.DEV": "true",
    "import.meta.env.PROD": "false",
  },
  loader: { ".css": "empty", ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".svg": "dataurl" },
  logLevel: "warning",
});
const mod = await import(`${process.cwd()}/${OUT_DIR}/probe-bundle.mjs?run=${Date.now()}`);
log("зондирую панель…");
await mod.probe();
process.exit(0);
