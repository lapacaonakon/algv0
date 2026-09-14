/**
 * Автосборка PDF-конспекта `guide_all_topics.pdf`.
 *
 * Что внутри:
 *  • весь ТЕКСТ страниц пособия (больше текста, чем HTML-элементов);
 *  • картинки визуализаций — React-компоненты рендерятся в статику
 *    (renderToStaticMarkup), из разметки берутся SVG-схемы и изображения;
 *  • НИКАКОГО кода компилятора и интерфейсных кнопок.
 *
 * Результат: public/export/guide_all_topics.pdf, ~40–70 страниц A4.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PDFDocument from "pdfkit";
// @ts-ignore - у пакета нет типов
import SVGtoPDF from "svg-to-pdfkit/source.js";
import { chapters } from "../../src/data/content";
import { VizChapterContext } from "../../src/data/vizStepBus";
import { VIZ_REGISTRY, getViz } from "../../src/components/vizRegistry";

// ───────────────────────────── шрифты ─────────────────────────────

const FONT_DIRS = ["/usr/share/fonts/truetype/dejavu", "/usr/share/fonts"];
function findFont(file: string): string | null {
  for (const dir of FONT_DIRS) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
const F_REG = findFont("DejaVuSans.ttf");
const F_BOLD = findFont("DejaVuSans-Bold.ttf");
const F_MONO = findFont("DejaVuSansMono.ttf");

// ────────────────────────── HTML → блоки текста ──────────────────────────

type Block =
  | { kind: "h"; level: 2 | 3 | 4; text: string }
  | { kind: "p"; text: string }
  | { kind: "li"; text: string }
  | { kind: "code"; text: string }
  | { kind: "table"; rows: string[] };

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&rarr;": "→", "&larr;": "←", "&le;": "≤", "&ge;": "≥",
  "&ne;": "≠", "&times;": "×", "&minus;": "−", "&mdash;": "—", "&ndash;": "–",
  "&hellip;": "…", "&infin;": "∞", "&cup;": "∪", "&cap;": "∩", "&sube;": "⊆",
  "&sub;": "⊂", "&isin;": "∈", "&notin;": "∉", "&pi;": "π", "&alpha;": "α",
  "&beta;": "β", "&gamma;": "γ", "&Delta;": "Δ", "&delta;": "δ", "&chi;": "χ",
  "&log;": "log", "&deg;": "°", "&plusmn;": "±", "&middot;": "·", "&bull;": "•",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-zA-Z#0-9]+;/g, (e) => ENTITIES[e] ?? " ");
}

/** Убрать инлайн-теги, оставив чистый текст с пробелами. */
function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr|summary)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Найти закрывающий тег с учётом вложенности однотипных. */
function findClose(html: string, openEnd: number, tag: string): number {
  const re = new RegExp(`<\\/?${tag}(\\s[^>]*)?>`, "gi");
  re.lastIndex = openEnd;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return html.length;
}

function findCloseAny(html: string, openEnd: number, tag: string): { end: number; inner: string } {
  const close = html.toLowerCase().indexOf(`</${tag}`, openEnd);
  if (close < 0) return { end: html.length, inner: html.slice(openEnd) };
  const inner = html.slice(openEnd, close);
  const end = html.indexOf(">", close) + 1;
  return { end, inner };
}

