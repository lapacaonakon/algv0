/**
 * Компактный PDF пособия: public/export/guide_lite.pdf
 *
 *   текст всех тем (без служебной разметки)
 * + снимки визуализаций, если они отрендерены (tmp/viz-shots/*.png — их делает
 *   capture-viz-shots.mjs в CI через headless-браузер)
 * + иллюстрации страниц (jpg из src/assets)
 * + текстовое описание каждой демонстрации и переменных, которыми её двигает
 *   Python-компилятор (работает и без браузера — локальная сборка полная)
 * − БЕЗ кода панели компилятора и без навигации приложения
 *
 * Запуск:  npm run export:guide
 * Цель:    40–60 страниц (жёсткий предел — 100).
 *
 * Вёрстка целиком на собственном курсоре (cy): pdfkit не дописывает страницы
 * сам, длинные таблицы/код/боксы режутся на фрагменты по высоте страницы.
 */
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import PDFDocument from "pdfkit";
import { ROOT, OUT_DIR, ensureDir, humanSize } from "./common.mjs";
import { htmlToBlocks } from "./html-to-blocks.mjs";

const GUIDE_PDF_PATH = path.join(OUT_DIR, "guide_lite.pdf");
const SHOTS_DIR = path.join(ROOT, "tmp", "viz-shots");
const ENTRY = path.join(ROOT, "tmp", "guide-entry.ts");



/** Векторные схемы графов и таблицы состояний для PDF без растровых скриншотов */
const VECTOR_VISUALIZERS = {
  dijkstra: {
    title: "Векторный граф релаксации (Дейкстра)",
    nodes: [
      { id: "A", label: "A", x: 40, y: 60, dist: "0", status: "done" },
      { id: "B", label: "B", x: 130, y: 30, dist: "3", status: "done" },
      { id: "C", label: "C", x: 130, y: 90, dist: "2", status: "done" },
      { id: "G", label: "G", x: 220, y: 90, dist: "5", status: "done" },
      { id: "D", label: "D", x: 220, y: 30, dist: "6", status: "done" },
      { id: "E", label: "E", x: 310, y: 90, dist: "7", status: "done" },
      { id: "F", label: "F", x: 400, y: 60, dist: "8", status: "done" },
    ],
    edges: [
      { u: "A", v: "B", w: 4, highlighted: true },
      { u: "A", v: "C", w: 2, highlighted: true },
      { u: "C", v: "B", w: 1, highlighted: true },
      { u: "B", v: "D", w: 5 },
      { u: "C", v: "G", w: 3, highlighted: true },
      { u: "C", v: "E", w: 8 },
      { u: "G", v: "D", w: 1, highlighted: true },
      { u: "G", v: "E", w: 2, highlighted: true },
      { u: "D", v: "F", w: 2 },
      { u: "E", v: "F", w: 1, highlighted: true },
    ],
    table: [
      ["Вершина", "Старт", "Кратчайшее dist", "Предшественник prev", "Статус"],
      ["Пиццерия A", "s = A", "0", "—", "зафиксирована"],
      ["Парк C", "из A", "2", "A", "зафиксирована"],
      ["Дом 1 B", "из C", "3", "C", "зафиксирована"],
      ["Метро G", "из C", "5", "C", "зафиксирована"],
      ["Офис D", "из G", "6", "G", "зафиксирована"],
      ["Дом 2 E", "из G", "7", "G", "зафиксирована"],
      ["ТЦ F", "из E", "8", "E", "зафиксирована"],
    ],
  },
  "bellman-ford": {
    title: "Векторный граф релаксации (Форд—Беллман)",
    nodes: [
      { id: "S", label: "S", x: 40, y: 60, dist: "0", status: "done" },
      { id: "A", label: "A", x: 130, y: 30, dist: "4", status: "done" },
      { id: "B", label: "B", x: 130, y: 90, dist: "5", status: "done" },
      { id: "C", label: "C", x: 220, y: 60, dist: "3", status: "done" },
      { id: "D", label: "D", x: 310, y: 30, dist: "6", status: "done" },
      { id: "E", label: "E", x: 310, y: 90, dist: "7", status: "done" },
      { id: "F", label: "F", x: 400, y: 60, dist: "8", status: "done" },
    ],
    edges: [
      { u: "S", v: "A", w: 4, highlighted: true },
      { u: "S", v: "B", w: 5, highlighted: true },
      { u: "B", v: "C", w: -2, highlighted: true },
      { u: "A", v: "C", w: 1 },
      { u: "C", v: "D", w: 3, highlighted: true },
      { u: "C", v: "E", w: 4, highlighted: true },
      { u: "D", v: "F", w: 2 },
      { u: "E", v: "F", w: 1, highlighted: true },
      { u: "D", v: "A", w: -2 },
    ],
    table: [
      ["Проход (итерация)", "Рёбра в работе", "Изменения dist", "Контроль n-й ночи"],
      ["Пара 1", "S→A, S→B", "dist[A]=4, dist[B]=5", "нормальный ход"],
      ["Пара 2", "B→C (-2)", "dist[C]=3", "нормальный ход"],
      ["Пара 3", "C→D, C→E", "dist[D]=6, dist[E]=7", "нормальный ход"],
      ["Пара 4", "E→F (1)", "dist[F]=8", "нормальный ход"],
      ["Итерация V-1", "все рёбра сошлись", "без изменений", "кратчайшие пути найдены"],
      ["Итерация V (контроль)", "все рёбра", "без изменений", "отрицательных циклов нет"],
    ],
  },
  floyd: {
    title: "Матрица кратчайших путей (Флойд—Уоршелл)",
    table: [
      ["из \\ в", "S (0)", "A (1)", "B (2)", "C (3)", "D (4)"],
      ["S (0)", "0", "4", "5", "3", "6"],
      ["A (1)", "∞", "0", "∞", "1", "4"],
      ["B (2)", "∞", "∞", "0", "-2", "1"],
      ["C (3)", "∞", "∞", "∞", "0", "3"],
      ["D (4)", "∞", "∞", "∞", "∞", "0"],
    ],
  },
  mst: {
    title: "Минимальный остов (Краскал / Прим / Борувка)",
    nodes: [
      { id: "1", label: "1", x: 50, y: 30, status: "done" },
      { id: "2", label: "2", x: 150, y: 30, status: "done" },
      { id: "3", label: "3", x: 250, y: 30, status: "done" },
      { id: "4", label: "4", x: 50, y: 90, status: "done" },
      { id: "5", label: "5", x: 150, y: 90, status: "done" },
      { id: "6", label: "6", x: 250, y: 90, status: "done" },
      { id: "7", label: "7", x: 350, y: 60, status: "done" },
    ],
    edges: [
      { u: "1", v: "2", w: 2, highlighted: true },
      { u: "2", v: "3", w: 3, highlighted: true },
      { u: "1", v: "4", w: 1, highlighted: true },
      { u: "4", v: "5", w: 4, highlighted: true },
      { u: "2", v: "5", w: 5 },
      { u: "3", v: "6", w: 2, highlighted: true },
      { u: "5", v: "6", w: 6 },
      { u: "6", v: "7", w: 3, highlighted: true },
    ],
    table: [
      ["Ребро", "Вес w", "Краскал (DSU)", "Прим (Куча)", "Борувка (Фазы)"],
      ["(1, 4)", "1", "добавлено (comp 1-4)", "добавлено первыми", "фаза 1 (comp 1)"],
      ["(1, 2)", "2", "добавлено (comp 1-2-4)", "добавлено в дерево", "фаза 1 (comp 2)"],
      ["(3, 6)", "2", "добавлено (comp 3-6)", "добавлено в дерево", "фаза 1 (comp 3)"],
      ["(2, 3)", "3", "добавлено (объединение)", "добавлено в дерево", "фаза 2"],
      ["(6, 7)", "3", "добавлено (финиш)", "добавлено в дерево", "фаза 2 (финиш)"],
    ],
  },
};

