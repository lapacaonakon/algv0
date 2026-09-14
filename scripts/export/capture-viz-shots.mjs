/**
 * Снимки визуализаций для PDF-конспекта: tmp/viz-shots/<chapter>.png
 *
 * Headless-браузер открывает каждую страницу с демонстрацией и фотографирует
 * блок #chapter-viz. У страниц с вкладками (sparse-table, mst, treap, splay)
 * снимается каждая вкладка — файл получает имя `<chapter>--<вкладка>.png`,
 * и PDF подписывает его как «режим «вкладка»».
 *
 *   npm run export:shots            # сервер уже поднят на SHOTS_BASE_URL
 *   SHOTS_BASE_URL=http://127.0.0.1:4173 npm run export:shots
 *
 * В CI это делает rebuild-pdf.yml: сборка → vite preview → этот скрипт →
 * npm run export:guide. Локально без браузера скрипт пропускается, и PDF
 * честно пишет, что снимки добавляются при сборке в CI.
 */
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import puppeteer from "puppeteer";
import { ROOT } from "./common.mjs";

const OUT_DIR = path.join(ROOT, "tmp", "viz-shots");
const BASE_URL = process.env.SHOTS_BASE_URL || "http://127.0.0.1:4173";

/** Вкладки, которые стоит снять отдельно: глава → подписи кнопок-вкладок. */
const TABS = {
  "sparse-table": ["1D", "2D: построение", "2D: запрос"],
  mst: ["Краскал", "Прим", "Борувка"],
  treap: ["Собрать", "Split", "Merge"],
  "splay-tree": ["Обход", "Повороты", "Прогулка"],
};

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

async function vizIds() {
  const bundle = await build({
    stdin: {
      contents: `export { activeVizIds } from "../../src/data/content";`,
      resolveDir: path.join(ROOT, "scripts", "export"),
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    logLevel: "warning",
  });
  const mod = await import("data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64"));
  return mod.activeVizIds;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const ids = await vizIds();
console.log(`[export:shots] страниц со визуализациями: ${ids.length}, сервер: ${BASE_URL}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });

let done = 0;
let failed = 0;
for (const id of ids) {
  try {
    await page.goto(`${BASE_URL}/?topic=${id}`, { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForSelector("#chapter-viz", { timeout: 20000 });
    // демо-анимации: даём кадру собраться до осмысленного состояния
    await new Promise((r) => setTimeout(r, 1600));
    const viz = await page.$("#chapter-viz");
    if (!viz) throw new Error("нет #chapter-viz");
    await viz.screenshot({ path: path.join(OUT_DIR, `${id}.png`) });
    done += 1;

    for (const tab of TABS[id] ?? []) {
      try {
        const clicked = await page.evaluate((label) => {
          const root = document.querySelector("#chapter-viz");
          if (!root) return false;
          const btn = Array.from(root.querySelectorAll("button")).find((b) =>
            (b.textContent ?? "").trim().startsWith(label)
          );
          if (!btn) return false;
          btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
          return true;
        }, tab);
        if (!clicked) continue;
        await new Promise((r) => setTimeout(r, 1200));
        const el = await page.$("#chapter-viz");
        await el.screenshot({ path: path.join(OUT_DIR, `${id}--${slug(tab)}.png`) });
        done += 1;
      } catch (error) {
        console.log(`[export:shots]   вкладка «${tab}» (${id}): пропущена — ${error.message?.slice(0, 80)}`);
      }
    }
    console.log(`[export:shots] ok ${id}`);
  } catch (error) {
    failed += 1;
    console.log(`[export:shots] FAIL ${id}: ${String(error.message ?? error).slice(0, 120)}`);
  }
}

const manifest = fs
  .readdirSync(OUT_DIR)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort()
  .map((f) => ({ file: f, name: f.replace(/\.(png|jpe?g)$/i, "").split("--")[1] ?? "" }));
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 1));

await browser.close();
console.log(`[export:shots] снимков: ${done}, пропусков: ${failed} → ${path.relative(ROOT, OUT_DIR)}`);
// Пропущенные страницы не повод ронять пайплайн: PDF для них печатает
// текстовое описание демонстрации.
process.exit(0);
