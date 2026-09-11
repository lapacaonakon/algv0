import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Copy,
  HelpCircle,
  Link2,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Terminal,
  Unlink,
  Variable,
  X,
} from "lucide-react";
import { getPageSync } from "../data/vizSync";
import { Tooltip } from "./Tooltip";

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PythonCompilerProps {
  /** Страница, с которой синхронизируется редактор. */
  chapterId: string;
  chapterTitle: string;
  /** Перейти к странице пособия (посмотреть визуализацию). */
  onOpenGuide: () => void;
  /** Скрыть панель. */
  onClose: () => void;
}

type PyodideRuntime = {
  runPythonAsync: (source: string) => Promise<unknown>;
  setStdout: (options: { batched: (message: string) => void }) => void;
  setStderr: (options: { batched: (message: string) => void }) => void;
  setStdin: (options: { stdin: () => string | number | null }) => void;
};

type PyodideModule = {
  loadPyodide: (options: { indexURL: string }) => Promise<PyodideRuntime>;
};

let runtimePromise: Promise<PyodideRuntime> | null = null;

function getPythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = import(/* @vite-ignore */ PYODIDE_MODULE_URL).then((module) =>
      (module as PyodideModule).loadPyodide({ indexURL: PYODIDE_INDEX_URL })
    );
  }
  return runtimePromise;
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/* ------------------------------------------------------------------ */
/*  Шаблон синхронизации: ТОЛЬКО комментарий с переменными страницы.  */
/*  Кода алгоритма здесь нет по замыслу — шаги повторяются руками.    */
/* ------------------------------------------------------------------ */

function buildSyncTemplate(chapterId: string, chapterTitle: string): string {
  const sync = getPageSync(chapterId);
  const bar = "# " + "─".repeat(44);
  const lines: string[] = [bar, "#  СИНХРОНИЗАЦИЯ С ВИЗУАЛИЗАЦИЕЙ", `#  Страница: «${chapterTitle}»`];
  if (sync.vizTitle) lines.push(`#  Демонстрация: ${sync.vizTitle}`);
  lines.push(bar, "#");

  if (sync.variables.length === 0) {
    lines.push(
      "#  На этой странице нет интерактивной визуализации —",
      "#  компилятор работает в свободном режиме.",
      "#  Откройте страницу с демонстрацией (стрелки ← →),",
      "#  и здесь появятся её переменные синхронизации."
    );
  } else {
    lines.push("#  Пошаговая подсветка идёт по переменным:");
    for (const v of sync.variables) {
      const range = v.range ? `  (${v.range})` : "";
      lines.push(`#    ${v.name} — ${v.role}${range}`);
    }
    if (sync.stepNote) lines.push("#", `#  Шаг = ${sync.stepNote}`);
    lines.push("#", "#  Кода тут нет нарочно: повторите шаги визуализации,", "#  задавая переменным значения текущего шага.");
  }
  return lines.join("\n") + "\n";
}

/* ------------------------------------------------------------------ */
/*  Шпаргалка Python: команды сортировки, циклы, структуры.           */
/*  «Вставить» кладёт сниппет в редактор под курсор.                  */
/* ------------------------------------------------------------------ */

interface Snippet {
  label: string;
  tip: string;
  code: string;
}