/** A4 в пунктах. */
const PAGE = { width: 595.28, height: 841.89, margin: 44 };
const CONTENT_W = PAGE.width - PAGE.margin * 2;
const TOP = PAGE.margin;
const BOTTOM = PAGE.height - PAGE.margin - 16;

/* ───────────────────────────── шрифты ───────────────────────────── */

const CANDIDATES = {
  regular: [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/usr/local/share/fonts/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "C:/Windows/Fonts/arial.ttf",
  ],
  bold: [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    "/usr/local/share/fonts/DejaVuSans-Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
  ],
  oblique: [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Oblique.ttf",
  ],
  mono: [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/dejavu/DejaVuSansMono.ttf",
    "/usr/local/share/fonts/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/consola.ttf",
  ],
};

const pick = (list) => list.find((f) => fs.existsSync(f)) ?? null;

/**
 * Убираем символы, которых нет в DejaVu (эмодзи и пиктограммы): иначе в PDF
 * на их месте появляется «пустой» глиф. Стрелки, математические знаки и
 * геометрические фигуры DejaVu знает — их оставляем.
 */
const UNSUPPORTED = /[\u{1F000}-\u{1FAFF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E000}-\u{F8FF}\u{24EA}\u{2122}]/gu;
/** Русское склонение счётных существительных: 1 страница, 22 страницы, 25 страниц. */
const plural = (n, one, few, many) => {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};

const plain = (text) =>
  String(text ?? "")
    .replace(UNSUPPORTED, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\u0000/g, "")
    .trim();

/* ─────────────────── данные приложения (через esbuild) ─────────────────── */

