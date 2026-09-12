import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  HelpCircle,
  Link2,
  Loader2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Terminal,
  Unlink,
  Variable,
  X,
} from "lucide-react";
import { buildInitTemplate, buildSyncTemplate, getPageSync } from "../data/vizSync";
import { clearVizState, emitVizState, onVizDemo } from "../data/vizStepBus";
import {
  baseVarName,
  buildDebugRunner,
  changedVars,
  DEBUG_STEP_CAP,
  orderVars,
  type DebugResult,
} from "../data/debugRunner";
import { Tooltip } from "./Tooltip";

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PythonCompilerProps {
  /** Страница, с которой синхронизируется редактор. */
  chapterId: string;
  chapterTitle: string;
  /** Ширина панели на десктопе (px) — управляется родителем, растягивается ручкой слева. */
  width?: number;
  onWidthChange?: (w: number) => void;
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
/*  Шаблон синхронизации: короткая шапка + минимальный исполняемый    */
/*  скелет, шаг-в-шаг с подсветкой визуализации (см. data/vizSync.ts).*/
/* ------------------------------------------------------------------ */

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

export function PythonCompiler({ chapterId, chapterTitle, width, onWidthChange, onOpenGuide, onClose }: PythonCompilerProps) {
  /** Активная вкладка демонстрации страницы (у sparse-table: 1d / 2d-build / 2d-query). */
  const [demoId, setDemoId] = useState<string | null>(null);
  const sync = useMemo(() => getPageSync(chapterId, demoId), [chapterId, demoId]);
  const syncVarBases = useMemo(
    () =>
      [...new Set(
        sync.variables.flatMap((v) =>
          v.name
            .split(/\s*(?:,|\/)\s*/)
            .map(baseVarName)
            .filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
        )
      )],
    [sync]
  );
  const syncVarSet = useMemo(() => new Set(syncVarBases), [syncVarBases]);
  /** Полный эталон: глаз сразу вставляет его в обычный редактор. */
  const template = useMemo(() => buildSyncTemplate(chapterId, chapterTitle, demoId), [chapterId, chapterTitle, demoId]);
  /** Дефолт редактора: только инициализация демо; она тоже выполняется автоматически. */
  const initTemplate = useMemo(() => buildInitTemplate(chapterId, chapterTitle, demoId), [chapterId, chapterTitle, demoId]);

  const [code, setCode] = useState(() => {
    if (!savedEditor) return initTemplate;
    if (savedEditor.code === savedEditor.template || savedEditor.code.trim() === "") return initTemplate;
    return savedEditor.code;
  });
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Код выполнится автоматически после короткой паузы.");
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("Python загружается автоматически…");
  /** Принудительный повтор (глаз / Ctrl+Enter), даже если текст не изменился. */
  const [traceRequest, setTraceRequest] = useState(0);
  const [copied, setCopied] = useState(false);
  const [stripTab, setStripTab] = useState<"vars" | "hints">("vars");
  const [outputOpen, setOutputOpen] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [desyncedFrom, setDesyncedFrom] = useState<string | null>(() =>
    savedEditor &&
    savedEditor.chapterId !== chapterId &&
    savedEditor.code !== savedEditor.template &&
    savedEditor.code.trim() !== "" &&
    savedEditor.code !== template &&
    savedEditor.code !== initTemplate
      ? chapterId
      : null
  );
  const prevTplRef = useRef({ base: initTemplate, full: template });

  /** Активная трасса. input нужен, чтобы изменение stdin тоже запускало её заново. */
  const [debug, setDebug] = useState<{ result: DebugResult; idx: number; src: string; input: string; request: number } | null>(null);
  /** Esc оставляет неизменённый текст в редакторе, пока пользователь не начнёт печатать. */
  const [editHold, setEditHold] = useState<string | null>(null);
  /** Автопроход включается пользователем; первый шаг показывается сразу после автозапуска. */
  const [playing, setPlaying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    savedEditor = { code, template: initTemplate, chapterId };
  }, [code, initTemplate, chapterId]);

  // демонстрация сообщает, какая вкладка открыта — код панели следует за ней
  useEffect(() => setDemoId(null), [chapterId]);
  useEffect(() => onVizDemo(chapterId, (d) => setDemoId(d || null)), [chapterId]);
  useEffect(() => () => clearVizState(chapterId), [chapterId]);

  // Смена страницы (или вкладки демо): нетронутый редактор получает свежую
  // инициализацию; свой код не затираем — предлагаем синхронизироваться кнопкой.
  useEffect(() => {
    const prev = prevTplRef.current;
    if (initTemplate === prev.base && template === prev.full) return;
    prevTplRef.current = { base: initTemplate, full: template };
    setPlaying(false);
    setEditHold(null);
    setDebug(null); // трасса ссылается на строки старого источника — сбрасываем
    if (code === prev.base || code === prev.full || code.trim() === "") {
      setCode(initTemplate);
      setDesyncedFrom(null);
    } else {
      setDesyncedFrom(chapterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initTemplate, template]);

  const resync = useCallback(() => {
    prevTplRef.current = { base: initTemplate, full: template };
    setCode(initTemplate);
    setDesyncedFrom(null);
    setStripTab("vars");
    setPlaying(false);
    setEditHold(null);
    setDebug(null);
    setTraceRequest((n) => n + 1);
  }, [initTemplate, template]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setRuntimeMessage("Не получилось скопировать — буфер обмена недоступен");
    }
  }, [code]);

  /* ── Пошаговый отладчик ────────────────────────────────────────────── */

  /** Связь больше не зависит от эталонных строк: совпадают только имена переменных. */
  const hasViz = sync.variables.length > 0;

  /**
   * Снимок ПОСЛЕ выделенной строки. Контейнеры берём из следующего trace-event
   * (там уже виден append/st[i][j]=…), но индексы цикла сохраняем с текущего
   * события: после st[i][j]= Python уже мог увеличить i для новой итерации.
   */
  const snapshotAt = useCallback((result: DebugResult, idx: number, source = "") => {
    const step = result.steps[idx];
    const next = result.steps[idx + 1];
    const afterLocals = next?.locals ?? result.finalLocals ?? step?.locals ?? {};
    const afterValues = next?.values ?? result.finalValues ?? step?.values ?? {};
    const beforeValues = step?.values ?? {};
    const line = step?.line ? source.split("\n")[step.line - 1] ?? "" : "";
    // Нас интересуют только простые скалярные цели (`i =`, `i, j =`,
    // `i +=`). Контейнеры и так всегда берутся из afterValues. Так знак `=`
    // внутри print(f"i={i}") не будет ошибочно принят за присваивание.
    const assignment = line.match(
      /^\s*([A-Za-z_][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*)*)\s*(?:\+=|-=|\*=|\/=|\/\/=|%=|=(?!=))/
    );
    const assigned = new Set(assignment?.[1].split(",").map((name) => name.trim()) ?? []);

    const variables = { ...afterValues };
    const locals = { ...afterLocals };
    for (const [name, value] of Object.entries(beforeValues)) {
      const scalar = value === null || typeof value !== "object";
      if (scalar && !assigned.has(name) && name in afterValues) {
        variables[name] = value;
        if (step?.locals[name] !== undefined) locals[name] = step.locals[name];
      }
    }
    const changed = changedVars(step?.locals, locals);
    return {
      line: step?.line,
      func: step?.func,
      locals,
      variables,
      changed: Object.keys(changed).filter((name) => changed[name]),
    };
  }, []);

  const publishDebug = useCallback(
    (result: DebugResult, idx: number, source: string) => {
      if (!hasViz || result.steps.length === 0) return;
      const snapshot = snapshotAt(result, idx, source);
      emitVizState(chapterId, {
        line: snapshot.line,
        func: snapshot.func,
        variables: snapshot.variables,
        changed: snapshot.changed,
      });
    },
    [chapterId, hasViz, snapshotAt]
  );

  // Единственная точка публикации: любое перемещение трассы сразу отдаёт
  // визуализации согласованный снимок, без side-effect внутри setState.
  useEffect(() => {
    if (debug) publishDebug(debug.result, debug.idx, debug.src);
  }, [debug, publishDebug]);

  const goDebug = useCallback(
    (nextIdx: number) => {
      setDebug((d) => {
        if (!d || d.result.steps.length === 0) return d;
        const idx = Math.max(0, Math.min(d.result.steps.length - 1, nextIdx));
        return { ...d, idx };
      });
    },
    []
  );

  const stepBy = useCallback(
    (delta: number) => {
      setDebug((d) => {
        if (!d || d.result.steps.length === 0) return d;
        const idx = Math.max(0, Math.min(d.result.steps.length - 1, d.idx + delta));
        return { ...d, idx };
      });
    },
    []
  );

  const stepTo = useCallback((idx: number) => goDebug(idx), [goDebug]);

  const stopDebug = useCallback(() => {
    setPlaying(false);
    setEditHold(code);
    setDebug(null);
    clearVizState(chapterId);
  }, [chapterId, code]);

  /** Интервал автопрохода шагов (мс). */
  const AUTOPLAY_MS = 650;

  // Автопроход: пока включен, шагает stepBy каждые AUTOPLAY_MS; в конце трассы стоп.
  useEffect(() => {
    if (!playing || !debug) return;
    if (debug.idx >= debug.result.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => stepBy(1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, debug, stepBy]);

  const debugRun = useCallback(async () => {
    if (running) return;

    const source = code;
    const input = stdin;
    const request = traceRequest;
    setRunning(true);
    setPlaying(false);
    setEditHold(null);
    setDebug(null);
    clearVizState(chapterId);
    setOutputOpen(false);
    setRuntimeMessage(runtimeReady ? "Обновляю трассу…" : "Загружаю Python в браузер…");

    const stdout: string[] = [];
    const stderr: string[] = [];
    const inputLines = input.split(/\r?\n/);

    try {
      const runtime = await getPythonRuntime();
      setRuntimeReady(true);
      runtime.setStdout({ batched: (message) => stdout.push(message) });
      runtime.setStderr({ batched: (message) => stderr.push(message) });
      runtime.setStdin({ stdin: () => (inputLines.length > 0 ? inputLines.shift() ?? "" : null) });

      const raw = await runtime.runPythonAsync(buildDebugRunner(source));
      const result = JSON.parse(String(raw)) as DebugResult;

      setDebug({ result, idx: 0, src: source, input, request });
      const printed = [...stdout, ...stderr].join("");
      setOutput(printed || "Программа ничего не вывела — трасса и переменные всё равно доступны.");
      setRuntimeMessage(
        result.truncated
          ? `Выполнение остановлено после ${DEBUG_STEP_CAP} шагов (защита от бесконечного цикла).`
          : "Трасса готова автоматически. ← → — шаги, пробел — воспроизведение, Esc — редактирование."
      );
    } catch (error) {
      const message = errorText(error);
      setDebug({ result: { steps: [], error: message, truncated: false }, idx: 0, src: source, input, request });
      setOutput(`Ошибка:\n${message}`);
      setRuntimeMessage("Не удалось выполнить код — проверьте синтаксис и доступ к CDN Pyodide");
    } finally {
      setRunning(false);
    }
  }, [chapterId, code, stdin, traceRequest, running, runtimeReady]);

  // Код выполняется сам: debounce даёт спокойно допечатать строку. Если текст
  // изменился во время загрузки Pyodide, после завершения запустится свежая версия.
  useEffect(() => {
    if (running || editHold === code) return;
    if (debug?.src === code && debug.input === stdin && debug.request === traceRequest) return;
    const timer = window.setTimeout(() => void debugRun(), runtimeReady ? 450 : 80);
    return () => window.clearTimeout(timer);
  }, [code, stdin, traceRequest, running, runtimeReady, debug, debugRun, editHold]);

  // Стрелки ← → в режиме отладки листают ШАГИ (а не страницы), Esc — выход из отладчика.
  useEffect(() => {
    if (!debug) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") {
        e.stopPropagation();
        e.preventDefault();
        setPlaying(false);
        stepBy(1);
      }
      if (e.key === "ArrowLeft") {
        e.stopPropagation();
        e.preventDefault();
        setPlaying(false);
        stepBy(-1);
      }
      if (e.key === " ") {
        e.stopPropagation();
        e.preventDefault();
        setPlaying((v) => !v);
      }
      if (e.key === "Escape") stopDebug();
    };
    // capture-фаза: чтобы глобальный обработчик навигации по главам не сработал
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [debug, stepBy, stopDebug]);

  // держим текущую строку листинга в видимой области
  const curDebug = debug ? { step: debug.result.steps[debug.idx], prev: debug.result.steps[debug.idx - 1] } : null;
  const curDebugLine = curDebug?.step?.line;
  useEffect(() => {
    if (curDebugLine === undefined || !listRef.current) return;
    listRef.current
      .querySelector(`[data-line="${curDebugLine}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [curDebugLine]);

  // производные данные шага: что изменилось, в каком порядке показать переменные
  // Строка, которую назначает текущий шаг, подсвечивается вместе с её РЕЗУЛЬТАТОМ:
  // локали берём со следующего шага трассы (для последнего — финальные, записанные
  // трейсером на возврате из фрейма). Значит на строке `i, j = 0, 0` видны именно 0, 0.
  const shownLocals = useMemo(() => {
    if (!debug || !curDebug?.step) return {};
    return snapshotAt(debug.result, debug.idx, debug.src).locals;
  }, [debug, curDebug, snapshotAt]);
  const debugChanged = curDebug?.step ? changedVars(curDebug.step.locals, shownLocals) : {};
  const debugOrdered = curDebug?.step ? orderVars(shownLocals, syncVarBases) : [];

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

  return (
    <aside
      aria-label="Python-компилятор"
      className="fixed z-40 inset-x-0 bottom-0 h-[58dvh] lg:inset-x-auto lg:right-0 lg:top-16 lg:bottom-0 lg:h-auto lg:w-[560px] xl:w-[620px] flex flex-col bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-700 shadow-2xl shadow-black/60"
      style={width && typeof window !== "undefined" && window.innerWidth >= 1024 ? { width } : undefined}
    >
      {/* Ручка растягивания панели за левый край (только десктоп) */}
      {onWidthChange && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Потяните, чтобы изменить ширину панели"
          title="Потяните, чтобы изменить ширину панели"
          className="hidden lg:block absolute top-0 bottom-0 -left-1.5 w-3 cursor-col-resize z-50 group"
          onPointerDown={(e) => {
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);
            const startX = e.clientX;
            const startW = width ?? 560;
            const onMove = (ev: PointerEvent) => {
              const next = Math.round(startW + (startX - ev.clientX));
              onWidthChange(Math.max(380, Math.min(next, Math.round(window.innerWidth * 0.9))));
            };
            const onUp = () => {
              el.removeEventListener("pointermove", onMove as EventListener);
              el.removeEventListener("pointerup", onUp as EventListener);
            };
            el.addEventListener("pointermove", onMove as EventListener);
            el.addEventListener("pointerup", onUp as EventListener);
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-1 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
        </div>
      )}
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
          <Tooltip
            side="bottom"
            content="Вставить полный эталонный код этого демо в редактор. Он выполнится автоматически; текущий код будет заменён."
          >
            <button
              type="button"
              onClick={() => {
                setCode(template);
                setDesyncedFrom(null);
                setPlaying(false);
                setEditHold(null);
                setDebug(null);
                setTraceRequest((n) => n + 1);
              }}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-colors"
              aria-label="Вставить эталонный код"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <span className="ml-1 inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400">
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            {running ? "авто…" : "автозапуск"}
          </span>
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
                  ? "Связь идёт по именам ниже: реальные значения из любого Python-кода сразу управляют ячейками и вершинами. Текст эталона не сравнивается."
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
        {debug ? (
          <div className="flex-1 min-h-[80px] flex flex-col">
            {/* панель управления шагами */}
            <div className="shrink-0 flex items-center gap-0.5 px-2 py-1 border-b border-slate-800 bg-slate-900">
              <Tooltip content={playing ? "Пауза автопрохода (пробел)" : debug.idx >= debug.result.steps.length - 1 ? "Проиграть трассу заново (пробел)" : "Продолжить автопроход (пробел)"}>
                <button
                  type="button"
                  onClick={() => {
                    if (!curDebug?.step) return;
                    if (playing) setPlaying(false);
                    else {
                      if (debug.idx >= debug.result.steps.length - 1) stepTo(0);
                      setPlaying(true);
                    }
                  }}
                  className={`mx-0.5 p-1.5 rounded-md transition-colors ${playing ? "text-amber-300 bg-amber-500/15 hover:bg-amber-500/25" : "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"}`}
                  aria-label={playing ? "Пауза автопрохода" : "Пуск автопрохода"}
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip content="В начало трассы">
                <button type="button" onClick={() => { setPlaying(false); stepTo(0); }} disabled={!curDebug?.step} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Шаг назад (←) — автопроход встанет на паузу">
                <button type="button" onClick={() => { setPlaying(false); stepBy(-1); }} disabled={!curDebug?.prev} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Шаг вперёд (→) — автопроход встанет на паузу">
                <button type="button" onClick={() => { setPlaying(false); stepBy(1); }} disabled={!curDebug?.step || debug.idx >= debug.result.steps.length - 1} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="В конец трассы">
                <button type="button" onClick={() => { setPlaying(false); stepTo(debug.result.steps.length - 1); }} disabled={!curDebug?.step || debug.idx >= debug.result.steps.length - 1} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
              </Tooltip>
              <span className="ml-1.5 text-[10px] text-slate-400 font-mono truncate">
                {curDebug?.step ? (
                  <>
                    шаг {debug.idx + 1}/{debug.result.steps.length} · строка {curDebug.step.line}
                    {curDebug.step.func !== "<module>" && <> · {curDebug.step.func}()</>}
                  </>
                ) : (
                  "шагов нет — исправьте ошибку и начните редактирование"
                )}
              </span>
              {debug.result.truncated && (
                <Tooltip content={`Выполнение остановлено: лимит ${DEBUG_STEP_CAP} шагов защищает браузер от бесконечного цикла.`}>
                  <span tabIndex={0} className="cursor-help text-[9px] font-bold text-amber-400 border border-amber-500/40 bg-amber-500/10 rounded-full px-1.5 py-0.5">
                    лимит
                  </span>
                </Tooltip>
              )}
              <Tooltip content={hasViz ? "Визуализация читает реальные значения захардкоженных имён этой темы: i, j, k, v, dist, P, st… Эталонный текст не требуется." : "У страницы нет связанных имён визуализации; Python всё равно выполняет любой код."}>
                <span
                  tabIndex={0}
                  className={`cursor-help inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${hasViz ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-slate-600 bg-slate-800 text-slate-400"}`}
                >
                  {hasViz ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                  {hasViz ? "имена → демо" : "свободный Python"}
                </span>
              </Tooltip>
              <Tooltip content="Вернуться в редактор (Esc). После изменения новая трасса появится автоматически.">
                <button type="button" aria-label="Редактировать код" onClick={stopDebug} className="ml-auto inline-flex items-center gap-1 p-1 rounded-md text-rose-400 hover:text-white hover:bg-rose-500/30 transition-colors">
                  <Square className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold">код</span>
                </button>
              </Tooltip>
            </div>

            {/* листинг с подсветкой текущей строки */}
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto bg-[#0b1220] py-1 font-mono text-[11.5px] leading-5">
              {debug.src.split("\n").map((line, i) => {
                const ln = i + 1;
                const active = ln === curDebug?.step?.line;
                return (
                  <div
                    key={i}
                    data-line={ln}
                    className={`flex whitespace-pre px-2 ${
                      active ? "bg-emerald-500/15 text-emerald-200" : "text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-7 shrink-0 select-none text-right pr-2 ${
                        active ? "text-emerald-300" : "text-slate-700"
                      }`}
                    >
                      {active ? "▶" : ln}
                    </span>
                    <span>{line || " "}</span>
                  </div>
                );
              })}
            </div>

            {/* панель переменных — «Variables», как в обычном отладчике */}
            <div className="shrink-0 max-h-[34%] overflow-y-auto border-t border-slate-800 bg-slate-950/80 px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                <Variable className="w-3 h-3 text-indigo-400" />
                Переменные на этом шаге
                <span className="normal-case tracking-normal text-slate-600">· янтарные — присваивает выделенная строка</span>
              </div>
              {debug.result.error && (
                <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-snug text-rose-300">{debug.result.error}</pre>
              )}
              {debugOrdered.length === 0 && !debug.result.error && (
                <div className="mt-1 text-[11px] text-slate-600">на этом шаге значений пока нет (заголовок/комментарий или пустая строка)</div>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {debugOrdered.map(([name, value]) => {
                  const changed = debugChanged[name];
                  const synced = syncVarSet.has(name);
                  return (
                    <span
                      key={name}
                      className={`inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] leading-4 ${
                        changed
                          ? "border-amber-500/50 bg-amber-500/10"
                          : synced
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-800/60"
                      }`}
                    >
                      <span className={changed ? "text-amber-300 font-bold" : synced ? "text-emerald-300" : "text-indigo-300"}>
                        {name}
                      </span>
                      <span className="text-slate-500">=</span>
                      <span className={changed ? "text-amber-200" : "text-slate-200"}>{value}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <textarea
            ref={editorRef}
            value={code}
            onChange={(event) => {
              setEditHold(null);
              setCode(event.target.value);
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                void debugRun();
              }
              event.stopPropagation();
            }}
            spellCheck={false}
            aria-label="Код Python"
            className="flex-1 min-h-[90px] w-full resize-none bg-[#0b1220] px-3 py-2.5 font-mono text-[12px] leading-5 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/40 placeholder:text-slate-600"
            placeholder="Напишите Python-код…"
          />
        )}
        <div className="shrink-0 border-t border-slate-800 bg-slate-950/70 flex items-center gap-2 px-3 py-1.5">
          <label htmlFor="python-stdin" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            stdin для input()
          </label>
          <input
            id="python-stdin"
            value={stdin}
            onChange={(event) => {
              setEditHold(null);
              setStdin(event.target.value);
            }}
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
          <pre className="flex-1 min-h-[70px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] px-3 py-2 font-mono text-[11.5px] leading-5 text-slate-300">
            {output}
          </pre>
        )}
        <div className="px-3 py-1.5 border-t border-slate-800 text-[10px] text-slate-500 truncate">{runtimeMessage}</div>
      </div>
    </aside>
  );
}
