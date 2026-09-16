/**
 * Аудит внутренних ссылок пособия: ничего не должно вести в никуда.
 *
 *   npm run verify:links
 *
 * Проверяет (по настоящим модулям приложения, собранным esbuild'ом):
 *   1. билеты 1–24 закрыты страницами, id в chapterTopics существуют;
 *   2. разделы содержания: каждая страница в своём разделе, билеты без дыр;
 *   3. упоминания «билет N» в тексте ведут на существующую страницу;
 *   4. все data-goto / href="?topic=…" указывают на существующие страницы;
 *   5. якоря href="#…" есть в той же главе;
 *   6. glossary.simulator существует в реестре и (кроме дополнительных демо)
 *      имеет свою страницу — иначе модалка не получит данные компилятора;
 *   7. glossary.demo — работающая мини-демо;
 *   8. у каждого ключа PAGE_SYNC есть запись в реестре (нет мёртвых ключей);
 *   9. у каждой страницы есть визуализация;
 *  10. страницы связаны перекрёстными ссылками (темы не висят поодиночке).
 */
import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync } from "fs";

const OUT = "tmp/verify/links-entry.mjs";
const FAILS = [];
const NOTES = [];
const ok = (cond, message) => (cond ? true : (FAILS.push(message), false));

mkdirSync("tmp/verify", { recursive: true });
writeFileSync(
  "tmp/verify/links-entry.ts",
  [
    'export { chapters, chapterTopics, SECTIONS, sectionOf } from "../../src/data/content";',
    'export { GLOSSARY } from "../../src/data/glossary";',
    'export { VIZ_REGISTRY } from "../../src/components/vizRegistry";',
    'export { PAGE_SYNC } from "../../src/data/vizSync";',
    'export { quizzes } from "../../src/data/quizzes";',
    'export { MINI_DEMO_KINDS } from "../../src/components/hints/MiniDemo";',
  ].join("\n")
);
await esbuild.build({
  entryPoints: ["tmp/verify/links-entry.ts"],
  bundle: true,
  outfile: OUT,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  logLevel: "error",
  define: {
    "process.env.NODE_ENV": '"development"',
    "import.meta.env.BASE_URL": '"/"',
    "import.meta.env.MODE": '"development"',
    "import.meta.env.DEV": "true",
    "import.meta.env.PROD": "false",
    "import.meta.env.SSR": "false",
  },
  loader: { ".css": "empty", ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".svg": "dataurl", ".gif": "dataurl" },
});
const { chapters, chapterTopics, SECTIONS, sectionOf, GLOSSARY, VIZ_REGISTRY, PAGE_SYNC, quizzes, MINI_DEMO_KINDS } =
  await import(`${process.cwd()}/${OUT}?run=${Date.now()}`);

const chapterIds = new Set(chapters.map((c) => c.id));
const registryIds = Object.keys(VIZ_REGISTRY);

/** Демо без собственной страницы: открываются из подсказок терминов как дополнение. */
const EXTRA_DEMOS = new Set(["stack-dfs", "queue-bfs", "heap-beam-search", "dynamic-programming", "intro", "everyday-basics"]);

/* 1. билеты 1–24 */
const covered = new Set();
for (const [id, tickets] of Object.entries(chapterTopics)) {
  ok(chapterIds.has(id), `chapterTopics ссылается на несуществующую страницу «${id}»`);
  tickets.forEach((n) => covered.add(n));
}
for (let n = 1; n <= 25; n += 1) {
  ok(covered.has(n), `билет ${n} не закрыт ни одной страницей`);
}

/* 2. разделы содержания */
for (const chapter of chapters) {
  const sec = sectionOf(chapter.id);
  ok(!!sec, `страница «${chapter.id}» не попала ни в один раздел`);
  const tickets = chapterTopics[chapter.id] ?? [];
  ok(
    tickets.every((n) => n >= sec.from && n <= sec.to),
    `билеты страницы «${chapter.id}» (${tickets.join(",")}) вне диапазона раздела «${sec.title}» (${sec.from}–${sec.to})`
  );
}
{
  const bySection = SECTIONS.map((s) => ({
    s,
    nums: chapters.flatMap((c) => (sectionOf(c.id).id === s.id ? chapterTopics[c.id] ?? [] : [])).sort((a, b) => a - b),
  }));
  for (let i = 1; i < bySection.length; i += 1) {
    const prevMax = Math.max(...bySection[i - 1].nums);
    const curMin = Math.min(...bySection[i].nums);
    ok(curMin > prevMax, `разделы пересекаются: «${bySection[i - 1].s.title}» (…${prevMax}) и «${bySection[i].s.title}» (${curMin}…)`);
  }
  const all = bySection.flatMap((x) => x.nums);
  for (let n = all[0]; n <= all[all.length - 1]; n += 1) {
    ok(all.includes(n), `в содержании дыра: билет ${n} не встречается ни в одном разделе`);
  }
}