async function loadAppData() {
  ensureDir(path.dirname(ENTRY));
  fs.writeFileSync(
    ENTRY,
    [
      'export { chapters, chapterTopics } from "../src/data/content";',
      'export { PAGE_SYNC } from "../src/data/vizSync";',
      'export { VIZ_REGISTRY } from "../src/components/vizRegistry";',
      'export { quizzes } from "../src/data/quizzes";',
    ].join("\n")
  );
  const res = await build({
    entryPoints: [ENTRY],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    logLevel: "silent",
    loader: { ".ts": "ts", ".tsx": "tsx", ".jpg": "dataurl", ".jpeg": "dataurl", ".png": "dataurl", ".svg": "text", ".gif": "dataurl", ".css": "empty" },
  });
  return import("data:text/javascript;base64," + Buffer.from(res.outputFiles[0].text).toString("base64"));
}

/* ────────────────────────── снимки визуализаций ────────────────────────── */

function shotsFor(chapterId) {
  const dirs = [SHOTS_DIR, path.join(ROOT, "public", "export", "viz-shots")];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir)
        .filter((f) => /\.(png|jpe?g)$/i.test(f))
        .filter((f) => f === `${chapterId}.png` || f.startsWith(`${chapterId}--`))
        .sort();
      if (files.length > 0) {
        return files.map((f) => ({
          file: path.join(dir, f),
          name: f.replace(/\.(png|jpe?g)$/i, "").split("--")[1] ?? "",
        }));
      }
    }
  }
  return [];
}

/* ───────────────────────────── отрисовка PDF ───────────────────────────── */

class Renderer {
  constructor(doc, fonts) {
    this.doc = doc;
    this.fonts = fonts;
    this.footerTitle = "";
    this.pages = 0;
    this.cy = TOP;
  }

  /**
   * Колонтитул текущей страницы (печатаем до перехода на следующую).
   *
   * Важно: на время печати нижнее поле страницы уменьшается, иначе pdfkit
   * решает, что текст не влез, и молча добавляет пустые страницы.
   */
  stampFooter() {
    if (this.pages === 0 || !this.doc.page) return;
    const prevBottom = this.doc.page.margins.bottom;
    this.doc.page.margins.bottom = 16;
    const y = PAGE.height - PAGE.margin + 4;
    this.doc.font(this.fonts.regular).fontSize(7.6).fillColor("#9ca3af");
    this.doc.text("Универсальное пособие · алгоритмы и структуры данных", PAGE.margin, y, {
      width: CONTENT_W * 0.62,
      align: "left",
      lineBreak: false,
      ellipsis: true,
    });
    this.doc.text(`${this.footerTitle} · ${this.pages}`, PAGE.margin + CONTENT_W * 0.62, y, {
      width: CONTENT_W * 0.38,
      align: "right",
      lineBreak: false,
      ellipsis: true,
    });
    this.doc.page.margins.bottom = prevBottom;
    this.doc.y = this.cy;
  }

  newPage(footerTitle) {
    this.stampFooter();
    if (footerTitle !== undefined) this.footerTitle = footerTitle;
    this.doc.addPage({ size: [PAGE.width, PAGE.height], margin: PAGE.margin });
    this.pages += 1;
    this.cy = TOP;
  }

  firstPage(footerTitle) {
    if (footerTitle !== undefined) this.footerTitle = footerTitle;
    this.doc.addPage({ size: [PAGE.width, PAGE.height], margin: PAGE.margin });
    this.pages += 1;
    this.cy = TOP;
  }

  /** Сколько места нужно, чтобы элемент не оторвался от следующего. */
  ensure(h, extra = 0) {
    if (this.cy + h + extra > BOTTOM) this.newPage();
  }

  height(text, { font, size, width, lineGap = 0 }) {
    return this.doc.font(font).fontSize(size).heightOfString(String(text), { width, lineGap });
  }

  /**
   * Режет текст на фрагменты не выше max пунктов: сначала по границам
   * предложений, слишком длинное предложение — по словам.
   *
   * Без этого pdfkit сам переносит остаток на новую страницу: такая страница
   * создаётся в обход рендерера — без нижнего колонтитула и без счётчика,
   * из-за чего в файле оказывалось на одну страницу больше, чем в отчёте.
   */
  splitToFit(text, opts, max) {
    const measure = (t) => this.height(t, opts);
    const source = String(text);
    if (measure(source) <= max) return [source];
    const chunks = [];
    let current = "";
    const flush = () => {
      if (current.trim()) chunks.push(current.trim());
      current = "";
    };
    for (const sentence of source.split(/(?<=[.!?…;:])\s+/)) {
      const withSentence = current ? `${current} ${sentence}` : sentence;
      if (measure(withSentence) <= max) {
        current = withSentence;
        continue;
      }
      flush();
      if (measure(sentence) <= max) {
        current = sentence;
        continue;
      }
      for (const word of sentence.split(/\s+/)) {
        const withWord = current ? `${current} ${word}` : word;
        if (measure(withWord) <= max) current = withWord;
        else {
          flush();
          current = word;
        }
      }
    }
    flush();
    return chunks.length ? chunks : [source];
  }

