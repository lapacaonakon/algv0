import type { Chapter } from "../types";
import { GLOSSARY_BY_ID } from "../data/glossary";
import { annotateTerms } from "../hooks/useTermHints";
import { annotateTicketLinks } from "./ticketLinks";

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
body { font-size: 15px; line-height: 1.6; }
.export-shell p, .export-shell li { line-height: 1.65; }
.export-shell pre { font-size: 12px; line-height: 1.5; }
.export-figs { margin: 0 0 1.6rem; }
.export-figs-title { color: #e2e8f0; font-size: .95rem; font-weight: 700; margin: 0 0 .6rem; }
.export-fig { margin: 0 0 .9rem; }
.export-fig img { width: 100%; border: 1px solid #1e293b; border-radius: .5rem; background: #020617; }
.export-fig figcaption { color: #94a3b8; font-size: .75rem; margin-top: .3rem; }
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
function prepareBody(html: string, opts: { selfId?: string; ticketAnchors?: boolean } = {}): {
  body: string;
  termIds: string[];
} {
  const host = document.createElement("div");
  host.innerHTML = html;

  try {
    annotateTerms(host);
  } catch {
    /* если браузер не осилил регулярку — выгружаем текст как есть */
  }

  /*
   * Упоминания «билет 15» становятся якорями на главу внутри файла. Делаем это
   * только для книги, где все главы на месте: в файле одной темы такой якорь
   * вёл бы в никуда, а битые ссылки — ровно то, от чего мы избавляемся.
   */
  if (opts.ticketAnchors) {
    try {
      annotateTicketLinks(host, { selfId: opts.selfId });
      host.querySelectorAll<HTMLAnchorElement>("a[data-goto]").forEach((a) => {
        a.setAttribute("href", `#ch-${a.dataset.goto}`);
        a.removeAttribute("data-goto");
      });
    } catch {
      /* ссылки — улучшение, а не обязательная часть файла */
    }
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

function glossarySection(termIds: string[], book = false): string {
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
  <h2>${book ? "Словарик терминов пособия" : "Словарик терминов из этой темы"}</h2>
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

/**
 * Картинки встраиваются в файл data-URL: автономная копия не должна терять
 * иллюстрации офлайн (раньше src вел на ассет приложения и в скачанной книге
 * картинки исчезали — оставались только самые первые, встроенные в CSS).
 */
async function inlineImages(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img[src]"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src") ?? "";
      if (!src || src.startsWith("data:")) return;
      try {
        const res = await fetch(src);
        if (!res.ok) return;
        const blob = await res.blob();
        if (blob.size > 4_000_000) return;
        const data = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        });
        img.setAttribute("src", data);
      } catch {
        /* картинка недоступна — глава останется со ссылкой на онлайн */
      }
    })
  );
  return doc.body.innerHTML;
}

/**
 * Кадры визуализаций: книга встраивает снимки демонстраций, чтобы автономный
 * файл показывал, что крутилось в приложении. Снимки делает CI
 * (capture-viz-shots.mjs) и публикует в /export/viz-shots/ вместе с манифестом;
 * без них (офлайн-сборка, локальный дев) книга остаётся текстовой — это
 * нормально и молча пропускается.
 */
async function vizFigures(chapterId: string): Promise<string> {
  try {
    const base = import.meta.env.BASE_URL || "/";
    const manifestRes = await fetch(`${base}export/viz-shots/manifest.json`);
    if (!manifestRes.ok) return "";
    const manifest = (await manifestRes.json()) as { file: string; name: string }[];
    const mine = manifest.filter((m) => m.file === `${chapterId}.png` || m.file.startsWith(`${chapterId}--`));
    const figures: string[] = [];
    for (const m of mine.slice(0, 4)) {
      const res = await fetch(`${base}export/viz-shots/${m.file}`);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.size > 3_000_000) continue;
      const data = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
      });
      figures.push(
        `<figure class="export-fig"><img src="${data}" alt="${escapeHtml(m.name || chapterId)}" />` +
          `<figcaption>${m.name ? `Режим «${escapeHtml(m.name)}»` : "Визуализация темы"}</figcaption></figure>`
      );
    }
    return figures.length
      ? `<div class="export-figs"><h3 class="export-figs-title">Как выглядит демонстрация</h3>${figures.join("")}</div>`
      : "";
  } catch {
    return "";
  }
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

/** Собрать автономный HTML одной главы. */
export async function buildChapterHtml(chapter: Chapter): Promise<string> {
  const css = await collectCss();
  const { body: rawBody, termIds } = prepareBody(chapter.content);
  const body = (await vizFigures(chapter.id)) + (await inlineImages(rawBody));
  return wrap({
    title: chapter.title,
    subtitle: chapter.category || "Универсальное пособие",
    css,
    body,
    gloss: glossarySection(termIds),
    origin: window.location.origin,
  });
}

/** Выгрузить одну главу. */
export async function downloadChapterHtml(chapter: Chapter): Promise<void> {
  triggerDownload(await buildChapterHtml(chapter), safeName(chapter.title, chapter.id));
}

/** Собрать книгу: всё пособие одним файлом со сквозным оглавлением. */
export async function buildBookHtml(chapters: Chapter[]): Promise<string> {
  const css = await collectCss();
  const allTerms: string[] = [];
  const bodies: string[] = [];

  const toc = chapters
    .map((c) => `<li style="margin:.2rem 0"><a href="#ch-${escapeHtml(c.id)}" style="color:#a5b4fc">${escapeHtml(c.title)}</a></li>`)
    .join("\n");

  for (const c of chapters) {
    const { body: rawBody, termIds } = prepareBody(c.content, { selfId: c.id, ticketAnchors: true });
    // картинки глав встраиваются сразу: книга одна, ассеты снаружи не выживут;
    // снимки демонстраций подтягиваются из /export/viz-shots/ (их сделал CI)
    const body = (await vizFigures(c.id)) + (await inlineImages(rawBody));
    termIds.forEach((t) => {
      if (!allTerms.includes(t)) allTerms.push(t);
    });
    bodies.push(`<div id="ch-${escapeHtml(c.id)}" style="scroll-margin-top:1rem">${body}
<p style="text-align:right;font-size:.72rem;margin:0 0 3rem"><a href="#toc" style="color:#475569">↑ к оглавлению</a></p></div>`);
  }

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
    gloss: glossarySection(allTerms, true),
    origin: window.location.origin,
  });
  return html;
}

/** Выгрузить всё пособие одним файлом. */
export async function downloadBookHtml(chapters: Chapter[]): Promise<void> {
  triggerDownload(await buildBookHtml(chapters), "posobie-vse-temy.html");
}
