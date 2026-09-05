import type { Chapter } from "../types";
import { GLOSSARY_BY_ID } from "../data/glossary";
import { annotateTerms } from "../hooks/useTermHints";

/**
 * Выгрузка главы (или всего пособия) в самостоятельный HTML-файл.
 *
 * Файл получается автономным: стили зашиты внутрь, интернет не нужен,
 * его можно открыть с флешки, отправить в мессенджер или распечатать.
 * Живые React-визуализации в статику не переносятся — вместо них
 * подставляется заметка со ссылкой на онлайн-версию, а все термины,
 * которые в приложении всплывают по наведению, собираются в словарик
 * в конце документа.
 */

/** Собирает CSS страницы: сначала пробуем правила, при неудаче — качаем файл. */
async function collectCss(): Promise<string> {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = (sheet as CSSStyleSheet).cssRules;
      parts.push(Array.from(rules).map((r) => r.cssText).join("\n"));
    } catch {
      const href = (sheet as CSSStyleSheet).href;
      if (!href) continue;
      try {
        const res = await fetch(href);
        if (res.ok) parts.push(await res.text());
      } catch {
        /* чужой домен — пропускаем */
      }
    }
  }
  return parts.join("\n");
}

const EXTRA_CSS = `
/* — правки для автономного файла — */
html { color-scheme: dark; }
body { background: #020617; color: #e2e8f0; font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif; margin: 0; }
a.term-hint { text-decoration: none; }
.export-shell { max-width: 62rem; margin: 0 auto; padding: 2rem 1rem 4rem; }
.export-head { border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 2rem; }
.export-note { background: #0f172a; border: 1px solid #1e293b; border-left: 3px solid #6366f1;
  border-radius: .5rem; padding: .85rem 1rem; font-size: .8rem; color: #94a3b8; margin-bottom: 2rem; }
.export-note a { color: #a5b4fc; }
.export-gloss { margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 1.5rem; }
.export-gloss h2 { color: #fff; font-size: 1.25rem; font-weight: 800; margin: 0 0 1rem; }
.export-term { background: #0f172a; border: 1px solid #1e293b; border-radius: .6rem; padding: .9rem 1rem; margin-bottom: .6rem; }
.export-term h3 { color: #c7d2fe; font-size: .95rem; font-weight: 700; margin: 0 0 .35rem; }
.export-term p { margin: 0 0 .3rem; font-size: .85rem; color: #cbd5e1; line-height: 1.55; }
.export-term .formal { color: #94a3b8; font-size: .8rem; }
.export-term .cx { color: #6ee7b7; font-size: .78rem; font-family: ui-monospace, monospace; }
.export-foot { margin-top: 3rem; border-top: 1px solid #1e293b; padding-top: 1rem; font-size: .72rem; color: #475569; }
@media print {
  body { background: #fff; color: #0f172a; }
  .export-note, details { break-inside: avoid; }
  details { display: block; }
  details > div, details > p { display: block !important; }
  pre { white-space: pre-wrap; }
}
`;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Размечает термины и превращает их в якорные ссылки на словарик.
 * Возвращает готовый HTML главы и список найденных терминов.
 */
function prepareBody(html: string): { body: string; termIds: string[] } {
  const host = document.createElement("div");
  host.innerHTML = html;

  try {
    annotateTerms(host);
  } catch {
    /* если браузер не осилил регулярку — выгружаем текст как есть */
  }

  const ids: string[] = [];
  host.querySelectorAll<HTMLElement>(".term-hint").forEach((el) => {
    const id = el.dataset.termId;
    if (!id) return;
    if (!ids.includes(id)) ids.push(id);
    const link = document.createElement("a");
    link.className = "term-hint";
    link.href = `#term-${id}`;
    link.title = GLOSSARY_BY_ID.get(id)?.short ?? "";
    link.textContent = el.textContent ?? "";
    el.replaceWith(link);
  });

  // <details> в файле лучше раскрыть: иначе код и разборы «спрятаны» при печати
  host.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));

  return { body: host.innerHTML, termIds: ids };
}