  rule(color = "#c7d2fe", width = 1) {
    const y = this.cy;
    this.doc.moveTo(PAGE.margin, y).lineTo(PAGE.margin + CONTENT_W, y).lineWidth(width).strokeColor(color).stroke();
    this.cy = y + 8;
  }

  h1(rawText, { size = 20, color = "#111827", rule = true, gapBefore = 0 } = {}) {
    const text = plain(rawText);
    if (!text) return;
    const h = this.height(text, { font: this.fonts.bold, size, width: CONTENT_W });
    this.ensure(h + (rule ? 14 : 6) + gapBefore, 22);
    this.cy += gapBefore;
    this.doc.font(this.fonts.bold).fontSize(size).fillColor(color).text(text, PAGE.margin, this.cy, { width: CONTENT_W, lineGap: 1 });
    this.cy = Math.max(this.cy, this.doc.y) + 2;
    if (rule) this.rule();
  }

  h2(rawText, { size = 13.5, color = "#1e293b" } = {}) {
    const text = plain(rawText);
    if (!text) return;
    const h = this.height(text, { font: this.fonts.bold, size, width: CONTENT_W });
    this.ensure(h + 6, 20);
    this.cy += 6;
    this.doc.font(this.fonts.bold).fontSize(size).fillColor(color).text(text, PAGE.margin, this.cy, { width: CONTENT_W, lineGap: 0.5 });
    this.cy = Math.max(this.cy, this.doc.y) + 3;
  }

  h3(rawText, { size = 11.2, color = "#334155" } = {}) {
    const text = plain(rawText);
    if (!text) return;
    const h = this.height(text, { font: this.fonts.bold, size, width: CONTENT_W });
    this.ensure(h + 4, 16);
    this.cy += 4;
    this.doc.font(this.fonts.bold).fontSize(size).fillColor(color).text(text, PAGE.margin, this.cy, { width: CONTENT_W });
    this.cy = Math.max(this.cy, this.doc.y) + 2;
  }

  /** Абзац: режем по высоте страницы сами — автоперенос pdfkit не используем. */
  para(rawText, { size = 10.0, indent = 0, color = "#1f2937", italic = false, mono = false, lineGap = 1.2, gapAfter = 4 } = {}) {
    const text = plain(rawText);
    if (!text) return;
    const font = mono ? this.fonts.mono : italic && this.fonts.oblique ? this.fonts.oblique : this.fonts.regular;
    const width = CONTENT_W - indent;
    const opts = { font, size, width, lineGap };
    const chunks = this.splitToFit(text, opts, BOTTOM - TOP);
    chunks.forEach((chunk, index) => {
      const last = index === chunks.length - 1;
      const h = this.height(chunk, opts);
      this.ensure(h + (last ? gapAfter : 0), 6);
      const y0 = this.cy;
      this.doc.font(font).fontSize(size).fillColor(color).text(chunk, PAGE.margin + indent, y0, { width, lineGap, align: "left" });
      this.cy = Math.max(y0 + h, this.doc.y) + (last ? gapAfter : 0);
      if (this.cy > BOTTOM) this.newPage();
    });
  }

  bullet(rawText, { ordinal = null, depth = 0, size = 9.9 } = {}) {
    const text = plain(rawText);
    if (!text) return;
    const indent = 16 + depth * 14;
    const marker = ordinal ? `${ordinal}.` : "•";
    const width = CONTENT_W - indent - 4;
    const opts = { font: this.fonts.regular, size, width, lineGap: 1 };
    const chunks = this.splitToFit(text, opts, BOTTOM - TOP);
    chunks.forEach((chunk, index) => {
      const h = this.height(chunk, opts);
      this.ensure(h + 2.5, 6);
      const y0 = this.cy;
      if (index === 0) {
        this.doc.font(this.fonts.regular).fontSize(size).fillColor("#6366f1").text(marker, PAGE.margin + indent - 13, y0, { width: 13, align: "right", lineGap: 1 });
      }
      this.doc.font(this.fonts.regular).fontSize(size).fillColor("#1f2937").text(chunk, PAGE.margin + indent, y0, { width, lineGap: 1 });
      this.cy = Math.max(y0 + h, this.doc.y) + 2.5;
      if (this.cy > BOTTOM) this.newPage();
    });
  }