/** Разобрать HTML главы на учебные блоки (текст → 90% документа). */
export function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  const skipTo = ["<pre", "<h2", "<h3", "<h4", "<summary"];
  while (i < html.length) {
    const lower = html.toLowerCase();
    const nexts = skipTo.map((t) => lower.indexOf(t, i)).filter((x) => x >= 0);
    const liRe = /<li(\s[^>]*)?>/gi;
    liRe.lastIndex = i;
    const liM = liRe.exec(lower);
    if (liM) nexts.push(liM.index);
    const trRe = /<tr(\s[^>]*)?>/gi;
    trRe.lastIndex = i;
    const trM = trRe.exec(lower);
    if (trM) nexts.push(trM.index);
    const pRe = /<p(\s[^>]*)?>/gi;
    pRe.lastIndex = i;
    const pM = pRe.exec(lower);
    if (pM) nexts.push(pM.index);
    if (!nexts.length) break;
    const at = Math.min(...nexts);

    if (lower.startsWith("<pre", at)) {
      const openEnd = html.indexOf(">", at) + 1;
      const { end, inner } = findCloseAny(html, openEnd, "pre");
      const code = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/\s+$/, "");
      if (code.trim()) blocks.push({ kind: "code", text: code });
      i = end;
      continue;
    }
    if (/^<h[234]/.test(lower.slice(at, at + 4))) {
      const tag = lower[at + 2];
      const openEnd = html.indexOf(">", at) + 1;
      const close = html.toLowerCase().indexOf(`</h${tag}`, openEnd);
      const text = stripTags(html.slice(openEnd, close < 0 ? html.length : close));
      if (text) blocks.push({ kind: "h", level: Number(tag) as 2 | 3 | 4, text });
      i = close < 0 ? html.length : close + 5;
      continue;
    }
    if (lower.startsWith("<summary", at)) {
      const openEnd = html.indexOf(">", at) + 1;
      const { end, inner } = findCloseAny(html, openEnd, "summary");
      const text = stripTags(inner);
      if (text) blocks.push({ kind: "p", text: "▸ " + text.replace(/^\s*(🔍|💡|📌)\s*/, "") + " — см. интерактивную версию" });
      // содержимое details выводим тоже: оно идёт сразу после summary
      const detEnd = html.toLowerCase().indexOf("</details>", end);
      if (detEnd >= 0) {
        blocks.push(...htmlToBlocks(html.slice(end, detEnd)));
        i = detEnd + "</details>".length;
      } else i = end;
      continue;
    }
    if (lower.startsWith("<li", at) || (liM && at === liM.index)) {
      const openEnd = html.indexOf(">", at) + 1;
      const close = html.toLowerCase().indexOf("</li>", openEnd);
      const text = stripTags(html.slice(openEnd, close < 0 ? html.length : close));
      if (text) blocks.push({ kind: "li", text });
      i = close < 0 ? html.length : close + 5;
      continue;
    }
    if (lower.startsWith("<tr", at)) {
      const openEnd = html.indexOf(">", at) + 1;
      const close = html.toLowerCase().indexOf("</tr>", openEnd);
      const rowHtml = html.slice(openEnd, close < 0 ? html.length : close);
      const cells: string[] = [];
      const tdRe = /<(t[dh])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
      let tm: RegExpExecArray | null;
      while ((tm = tdRe.exec(rowHtml))) cells.push(stripTags(tm[3]).replace(/\n/g, " "));
      if (cells.some(Boolean)) blocks.push({ kind: "table", rows: cells });
      i = close < 0 ? html.length : close + 5;
      continue;
    }
    // <p>
    const openEnd = html.indexOf(">", at) + 1;
    const close = html.toLowerCase().indexOf("</p>", openEnd);
    const text = stripTags(html.slice(openEnd, close < 0 ? html.length : close));
    if (text) blocks.push({ kind: "p", text });
    i = close < 0 ? html.length : close + 4;
  }
  return blocks;
}

// ───────────────────────── SSR визуализаций → SVG ─────────────────────────

interface VizArt {
  svgs: string[];
  images: string[]; // dataURL
  grids: string[][]; // текстовые матрицы (div-таблицы без SVG)
  error?: string;
}

