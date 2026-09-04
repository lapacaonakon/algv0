/**
 * Проверка покрытия глав всплывающими подсказками:
 * в каждой ли теме находятся термины из глоссария.
 *
 *   node scripts/audit-terms.mjs
 */
import { build } from "esbuild";
import path from "node:path";

const ROOT = process.cwd();
await build({
  entryPoints: ["src/data/content.ts", "src/data/glossary.ts"],
  bundle: true, format: "esm", platform: "node",
  outdir: "tmp/audit-terms", outExtension: { ".js": ".mjs" }, logLevel: "error",
  external: ["react", "react-dom", "motion", "lucide-react"],
});

const { chapters } = await import(path.join(ROOT, "tmp/audit-terms/content.mjs"));
const { GLOSSARY_LABELS, GLOSSARY } = await import(path.join(ROOT, "tmp/audit-terms/glossary.mjs"));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const re = new RegExp(
  `(?<![\\p{L}\\p{N}_-])(${GLOSSARY_LABELS.map((l) => esc(l.label)).join("|")})(?![\\p{L}\\p{N}_-])`,
  "giu"
);
const map = new Map(GLOSSARY_LABELS.map((l) => [l.label.toLowerCase(), l.id]));

const bad = [];
const used = new Set();
for (const c of chapters) {
  const text = c.content
    .replace(/<(script|style|code|pre)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const ids = new Set([...text.matchAll(re)].map((m) => map.get(m[1].toLowerCase())).filter(Boolean));
  ids.forEach((i) => used.add(i));
  if (ids.size === 0) bad.push(c.title);
  console.log(String(ids.size).padStart(2), "|", c.title.slice(0, 52).padEnd(53), [...ids].slice(0, 7).join(","));
}
console.log("\nГлав без единой подсказки:", bad.length, bad);
console.log("Терминов в глоссарии:", GLOSSARY.length, "| встречаются в тексте:", used.size);
console.log("Не встретились:", GLOSSARY.filter((g) => !used.has(g.id)).map((g) => g.id).join(", ") || "—");