  /** Код: режем на фрагменты по высоте страницы, каждый — в своей рамке. */
  code(rawText, { size = 8.0 } = {}) {
    const font = this.fonts.mono;
    const inner = CONTENT_W - 22;
    const lines = String(rawText ?? "").replace(UNSUPPORTED, "").split("\n");
    // собираем фрагменты, которые влезают в одну рамку
    let i = 0;
    while (i < lines.length) {
      // Если у низа страницы осталось меньше минимальной рамки — новая страница
      // СРАЗУ: иначе рамка уедет за BOTTOM, и pdfkit создаст страницу сам,
      // в обход рендерера (без колонтитула и нумерации).
      if (BOTTOM - this.cy - 16 < 60) this.newPage();
      const avail = BOTTOM - this.cy - 16;
      const maxH = avail;
      let chunk = [];
      let h = 0;
      while (i < lines.length) {
        const candidate = chunk.concat(lines[i]).join("\n");
        const ch = this.height(candidate, { font, size, width: inner, lineGap: 0.6 });
        if (chunk.length && ch > maxH) break;
        chunk.push(lines[i]);
        h = ch;
        i += 1;
      }
      const body = chunk.join("\n");
      const boxH = h + 14;
      this.ensure(boxH);
      const y0 = this.cy;
      this.doc.roundedRect(PAGE.margin, y0, CONTENT_W, boxH, 4).fillAndStroke("#f6f7fb", "#d7dbe6");
      this.doc.font(font).fontSize(size).fillColor("#1f2937").text(body, PAGE.margin + 11, y0 + 7, { width: inner, lineGap: 0.6 });
      this.cy = y0 + boxH + (i < lines.length ? 2 : 7);
      if (i < lines.length) this.newPage();
    }
  }

  vectorGraph(nodes = [], edges = [], { height = 130, title = "" } = {}) {
    this.ensure(height + 20, 10);
    const startY = this.cy;
    const boxW = CONTENT_W;

    this.doc
      .roundedRect(PAGE.margin, startY, boxW, height, 6)
      .fillAndStroke("#f8fafc", "#cbd5e1");

    if (title) {
      this.doc
        .font(this.fonts.bold)
        .fontSize(9.5)
        .fillColor("#1e293b")
        .text(title, PAGE.margin + 12, startY + 8);
    }

    // Рёбра графа
    for (const e of edges) {
      const fromNode = nodes.find((n) => n.id === e.u);
      const toNode = nodes.find((n) => n.id === e.v);
      if (!fromNode || !toNode) continue;

      const x1 = PAGE.margin + fromNode.x;
      const y1 = startY + fromNode.y;
      const x2 = PAGE.margin + toNode.x;
      const y2 = startY + toNode.y;

      const strokeColor = e.highlighted ? "#059669" : "#94a3b8";
      const strokeWidth = e.highlighted ? 2 : 1;

      this.doc
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineWidth(strokeWidth)
        .strokeColor(strokeColor)
        .stroke();

      if (e.w !== undefined) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        this.doc
          .circle(mx, my, 7)
          .fillAndStroke("#ffffff", strokeColor);
        this.doc
          .font(this.fonts.bold)
          .fontSize(7)
          .fillColor("#0f172a")
          .text(String(e.w), mx - 7, my - 3.5, { width: 14, align: "center" });
      }
    }

    // Вершины графа
    for (const n of nodes) {
      const nx = PAGE.margin + n.x;
      const ny = startY + n.y;
      const r = 12;

      const fillColor = n.status === "done" ? "#dcfce7" : n.status === "active" ? "#fef08a" : "#ffffff";
      const strokeColor = n.status === "done" ? "#16a34a" : n.status === "active" ? "#ca8a04" : "#2563eb";

      this.doc
        .circle(nx, ny, r)
        .lineWidth(1.5)
        .fillAndStroke(fillColor, strokeColor);

      this.doc
        .font(this.fonts.bold)
        .fontSize(8.5)
        .fillColor("#0f172a")
        .text(String(n.label ?? n.id), nx - r, ny - 4, { width: r * 2, align: "center" });

      if (n.dist !== undefined) {
        this.doc
          .font(this.fonts.mono)
          .fontSize(7)
          .fillColor("#059669")
          .text(`d=${n.dist}`, nx - 20, ny + r + 2, { width: 40, align: "center" });
      }
    }