const SNIPPETS: { group: string; items: Snippet[] }[] = [
  {
    group: "Сортировка",
    items: [
      {
        label: "arr.sort() / sorted()",
        tip: "In-place сортировка по возрастанию и новая копия через sorted(). O(n·log n).",
        code: 'arr = [5, 2, 8, 1]\narr.sort()                      # по возрастанию, на месте\nprint(arr)\nprint(sorted(arr, reverse=True))  # копия по убыванию\n',
      },
      {
        label: "sorted(key=…)",
        tip: "Сортировка по ключу: рёбра по весу, пары по второму элементу.",
        code: 'edges = [(3, "A", "B"), (1, "B", "C"), (2, "A", "C")]\nedges.sort(key=lambda e: e[0])  # по весу, как в Краскале\nprint(edges)\n',
      },
    ],
  },
  {
    group: "Циклы",
    items: [
      {
        label: "for i in range(n)",
        tip: "Вложенные циклы по i и j — как обход матрицы dist[i][j] у Флойда.",
        code: "n, m = 3, 4\nfor i in range(n):          # 0 … n-1\n    for j in range(m):  # 0 … m-1\n        print(f\"cell {i},{j}\")\n",
      },
      {
        label: "while …",
        tip: "Классический while-счётчик — как n−1 итераций Беллмана-Форда.",
        code: "i = 1\nwhile i < 5:\n    print(f\"итерация {i}\")\n    i += 1\n",
      },
      {
        label: "for i, x in enumerate(…)",
        tip: "Индекс и элемент одновременно: i — позиция, x — значение.",
        code: "for i, x in enumerate([\"a\", \"b\", \"c\", \"a\"]):\n    print(i, x)\n",
      },
    ],
  },
  {
    group: "Структуры",
    items: [
      {
        label: "Стек (список)",
        tip: "LIFO, как рекурсия DFS: append = push, pop() с конца.",
        code: 'st = []\nst.append("A")    # push\nst.append("B")\ntop = st.pop()      # pop с конца\nprint(top, st)\n',
      },
      {
        label: "Очередь (deque)",
        tip: "FIFO для BFS: popleft() за O(1). list.pop(0) был бы O(n).",
        code: 'from collections import deque\nq = deque(["A"])\nq.append("B")       # enqueue\nv = q.popleft()     # dequeue\nprint(v, list(q))\n',
      },
      {
        label: "Куча (heapq)",
        tip: "Мин-куча: (вес, вершина) — как очередь приоритетов у Дейкстры и Прима.",
        code: 'import heapq\nh = []\nheapq.heappush(h, (3, "C"))\nheapq.heappush(h, (1, "A"))\nw, v = heapq.heappop(h)   # минимум\nprint(w, v)\n',
      },
      {
        label: "Матрица n × m",
        tip: "Таблица расстояний: dist[i][j], бесконечность — float('inf').",
        code: 'n, m = 3, 4\ndist = [[float("inf")] * m for _ in range(n)]\ndist[0][0] = 0\nprint(dist)\n',
      },
      {
        label: "Множество visited",
        tip: "Посещённые вершины: in/add за O(1).",
        code: 'visited = set()\nvisited.add("A")\nprint("A" in visited, "B" in visited)\n',
      },
    ],
  },
  {
    group: "Вывод",
    items: [
      {
        label: "f-строка",
        tip: "Подставить значения переменных шага в строку: i, j, k…",
        code: 'i, j, k = 1, 2, 0\nprint(f"dist[{i}][{j}] через k={k}")\n',
      },
    ],
  },
];

/** Переживает скрытие панели: код пользователя не теряется. */
let savedEditor: { code: string; template: string; chapterId: string } | null = null;