/** Отрендерить визуализатор в статику и вытащить картинки-схемы. */
export function renderVizArt(chapterId: string): VizArt | null {
  const entry = getViz(chapterId);
  if (!entry) return null;
  try {
    const html = renderToStaticMarkup(
      createElement(VizChapterContext.Provider, { value: chapterId }, createElement(entry.Component))
    );
    const svgs: string[] = [];
    const images: string[] = [];
    let idx = 0;
    while (true) {
      const at = html.toLowerCase().indexOf("<svg", idx);
      if (at < 0) break;
      const openEnd = html.indexOf(">", at) + 1;
      // вложенные <svg> не встречаются, но ищем закрывающий с балансом
      let depth = 1;
      let pos = openEnd;
      while (depth > 0) {
        const no = html.toLowerCase().indexOf("<svg", pos);
        const nc = html.toLowerCase().indexOf("</svg>", pos);
        if (nc < 0) { pos = html.length; break; }
        if (no >= 0 && no < nc) { depth++; pos = html.indexOf(">", no) + 1; }
        else { depth--; pos = nc + 6; }
      }
      let svg = html.slice(at, pos);
      if (!/xmlns=/.test(svg)) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      // выкинуть элементы с tailwind-классами без инлайн-стилей незачем: svg-to-pdfkit берёт атрибуты
      svgs.push(svg);
      idx = pos;
    }
    const imgRe = /<img[^>]*src="(data:image\/(png|jpeg|jpg);base64,[^"]+)"/gi;
    let im: RegExpExecArray | null;
    while ((im = imgRe.exec(html))) images.push(im[1]);
    const grids = extractDivGrids(html);
    return { svgs, images, grids };
  } catch (e) {
    return { svgs: [], images: [], grids: [], error: String(e).slice(0, 200) };
  }
}

/**
 * Визуализации бывают и без SVG: матрицы из div-ячеек (например,
 * префиксные суммы). Собираем такие «таблицы» в текстовые сетки.
 */
function extractDivGrids(html: string): string[][] {
  const grids: string[][] = [];
  const rows: string[] = [];
  const rowMark = /<div class="[^"]*(?:flex gap-1\.5|grid-cols-\d+)[^"]*"/g;
  let m: RegExpExecArray | null;
  while ((m = rowMark.exec(html))) {
    // сбалансированно находим конец строки-контейнера
    let depth = 1;
    let pos = m.index + m[0].length;
    while (depth > 0 && pos < html.length) {
      const no = html.indexOf("<div", pos);
      const nc = html.indexOf("</div>", pos);
      if (nc < 0) break;
      if (no >= 0 && no < nc) { depth++; pos = no + 4; }
      else { depth--; pos = nc + 6; }
    }
    const inner = html.slice(m.index + m[0].length, pos - 6);
    // теги → разделители: порядок значений сохраняется даже при вложенных span
    const cells = decodeEntities(inner.replace(/<[^>]+>/g, " "))
      .split(/\s+/)
      .filter((v) => v.length > 0 && v.length <= 6);
    if (cells.length >= 2 && cells.length <= 24) rows.push(cells.join("\u2009"));
  }
  // подряд идущие строки одинаковой длины = матрица; одиночная строка = массив
  let cur: string[] = [];
  const flush = () => {
    if (cur.length >= 2) grids.push(cur);
    else if (cur.length === 1 && cur[0].split("\u2009").length >= 2) grids.push(cur);
    cur = [];
  };
  for (const r of rows) {
    if (cur.length && r.length !== cur[cur.length - 1].length) flush();
    cur.push(r);
  }
  flush();
  return grids.slice(0, 6);
}

// ────────────────────────────── вёрстка PDF ──────────────────────────────

const A4: [number, number] = [595.28, 841.89];
const M = { top: 46, bottom: 48, left: 50, right: 50 };
const CONTENT_W = A4[0] - M.left - M.right;

interface Stats {
  chapterStart: Map<string, number>;
  total: number;
}

class Doc {
  doc: PDFDocument;
  pages = 0;
  chapterStart = new Map<string, number>();
  constructor(stream: fs.WriteStream) {
    this.doc = new PDFDocument({ size: "A4", margins: { ...M }, autoFirstPage: true, bufferPages: true });
    this.doc.pipe(stream);
    this.doc.on("pageAdded", () => this.pages++);
    this.setupFonts();
    this.bodyFont();
  }
  setupFonts() {
    if (F_REG) this.doc.registerFont("Body", F_REG);
    if (F_BOLD) this.doc.registerFont("BodyBold", F_BOLD);
    if (F_MONO) this.doc.registerFont("Mono", F_MONO);
    if (F_MONO) this.doc.registerFont("MonoBold", F_MONO);
  }
  bodyFont() { this.doc.font(F_REG ? "Body" : "Helvetica"); return this.doc; }
  boldFont() { this.doc.font(F_BOLD ? "BodyBold" : "Helvetica-Bold"); return this.doc; }
  monoFont() { this.doc.font(F_MONO ? "Mono" : "Courier"); return this.doc; }