    this.cy = startY + height + 8;
  }

  /** Таблица: строки режутся по страницам, заголовок повторяется. */
  table(rawRows, { size = 8.5 } = {}) {
    const rows = rawRows.map((r) => r.map((c) => plain(c)));
    if (!rows.length) return;
    const cols = Math.max(...rows.map((r) => r.length));
    const widths = new Array(cols).fill(CONTENT_W / cols);
    const pad = 5;
    const header = rows[0];

    const rowHeight = (cells) => {
      let max = 0;
      for (let i = 0; i < cols; i++) {
        const h = this.height(cells[i] ?? "", { font: this.fonts.regular, size, width: widths[i] - pad * 2, lineGap: 0.4 });
        max = Math.max(max, h);
      }
      return max + pad * 2;
    };

    const drawRow = (cells, y, isHeader, zebra) => {
      const h = rowHeight(cells);
      this.doc.rect(PAGE.margin, y, CONTENT_W, h).fill(isHeader ? "#eef1f8" : zebra ? "#fafbfd" : "#ffffff");
      for (let i = 0; i < cols; i++) {
        const x = PAGE.margin + widths.slice(0, i).reduce((a, b) => a + b, 0) + pad;
        this.doc
          .font(isHeader ? this.fonts.bold : this.fonts.regular)
          .fontSize(size)
          .fillColor("#1f2937")
          .text(String(cells[i] ?? ""), x, y + pad, { width: widths[i] - pad * 2, lineGap: 0.4 });
      }
      this.doc.rect(PAGE.margin, y, CONTENT_W, h).lineWidth(0.5).strokeColor("#dfe3ec").stroke();
      return h;
    };

    this.ensure(rowHeight(header) + 8, 14);
    let y = this.cy;
    rows.forEach((cells, idx) => {
      const row = [];
      for (let i = 0; i < cols; i++) row.push(cells[i] ?? "");
      const h = rowHeight(row);
      if (y + h > BOTTOM) {
        this.cy = y;
        this.newPage();
        y = this.cy;
        if (idx > 0) y += drawRow(header, y, true, false); // повтор шапки
      }
      y += drawRow(row, y, idx === 0, idx % 2 === 1);
    });
    this.cy = y + 8;
  }

  quote(rawText) {
    const text = plain(rawText);
    if (!text) return;
    const font = this.fonts.oblique ?? this.fonts.regular;
    const width = CONTENT_W - 22;
    const opts = { font, size: 9.5, width, lineGap: 1 };
    // Длинная цитата режется по страницам заранее: рисовать целиком нельзя —
    // текст уйдёт за BOTTOM и pdfkit добавит страницу без колонтитула.
    const chunks = this.splitToFit(text, opts, BOTTOM - TOP);
    chunks.forEach((chunk) => {
      const h = this.height(chunk, opts);
      this.ensure(h + 10);
      const y0 = this.cy;
      this.doc.rect(PAGE.margin, y0, 3, h + 4).fill("#a5b4fc");
      this.doc.font(font).fontSize(9.5).fillColor("#374151").text(chunk, PAGE.margin + 14, y0 + 2, { width, lineGap: 1 });
      this.cy = y0 + h + 10;
      if (this.cy > BOTTOM) this.newPage();
    });
  }

  image(file, { maxWidth = CONTENT_W, maxHeight = 320, caption = "" } = {}) {
    if (!fs.existsSync(file)) return false;
    let img;
    try {
      img = this.doc.openImage(file);
    } catch {
      return false;
    }
    const capH = caption ? 14 : 0;
    const scale = Math.min(maxWidth / img.width, (maxHeight - capH) / img.height, 1.5);
    const w = img.width * scale;
    const h = img.height * scale;
    this.ensure(h + capH + 10, 20);
    const y0 = this.cy;
    const x0 = PAGE.margin + (CONTENT_W - w) / 2;
    this.doc.image(file, x0, y0, { width: w, height: h });
    this.doc.rect(x0, y0, w, h).lineWidth(0.6).strokeColor("#d1d5db").stroke();
    this.cy = y0 + h + 4;
    if (caption) {
      this.doc.font(this.fonts.regular).fontSize(8).fillColor("#6b7280").text(caption, PAGE.margin, this.cy, { width: CONTENT_W, align: "center" });
      this.cy = Math.max(this.cy, this.doc.y) + 6;
    }
    return true;
  }

  /** Бокс с заголовком и строками; длинные режутся на страницы. */
  box(rawTitle, rawLines, { color = "#eef2ff", border = "#c7d2fe", titleColor = "#3730a3", size = 8.7 } = {}) {
    const title = plain(rawTitle);
    const lines = rawLines.map((l) => plain(l)).filter((l) => l.length);
    const inner = CONTENT_W - 20;
    let rest = lines.slice();
    let first = true;
    while (rest.length || first) {
      first = false;
      const headH = this.height(title, { font: this.fonts.bold, size: 9.2, width: inner }) + 6;
      this.ensure(headH + 24, 16);
      const y0 = this.cy;
      // сколько строк влезет на эту страницу
      const avail = BOTTOM - y0 - headH - 16;
      const taken = [];
      let h = 0;
      while (rest.length) {
        const ch = this.height(rest[0], { font: this.fonts.regular, size, width: inner, lineGap: 0.6 }) + 3;
        if (taken.length && h + ch > avail) break;
        taken.push(rest.shift());
        h += ch;
      }
      const boxH = headH + h + 12;
      this.doc.roundedRect(PAGE.margin, y0, CONTENT_W, boxH, 5).fillAndStroke(color, border);
      this.doc.font(this.fonts.bold).fontSize(9.2).fillColor(titleColor).text(title, PAGE.margin + 10, y0 + 7, { width: inner });
      let y = y0 + 7 + headH;
      for (const l of taken) {
        this.doc.font(this.fonts.regular).fontSize(size).fillColor("#374151").text(l, PAGE.margin + 10, y, { width: inner, lineGap: 0.6 });
        y += this.height(l, { font: this.fonts.regular, size, width: inner, lineGap: 0.6 }) + 3;
      }
      this.cy = y0 + boxH + 7;
      if (rest.length) this.newPage();
    }
  }
}