/* 3–5. ссылки внутри текста страниц */
const TICKET_RE = /билет(?:ы|ов|ам|ах|ом|у|а|е)?\s*(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?/gi;
let ticketMentions = 0;
let explicitLinks = 0;
const withoutLinks = [];
for (const chapter of chapters) {
  const html = chapter.content ?? "";
  let mentionsHere = 0;

  // 3. упоминания «билет N» — только внутри текста, не в разметке и не в коде
  const textOnly = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code[\s\S]*?<\/code>/gi, " ")
    .replace(/<[^>]*>/g, " ");
  for (const m of textOnly.matchAll(TICKET_RE)) {
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    mentionsHere += 1;
    for (let n = from; n <= to; n += 1) {
      ok(n >= 1 && n <= 25 && covered.has(n), `«${chapter.id}»: упоминание «${m[0]}» ведёт в никуда — билета ${n} нет в пособии`);
    }
  }
  ticketMentions += mentionsHere;

  // 4. явные переходы
  for (const m of html.matchAll(/data-goto="([^"]+)"/g)) {
    explicitLinks += 1;
    ok(chapterIds.has(m[1]), `«${chapter.id}»: data-goto="${m[1]}" — такой страницы нет`);
  }
  for (const m of html.matchAll(/href="\?(?:lite=1&)?topic=([^"&]+)"/g)) {
    explicitLinks += 1;
    ok(chapterIds.has(decodeURIComponent(m[1])), `«${chapter.id}»: href="?topic=${m[1]}" — такой страницы нет`);
  }

  // 5. якоря
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    ok(html.includes(`id="${m[1]}"`), `«${chapter.id}»: якорь #${m[1]} не найден в этой же главе`);
  }

  if (mentionsHere === 0 && !/data-goto=/.test(html)) withoutLinks.push(chapter.id);
}

/* 6–7. глоссарий */
const demoKinds = new Set(MINI_DEMO_KINDS);
for (const term of GLOSSARY) {
  if (term.simulator) {
    ok(registryIds.includes(term.simulator), `глоссарий «${term.id}»: simulator "${term.simulator}" отсутствует в реестре визуализаций`);
    ok(
      chapterIds.has(term.simulator) || EXTRA_DEMOS.has(term.simulator),
      `глоссарий «${term.id}»: simulator "${term.simulator}" не имеет страницы и не числится дополнительным демо — модалка не получит данные компилятора`
    );
  }
  if (term.demo) ok(demoKinds.has(term.demo), `глоссарий «${term.id}»: мини-демо "${term.demo}" не существует`);
}

/* 8–9. реестр и синхронизация */
for (const key of Object.keys(PAGE_SYNC)) {
  const base = key.split("#")[0];
  ok(registryIds.includes(base), `PAGE_SYNC["${key}"]: в реестре нет визуализации "${base}" — ключ мёртв`);
}
for (const id of registryIds) {
  if (!chapterIds.has(id) && !EXTRA_DEMOS.has(id)) {
    FAILS.push(`реестр: визуализация "${id}" не является ни страницей, ни дополнительным демо`);
  }
}
for (const chapter of chapters) {
  ok(registryIds.includes(chapter.id), `страница «${chapter.id}» без визуализации`);
}

/* 9б. файлы, на которые ведут кнопки шапки, действительно существуют */
{
  const { existsSync, statSync } = await import("fs");
  for (const file of ["public/export/guide_lite.pdf", "public/export/full_code_all_pages.pdf", "public/export/full_code_all_pages.txt"]) {
    ok(existsSync(file), `шапка ссылается на ${file}, но файла нет (нужна сборка npm run export)`);
    if (existsSync(file) && statSync(file).size < 1000) FAILS.push(`${file} подозрительно маленький: ${statSync(file).size} байт`);
  }
}

/* 10. связанные темы + блиц */
for (const id of withoutLinks) NOTES.push(`нет перекрёстных ссылок на другие билеты: ${id}`);
const noQuiz = chapters.filter((c) => !(quizzes[c.id] ?? []).length).map((c) => c.id);

console.log("────────── ссылки и структура содержания ──────────");
console.log(`  страниц: ${chapters.length} · разделов: ${SECTIONS.length} · билетов закрыто: ${covered.size}/24`);
console.log(`  упоминаний «билет N» в тексте: ${ticketMentions} · явных ссылок data-goto/href: ${explicitLinks}`);
console.log(`  визуализаций в реестре: ${registryIds.length} · ключей PAGE_SYNC: ${Object.keys(PAGE_SYNC).length} · терминов глоссария: ${GLOSSARY.length}`);
console.log(`  блиц есть у ${Object.keys(quizzes).length} страниц из ${chapters.length}`);
if (NOTES.length) console.log(`  заметки:\n    ${NOTES.join("\n    ")}`);
if (noQuiz.length) console.log(`  без блица: ${noQuiz.join(", ")}`);

if (FAILS.length) {
  console.log(`\nПРОВАЛЕНО ${FAILS.length}:`);
  FAILS.slice(0, 40).forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log("\nвсе ссылки целы: 0 битых переходов");
