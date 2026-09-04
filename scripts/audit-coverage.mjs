/**
 * Аудит покрытия глав пособия: у каких тем нет «объяснения на пальцах»
 * (блок «Аналогия») и/или 2D-визуализации (интерактивный компонент или inline SVG).
 *
 *   node scripts/audit-coverage.mjs            # отчёт в консоль
 *   node scripts/audit-coverage.mjs --md       # markdown-таблица
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP = path.join(ROOT, "tmp", "audit");

fs.mkdirSync(TMP, { recursive: true });
const bundle = path.join(TMP, "content.bundle.mjs");

await build({
  entryPoints: [path.join(ROOT, "src/data/content.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "error",
});

const { chapters } = await import(`file://${bundle}`);

// Список интерактивов берём из реестра визуализаторов
const registry = fs.readFileSync(path.join(ROOT, "src/components/vizRegistry.tsx"), "utf8");
const registryBody = registry.slice(registry.indexOf("VIZ_REGISTRY: Record<string, VizEntry> = {"));
const vizIds = new Set([...registryBody.matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s*\{/gim)].map((m) => m[1]));

const rows = chapters.map((c) => {
  const html = c.content ?? "";
  const analogies = (html.match(/Аналогия/gi) ?? []).length;
  return {
    id: c.id,
    title: c.title,
    num: Number.parseInt(c.title.match(/^(\d+)\./)?.[1] ?? "0", 10),
    analogies,
    hasAnalogy: analogies > 0,
    inlineSvg: /<svg[\s>]/i.test(html),
    image: /<img[\s>]/i.test(html),
    interactive: vizIds.has(c.id),
    chars: html.length,
  };
});

const has2D = (r) => r.interactive || r.inlineSvg || r.image;
const gapBoth = rows.filter((r) => !r.hasAnalogy && !has2D(r));
const gapAnalogy = rows.filter((r) => !r.hasAnalogy && has2D(r));
const gapViz = rows.filter((r) => r.hasAnalogy && !has2D(r));
const orphanViz = [...vizIds].filter((id) => !chapters.some((c) => c.id === id));

const nums = rows.map((r) => r.num).filter(Boolean);
const missingNums = Array.from({ length: 24 }, (_, i) => i + 1).filter((n) => !nums.includes(n));

const flag = (b) => (b ? "✅" : "—");

if (process.argv.includes("--md")) {
  console.log("| # | Глава | Аналогия | 2D-виз. | SVG | Картинка |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const r of rows) {
    console.log(
      `| ${r.num || "—"} | ${r.title} | ${r.hasAnalogy ? r.analogies : "—"} | ${flag(r.interactive)} | ${flag(r.inlineSvg)} | ${flag(r.image)} |`
    );
  }
} else {
  console.log(`Глав в пособии: ${rows.length}\n`);
  const dump = (title, list) => {
    console.log(`${title} (${list.length}):`);
    list.forEach((r) => console.log(`  • ${r.title}  [${r.id}]`));
    console.log();
  };
  dump("НЕТ НИ АНАЛОГИИ, НИ 2D", gapBoth);
  dump("НЕТ АНАЛОГИИ (2D есть)", gapAnalogy);
  dump("НЕТ 2D (аналогия есть)", gapViz);
  console.log(`Пропущенные номера билетов 1-24: ${missingNums.join(", ") || "нет"}`);
  console.log(`Визуализаторы без главы: ${orphanViz.join(", ") || "нет"}`);
}