  get y() { return this.doc.y; }
  set y(v: number) { this.doc.y = v; }
  get pageBottom() { return A4[1] - M.bottom; }
  ensureSpace(need: number) {
    if (this.y + need > this.pageBottom) this.doc.addPage();
  }
  footerAll(skipCover = true) {
    const range = this.doc.bufferedPageRange();
    const oldBottom = this.doc.page.margins.bottom;
    for (let p = range.start; p < range.start + range.count; p++) {
      if (skipCover && p === range.start) continue;
      this.doc.switchToPage(p);
      this.doc.page.margins.bottom = 0;
      this.doc.font(F_REG ? "Body" : "Helvetica").fontSize(8).fillColor("#94a3b8")
        .text(String(p + 1), 0, A4[1] - 30, { width: A4[0], align: "center", lineBreak: false });
      this.doc.page.margins.bottom = oldBottom;
    }
  }
}

const CH_LINE = 13.4;      // межстрочный в теле
const BODY_SIZE = 9.6;

function drawTextBlock(d: Doc, text: string, opts: { size?: number; bold?: boolean; indent?: number; gap?: number; color?: string; mono?: boolean } = {}) {
  const size = opts.size ?? BODY_SIZE;
  const lead = size * 1.42;
  d.ensureSpace(lead * 2);
  d.doc.fontSize(size)
    .fillColor(opts.color ?? "#1f2937")
    .text(text, M.left + (opts.indent ?? 0), d.y, {
      width: CONTENT_W - (opts.indent ?? 0),
      lineGap: lead - size,
      align: "left",
    });
  d.doc.moveDown((opts.gap ?? 2) / lead);
}

function drawCodeBlock(d: Doc, code: string) {
  const size = 7.7;
  const lead = size * 1.5;
  const lines = code.split("\n");
  const height = lines.length * lead + 14;
  d.ensureSpace(Math.min(height, A4[1] - M.top - M.bottom - 10) + 8);
  // если блок целиком не влезает — разрыв страницы перед ним
  if (d.y + height > d.pageBottom && lines.length > 3) d.doc.addPage();
  const top = d.y;
  const drawPortion = (from: number, to: number, yStart: number) => {
    const h = (to - from) * lead + 12;
    d.doc.save().rect(M.left - 4, yStart - 4, CONTENT_W + 8, h).fillAndStroke("#f3f4f6", "#e5e7eb").restore();
    d.monoFont().fontSize(size).fillColor("#111827");
    let y = yStart + 2;
    for (let li = from; li < to; li++) {
      d.doc.text(lines[li], M.left, y, { width: CONTENT_W, lineBreak: false });
      y += lead;
    }
    return y;
  };
  // постранично
  let from = 0;
  let yTop = top;
  while (from < lines.length) {
    const avail = d.pageBottom - yTop;
    let fit = Math.floor((avail - 8) / lead);
    if (fit <= 0 && from === 0 && lines.length > 1) { d.doc.addPage(); yTop = M.top; continue; }
    fit = Math.max(fit, 1);
    const to = Math.min(lines.length, from + fit);
    drawPortion(from, to, yTop);
    from = to;
    if (from < lines.length) { d.doc.addPage(); yTop = M.top; }
  }
  d.y = yTop + Math.min(lines.length, Math.floor((d.pageBottom - yTop) / lead)) * lead + 12;
  d.doc.moveDown(3);
}

function drawTableBlock(d: Doc, rows: string[]) {
  const size = 8.4;
  d.ensureSpace(size * 3);
  const text = rows.map((c) => c.replace(/\s*\n\s*/g, " ")).join("   ·   ");
  d.doc.fontSize(size).fillColor("#374151").text(text, M.left + 6, d.y, { width: CONTENT_W - 12, lineGap: 2 });
  d.doc.moveDown(2.2);
}