/* ─────────────────────────────── сборка ─────────────────────────────── */

async function main() {
  const fonts = {
    regular: pick(CANDIDATES.regular),
    bold: pick(CANDIDATES.bold),
    oblique: pick(CANDIDATES.oblique),
    mono: pick(CANDIDATES.mono),
  };
  if (!fonts.regular) throw new Error("Не найден TTF-шрифт с кириллицей (DejaVu Sans). Установите fonts-dejavu-core.");
  fonts.bold = fonts.bold ?? fonts.regular;
  fonts.mono = fonts.mono ?? fonts.regular;

  const { chapters, chapterTopics, PAGE_SYNC, VIZ_REGISTRY, quizzes } = await loadAppData();
  ensureDir(OUT_DIR);

  const doc = new PDFDocument({
    size: [PAGE.width, PAGE.height],
    margin: PAGE.margin,
    autoFirstPage: false,
    info: {
      Title: "Универсальное пособие — алгоритмы и структуры данных (билеты 1–24)",
      Author: "algv0 · автоэкспорт",
      Subject: "Текст всех тем + визуализации, без кода панели компилятора",
      CreationDate: new Date(),
    },
  });
  const stream = fs.createWriteStream(GUIDE_PDF_PATH);
  doc.pipe(stream);

  const R = new Renderer(doc, fonts);
  const today = new Date().toISOString().slice(0, 10);
  const totalTopics = new Set(Object.values(chapterTopics).flat()).size || 24;
  const vizCount = chapters.filter((c) => VIZ_REGISTRY[c.id]).length;

  /* ── обложка ── */
  R.firstPage("Обложка");
  R.cy = TOP + 90;
  R.h1("Универсальное пособие", { size: 26, rule: false });
  R.h1("Алгоритмы и структуры данных", { size: 17, color: "#4338ca" });
  R.para(
    `Билеты 1–${totalTopics} · ${chapters.length} ${plural(chapters.length, "страница", "страницы", "страниц")} · ${vizCount} ${plural(vizCount, "интерактивная демонстрация", "интерактивные демонстрации", "интерактивных демонстраций")}`,
    { size: 10.5, color: "#4b5563" }
  );
  R.para(
    "Автоматический компактный сборник: весь текст тем (включая раскрытые спойлеры с доказательствами, таблицами и кодом алгоритмов) и визуализации. Навигация приложения и код панели Python-компилятора сюда не входят — интерактивная версия живёт в репозитории и на GitHub Pages.",
    { size: 9.6, color: "#374151" }
  );
  R.para(`Дата сборки: ${today}`, { size: 9, color: "#6b7280", italic: true });

  const missingViz = chapters.filter((c) => !VIZ_REGISTRY[c.id]);
  R.box("Как устроено пособие", [
    "• Страница = один или несколько билетов: текст, аналогии, доказательства и код в спойлерах.",
    "• У каждой страницы есть интерактивная демонстрация и панель Python: значения переменных (i, v, dist, comp, color, path, ops…) перерисовывают её напрямую.",
    "• В этом PDF демонстрации показаны снимками (когда они отрендерены в CI) и описанием: какие вкладки есть и какие переменные кода ими управляют.",
    missingViz.length
      ? `• Страницы без демонстрации: ${missingViz.map((c) => c.id).join(", ")}`
      : "• Демонстрация и синхронизация с компилятором есть у каждой страницы пособия.",
  ]);

  /* ── содержание ── */
  R.newPage("Содержание");
  R.h1("Содержание", { size: 18 });
  chapters.forEach((c, i) => {
    const topics = chapterTopics[c.id] ?? [];
    R.para(
      `${String(i + 1).padStart(2, "0")}.  ${c.title}${topics.length ? `   ·   билет${topics.length > 1 ? "ы" : ""} ${topics.join(", ")}` : ""}`,
      { size: 9.3, gapAfter: 2 }
    );
  });

  /* ── темы ── */
  let shotsTotal = 0;
  for (const chapter of chapters) {
    const topics = chapterTopics[chapter.id] ?? [];
    const shortTitle = chapter.title.replace(/^\d+[.–-]?\s*/, "").replace(/^[\d–\s]+/, "").slice(0, 44);
    R.newPage(shortTitle);

    if (topics.length) {
      R.para(`Билет${topics.length > 1 ? "ы" : ""} ${topics.join(", ")} · страница ${chapter.id}`, { size: 8.8, color: "#4338ca", gapAfter: 2 });
    }
    R.h1(chapter.title.replace(/^\d+[.–-]?\s*/, ""), { size: 16.5 });

    const chapterTitle = chapter.title.replace(/^\d+[.–-]?\s*/, "");
    for (const b of htmlToBlocks(chapter.content)) {
      if (b.type === "p" && /^Билет\s/i.test(b.text)) continue; // уже напечатано
      if (b.type === "heading" && b.level <= 2 && b.text.trim() === chapterTitle.trim()) continue;

      if (b.type === "heading") {
        if (b.level <= 2) R.h2(b.text);
        else if (b.level === 3) R.h3(b.text);
        else R.para(b.text, { size: 10.2, color: "#334155" });
      } else if (b.type === "summary") {
        R.para("▸ " + b.text, { size: 9.8, color: "#3730a3", italic: true });
      } else if (b.type === "li") {
        R.bullet(b.text, { ordinal: b.ordinal, depth: b.depth });
      } else if (b.type === "code") {
        R.code(b.text);
      } else if (b.type === "table") {
        R.table(b.rows);
      } else if (b.type === "quote") {
        R.quote(b.text);
      } else if (b.type === "caption") {
        R.para(b.text, { size: 8.3, color: "#6b7280", italic: true });
      } else {
        R.para(b.text);
      }
    }

    /* демонстрация: интерактивная схема (векторные графы и таблицы) + связь с компилятором */
    const viz = VIZ_REGISTRY[chapter.id];
    const vecViz = VECTOR_VISUALIZERS[chapter.id];
    const syncKeys = Object.keys(PAGE_SYNC).filter((k) => k === chapter.id || k.startsWith(`${chapter.id}#`));

    if (viz || syncKeys.length || vecViz) {
      R.h2("Демонстрация и интерактивная схема");
      if (viz) {
        R.para(viz.title, { size: 10.2, color: "#1e293b" });
        if (viz.hint) R.para(viz.hint, { size: 9.1, color: "#4b5563" });
      }

      if (vecViz) {
        if (vecViz.nodes && vecViz.edges) {
          R.vectorGraph(vecViz.nodes, vecViz.edges, { height: 130, title: vecViz.title });
        }
        if (vecViz.table) {
          R.table(vecViz.table);
        }
      }

      for (const key of syncKeys) {
        const sync = PAGE_SYNC[key];
        const demo = key.includes("#") ? key.split("#")[1] : null;
        const title = demo ? `Вкладка «${demo}»${sync.vizTitle ? ` — ${sync.vizTitle}` : ""}` : sync.vizTitle ?? "Основной режим";
        const lines = [];
        if (sync.stepNote) lines.push(`Шаг демонстрации: ${sync.stepNote}`);
        sync.variables.forEach((v) => lines.push(`• ${v.name} — ${v.role}${v.range ? ` (${v.range})` : ""}`));
        lines.push("• Референсный код открывается в интерактивной панели Python веб-приложения.");
        if (lines.length) R.box(title, lines);
      }
    }

    /* блиц: те же вопросы, что в приложении, но сразу с ответом и разбором */
    const quiz = (quizzes && quizzes[chapter.id]) || [];
    if (quiz.length) {
      R.h2("Блиц: вопросы по теме");
      quiz.forEach((q, qi) => {
        R.para(`${qi + 1}. ${q.question}`, { size: 9.6, color: "#111827", gapAfter: 2 });
        q.options.forEach((option, oi) => {
          R.bullet(oi === q.correctIndex ? `${option} — верный ответ` : option, { depth: 1, size: 9.2 });
        });
        R.para(q.explanation, { size: 8.8, color: "#4b5563", italic: true, indent: 10, gapAfter: 6 });
      });
    }
  }

  R.stampFooter();
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const size = fs.statSync(GUIDE_PDF_PATH).size;
  console.log("[guide] PDF пособия собран");
  console.log(`        тем: ${chapters.length} · снимков демонстраций: ${shotsTotal}`);
  console.log(`        выход: ${path.relative(ROOT, GUIDE_PDF_PATH)} (${humanSize(size)})`);

  // Самопроверка: страниц в файле должно быть ровно столько, сколько насчитал
  // рендерер. Расхождение означает, что pdfkit создал страницу сам — она уходит
  // в файл без нижнего колонтитула и без нумерации.
  const pdfLib = await import("pdf-lib");
  const physical = (await pdfLib.PDFDocument.load(fs.readFileSync(GUIDE_PDF_PATH), { ignoreEncryption: true })).getPageCount();
  console.log(`        страниц: ${R.pages} (рендер) / ${physical} (в файле)${R.pages === physical ? " — совпадает" : ""}`);
  if (R.pages > 100) console.warn(`        ВНИМАНИЕ: ${R.pages} страниц — цель до 100 (ожидалось 40–60).`);
  if (physical !== R.pages) {
    console.error(`        ОШИБКА: pdfkit добавил ${physical - R.pages} стр. в обход рендерера (без колонтитула).`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Ошибка сборки PDF пособия:", err.message);
  process.exit(1);
});