export function PythonCompiler({ chapterId, chapterTitle, onOpenGuide, onClose }: PythonCompilerProps) {
  const sync = useMemo(() => getPageSync(chapterId), [chapterId]);
  const template = useMemo(() => buildSyncTemplate(chapterId, chapterTitle), [chapterId, chapterTitle]);

  const [code, setCode] = useState(() => {
    if (!savedEditor) return template;
    if (savedEditor.code === savedEditor.template || savedEditor.code.trim() === "") return template;
    return savedEditor.code;
  });
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Нажмите «Запустить» (Ctrl/Cmd + Enter).");
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("Python загрузится при первом запуске");
  const [copied, setCopied] = useState(false);
  const [stripTab, setStripTab] = useState<"vars" | "hints">("vars");
  const [outputOpen, setOutputOpen] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [desyncedFrom, setDesyncedFrom] = useState<string | null>(() =>
    savedEditor &&
    savedEditor.chapterId !== chapterId &&
    savedEditor.code !== savedEditor.template &&
    savedEditor.code.trim() !== "" &&
    savedEditor.code !== template
      ? chapterId
      : null
  );
  const prevTemplateRef = useRef(template);

  useEffect(() => {
    savedEditor = { code, template, chapterId };
  }, [code, template, chapterId]);

  // Смена страницы: нетронутый редактор получает свежий шаблон,
  // свой код не затираем — предлагаем синхронизироваться кнопкой.
  useEffect(() => {
    if (template === prevTemplateRef.current) return;
    const prevTemplate = prevTemplateRef.current;
    prevTemplateRef.current = template;
    if (code === prevTemplate || code.trim() === "") {
      setCode(template);
      setDesyncedFrom(null);
    } else {
      setDesyncedFrom(chapterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const resync = useCallback(() => {
    prevTemplateRef.current = template;
    setCode(template);
    setDesyncedFrom(null);
    setStripTab("vars");
  }, [template]);

  const runCode = useCallback(async () => {
    if (running) return;

    setRunning(true);
    setOutputOpen(true);
    setOutput("");
    setRuntimeMessage(runtimeReady ? "Выполняю код…" : "Загружаю Python в браузер…");

    const stdout: string[] = [];
    const stderr: string[] = [];
    const inputLines = stdin.split(/\r?\n/);

    try {
      const runtime = await getPythonRuntime();
      setRuntimeReady(true);
      setRuntimeMessage("Python готов — код выполняется локально в браузере");

      runtime.setStdout({ batched: (message) => stdout.push(message) });
      runtime.setStderr({ batched: (message) => stderr.push(message) });
      runtime.setStdin({ stdin: () => (inputLines.length > 0 ? inputLines.shift() ?? "" : null) });
      await runtime.runPythonAsync(code);

      const text = [...stdout, ...stderr].join("");
      setOutput(text || "Готово: программа ничего не вывела.");
    } catch (error) {
      const captured = [...stdout, ...stderr].join("");
      setOutput(`${captured}${captured && !captured.endsWith("\n") ? "\n" : ""}Ошибка:\n${errorText(error)}`);
      setRuntimeMessage("Не удалось выполнить — проверьте код и доступ к CDN Pyodide");
    } finally {
      setRunning(false);
    }
  }, [code, stdin, running, runtimeReady]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setRuntimeMessage("Не получилось скопировать — буфер обмена недоступен");
    }
  }, [code]);

  /** Вставка сниппета из шпаргалки в позицию курсора. */
  const insertSnippet = useCallback((snippet: string) => {
    const ta = editorRef.current;
    setCode((current) => {
      if (!ta) return current + (current.endsWith("\n") ? "" : "\n") + snippet;
      const start = ta.selectionStart ?? current.length;
      const end = ta.selectionEnd ?? start;
      const padded = (start > 0 && !current.slice(0, start).endsWith("\n") ? "\n" : "") + snippet;
      const next = current.slice(0, start) + padded + current.slice(end);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + padded.length;
      });
      return next;
    });
  }, []);

  const hasViz = sync.variables.length > 0;

  return (
    <aside
      aria-label="Python-компилятор"
      className="fixed z-40 inset-x-0 bottom-0 h-[58dvh] lg:inset-x-auto lg:right-0 lg:top-16 lg:bottom-0 lg:h-auto lg:w-[560px] xl:w-[620px] flex flex-col bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-700 shadow-2xl shadow-black/60"
    >
      {/* ── Заголовок панели ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900">
        <span className={`w-2 h-2 rounded-full shrink-0 ${desyncedFrom !== null ? "bg-amber-400" : "bg-emerald-400"}`} />
        <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[13px] font-bold text-white">main.py</span>
        <span className="hidden sm:inline text-[10px] text-slate-500">Pyodide</span>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip side="bottom" content="Скопировать код из редактора.">
            <button
              type="button"
              onClick={() => void copyCode()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Скопировать код"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </Tooltip>
          <Tooltip side="bottom" content="Вернуть комментарий с переменными текущей страницы (код будет заменён).">
            <button
              type="button"
              onClick={resync}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Сбросить к шаблону страницы"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip side="bottom" content="Скрыть панель (код сохранится).">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Закрыть компилятор"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip side="bottom" content="Запустить код (Ctrl/Cmd + Enter). Первый запуск скачивает Python в браузер.">
            <button
              type="button"
              onClick={() => void runCode()}
              disabled={running}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {running ? "Запуск…" : "Запустить"}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Мини-вкладки: переменные страницы / шпаргалка Python ────── */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-1 px-2 pt-1.5">
          <button
            type="button"
            onClick={() => setStripTab("vars")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg text-[11px] font-bold transition-colors ${
              stripTab === "vars" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Variable className="w-3.5 h-3.5" /> Переменные страницы
          </button>
          <button
            type="button"
            onClick={() => setStripTab("hints")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg text-[11px] font-bold transition-colors ${
              stripTab === "hints" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Подсказки Python
          </button>
          <div className="ml-auto pr-1">
            <Tooltip
              side="bottom"
              content={
                hasViz
                  ? "Редактор и визуализация смотрят на одну страницу: переменные ниже — те, что подсвечиваются по шагам."
                  : "На выбранной странице нет интерактива — переменных синхронизации нет."
              }
            >
              <span
                tabIndex={0}
                className={`cursor-help inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
                  hasViz ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                <Link2 className="w-3 h-3" />
                {hasViz ? "синхронизировано" : "нет визуализации"}
              </span>
            </Tooltip>
          </div>
        </div>

        {stripTab === "vars" ? (
          <div className="px-3 pb-2.5 space-y-2 max-h-36 overflow-y-auto">
            <div className="flex items-center gap-2 min-w-0">
              <Tooltip side="bottom" content="Открыть эту страницу в пособии — демонстрация появится рядом с панелью.">
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors max-w-full"
                >
                  <span className="truncate">{chapterTitle}</span>
                </button>
              </Tooltip>
            </div>
            {desyncedFrom !== null && (
              <Tooltip
                side="bottom"
                content="В редакторе ваш код, а страница сменилась. Кнопка вернёт комментарий с переменными текущей страницы (ваш код будет заменён)."
              >
                <button
                  type="button"
                  onClick={resync}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-bold bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 transition-colors w-full text-left"
                >
                  <Unlink className="w-3.5 h-3.5 shrink-0" />
                  Страница сменилась — подставить её переменные
                </button>
              </Tooltip>
            )}
            {hasViz && (
              <div className="flex flex-wrap items-center gap-1.5">
                {sync.variables.map((v) => (
                  <Tooltip
                    key={v.name}
                    side="bottom"
                    content={
                      <span>
                        <span className="block font-bold text-white mb-0.5">
                          <code className="font-mono text-emerald-300">{v.name}</code>
                        </span>
                        <span className="block">{v.role}</span>
                        {v.range && <span className="block mt-1 text-indigo-300">{v.range}</span>}
                      </span>
                    }
                  >
                    <code
                      tabIndex={0}
                      className="cursor-help rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                    >
                      {v.name}
                    </code>
                  </Tooltip>
                ))}
                {sync.stepNote && (
                  <Tooltip side="bottom" content={`Шаг визуализации = ${sync.stepNote}`}>
                    <span
                      tabIndex={0}
                      className="cursor-help inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white transition-colors max-w-full"
                    >
                      <ArrowRightLeft className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-52">{sync.stepNote}</span>
                    </span>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 pb-2.5 max-h-36 overflow-y-auto space-y-2.5">
            {SNIPPETS.map((gItem) => (
              <div key={gItem.group}>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">{gItem.group}</div>
                <div className="flex flex-wrap gap-1.5">
                  {gItem.items.map((s) => (
                    <Tooltip key={s.label} side="bottom" content={s.tip}>
                      <button
                        type="button"
                        onClick={() => insertSnippet(s.code)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-[10.5px] text-indigo-300 hover:text-white hover:border-indigo-500 transition-colors"
                        title=""
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        {s.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-600">Нажатие вставляет сниппет в редактор в позицию курсора.</p>
          </div>
        )}
      </div>

      {/* ── Редактор + ввод ──────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <textarea
          ref={editorRef}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              void runCode();
            }
            event.stopPropagation();
          }}
          spellCheck={false}
          aria-label="Код Python"
          className="flex-1 min-h-[90px] w-full resize-none bg-[#0b1220] px-3 py-2.5 font-mono text-[12px] leading-5 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/40 placeholder:text-slate-600"
          placeholder="Напишите Python-код…"
        />
        <div className="shrink-0 border-t border-slate-800 bg-slate-950/70 flex items-center gap-2 px-3 py-1.5">
          <label htmlFor="python-stdin" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            stdin для input()
          </label>
          <input
            id="python-stdin"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            spellCheck={false}
            placeholder="строки ввода через ↵"
            className="w-full bg-transparent font-mono text-[11.5px] text-slate-300 outline-none placeholder:text-slate-700"
          />
        </div>
      </div>

      {/* ── Вывод ────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-800 flex flex-col max-h-[38%]">
        <button
          type="button"
          onClick={() => setOutputOpen((o) => !o)}
          className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
        >
          <span className="inline-flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Результат
          </span>
          <span className="inline-flex items-center gap-2">
            {runtimeReady && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-slate-600">{outputOpen ? "▾" : "▸"}</span>
          </span>
        </button>
        {outputOpen && (
          <>
            <pre className="flex-1 min-h-[70px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] px-3 py-2 font-mono text-[11.5px] leading-5 text-slate-300">
              {output}
            </pre>
            <div className="px-3 py-1.5 border-t border-slate-800 text-[10px] text-slate-500 truncate">{runtimeMessage}</div>
          </>
        )}
      </div>
    </aside>
  );
}
