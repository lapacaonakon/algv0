/**
 * ШАГ 1: КОД -> TXT
 *
 * Собирает ВЕСЬ исходный код репозитория в один текстовый файл
 * public/export/full_code_all_pages.txt
 *
 * Список файлов берётся из git (чтобы ничего не забыть и не утащить мусор),
 * с фоллбэком на обход файловой системы, если git недоступен.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, OUT_DIR, TXT_PATH, HR, SUBHR, ensureDir, humanSize } from "./common.mjs";

/** Расширения, которые считаем «кодом» и включаем в дамп. */
const CODE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss", ".html", ".json", ".md", ".yml", ".yaml",
]);

/** Явные исключения: генерируемое, бинарное и просто шумное. */
const EXCLUDE_FILES = new Set(["package-lock.json", "bun.lock", "yarn.lock", "pnpm-lock.yaml"]);
const EXCLUDE_DIRS = ["node_modules", "dist", "build", "tmp", ".git", "public/export"];

/** Человекочитаемые категории для оглавления. */
const CATEGORIES = [
  [/^src\/data\/tickets\//, "Билеты (учебный контент)"],
  [/^src\/data\//, "Контент и данные пособия"],
  [/^src\/components\/visualizers\//, "Визуализаторы (вложенные)"],
  [/^src\/components\//, "Интерактивные компоненты и симуляторы"],
  [/^src\/layout\//, "HTML-разметка (layout)"],
  [/^src\/utils\//, "Утилиты"],
  [/^src\//, "Ядро приложения"],
  [/^scripts\//, "Скрипты сборки и экспорта"],
  [/^\.github\//, "CI / автоматизация"],
  [/^[^/]+$/, "Конфигурация проекта"],
];

const categoryOf = (rel) => CATEGORIES.find(([re]) => re.test(rel))?.[1] ?? "Прочее";

/** Порядок разделов в документе. */
const ORDER = [
  "Конфигурация проекта",
  "Ядро приложения",
  "Контент и данные пособия",
  "Билеты (учебный контент)",
  "Интерактивные компоненты и симуляторы",
  "Визуализаторы (вложенные)",
  "HTML-разметка (layout)",
  "Утилиты",
  "Скрипты сборки и экспорта",
  "CI / автоматизация",
  "Прочее",
];

function listFiles() {
  let files;
  try {
    files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: ROOT,
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
  } catch {
    files = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        const rel = path.relative(ROOT, abs).split(path.sep).join("/");
        if (EXCLUDE_DIRS.some((d) => rel === d || rel.startsWith(`${d}/`))) continue;
        if (e.isDirectory()) walk(abs);
        else files.push(rel);
      }
    };
    walk(ROOT);
  }

  return files
    .filter((rel) => !EXCLUDE_DIRS.some((d) => rel.startsWith(`${d}/`)))
    .filter((rel) => !EXCLUDE_FILES.has(path.basename(rel)))
    .filter((rel) => CODE_EXT.has(path.extname(rel)))
    .filter((rel) => fs.existsSync(path.join(ROOT, rel)))
    .sort((a, b) => {
      const ia = ORDER.indexOf(categoryOf(a));
      const ib = ORDER.indexOf(categoryOf(b));
      return ia !== ib ? ia - ib : a.localeCompare(b);
    });
}

/** Достаём заголовки глав из данных пособия (без запуска TypeScript). */
function extractChapters(files) {
  const chapters = [];
  const seen = new Set();
  for (const rel of files.filter((f) => f.startsWith("src/data/"))) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const re = /id:\s*"([^"]+)"\s*,\s*\n?\s*title:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const [, id, title] = m;
      if (seen.has(id)) continue;
      seen.add(id);
      chapters.push({ id, title, file: rel });
    }
  }
  return chapters.sort((a, b) => {
    const na = parseInt(a.title.match(/(\d+)/)?.[0] ?? "999", 10);
    const nb = parseInt(b.title.match(/(\d+)/)?.[0] ?? "999", 10);
    return na - nb;
  });
}

function main() {
  const files = listFiles();
  const chapters = extractChapters(files);
  ensureDir(OUT_DIR);

  const out = [];
  const push = (s = "") => out.push(s);

  const stamp = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const totalBytes = files.reduce((s, f) => s + fs.statSync(path.join(ROOT, f)).size, 0);

  push(HR);
  push("       УНИВЕРСАЛЬНОЕ ПОСОБИЕ ПО АЛГОРИТМАМ И СТРУКТУРАМ ДАННЫХ");
  push("            ПОЛНЫЙ ИСХОДНЫЙ КОД ПРОЕКТА (ВСЕ ФАЙЛЫ, ВСЕ СТРАНИЦЫ)");
  push(HR);
  push();
  push(`Дата генерации:            ${stamp}`);
  push(`Файлов исходного кода:     ${files.length}`);
  push(`Суммарный объём кода:      ${humanSize(totalBytes)}`);
  push(`Глав/билетов в пособии:    ${chapters.length}`);
  push();

  push(HR);
  push("                       ОГЛАВЛЕНИЕ: ГЛАВЫ И БИЛЕТЫ");
  push(HR);
  chapters.forEach((c, i) => {
    push(`  ${String(i + 1).padStart(3, " ")}. ${c.title}   [id: ${c.id}]`);
  });
  push();

  push(HR);
  push("                       ОГЛАВЛЕНИЕ: ФАЙЛЫ ИСХОДНОГО КОДА");
  push(HR);
  let current = null;
  files.forEach((rel, i) => {
    const cat = categoryOf(rel);
    if (cat !== current) {
      current = cat;
      push();
      push(`  # ${cat}`);
    }
    push(`  ${String(i + 1).padStart(3, " ")}. ${rel}`);
  });
  push();
  push();

  current = null;
  files.forEach((rel, i) => {
    const cat = categoryOf(rel);
    if (cat !== current) {
      current = cat;
      push(HR);
      push(`РАЗДЕЛ: ${cat.toUpperCase()}`);
      push(HR);
      push();
    }
    const content = fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
    const lines = content.split("\n");
    push(SUBHR);
    push(`ФАЙЛ ${i + 1}/${files.length}: ${rel}`);
    push(`КАТЕГОРИЯ: ${cat} | СТРОК: ${lines.length} | РАЗМЕР: ${humanSize(Buffer.byteLength(content))}`);
    push(SUBHR);
    push();
    push(content.replace(/\n+$/, ""));
    push();
    push();
  });

  push(HR);
  push(`КОНЕЦ ДОКУМЕНТА • ${files.length} файлов • сгенерировано ${stamp}`);
  push(HR);

  const txt = out.join("\n") + "\n";
  fs.writeFileSync(TXT_PATH, txt, "utf8");

  console.log("[1/3] код -> txt");
  console.log(`      файлов:  ${files.length}`);
  console.log(`      глав:    ${chapters.length}`);
  console.log(`      строк:   ${txt.split("\n").length}`);
  console.log(`      выход:   ${path.relative(ROOT, TXT_PATH)} (${humanSize(Buffer.byteLength(txt))})`);
}

main();
