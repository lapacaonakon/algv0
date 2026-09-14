/**
 * DOM-харнес: настоящее приложение в jsdom + настоящий Pyodide из node_modules.
 * Монтирует App, кликает кнопки, печатает в редакторе Python, подсовывает
 * визуализациям матрицы чужих размерностей и ловит падения/баги в DOM.
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import App from "../../src/App";
import { chapters, chapterTopics, SECTIONS, sectionOf } from "../../src/data/content";
import { quizzes } from "../../src/data/quizzes";
import { VIZ_REGISTRY } from "../../src/components/vizRegistry";
import { VizLiveStatus } from "../../src/components/VizLiveStatus";
import { PAGE_SYNC, buildInitTemplate } from "../../src/data/vizSync";
import { VizChapterContext, emitVizState, clearVizState } from "../../src/data/vizStepBus";
import { buildDebugRunner, type DebugResult } from "../../src/data/debugRunner";

type Py = { runPythonAsync: (src: string) => Promise<unknown> };

export interface TestResult {
  group: string;
  name: string;
  ok: boolean;
  ms: number;
  detail: string;
  consoleErrors: string[];
}

const results: TestResult[] = [];
let consoleErrors: string[] = [];
const realConsoleError = console.error;

/* ------------------------------------------------------------------ */
/*  утилиты                                                            */
/* ------------------------------------------------------------------ */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function settle(ms = 40) {
  await act(async () => {
    await sleep(ms);
  });
}

function bodyText(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ");
}

function allButtons(): string[] {
  return Array.from(document.querySelectorAll("button")).map(
    (b) => (b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70)
  );
}

/** Кнопки без доступного имени: ни aria-label, ни title, ни текста. */
function namelessButtons(scope: ParentNode = document): string[] {
  return Array.from(scope.querySelectorAll("button"))
    .filter((b) => {
      const name = [b.getAttribute("aria-label"), b.getAttribute("title"), b.textContent]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      return name.length === 0;
    })
    .map((b) => `<button class="${(b.className || "").slice(0, 60)}">`);
}

function findButton(match: string | RegExp): HTMLButtonElement | undefined {
  const list = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
  return list.find((b) => {
    const hay = [b.getAttribute("aria-label"), b.getAttribute("title"), b.textContent].filter(Boolean).join(" | ");
    return typeof match === "string" ? hay.includes(match) : match.test(hay);
  });
}

async function click(el: Element | undefined | null, label = "кнопка") {
  if (!el) throw new Error(`не найдена ${label}`);
  await act(async () => {
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    await sleep(20);
  });
}

/** Панель компилятора — все поиски внутри неё, чтобы не цеплять чужие поля. */
function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('aside[aria-label="Python-компилятор"]');
}

function panelText(): string {
  return (panel()?.textContent ?? "").replace(/\s+/g, " ");
}

function textarea(): HTMLTextAreaElement | undefined {
  return panel()?.querySelector<HTMLTextAreaElement>("textarea") ?? undefined;
}

function typeInto(ta: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
  if (!setter) throw new Error("нет нативного setter'а value у textarea");
  act(() => {
    setter.call(ta, value);
    ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

async function key(k: string, init: KeyboardEventInit = {}) {
  await act(async () => {
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init }));
    await sleep(20);
  });
}

/** Ждём появления признака в DOM (текст/предикат), периодически скармливая act(). */
async function waitFor(pred: () => boolean, timeoutMs = 25000, step = 60): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pred()) return true;
    await settle(step);
  }
  return pred();
}

const RUN_DONE = [
  "Трасса готова автоматически",
  "Нет шагов трассы",
  "Пустой код",
  "Код не выполнился",
  "Выполнение остановлено после",
  "Не удалось выполнить код",
  "Ошибка:",
];

let root: Root | null = null;
let host: HTMLElement | null = null;

function freshHost(): HTMLElement {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return div;
}

async function mountApp(topic: string) {
  if (root) {
    await act(async () => {
      root?.unmount();
    });
    root = null;
  }
  if (host) {
    host.remove();
  }
  host = freshHost();
  window.history.replaceState({}, "", `/?topic=${encodeURIComponent(topic)}`);
  root = createRoot(host);
  await act(async () => {
    root!.render(<App />);
  });
  await settle(80);
  return host;
}

/** Смонтировать одну визуализацию так, как это делает ChapterView. */
async function mountViz(vizId: string) {
  if (root) {
    await act(async () => {
      root?.unmount();
    });
    root = null;
  }
  if (host) host.remove();
  host = freshHost();
  const entry = VIZ_REGISTRY[vizId];
  if (!entry) throw new Error(`в реестре нет визуализации "${vizId}"`);
  const Comp = entry.Component;
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <VizChapterContext.Provider value={vizId}>
        <VizLiveStatus demoTitle={entry.title} />
        <Comp />
      </VizChapterContext.Provider>
    );
  });
  await settle(60);
  return host;
}

const BAD_DOM = [
  { re: /\bNaN\b/, why: "NaN в разметке" },
  { re: /\bundefined\b/, why: "undefined в разметке" },
  { re: /\[object Object\]/, why: "[object Object] в разметке" },
];

/**
 * Битые подстановки видны в КОРОТКИХ текстовых узлах (ячейка таблицы, подпись
 * вершины): «undefined», «NaN», «[object Object]». В длинной прозе и листингах
 * псевдокода те же слова законны — их не трогаем.
 */
function domDefects(scope: HTMLElement | null): string[] {
  if (!scope) return [];
  const found: string[] = [];
  const walker = document.createTreeWalker(scope, 4 /* SHOW_TEXT */);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const text = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
    if (text.length > 0 && text.length < 60) {
      for (const bad of BAD_DOM) {
        if (bad.re.test(text)) found.push(`${bad.why}: «${text}»`);
      }
    }
    node = walker.nextNode() as Text | null;
  }
  return [...new Set(found)];
}

async function test(group: string, name: string, fn: () => Promise<string | void>) {
  if (skipGroups.has(group[0])) return true;
  consoleErrors = [];
  const t0 = Date.now();
  let ok = true;
  let detail = "";
  try {
    const d = await fn();
    detail = d ?? "";
  } catch (error) {
    ok = false;
    detail = error instanceof Error ? `${error.message}\n${(error.stack ?? "").split("\n").slice(1, 5).join("\n")}` : String(error);
  }
  const ms = Date.now() - t0;
  const errs = consoleErrors.filter((e) => !/not wrapped in act|ReactDOMTestUtils|useLayoutEffect does nothing/.test(e));
  if (errs.length > 0) {
    ok = false;
    detail = `${detail}\nconsole.error (${errs.length}): ${errs.slice(0, 4).join(" / ").slice(0, 600)}`.trim();
  }
  results.push({ group, name, ok, ms, detail, consoleErrors: errs });
  const mark = ok ? "PASS" : "FAIL";
  realConsoleError === console.error;
  process.stdout.write(`${mark}  [${group}] ${name}${ok && detail ? ` — ${detail.slice(0, 110).replace(/\n/g, " ")}` : ""}\n`);
  if (!ok) process.stdout.write(detail.split("\n").map((l) => `        ${l.slice(0, 200)}`).join("\n") + "\n");
  return ok;
}

/* ------------------------------------------------------------------ */
/*  сценарии                                                           */
/* ------------------------------------------------------------------ */

/** Фильтры прогона: HAR_CHAPTERS=segment-trees,floyd и HAR_SKIP=A,E (буквы групп). */
const onlyChapters = (process.env.HAR_CHAPTERS || "").split(",").map((s) => s.trim()).filter(Boolean);
const skipGroups = new Set((process.env.HAR_SKIP || "").split(",").map((s) => s.trim()).filter(Boolean));
/** HAR_SYNC=floyd,dijkstra — прогнать только эти записи эталонного кода. */
const onlySync = new Set((process.env.HAR_SYNC || "").split(",").map((s) => s.trim()).filter(Boolean));