function drawGrid(d: Doc, rows: string[]) {
  const size = 8;
  const lead = size * 1.6;
  d.ensureSpace(rows.length * lead + 16);
  const top = d.y;
  d.monoFont().fontSize(size).fillColor("#111827");
  const cellW = Math.min(
    34,
    (CONTENT_W - 16) / Math.max(...rows.map((r) => r.split("\u2009").length))
  );
  rows.forEach((row, ri) => {
    const cells = row.split("\u2009");
    cells.forEach((cval, ci) => {
      const x = M.left + 6 + ci * cellW;
      const y = top + 4 + ri * lead;
      d.doc.save().rect(x - 2, y - 2, cellW - 4, lead - 2).fillAndStroke("#eef2ff", "#c7d2fe").restore();
      d.doc.text(cval, x + 2, y + lead * 0.12, { width: cellW - 8, align: "center", lineBreak: false });
    });
  });
  d.y = top + 8 + rows.length * lead + 8;
  d.doc.moveDown(2);
}

function drawSvg(d: Doc, svg: string) {
  const wAttr = Number(/width="([\d.]+)/.exec(svg)?.[1] ?? 0);
  const hAttr = Number(/height="([\d.]+)/.exec(svg)?.[1] ?? 0);
  const vb = /viewBox="([\d.\-\s]+)"/.exec(svg)?.[1]?.trim().split(/\s+/).map(Number);
  const natW = wAttr || (vb ? vb[2] : 480);
  const natH = hAttr || (vb ? vb[3] : 320);
  const maxW = CONTENT_W - 10;
  const maxH = 330;
  let w = Math.min(natW, maxW);
  let h = (natH / natW) * w;
  if (h > maxH) { h = maxH; w = (natW / natH) * h; }
  const avail = d.pageBottom - d.y;
  if (h + 20 > avail) {
    // пробуем ужать в остаток страницы, иначе — с новой страницы
    if (avail > 170) {
      const k = (avail - 20) / h;
      h = avail - 20;
      w = Math.min(w * k, CONTENT_W - 10);
    } else {
      d.doc.addPage();
    }
  }
  const x = M.left + (CONTENT_W - w) / 2;
  try {
    SVGtoPDF(d.doc, svg, x, d.y + 6, { width: w, height: h, assumePt: true });
  } catch {
    /* кривой SVG не роняем весь PDF */
  }
  d.y = d.y + h + 18;
}

function drawImage(d: Doc, dataUrl: string) {
  const b64 = dataUrl.split(",")[1];
  if (!b64) return;
  const buf = Buffer.from(b64, "base64");
  const maxW = CONTENT_W * 0.82;
  const avail = d.pageBottom - d.y;
  if (avail < 200) d.doc.addPage();
  try {
    d.doc.image(buf, M.left + (CONTENT_W - maxW) / 2, d.y + 4, { width: maxW });
  } catch { return; }
  d.y = d.y + 10 + maxW * 0.6; // примерная высота фото 3:2
  d.doc.moveDown(2);
}

// ─────────────────────────────── сборка ───────────────────────────────

const FRONT_TOC_LINES = 44; // строк содержания на странице

function tocEntries() {
  return chapters.map((c) => ({ id: c.id, title: c.title, topic: !c.title.match(/^[А-Яа-яЁё]/) }));
}

function tocPagesNeeded(): number {
  return Math.max(1, Math.ceil(tocEntries().length / FRONT_TOC_LINES));
}

interface BuildOpts {
  outPath: string;
  record: boolean;
  /** id → стартовая страница (для второго прохода) */
  pageMap?: Map<string, number>;
  frontPages: number;
}

function buildOne(opts: BuildOpts): Stats {
  return new Promise<Stats>((resolve, reject) => {
    const stream = opts.record ? fs.createWriteStream("/dev/null") : fs.createWriteStream(opts.outPath);
    const d = new Doc(stream as unknown as fs.WriteStream);
    const doc = d.doc;

    const finish = (stats: Stats) => {
      d.footerAll(!opts.record);
      doc.end();
      stream.on("close", () => resolve(stats));
      stream.on("error", reject);
    };

    if (!opts.record) {
      // ── обложка (первая страница уже создана) ──
      d.bodyFont();
      doc.fillColor("#312e81").fontSize(26).font(F_BOLD ? "BodyBold" : "Helvetica-Bold")
        .text("Алгоритмы и структуры данных", M.left, 190, { width: CONTENT_W, align: "center" });
      doc.moveDown(0.6);
      doc.fontSize(15).fillColor("#4b5563").font(F_REG ? "Body" : "Helvetica")
        .text("Универсальное пособие: билеты 1–24", { width: CONTENT_W, align: "center" });
      doc.moveDown(1.2);
      doc.fontSize(10.5).fillColor("#6b7280")
        .text("Текст всех тем + схемы интерактивных визуализаций.\nСобрано автоматически из сайта-пособия.", {
          width: CONTENT_W, align: "center",
        });
      doc.fontSize(9.5).fillColor("#9ca3af")
        .text(new Date().toLocaleDateString("ru-RU"), { width: CONTENT_W, align: "center" });
    }

    // ── содержание ──
    if (!opts.record) {
      doc.addPage(); // оглавление на отдельной странице после обложки
      const entries = chapters;
      let line = 0;
      const drawTocHeader = () => {
        doc.fontSize(18).font(F_BOLD ? "BodyBold" : "Helvetica-Bold").fillColor("#111827")
          .text("Содержание", M.left, M.top, { width: CONTENT_W });
        doc.moveDown(0.8);
        doc.y = doc.y;
        d.y = doc.y;
      };
      drawTocHeader();
      entries.forEach((ch, i) => {
        if (line > 0 && line % FRONT_TOC_LINES === 0) {
          doc.addPage();
          drawTocHeader();
        }
        const pageNo2 = (opts.pageMap?.get(ch.id) ?? 0) + opts.frontPages;
        const isTopic = /^\d/.test(ch.title);
        doc.fontSize(isTopic ? 10.5 : 10).font(isTopic && F_BOLD ? "BodyBold" : F_REG ? "Body" : "Helvetica")
          .fillColor(isTopic ? "#1f2937" : "#6b7280");
        // заголовок + точечная отбивка + номер страницы
        const title = ch.title.length > 86 ? ch.title.slice(0, 84) + "…" : ch.title;
        const w = CONTENT_W - 40;
        const tw = doc.widthOfString(title);
        const pw = doc.widthOfString(String(pageNo2));
        doc.text(title, M.left, d.y, { width: w, lineBreak: false });
        const dots = ".".repeat(Math.max(3, Math.floor((w - tw - pw) / doc.widthOfString("."))));
        doc.fillColor("#d1d5db").text(dots, M.left + tw + 4, d.y, { lineBreak: false });
        doc.fillColor("#111827").text(String(pageNo2), M.left + w + 4, d.y, { lineBreak: false });
        d.y += 16.2;
        line++;
      });
      // добиваем до расчётного числа страниц содержания и отрываем тело от оглавления
      const used = Math.ceil(entries.length / FRONT_TOC_LINES);
      for (let p = used; p < opts.frontPages - 1; p++) doc.addPage();
      doc.addPage();
      if (!opts.record) console.log(`TOC: ${entries.length} записей, страниц=${doc.bufferedPageRange().count}`);
    }

    // ── главы ──
    const stats: Stats = { chapterStart: new Map(), total: 0 };

    chapters.forEach((ch, ci) => {
      const startPageOf = () => {
        // текущая страница = pages (0-based) + 1
        return doc.bufferedPageRange().start + doc.bufferedPageRange().count;
      };
      if (ci > 0) doc.addPage();
      const pageNow = opts.record ? doc.bufferedPageRange().count : startPageOf();
      d.chapterStart.set(ch.id, pageNow);
      if (!opts.record && ci < 3) console.log(`глава ${ch.id} → стр ${pageNow}`);
      d.bodyFont();
      doc.y = M.top;
      d.y = M.top;

      // заголовок главы
      doc.fontSize(16).font(F_BOLD ? "BodyBold" : "Helvetica-Bold").fillColor("#111827")
        .text(ch.title, M.left, M.top, { width: CONTENT_W });
      if (ch.description) {
        doc.moveDown(0.2);
        doc.fontSize(9).font(F_REG ? "Body" : "Helvetica").fillColor("#6b7280").text(ch.description, { width: CONTENT_W });
      }
      doc.moveDown(0.6);
      d.y = doc.y;

      // текст главы
      const blocks = htmlToBlocks(ch.content);
      for (const b of blocks) {
        if (b.kind === "h") {
          d.ensureSpace(40);
          doc.moveDown(0.4);
          const size = b.level === 2 ? 13 : b.level === 3 ? 11.2 : 10.2;
          doc.fontSize(size).font(F_BOLD ? "BodyBold" : "Helvetica-Bold").fillColor(b.level === 2 ? "#1e3a8a" : "#374151")
            .text(b.text, M.left, d.y + 4, { width: CONTENT_W, lineGap: 1.5 });
          d.y = doc.y + 4;
        } else if (b.kind === "p") {
          drawTextBlock(d, b.text, { gap: 3 });
        } else if (b.kind === "li") {
          drawTextBlock(d, "•  " + b.text, { indent: 8, gap: 1.5, size: BODY_SIZE - 0.3 });
        } else if (b.kind === "code") {
          drawCodeBlock(d, b.text);
        } else if (b.kind === "table") {
          drawTableBlock(d, b.rows);
        }
      }

      // визуализация главы
      const vizEntry = VIZ_REGISTRY[ch.id];
      if (vizEntry) {
        const art = renderVizArt(ch.id);
        if (opts.record) {
          const n = (art?.svgs.length ?? 0) + (art?.images.length ?? 0) + (art?.grids.length ?? 0);
          console.log(`  viz ${ch.id}: svg=${art?.svgs.length ?? 0} img=${art?.images.length ?? 0} grid=${art?.grids.length ?? 0}${art?.error ? " ОШИБКА: " + art.error : ""}`);
          if (n === 0) console.log(`  ⚠ ${ch.id}: визуализация не отрисовалась`);
        }
        if (art && (art.svgs.length || art.images.length)) {
          d.ensureSpace(60);
          doc.moveDown(0.6);
          doc.fontSize(10).font(F_BOLD ? "BodyBold" : "Helvetica-Bold").fillColor("#4338ca")
            .text("▣ Визуализация: " + vizEntry.title, M.left, d.y + 2, { width: CONTENT_W });
          d.y = doc.y + 6;
          let drawn = 0;
          for (const img of art.images) {
            if (drawn >= 4) break;
            drawImage(d, img);
            drawn++;
          }
          for (const svg of art.svgs) {
            if (drawn >= 5) break;
            drawSvg(d, svg);
            drawn++;
          }
          for (const grid of art.grids) {
            if (drawn >= 7) break;
            drawGrid(d, grid);
            drawn++;
          }
        } else if (art?.error) {
          // SSR упал — рисуем текстовую заглушку, PDF не роняем
        }
      }
    });

    stats.chapterStart = d.chapterStart;
    stats.total = doc.bufferedPageRange().count;
    finish(stats);
  });
}

async function main() {
  const outPath = process.argv[2] || path.join(process.cwd(), "public/export/guide_all_topics.pdf");
  if (!F_REG) throw new Error("Не найден шрифт DejaVuSans (установите fonts-dejavu-core)");
  const frontPages = 1 + tocPagesNeeded(); // обложка + страницы содержания

  // проход 1: считаем, на какой странице начинается каждая глава
  const stats = await buildOne({ outPath: "/dev/null", record: true, frontPages });
  console.log(`Проход 1: ${stats.total} стр. тела`);

  // проход 2: обложка + содержание с номерами страниц + тело
  await buildOne({
    outPath,
    record: false,
    frontPages,
    pageMap: stats.chapterStart,
  });
  const size = fs.statSync(outPath).size;
  console.log(`Готово: ${outPath} (${(size / 1024).toFixed(0)} KB)`);
  // отчёт для CI-summary: число страниц конечного документа
  const pages = await (async () => {
    const buf = fs.readFileSync(outPath);
    const m = buf.toString("latin1").match(/\/Count\s+(\d+)/);
    return m ? Number(m[1]) : 0;
  })();
  fs.writeFileSync(
    path.join(process.cwd(), "tmp/guide-pdf-report.json"),
    JSON.stringify({ pages, bytes: size, generatedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`Страниц: ${pages}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