function glossarySection(termIds: string[]): string {
  if (!termIds.length) return "";
  const items = termIds
    .map((id) => {
      const e = GLOSSARY_BY_ID.get(id);
      if (!e) return "";
      return `<div class="export-term" id="term-${escapeHtml(id)}">
  <h3>${escapeHtml(e.title)}</h3>
  <p>${escapeHtml(e.short)}</p>
  ${e.formal ? `<p class="formal">${escapeHtml(e.formal)}</p>` : ""}
  ${e.complexity ? `<p class="cx">Сложность: ${escapeHtml(e.complexity)}</p>` : ""}
</div>`;
    })
    .join("\n");

  return `<section class="export-gloss">
  <h2>Словарик терминов из этой темы</h2>
  <p style="font-size:.8rem;color:#94a3b8;margin:0 0 1rem">В приложении эти слова всплывают по наведению курсора. В офлайн-файле они собраны сюда.</p>
  ${items}
</section>`;
}

function wrap(opts: { title: string; subtitle: string; css: string; body: string; gloss: string; origin: string }) {
  const stamp = new Date().toLocaleString("ru-RU");
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
<style>${opts.css}</style>
<style>${EXTRA_CSS}</style>
</head>
<body>
<div class="export-shell">
  <header class="export-head">
    <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:#64748b">${escapeHtml(opts.subtitle)}</div>
    <h1 style="color:#fff;font-size:1.6rem;font-weight:800;margin:.3rem 0 0">${escapeHtml(opts.title)}</h1>
    <div style="font-size:.72rem;color:#475569;margin-top:.35rem">Сохранено ${escapeHtml(stamp)}</div>
  </header>

  <div class="export-note">
    Это автономная копия: стили внутри файла, интернет не нужен, можно распечатать (Ctrl+P) или сохранить в PDF.
    Интерактивные тренажёры и анимации в статичный HTML не переносятся —
    они живут в онлайн-версии: <a href="${escapeHtml(opts.origin)}">${escapeHtml(opts.origin)}</a>.
  </div>

  <article class="prose prose-invert max-w-none">
${opts.body}
  </article>

${opts.gloss}

  <footer class="export-foot">Универсальное пособие по алгоритмам и структурам данных · выгрузка отдельной страницы в HTML</footer>
</div>
</body>
</html>`;
}

function triggerDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Имя файла: «04-splay-derevo.html» — без кириллицы и пробелов. */
function safeName(title: string, id: string): string {
  const num = title.match(/^\s*(\d+)/)?.[1];
  const base = id.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return `${num ? String(num).padStart(2, "0") + "-" : ""}${base}.html`;
}

/** Выгрузить одну главу. */
export async function downloadChapterHtml(chapter: Chapter): Promise<void> {
  const css = await collectCss();
  const { body, termIds } = prepareBody(chapter.content);
  const html = wrap({
    title: chapter.title,
    subtitle: chapter.category || "Универсальное пособие",
    css,
    body,
    gloss: glossarySection(termIds),
    origin: window.location.origin,
  });
  triggerDownload(html, safeName(chapter.title, chapter.id));
}

/** Выгрузить всё пособие одним файлом со сквозным оглавлением. */
export async function downloadBookHtml(chapters: Chapter[]): Promise<void> {
  const css = await collectCss();
  const allTerms: string[] = [];
  const bodies: string[] = [];

  const toc = chapters
    .map((c) => `<li style="margin:.2rem 0"><a href="#ch-${escapeHtml(c.id)}" style="color:#a5b4fc">${escapeHtml(c.title)}</a></li>`)
    .join("\n");

  chapters.forEach((c) => {
    const { body, termIds } = prepareBody(c.content);
    termIds.forEach((t) => {
      if (!allTerms.includes(t)) allTerms.push(t);
    });
    bodies.push(`<div id="ch-${escapeHtml(c.id)}" style="scroll-margin-top:1rem">${body}
<p style="text-align:right;font-size:.72rem;margin:0 0 3rem"><a href="#toc" style="color:#475569">↑ к оглавлению</a></p></div>`);
  });

  const body = `<nav id="toc" style="background:#0f172a;border:1px solid #1e293b;border-radius:.6rem;padding:1rem 1.2rem;margin-bottom:2.5rem">
  <h2 style="color:#fff;font-size:1.05rem;font-weight:800;margin:0 0 .6rem">Оглавление · ${chapters.length} тем</h2>
  <ol style="margin:0;padding-left:1.1rem;font-size:.85rem">${toc}</ol>
</nav>
${bodies.join("\n")}`;

  const html = wrap({
    title: "Универсальное пособие по алгоритмам",
    subtitle: `Все темы, ${chapters.length} шт.`,
    css,
    body,
    gloss: glossarySection(allTerms),
    origin: window.location.origin,
  });
  triggerDownload(html, "posobie-vse-temy.html");
}