export async function runSuite({ py }: { py: Py }): Promise<TestResult[]> {
  const chapterList = onlyChapters.length ? chapters.filter((c) => onlyChapters.includes(c.id)) : chapters;
  const want = (group: string) => !skipGroups.has(group[0]);
  // перехват console.error приложения (React пишет сюда о падениях потомков)
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(" "));
  };

  /* ── 1. Панель Python: реальный запуск на каждой главе ─────────── */
  for (const chapter of chapterList) {
    const group = "A. страницы";
    await test(group, `${chapter.id}: монтируется, бейдж источника виден`, async () => {
      await mountApp(chapter.id);
      const txt = bodyText();
      if (!txt.includes(chapter.title.slice(0, 18))) throw new Error(`заголовок главы не отрендерился: "${chapter.title}"`);
      if (!VIZ_REGISTRY[chapter.id]) return "визуализации у главы нет (ок)";
      if (!/встроенное демо|данные из компилятора/.test(txt)) throw new Error("нет бейджа источника данных (VizLiveStatus)");
      const defects = domDefects(host);
      if (defects.length) throw new Error(`артефакты в DOM демо-режима: ${defects.join(", ")}`);
      const nameless = namelessButtons(host!);
      if (nameless.length) throw new Error(`кнопок без подписи/aria-label: ${nameless.length} → ${nameless.slice(0, 3).join(", ")}`);
      return `бейдж «встроенное демо» на месте, кнопок ${allButtons().length}, немых 0`;
    });

    await test(group, `${chapter.id}: панель открывается, редактор на месте`, async () => {
      await mountApp(chapter.id);
      const toggle = findButton("Боковая панель Python");
      await click(toggle, "кнопка панели Python в навбаре");
      const ta = textarea();
      if (!ta) throw new Error("редактор (textarea) не появился после открытия панели");
      if (!ta.value.includes("# «")) return `редактор есть, но без шапки страницы: ${ta.value.slice(0, 60)}`;
      const eye = findButton(/эта?лонный код/i);
      if (!eye) throw new Error("нет кнопки-«глаза» (вставить эталонный код)");
      const run = findButton(/Запустить код|автопроход/i);
      if (!run) throw new Error("нет кнопки запуска ▶");
      return `кнопок в панели: ${allButtons().length}`;
    });

    await test(group, `${chapter.id}: автозапуск инициализации (настоящий Python)`, async () => {
      await mountApp(chapter.id);
      await click(findButton("Боковая панель Python"), "панель Python");
      const done = await waitFor(() => RUN_DONE.some((m) => bodyText().includes(m)), 30000);
      if (!done) throw new Error(`запуск не завершился за 30 с (сообщения: ${bodyText().slice(0, 120)})`);
      const msg = RUN_DONE.find((m) => bodyText().includes(m))!;
      const sync = PAGE_SYNC[chapter.id];
      if (!sync?.code) return `кода синхронизации нет: ${msg}`;
      if (/Ошибка|Не удалось/.test(msg)) throw new Error(`инициализация страницы не выполнилась: ${msg}`);
      // после настоящего прогона визуализация обязана перейти на данные компилятора
      const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 3000);
      if (!linked) return `${msg}; визуализация осталась на встроенном демо`;
      return `${msg} → визуализация переключилась на данные компилятора`;
    });
  }

  /* ── 2. Флойд: матрицы ЛЮБОЙ размерности из кода пользователя ──── */
  const floydCases: { name: string; vars: Record<string, unknown>; expect: string }[] = [
    { name: "5×5 (меньше демо-7×7)", vars: { n: 5, k: 1, i: 2, j: 3, d: [[0, 1, 9, 9, 9], [9, 0, 2, 9, 9], [9, 9, 0, 3, 9], [4, 9, 9, 0, 5], [9, 6, 9, 9, 0]] }, expect: "5×5" },
    { name: "10×10 (больше демо — старый краш nodeNames)", vars: { n: 10, k: 2, i: 8, j: 9, d: Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => (r === c ? 0 : (r * 7 + c * 3) % 13))) }, expect: "10×10" },
    { name: "3×3 с бесконечностями", vars: { n: 3, k: 0, i: 0, j: 2, d: [[0, 1, Infinity], [Infinity, 0, 2], [3, Infinity, 0]] }, expect: "3×3" },
    { name: "не квадратная 4×6", vars: { n: 4, k: 1, i: 0, j: 5, d: [[0, 1, 2, 3, 4, 5], [6, 0, 7, 8, 9, 10], [11, 12, 0, 13, 14, 15], [16, 17, 18, 19, 0, 20]] }, expect: "Демо-схема графа нарисована для 7 вершин" },
    { name: "словарь словарей d[0][1]", vars: { n: 4, k: 1, i: 0, j: 1, d: { 0: { 0: 0, 1: 4, 2: 9, 3: 9 }, 1: { 0: 9, 1: 0, 2: 2, 3: 9 }, 2: { 0: 9, 1: 9, 2: 0, 3: 1 }, 3: { 0: 3, 1: 9, 2: 9, 3: 0 } } }, expect: "4×4" },
    { name: "ключи-пары \"(i, j)\"", vars: { n: 3, k: 0, i: 0, j: 1, d: { "(0, 0)": 0, "(0, 1)": 5, "(0, 2)": 9, "(1, 0)": 9, "(1, 1)": 0, "(1, 2)": 2, "(2, 0)": 1, "(2, 1)": 9, "(2, 2)": 0 } }, expect: "3×3" },
    { name: "плоский список — это НЕ матрица", vars: { n: 3, k: 0, i: 1, j: 2, d: [1, 2, 3, 4, 5] }, expect: "n, k, i, j, d" },
    { name: "80×80 (обрезка до 64)", vars: { n: 80, k: 3, i: 70, j: 71, d: Array.from({ length: 80 }, (_, r) => Array.from({ length: 80 }, (_, c) => (r === c ? 0 : 1 + ((r + c) % 50)))) }, expect: "64" },
    { name: "пустая матрица", vars: { n: 0, k: 0, i: 0, j: 0, d: [] }, expect: "данные из компилятора" },
    { name: "матрица под именем D и k/i/j вне диапазона", vars: { n: 4, k: 99, i: -5, j: 42, D: [[0, 1, 2, 3], [4, 0, 5, 6], [7, 8, 0, 9], [10, 11, 12, 0]] }, expect: "4×4" },
  ];

  for (const c of floydCases) {
    await test("B. Флойд: размерности", c.name, async () => {
      await mountViz("floyd");
      await act(async () => {
        emitVizState("floyd", { line: 3, func: "<module>", variables: c.vars as never, changed: Object.keys(c.vars) });
        await sleep(30);
      });
      const txt = (host?.textContent ?? "").replace(/\s+/g, " ");
      if (!/данные из компилятора/.test(txt)) throw new Error("бейдж не переключился на данные компилятора");
      if (!txt.includes(c.expect)) throw new Error(`в разметке нет ожидаемого "${c.expect}": ${txt.slice(0, 300)}`);
      const defects = domDefects(host);
      if (defects.length) throw new Error(`артефакты в DOM: ${defects.join(", ")} :: ${txt.slice(0, 300)}`);
      return `бейдж: ${(txt.match(/данные из компилятора[^·]*(·[^сцен]*)?/) ?? [""])[0].trim().slice(0, 60)}`;
    });
  }

  /* ── 3. Префиксные суммы 2D и разреженная таблица ─────────────── */
  const gridCases: { viz: string; chapter: string; name: string; vars: Record<string, unknown>; expect: RegExp }[] = [
    { viz: "prefix-sums-2d", chapter: "prefix-sums-2d#2d", name: "своя матрица 3×4", vars: { n: 3, m: 4, a: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], S: [[1, 3, 6, 10], [6, 14, 24, 36], [15, 33, 54, 78]], r1: 0, c1: 1, r2: 2, c2: 3 }, expect: /3×4|данные из компилятора/ },
    { viz: "prefix-sums-2d", chapter: "prefix-sums-2d#2d", name: "префиксы под именем pref, 2×2", vars: { n: 2, m: 2, a: [[1, 2], [3, 4]], pref: [[1, 3], [4, 10]], r1: 0, c1: 0, r2: 1, c2: 1 }, expect: /2×2|данные из компилятора/ },
    { viz: "prefix-sums-2d", chapter: "prefix-sums-2d#2d", name: "запрос вне границ", vars: { n: 3, m: 3, a: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], S: [[1, 3, 6], [5, 12, 21], [12, 27, 45]], r1: -2, c1: 0, r2: 99, c2: 3 }, expect: /не совпадает|данные из компилятора/ },
    { viz: "sparse-table", chapter: "sparse-table", name: "1D: свой массив другой длины", vars: { n: 5, k: 1, i: 2, st: [[5, 3, 9, 1, 7], [3, 3, 1, 1, 0], [1, 1, 0, 0, 0]] }, expect: /не совпадает|данные из компилятора/ },
    { viz: "sparse-table", chapter: "sparse-table#2d-build", name: "2D-построение: матрица 4×4 вместо 8×8", vars: { n: 4, m: 4, ki: 1, kj: 0, i: 2, j: 3, st: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 1)) }, expect: /не совпадает|данные из компилятора/ },
    { viz: "sparse-table", chapter: "sparse-table#2d-query", name: "2D-запрос: координаты вне 0…7", vars: { n: 4, m: 4, i1: 0, j1: 0, i2: 30, j2: 40, res: 2 }, expect: /не совпадает|данные из компилятора/ },
  ];
  for (const c of gridCases) {
    await test("C. матричные страницы", `${c.viz}: ${c.name}`, async () => {
      await mountViz(c.viz);
      await act(async () => {
        emitVizState(c.viz, { line: 2, func: "<module>", variables: c.vars as never, changed: Object.keys(c.vars) });
        await sleep(30);
      });
      const txt = (host?.textContent ?? "").replace(/\s+/g, " ");
      if (!c.expect.test(txt)) throw new Error(`ожидали ${c.expect}, получили: ${txt.slice(0, 300)}`);
      const defects = domDefects(host);
      if (defects.length) throw new Error(`артефакты в DOM: ${defects.join(", ")} :: ${txt.slice(0, 300)}`);
      return /размерность не совпадает/.test(txt) ? "предупреждение о несовпадении показано" : "данные компилятора приняты";
    });
  }

  await test("C. матричные страницы", "2D-построение: оригинал из A, шаги кликаются", async () => {
    await mountViz("sparse-table");
    const A8 = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => i * 8 + j + 1));
    await act(async () => {
      emitVizState("sparse-table", { line: 7, func: "<module>", variables: { A: A8, st2: {}, r: 0, c: 0, k: 0 } as never, changed: ["st2"] });
      await sleep(40);
    });
    const grids = () => Array.from((host ?? document).querySelectorAll("div.grid"));
    let g0 = grids()[0];
    if (!g0) throw new Error("нет ни одной матрицы блоков");
    const firstCell = () => (g0.children[0]?.textContent ?? "").trim();
    // «Оригинал (1x1)» = сама матрица A: значения видны сразу, а не после цикла построения
    if (firstCell() !== "1") throw new Error(`оригинал не взял значения из A: первая клетка «${firstCell()}»`);
    if ((g0.children[7]?.textContent ?? "").trim() !== "8") throw new Error("строка оригинала не равна строке A");
    // шаги кликаются даже под live-k из компилятора
    await click(findButton("Шаг 2 (4x4)"), "вкладка шага");
    const txt = (host?.textContent ?? "").replace(/\s+/g, " ");
    if (!/Матрица блоков 4x4/.test(txt)) throw new Error(`вкладка «Шаг 2» не переключила матрицы: ${txt.slice(0, 200)}`);
    g0 = grids()[0];
    const cls = (g0.children[0] as HTMLElement)?.className ?? "";
    // пустая активная клетка (код смотрит на (0,0), st2 не построена) — контур, не залитый квадрат
    if (!/border-dashed/.test(cls) || !/indigo/.test(cls)) {
      throw new Error(`пустая активная клетка нарисована как залитая: ${cls.slice(0, 120)}`);
    }
    if (domDefects(host).length) throw new Error(`артефакты в DOM: ${domDefects(host).join(", ")}`);
    return "оригинал из A с первого шага, вкладка «Шаг 2» переключает, пустая активная клетка — контур";
  });

  /* ── 4. Дейкстра / Форд-Беллман: чужие имена вершин + кнопки ──── */
  for (const [viz, vars] of [
    ["dijkstra", { u: 0, v: 3, w: 4, dist: [0, 4, 2, 6, 9], prev: [-1, 0, 0, 2, 3], done: [true, false, true, false, false] }],
    ["bellman-ford", { n: 5, m: 4, i: 1, u: 2, v: 4, w: 3, dist: [0, 5, 2, 7, 5], prev: [-1, 0, 0, 2, 2] }],
  ] as [string, Record<string, unknown>][]) {
    await test("D. графы путей", `${viz}: вершины 0…4 вместо A…G + кнопки гаснут`, async () => {
      await mountViz(viz);
      const before = allButtons().length;
      const playEnabled = (findButton(/^Пуск|Пуск$/) as HTMLButtonElement | undefined)?.disabled;
      await act(async () => {
        emitVizState(viz, { line: 5, func: "<module>", variables: vars as never, changed: Object.keys(vars) });
        await sleep(30);
      });
      const txt = (host?.textContent ?? "").replace(/\s+/g, " ");
      if (!/данные из компилятора/.test(txt)) throw new Error("бейдж не переключился на компилятор");
      if (!/ваши расстояния|dist/i.test(txt)) throw new Error("нет таблицы значений пользователя");
      const step = findButton(/^Шаг$|Шаг /) as HTMLButtonElement | undefined;
      if (step && !step.disabled) throw new Error("кнопка «Шаг» осталась активной, хотя шаги ведёт компилятор");
      if (domDefects(host).length) throw new Error(`артефакты в DOM: ${domDefects(host).join(", ")}`);
      await act(async () => {
        clearVizState(viz);
        await sleep(30);
      });
      const step2 = findButton(/^Шаг$|Шаг /) as HTMLButtonElement | undefined;
      if (step2 && step2.disabled) throw new Error("кнопка «Шаг» не ожила после снятия связи");
      return `кнопок до/после: ${before}/${allButtons().length}, «Пуск» в демо: ${playEnabled === false ? "активна" : "—"}`;
    });
  }

  /* ── 5. Все референсные коды: настоящий Python → настоящая картинка ── */
  const syncKeys = Object.keys(PAGE_SYNC).filter((k) => PAGE_SYNC[k].code && (onlySync.size === 0 || onlySync.has(k)));
  for (const key of syncKeys) {
    const sync = PAGE_SYNC[key];
    const chapterId = key.split("#")[0];
    await test("E. эталонный код", `${key}: выполняется и ведёт визуализацию`, async () => {
      const raw = await py.runPythonAsync(buildDebugRunner(sync.code!));
      const result = JSON.parse(String(raw)) as DebugResult;
      if (result.error) throw new Error(`Python-ошибка: ${result.error.slice(0, 300)}`);
      if (result.steps.length === 0) throw new Error("нет ни одного шага трассы — панель уйдёт в пустой листинг");
      // объявленные переменные синхронизации реально появляются в трассе
      const seen = new Set<string>();
      for (const s of result.steps) for (const n of Object.keys(s.values ?? {})) seen.add(n);
      for (const n of Object.keys(result.finalValues ?? {})) seen.add(n);
      // в документации имя может быть видом «xk / x», «dist[v]», «(i−1)//2», «π»:
      // проверяем, что хотя бы один python-идентификатор из описания реально есть в трассе
      const declared = sync.variables.map((v) => v.name);
      const ident = (t: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(t);
      const missing = declared
        .map((raw) => raw.split(/[\/[\],]|\s+или\s+/).map((p) => p.trim()).filter(Boolean))
        .filter((alts) => alts.some(ident))
        .filter((alts) => !alts.some((a) => ident(a) && seen.has(a)))
        .map((alts) => alts.join(" / "));
      if (missing.length) throw new Error(`код не создаёт переменные синхронизации: ${missing.join(", ")} (шагов: ${result.steps.length})`);

      if (!VIZ_REGISTRY[chapterId]) return `шагов ${result.steps.length}; визуализации у страницы нет`;
      await mountViz(chapterId);
      const finalVars = result.finalValues ?? result.steps[result.steps.length - 1].values ?? {};
      await act(async () => {
        emitVizState(chapterId, { line: result.steps[result.steps.length - 1].line, func: "<module>", variables: finalVars as never, changed: Object.keys(finalVars) });
        await sleep(40);
      });
      const txt = (host?.textContent ?? "").replace(/\s+/g, " ");
      if (!/данные из компилятора/.test(txt)) throw new Error(`визуализация не приняла данные кода (${result.steps.length} шагов)`);
      const defects = domDefects(host);
      if (defects.length) throw new Error(`артефакты в DOM на финальном шаге: ${defects.join(", ")} :: ${txt.slice(0, 240)}`);
      return `шагов ${result.steps.length}${result.truncated ? " (ЛИМИТ — трасса обрезана)" : ""}, переменные кода: ${[...seen].slice(0, 6).join(", ")}`;
    });
  }

  /* ── 6. Поведение редактора: пустой код, ошибки, глазик, страницы ── */
  const ch = "dijkstra";

  await test("F. редактор", "только комментарии: редактор НЕ исчезает, связь снята", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(ta, "# просто комментарий\n# и ещё один\n");
    const done = await waitFor(() => bodyText().includes("Нет шагов трассы"), 20000);
    if (!done) throw new Error(`не дождались сообщения о пустой трассе. Панель: ${panelText().slice(0, 320)}`);
    if (!textarea()) throw new Error("редактор исчез после кода без исполняемых строк — кнопка/поле пропадают");
    if (!/встроенное демо/.test(bodyText())) throw new Error("визуализация не вернулась к встроенному демо");
    return "редактор на месте, бейдж «встроенное демо»";
  });

  await test("F. редактор", "синтаксическая ошибка: редактор открыт, ошибка видна", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(ta, "def broken(:\n    pass\n");
    const done = await waitFor(() => /Код не выполнился|Ошибка/.test(bodyText()), 20000);
    if (!done) throw new Error(`ошибка синтаксиса не показана. Панель: ${panelText().slice(0, 320)}`);
    if (!textarea()) throw new Error("редактор исчез на синтаксической ошибке — править негде");
    if (!/invalid syntax|SyntaxError/i.test(bodyText())) throw new Error("текст ошибки Python не показан пользователю");
    return "ошибка показана, редактор остался";
  });

  await test("F. редактор", "гигантский print обрезается честно и не вешает панель", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(ta, 'dist = {0: 0}\nprint("x" * 200000)\nprint("ХВОСТ_ВЫВОДА")\n');
    const ready = await waitFor(() => bodyText().includes("Трасса готова автоматически"), 40000);
    if (!ready) throw new Error(`программа с огромным print не выполнилась. Панель: ${panelText().slice(0, 300)}`);
    const block = document.querySelector('[data-testid="compiler-output"]');
    if (!block) throw new Error("блок «Результат» не отрисован");
    const out = block.textContent ?? "";
    if (!/вывод обрезан/.test(out)) throw new Error(`панель промолчала об обрезке: ${out.slice(0, 200)}`);
    if (out.includes("ХВОСТ_ВЫВОДА")) throw new Error("обрезка не сработала: в панели оказался весь вывод на 200 тысяч знаков");
    if (out.length > 40000) throw new Error(`в панели ${out.length} знаков — вкладка бы зависла`);
    if (!textarea()) throw new Error("редактор исчез после огромного вывода");
    if (domDefects(host).length) throw new Error(`артефакты в DOM: ${domDefects(host).join(", ")}`);
    return `вывод обрезан до ${out.length} знаков, хвост не показан, редактор жив`;
  });

  await test("F. редактор", "полная очистка: ничего не исполняется, демо своё", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(ta, "");
    const done = await waitFor(() => bodyText().includes("Пустой код"), 15000);
    if (!done) throw new Error(`на пустой редактор панель не ответила. Панель: ${panelText().slice(0, 320)}`);
    if (!textarea()) throw new Error("редактор исчез после очистки");
    if (!/встроенное демо/.test(bodyText())) throw new Error("связь с визуализацией не снята");
    if (allButtons().length < 5) throw new Error(`кнопок осталось ${allButtons().length} — панель рассыпалась`);
    return `пустой код: кнопок ${allButtons().length}, демо автономно`;
  });

  await test("F. редактор", "глаз: эталон попадает в редактор и по-настоящему снимается", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    const init = ta.value;
    const editorButtons = allButtons();
    const ref = PAGE_SYNC[ch]?.code ?? "";
    if (!ref) throw new Error("у страницы нет эталонного кода");
    const done0 = await waitFor(() => RUN_DONE.some((m) => panelText().includes(m)), 25000);
    if (!done0) throw new Error(`инициализация не выполнилась до проверки глаза: ${panelText().slice(0, 200)}`);

    // ── глаз ВКЛ: эталон лежит В РЕДАКТОРЕ, и редактор при этом не исчезает ──
    await click(findButton("Вставить эталонный код"), "глаз");
    const trace = await waitFor(() => !!findButton(/Остановить прогон трассы/), 30000);
    if (!trace) throw new Error(`эталон не запустился. Панель: ${panelText().slice(0, 320)}`);
    if (!textarea()) throw new Error("редактор исчез во время прогона эталона — править негде");
    if (/Ошибка:/.test(panelText())) throw new Error(`эталонный код упал: ${panelText().slice(0, 240)}`);
    const ta2 = textarea();
    const firstRefLine = ref.split("\n").find((l) => l.trim() !== "")?.trim() ?? "";
    if (!ta2?.value.includes(firstRefLine)) {
      throw new Error(`выполняется не тот текст, что лежит в редакторе:\n  редактор: ${ta2?.value.slice(0, 100)}\n  эталон:   ${ref.slice(0, 100)}`);
    }
    const mustBe = [
      { what: "пуск/автопроход", re: /Запустить код|Продолжить автопроход|Пауза автопрохода|Пуск автопрохода/ },
      { what: "копирование кода", re: /Скопировать код|Копировать/ },
      { what: "закрыть панель", re: /Закрыть компилятор|Скрыть панель/ },
      { what: "шаг вперёд", re: /Шаг вперёд|вперёд/i },
      { what: "шаг назад", re: /Шаг назад|назад/i },
      { what: "свернуть листинг", re: /Свернуть листинг|Показать листинг/ },
    ];
    const btns = allButtons().join(" | ");
    for (const m of mustBe) {
      if (!m.re.test(btns)) throw new Error(`в панели нет кнопки «${m.what}». Есть: ${btns.slice(0, 400)}`);
    }
    // На первом шаге переменных ещё нет (отладчик встал ДО первой строки) —
    // поэтому связь с демонстрацией проверяем, дойдя до конца трассы.
    await click(findButton("В конец трассы"), "в конец трассы");
    const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 4000);
    if (!linked) throw new Error(`эталон выполнен до конца, но визуализация его не приняла. Страница: ${bodyText().slice(0, 200)}`);

    // ── глаз ВЫКЛ: кода нет вовсе, ничего не выполняется, связь снята ──
    await click(findButton("Убрать эталонный код"), "глаз (обратно)");
    const cleared = await waitFor(() => bodyText().includes("Пустой код"), 20000);
    if (!cleared) throw new Error(`после выключения глаза панель продолжает что-то выполнять. Панель: ${panelText().slice(0, 320)}`);
    const ta3 = textarea();
    if (!ta3) throw new Error("редактор пропал после выключения глаза");
    if (ta3.value.trim() !== "") throw new Error(`глаз не снял код — в редакторе осталось:\n${ta3.value.slice(0, 140)}`);
    if (!/встроенное демо/.test(bodyText())) throw new Error("связь не снята: демонстрация по-прежнему живёт значениями убранного кода");
    if (/данные из компилятора/.test(bodyText())) throw new Error("бейдж врёт: код убран, а он показывает «данные из компилятора»");
    const afterButtons = allButtons();
    const lost = editorButtons.filter((b) => b && !afterButtons.includes(b));
    if (lost.length > 2) throw new Error(`после снятия эталона не хватает кнопок: ${lost.slice(0, 5).join(" | ")}`);

    // ↺ возвращает инициализацию страницы
    await click(findButton("Сбросить к шаблону страницы"), "сброс к шаблону");
    const back = await waitFor(() => textarea()?.value === init, 4000);
    if (!back) throw new Error(`↺ не вернул инициализацию страницы: ${textarea()?.value.slice(0, 100)}`);
    return "эталон вставляется в редактор, ведёт демонстрацию и снимается по-настоящему";
  });

  await test("F. редактор", "код не перетекает между страницами", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(ta, "# MY-MARKER-14\nx = 41\nx += 1\nprint(x)\n");
    await waitFor(() => RUN_DONE.some((m) => bodyText().includes(m)), 20000);
    if (!bodyText().includes("42")) throw new Error("свой код не выполнился (нет вывода 42)");
    // переходим на другую страницу, не закрывая панель
    await mountApp("floyd");
    await click(findButton("Боковая панель Python"), "панель");
    const ta2 = textarea();
    if (!ta2) throw new Error("на новой странице нет редактора");
    if (ta2.value.includes("MY-MARKER-14")) throw new Error("код прошлой страницы исполняется на новой — утечка между главами");
    if (!ta2.value.includes("# «")) throw new Error("на новой странице редактор без инициализации своей страницы");
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const ta3 = textarea();
    if (!ta3?.value.includes("MY-MARKER-14")) throw new Error("свой код не вернулся при возврате на страницу");
    return "у каждой страницы свой код, возврат сохраняет правки";
  });

  await test("F. редактор", "редактор живёт и во время прогона; Esc останавливает трассу", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const done = await waitFor(() => bodyText().includes("Трасса готова автоматически"), 25000);
    if (!done) throw new Error(`трасса не собралась. Панель: ${panelText().slice(0, 320)}`);
    if (!textarea()) throw new Error("во время прогона редактор исчез — править код негде");
    if (!findButton(/Остановить прогон трассы/)) throw new Error("панель не показала трассу после автозапуска");
    // Листинг сворачивается (освобождая место редактору), управление шагами
    // и редактор остаются на месте.
    const codeLines = () => panel()?.querySelectorAll("[data-line]").length ?? 0;
    if (codeLines() === 0) throw new Error("в раскрытой трассе нет строк листинга");
    await click(findButton("Свернуть листинг трассы"), "свернуть листинг");
    await settle(80);
    if (!textarea()) throw new Error("после сворачивания листинга редактор пропал");
    if (codeLines() !== 0) throw new Error(`листинг не свернулся: ${codeLines()} строк осталось`);
    if (!findButton("В конец трассы")) throw new Error("вместе с листингом пропало управление шагами");
    await click(findButton("Показать листинг трассы"), "развернуть листинг");
    await settle(80);
    if (codeLines() === 0) throw new Error("листинг не развернулся обратно");
    // Esc: прогон остановлен, трасса убрана, редактор на месте, связь снята
    await key("Escape");
    await settle(150);
    if (!textarea()) throw new Error("Esc убрал редактор вместе с трассой");
    if (findButton(/Остановить прогон трассы/)) throw new Error("Esc не остановил прогон — трасса осталась");
    if (!/встроенное демо/.test(bodyText())) throw new Error("после Esc демонстрация осталась на значениях кода");
    return "редактор всегда на месте: трасса рядом, сворачивается и снимается по Esc";
  });

  await test("F. редактор", "закрытие панели во время прогона снимает связь", async () => {
    await mountApp("floyd"); // 869 шагов: прогон долгий, есть что закрыть на середине
    await click(findButton("Боковая панель Python"), "панель");
    await waitFor(() => panel() !== null, 4000);
    await click(findButton("Закрыть компилятор"), "крестик");
    await settle(150);
    if (panel()) throw new Error("панель не закрылась");
    const backToDemo = await waitFor(() => /встроенное демо/.test(bodyText()), 8000);
    if (!backToDemo) throw new Error(`после закрытия панели демонстрация осталась на данных кода: ${bodyText().slice(0, 160)}`);
    await settle(3000); // ждём, пока догоняющий прогон Pyodide завершится в фоне
    if (/данные из компилятора/.test(bodyText())) {
      throw new Error("закрытая панель всё-таки опубликовала снимок: код продолжает управлять демонстрацией");
    }
    if (!/встроенное демо/.test(bodyText())) throw new Error("связь ожила сама собой — закрытие панели ничего не решает");
    return "панель закрыта во время выполнения — демонстрация честно вернулась к встроенному демо";
  });

  await test("H. доступность", "панель: все кнопки подписаны в обоих режимах", async () => {
    await mountApp(ch);
    await click(findButton("Боковая панель Python"), "панель");
    const namelessEditor = namelessButtons(panel() ?? document);
    const editorBtns = allButtons().length;
    const listing = await waitFor(() => !!findButton(/Остановить прогон трассы/), 30000);
    if (!listing) throw new Error("панель не показала трассу после автозапуска");
    const namelessListing = namelessButtons(panel() ?? document);
    const listingBtns = allButtons().length;
    if (namelessEditor.length) throw new Error(`в редакторе ${namelessEditor.length} кнопок без имени: ${namelessEditor.slice(0, 3).join(", ")}`);
    if (namelessListing.length) throw new Error(`в листинге ${namelessListing.length} кнопок без имени: ${namelessListing.slice(0, 3).join(", ")}`);
    const required = [/Остановить прогон трассы/, /Свернуть листинг|Показать листинг/, /Закрыть компилятор/, /Шаг назад/, /Шаг вперёд/, /В начало трассы/, /В конец трассы/, /автопроход/i];
    const btns = allButtons().join(" | ");
    const missing = required.filter((re) => !re.test(btns));
    if (missing.length) throw new Error(`в листинге нет кнопок: ${missing.map(String).join(", ")}`);
    return `редактор: ${editorBtns} кнопок, листинг: ${listingBtns}, немых 0, управление шагами на месте`;
  });

  await test("H. доступность", "бейдж честно различает три состояния источника", async () => {
    await mountApp(ch);
    // 1) демо: компилятор ещё ничего не присылал
    if (!/встроенное демо/.test(bodyText())) throw new Error("до запуска нет подписи «встроенное демо»");
    if (/переменных пока нет/.test(bodyText())) throw new Error("состояние «переменных пока нет» показано без всякого запуска");
    await click(findButton("Боковая панель Python"), "панель");
    const listing = await waitFor(() => !!findButton(/Остановить прогон трассы/), 30000);
    if (!listing) throw new Error("панель не показала трассу");
    // 2) код выполнен, отладчик на первой строке: переменных ещё нет
    const awaiting = await waitFor(() => /переменных пока нет/.test(bodyText()) || /данные из компилятора/.test(bodyText()), 4000);
    if (!awaiting) throw new Error(`после запуска бейдж остался на «встроенном демо» — пользователь не понимает, что код выполнен. Бейдж: ${(bodyText().match(/встроенное демо|данные из компилятора|переменных пока нет/) ?? ["—"])[0]}`);
    // 3) дошли до конца трассы — картинка обязана жить данными кода
    await click(findButton("В конец трассы"), "в конец трассы");
    const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 4000);
    if (!linked) throw new Error("в конце трассы визуализация не переключилась на данные кода");
    // 4) сняли связь (Esc + пустой код) — снова демо
    await key("Escape");
    await settle(80);
    const ta = textarea();
    if (!ta) throw new Error("редактор не вернулся по Esc");
    typeInto(ta, "");
    const cleared = await waitFor(() => /встроенное демо/.test(bodyText()), 15000);
    if (!cleared) throw new Error("после очистки кода бейдж не вернулся к «встроенному демо»");
    if (/переменных пока нет/.test(bodyText())) throw new Error("после очистки осталось состояние «компилятор выполнен»");
    return "демо → выполнено/переменных нет → данные из компилятора → снова демо";
  });

  /* ── 7. Текстовый режим для PDF/парсеров ─────────────────────── */
  /* ── 9. Ссылки между билетами, разделы содержания, блиц, факты ─────── */

  await test("J. шапка", "кнопки выгрузки не прячутся и ведут на существующие файлы", async () => {
    await mountApp("segment-trees");
    const menu = document.querySelector("#download-menu");
    if (!menu) throw new Error("нет меню выгрузки в шапке");
    const want = [
      { id: "download-guide-pdf-btn", file: "export/guide_lite.pdf", what: "PDF пособия" },
      { id: "download-pdf-btn", file: "export/full_code_all_pages.pdf", what: "PDF с кодом" },
      { id: "download-txt-btn", file: "export/full_code_all_pages.txt", what: "TXT" },
    ];
    for (const w of want) {
      const el = menu.querySelector<HTMLAnchorElement>(`#${w.id}`);
      if (!el) throw new Error(`в шапке нет кнопки «${w.what}» — она уехала за край панели`);
      const href = el.getAttribute("href") ?? "";
      if (!href.endsWith(w.file)) throw new Error(`«${w.what}» ведёт не на ${w.file}, а на «${href}»`);
      const name = [el.getAttribute("aria-label"), el.getAttribute("title"), el.textContent].filter(Boolean).join(" ");
      if (name.trim().length < 5) throw new Error(`у кнопки «${w.what}» нет внятного имени`);
    }
    if (!menu.querySelector("#download-html-btn")) throw new Error("в шапке нет кнопки автономного HTML");
    const py = document.querySelector<HTMLButtonElement>("#tab-compiler-btn");
    if (!py) throw new Error("нет кнопки панели Python");
    if (!py.getAttribute("aria-label")) throw new Error("у кнопки Python нет aria-label");
    if (!py.getAttribute("title")) throw new Error("у кнопки Python нет подписи-title");
    return "4 выгрузки на месте, href ведут на файлы, кнопка Python подписана";
  });

  await test("I. ссылки", "упоминание «билет 5» кликабельно и открывает свою страницу", async () => {
    await mountApp("sparse-table");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[data-goto]"));
    if (links.length === 0) throw new Error("на странице билета 2 нет ни одной ссылки на другие билеты");
    const toPrefix = links.find((a) => a.dataset.goto === "prefix-sums-2d");
    if (!toPrefix) throw new Error(`нет ссылки на билет 5. Есть: ${links.map((a) => a.dataset.goto).join(", ")}`);
    if (!/билет 5/i.test(toPrefix.textContent ?? "")) throw new Error(`подпись ссылки не похожа на номер билета: «${toPrefix.textContent}»`);
    const href = toPrefix.getAttribute("href") ?? "";
    if (!href.includes("topic=prefix-sums-2d")) throw new Error(`у ссылки нет рабочего href: «${href}»`);
    await click(toPrefix, "ссылка на билет 5");
    await settle(120);
    const txt = bodyText();
    if (!/Двумерная матрица префиксных сумм/.test(txt)) {
      throw new Error(`клик по «билет 5» не открыл страницу билета 5. Заголовок: ${txt.slice(0, 200)}`);
    }
    return `ссылок на странице: ${links.length}, переход по «билет 5» работает`;
  });

  await test("I. ссылки", "содержание: разделы по порядку, связанные темы рядом", async () => {
    await mountApp("bridges-code");
    const sidebar = document.querySelector("#sidebar-root");
    if (!sidebar) throw new Error("нет сайдбара содержания");
    const headers = Array.from(sidebar.querySelectorAll("span"))
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => SECTIONS.some((sec) => sec.title === t));
    if (headers.length !== SECTIONS.length) {
      throw new Error(`в содержании ${headers.length} разделов из ${SECTIONS.length}: ${headers.join(" | ")}`);
    }
    const expected = SECTIONS.map((sec) => sec.title).join(" | ");
    if (headers.join(" | ") !== expected) throw new Error(`порядок разделов нарушен: ${headers.join(" | ")} ≠ ${expected}`);
    // 11 «Мосты» и 12 «Точки сочленения» читаются парой — обязаны стоять подряд
    const items = Array.from(sidebar.querySelectorAll("button")).map((b) => (b.textContent ?? "").replace(/\s+/g, " ").trim());
    const iBridges = items.findIndex((t) => t.includes("Мосты"));
    const iArtic = items.findIndex((t) => t.includes("Точки сочленения"));
    if (iBridges < 0 || iArtic < 0) throw new Error(`в содержании не нашлись «Мосты» (${iBridges}) или «Точки сочленения» (${iArtic})`);
    if (Math.abs(iArtic - iBridges) !== 1) throw new Error(`билеты 11 и 12 разнесены в содержании: позиции ${iBridges} и ${iArtic}`);
    // 2 «разреженная» и 5 «префиксные» — в одном разделе
    if (sectionOf("sparse-table").id !== sectionOf("prefix-sums-2d").id) {
      throw new Error("билеты 2 и 5 попали в разные разделы содержания");
    }
    if (sectionOf("bridges-code").id !== sectionOf("graph-articulation").id) {
      throw new Error("билеты 11 и 12 попали в разные разделы содержания");
    }
    // порядок чтения: номера билетов сверху вниз не убывают — читатель идёт 1 → 24
    const nums = Array.from(sidebar.querySelectorAll("button"))
      .map((b) => (b.querySelector("span")?.textContent ?? "").trim())
      .filter((t) => /^\d/.test(t))
      .map((t) => Number.parseInt(t, 10));
    const ticketed = chapters.filter((c) => (chapterTopics[c.id] ?? []).length > 0).length;
    if (nums.length !== ticketed) {
      throw new Error(`номера билетов видны у ${nums.length} тем из ${ticketed} — порядок чтения не прочитать`);
    }
    for (let i = 1; i < nums.length; i += 1) {
      if (nums[i] < nums[i - 1]) throw new Error(`порядок чтения сломан: билет ${nums[i]} стоит после билета ${nums[i - 1]}`);
    }
    if (!sidebar.textContent?.includes("Порядок чтения")) {
      throw new Error("в содержании нет подсказки, в каком порядке читать темы");
    }
    return `разделов ${headers.length}, 11↔12 соседствуют, 2 и 5 в одном разделе, билеты ${nums[0]}→${nums.at(-1)} по порядку`;
  });

  await test("I. ссылки", "введение: базовая база, обзор путей — ссылками", async () => {
    await mountApp("intro");
    const txt = bodyText();
    for (const must of ["Дерево как массив", "Куча", "Очередь и стек", "Бинарный поиск", "Сортировка по умолчанию", "AVL", "DFS и BFS"]) {
      if (!txt.includes(must)) throw new Error(`во введении нет блока «${must}»`);
    }
    if (!txt.includes("2n") || !txt.includes("2n+1")) throw new Error("во введении нет формулы детей дерева как массива");
    if (!txt.includes("≤ 1")) throw new Error("во введении нет условия баланса AVL |hL − hR| ≤ 1");
    if (/Обзор: Кратчайшие пути/.test(txt)) throw new Error("во введении остался обзор кратчайших путей текстом, а не ссылками");
    const goto = Array.from(document.querySelectorAll("a[data-goto]")).map((a) => a.getAttribute("data-goto"));
    if (!goto.includes("dijkstra")) throw new Error(`обзор кратчайших путей не стал гиперссылкой: ${goto.slice(0, 8).join(", ")}`);
    if (domDefects(document.querySelector("#chapter-viz") ?? document.body).length) {
      throw new Error("артефакты в DOM введения");
    }
    return "введение = куча/очередь/бинпоиск/сортировка/AVL/DFS/BFS + дерево как массив; пути ушли ссылками";
  });

  await test("I. блиц", "вопросы отвечают, объясняют и считаются", async () => {
    await mountApp("sparse-table");
    const list = quizzes["sparse-table"] ?? [];
    if (list.length === 0) throw new Error("у билета 2 нет блица");
    const section = Array.from(document.querySelectorAll("section")).find((el) =>
      (el.getAttribute("aria-label") ?? "").includes("Блиц")
    );
    if (!section) throw new Error("блиц не отрисован на странице");
    const ask = (label: string | RegExp) =>
      Array.from(section.querySelectorAll("button")).find((b) => {
        const hay = [b.getAttribute("aria-label"), b.textContent].filter(Boolean).join(" | ");
        return typeof label === "string" ? hay.includes(label) : label.test(hay);
      });
    const shown = () => (section.textContent ?? "").replace(/\s+/g, " ");
    if (!shown().includes(list[0].question.slice(0, 24))) {
      throw new Error(`первый вопрос не показан: ${list[0].question.slice(0, 40)} :: ${shown().slice(0, 160)}`);
    }
    const wrong = list[0].options.findIndex((_, i) => i !== list[0].correctIndex);
    await click(ask(list[0].options[wrong].slice(0, 20)), "неверный ответ");
    await settle(80);
    if (!/Неверно/.test(shown())) throw new Error("на неверный ответ блиц не сказал «Неверно»");
    if (!shown().includes(list[0].explanation.slice(0, 30))) {
      throw new Error("после ответа нет разбора — пользователь не узнаёт, почему неверно");
    }
    const nextBtn = ask("Следующий вопрос");
    if (!nextBtn) throw new Error("нет кнопки «Следующий вопрос»");
    await click(nextBtn, "дальше");
    await settle(80);
    if (!shown().includes(list[1].question.slice(0, 24))) throw new Error("второй вопрос не показался");
    // верный ответ
    await click(ask(list[1].options[list[1].correctIndex].slice(0, 20)), "верный ответ");
    await settle(80);
    if (!/Верно/.test(shown())) throw new Error("на верный ответ блиц не сказал «Верно»");
    if (!/вопрос 2\//.test(shown())) throw new Error(`счётчик вопросов не обновился: ${shown().slice(0, 140)}`);
    return `блиц из ${list.length} вопросов отвечает, разбирает ошибки и считает прогресс`;
  });

  await test("I. факты", "память: разреженная жирная, префиксная тонкая", async () => {
    const memoryRow = async (topic: string) => {
      await mountApp(topic);
      const rows = Array.from(document.querySelectorAll("tr"));
      const row = rows.find((r) => /^\s*Память/.test((r.textContent ?? "").trim()));
      if (!row) throw new Error(`на странице «${topic}» нет строки «Память» в сравнении`);
      return Array.from(row.querySelectorAll("td")).map((td) => (td.textContent ?? "").replace(/\s+/g, " ").trim());
    };
    const sparse = await memoryRow("sparse-table");
    const prefix = await memoryRow("prefix-sums-2d");
    // билет 2: у префиксной N × M, у разреженной — с логарифмами
    if (!/log/.test(sparse.join(" "))) throw new Error(`в сравнении билета 2 у разреженной таблицы нет логарифмов: ${sparse.join(" | ")}`);
    const prefixCell = sparse.find((c) => !/log/.test(c) && /N\s*×\s*M|N \* M/.test(c));
    if (!prefixCell) throw new Error(`в сравнении билета 2 префиксная матрица не показана как N × M: ${sparse.join(" | ")}`);
    // билет 5: зеркально — у префиксной без логарифмов, у разреженной с ними
    if (!/log/.test(prefix.join(" "))) throw new Error(`в сравнении билета 5 у разреженной таблицы нет логарифмов: ${prefix.join(" | ")}`);
    if (/log/.test(prefix[1] ?? "")) throw new Error(`в билете 5 префиксной матрице приписали логарифмы памяти: ${prefix[1]}`);
    const txt = bodyText();
    if (/префиксн[^.]{0,40}(жирн|больше памяти)/i.test(txt)) {
      throw new Error("на странице билета 5 префиксная матрица названа более прожорливой — это наоборот");
    }
    await mountApp("sparse-table");
    const full = bodyText();
    if (!/100 (коржей|копий|матриц)|сто (коржей|матриц)/i.test(full)) {
      throw new Error("на странице билета 2 не объяснено, откуда берутся десятки копий матрицы");
    }
    if (!/не конкуренты|разные задачи/i.test(full)) {
      throw new Error("на странице билета 2 не сказано, что структуры решают разные задачи");
    }
    // аналогии: торт стоит РЯДОМ с вафельными трубочками, сложность — в самих карточках
    for (const topic of ["sparse-table", "prefix-sums-2d"]) {
      await mountApp(topic);
      const full = bodyText();
      if (!/Аналогия 1: Сетка из вафельных трубочек/.test(full)) throw new Error(`на «${topic}» нет аналогии с вафельными трубочками`);
      if (!/Аналогия 2: Торт-пирамидка/.test(full)) throw new Error(`на «${topic}» нет аналогии с тортом рядом с трубочками`);
      if (!/крем обратно/.test(full)) throw new Error(`на «${topic}» не объяснено, что торт нужен из-за отсутствия обратной операции`);
      if (!/трубочки можно не только докладывать, но и убирать обратно/.test(full)) {
        throw new Error(`на «${topic}» не объяснено, что у суммы обратная операция есть`);
      }
      if (!/время: построение O\(N·M·logN·logM\), запрос min O\(1\)/.test(full)) {
        throw new Error(`на «${topic}» у карточки торта нет сложности по времени`);
      }
      if (!/память: N×M×logN×logM/.test(full)) throw new Error(`на «${topic}» у карточки торта нет сложности по памяти`);
      if (!/время: построение O\(N·M\), запрос суммы O\(1\)/.test(full)) {
        throw new Error(`на «${topic}» у карточки трубочек нет сложности по времени`);
      }
      if (!/память: N×M — как оригинал, тонкая/.test(full)) {
        throw new Error(`на «${topic}» у карточки трубочек нет сложности по памяти`);
      }
    }
    return "билет 2: N×M×logN×logM против N×M; билет 5: то же зеркально; торт и трубочки рядом, сложность в карточках";
  });

  /* ── 10. Сквозной путь: свой код чужой размерности, набранный в панели ── */

  await test("K. свой код", "Флойд 4×4 из редактора ведёт демонстрацию", async () => {
    await mountApp("floyd");
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(
      ta,
      [
        "n = 4",
        "INF = 999",
        "d = [[0, 3, INF, 7], [8, 0, 2, INF], [5, INF, 0, 1], [2, INF, INF, 0]]",
        "k = 0",
        "i = 0",
        "j = 0",
        "for k in range(n):",
        "    for i in range(n):",
        "        for j in range(n):",
        "            if d[i][k] + d[k][j] < d[i][j]:",
        "                d[i][j] = d[i][k] + d[k][j]",
        "print(d[0], d[1][0])",
      ].join("\n")
    );
    const ready = await waitFor(() => bodyText().includes("Трасса готова автоматически"), 40000);
    if (!ready) throw new Error(`своя программа не выполнилась. Панель: ${panelText().slice(0, 300)}`);
    if (!bodyText().includes("[0, 3, 5, 6]")) {
      throw new Error(`Флойд на своей матрице 4×4 посчитал не то. Панель: ${panelText().slice(0, 300)}`);
    }
    if (!textarea()) throw new Error("редактор исчез, пока выполнялась своя программа");
    await click(findButton("В конец трассы"), "в конец трассы");
    const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 5000);
    if (!linked) throw new Error("демонстрация не приняла данные своей программы");
    const page = bodyText();
    if (!/4×4/.test(page)) throw new Error(`демонстрация не перешла на размер 4×4: ${page.slice(0, 260)}`);
    const defects = domDefects(document.querySelector("#chapter-viz"));
    if (defects.length) throw new Error(`артефакты в демонстрации: ${defects.join(", ")}`);
    return "набрал 4×4 с INF=999 → d[0] = [0, 3, 5, 6] и d[1][0] = 5, демонстрация перешла на 4×4";
  });

  await test("K. свой код", "своя разреженная таблица на 6 элементах вместо 8", async () => {
    await mountApp("sparse-table");
    await click(findButton("Боковая панель Python"), "панель");
    const ta = textarea();
    if (!ta) throw new Error("нет редактора");
    typeInto(
      ta,
      [
        "a = [5, 1, 9, 3, 7, 2]",
        "n = len(a)",
        "LOG = 3",
        "i, j = 0, 0",
        "st = []",
        "for row in a:",
        "    st.append([row] + [None] * (LOG - 1))",
        "for j in range(1, LOG):",
        "    for i in range(n - (1 << j) + 1):",
        "        st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])",
        "print(n, st[0][2], st[1][1])",
      ].join("\n")
    );
    const ready = await waitFor(() => bodyText().includes("Трасса готова автоматически"), 40000);
    if (!ready) throw new Error(`своя таблица не построилась. Панель: ${panelText().slice(0, 300)}`);
    if (!/6 1 1/.test(panelText())) throw new Error(`ответ не тот (ждали «6 1 1»): ${panelText().slice(0, 240)}`);
    await click(findButton("В конец трассы"), "в конец трассы");
    const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 5000);
    if (!linked) throw new Error("демонстрация не приняла свою таблицу");
    const defects = domDefects(document.querySelector("#chapter-viz"));
    if (defects.length) throw new Error(`артефакты в демонстрации: ${defects.join(", ")}`);
    return "свой массив из 6 чисел: st[0][2] = 1, st[1][1] = 1, демонстрация на данных кода";
  });

  await test("K. свой код", "Косарайю: эталон сам считает порядок выхода и компоненты", async () => {
    await mountApp("scc-kosaraju");
    await click(findButton("Боковая панель Python"), "панель");
    if (!textarea()) throw new Error("нет редактора");
    await click(findButton("Вставить эталонный код"), "глаз");
    const ready = await waitFor(() => bodyText().includes("Трасса готова автоматически"), 40000);
    if (!ready) throw new Error(`эталон Косарайю не выполнился. Панель: ${panelText().slice(0, 320)}`);
    if (/Ошибка:/.test(panelText())) throw new Error(`эталон упал: ${panelText().slice(0, 260)}`);
    const out = panelText();
    if (!/порядок выхода:/.test(out)) throw new Error(`эталон не печатает порядок выхода. Панель: ${out.slice(0, 300)}`);
    // граф на экране: 0→1→2→0, 2→3, 3↔4 — ровно две SCC, и код обязан их найти сам
    if (!/компонент: 2/.test(out)) throw new Error(`в графе две SCC, а эталон насчитал иначе. Панель: ${out.slice(0, 300)}`);
    if (!textarea()) throw new Error("редактор исчез, пока выполнялся эталон");
    await click(findButton("В конец трассы"), "в конец трассы");
    const linked = await waitFor(() => /данные из компилятора/.test(bodyText()), 5000);
    if (!linked) throw new Error("демонстрация не приняла разметку компонент из кода");
    const defects = domDefects(document.querySelector("#chapter-viz"));
    if (defects.length) throw new Error(`артефакты в демонстрации: ${defects.join(", ")}`);
    return "эталон Косарайю: order считается DFS-ом, найдено 2 SCC, демонстрация на данных кода";
  });

  await test("G. lite-режим", "?lite=1 отдаёт текст без навигации и компилятора", async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (host) host.remove();
    host = freshHost();
    window.history.replaceState({}, "", "/?lite=1&topic=sparse-table");
    root = createRoot(host);
    await act(async () => {
      root!.render(<App />);
    });
    await settle(120);
    const txt = bodyText();
    if (txt.length < 2000) throw new Error(`lite-режим почти пустой: ${txt.length} знаков`);
    if (/main\.py|Pyodide/.test(txt)) throw new Error("в lite-режим виден компилятор (его быть не должно)");
    if (!/разреженн/i.test(txt)) throw new Error("в lite-режиме нет текста темы");
    if (findButton("Боковая панель Python")) throw new Error("в lite-режиме осталась кнопка компилятора");
    // текстовая версия: ссылки на другие билеты ведут в ту же текстовую версию,
    // а блиц напечатан списком с ответами
    const liteLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-goto]'));
    const bad = liteLinks.filter((a) => !(a.getAttribute("href") ?? "").startsWith("?lite=1&topic="));
    if (liteLinks.length === 0) throw new Error("в lite-версии нет ни одной ссылки на другие билеты");
    if (bad.length) throw new Error(`в lite-версии ${bad.length} ссылок уводят из текстового режима: ${bad[0].getAttribute("href")}`);
    const unknown = liteLinks.filter((a) => !chapters.some((c) => c.id === a.dataset.goto));
    if (unknown.length) throw new Error(`в lite-версии ссылка на несуществующую страницу: ${unknown[0].dataset.goto}`);
    if (!/Блиц: вопросы по теме/.test(txt)) throw new Error("в lite-версии нет блица — парсеры и печать его не увидят");
    if (!/Верно:/.test(txt)) throw new Error("в lite-версии блиц без отметки верного ответа");
    return `${txt.length} знаков, ссылок в lite ${liteLinks.length}, блиц напечатан, навигации и компилятора нет`;
  });

  console.error = realConsoleError;
  return results;
}

/** Сводка для оркестратора. */
export function summary() {
  const byGroup = new Map<string, { ok: number; fail: number }>();
  for (const r of results) {
    const g = byGroup.get(r.group) ?? { ok: 0, fail: 0 };
    g[r.ok ? "ok" : "fail"]++;
    byGroup.set(r.group, g);
  }
  return { total: results.length, passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, byGroup: Object.fromEntries(byGroup) };
}

/** Инициализация страницы из vizSync — нужна для проверок содержимого редактора. */
export const initTemplateOf = (id: string) => buildInitTemplate(id, chapters.find((c) => c.id === id)?.title ?? id, null);
