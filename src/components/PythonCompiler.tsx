import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  Unlink,
  Variable,
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
  /** Перейти обратно к странице пособия (посмотреть визуализацию). */
  onOpenGuide: () => void;
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

/**
 * Стартовое содержимое редактора для страницы.
 *
 * ВАЖНО: здесь намеренно НЕТ кода алгоритма — только комментарий с
 * переменными, по которым идёт пошаговая визуализация (i, j, k, n, m…).
 * Студент сам меняет их значения, повторяя шаги демонстрации.
 */
function buildSyncTemplate(chapterId: string, chapterTitle: string): string {
  const sync = getPageSync(chapterId);
  const bar = "# " + "═".repeat(56);
  const lines: string[] = [bar, "#  СИНХРОНИЗАЦИЯ С ВИЗУАЛИЗАЦИЕЙ", `#  Страница: «${chapterTitle}»`];
  if (sync.vizTitle) lines.push(`#  Демонстрация: ${sync.vizTitle}`);
  lines.push(bar, "#");

  if (sync.variables.length === 0) {
    lines.push(
      "#  На этой странице нет интерактивной визуализации —",
      "#  компилятор работает в свободном режиме.",
      "#  Откройте страницу с демонстрацией (стрелки ← → в пособии),",
      "#  и здесь появятся её переменные синхронизации."
    );
  } else {
    lines.push("#  Пошаговая подсветка на визуализации идёт по переменным:");
    for (const v of sync.variables) {
      const range = v.range ? `  (${v.range})` : "";
      lines.push(`#    ${v.name} — ${v.role}${range}`);
    }
    if (sync.stepNote) {
      lines.push("#", `#  Шаг = ${sync.stepNote}`);
    }
    lines.push(
      "#",
      "#  Кода алгоритма здесь намеренно нет: листайте шаги на",
      "#  визуализации и повторяйте их руками — заведите эти переменные",
      "#  и задайте им значения текущего шага."
    );
  }
  return lines.join("\n") + "\n";
}

/** Переживает перемонтирование вкладки: код пользователя не теряется при переключении вкладок. */
let savedEditor: { code: string; template: string; chapterId: string } | null = null;

export function PythonCompiler({ chapterId, chapterTitle, onOpenGuide }: PythonCompilerProps) {
  const sync = useMemo(() => getPageSync(chapterId), [chapterId]);
  const template = useMemo(() => buildSyncTemplate(chapterId, chapterTitle), [chapterId, chapterTitle]);

  const [code, setCode] = useState(() => {
    if (!savedEditor) return template;
    // редактор не трогали — берём свежий шаблон текущей страницы
    if (savedEditor.code === savedEditor.template || savedEditor.code.trim() === "") return template;
    return savedEditor.code;
  });
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Нажмите «Запустить», чтобы увидеть результат.");
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("Python загружается только после первого запуска");
  const [copied, setCopied] = useState(false);

  /** Страница, с которой редактор перестал совпадать (пользователь написал свой код). */
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

  // запоминаем состояние редактора, чтобы возврат на вкладку ничего не затирал
  useEffect(() => {
    savedEditor = { code, template, chapterId };
  }, [code, template, chapterId]);

  // Смена страницы: если редактор не тронут (пуст или равен прошлому шаблону) —
  // тихо подставляем переменные новой страницы. Свой код не затираем,
  // а предлагаем синхронизироваться кнопкой.
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
  }, [template]);

  const runCode = useCallback(async () => {
    if (running) return;

    setRunning(true);
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
      setRuntimeMessage("Не удалось выполнить код — проверьте программу и соединение для загрузки Pyodide");
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

  const hasViz = sync.variables.length > 0;

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Terminal className="w-4 h-4" /> Боковая вкладка · Python
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Мини-компилятор Python</h2>
            <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Редактор синхронизирован с текущей страницей пособия: в нём только комментарий с переменными,
              по которым идёт пошаговая визуализация. Наведите курсор на переменную — появится подсказка.
            </p>
          </div>
          <a
            href="https://pyodide.org/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Как это работает <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Панель синхронизации с визуализацией */}
        <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip
              side="bottom"
              content={
                hasViz
                  ? "Редактор и визуализация смотрят на одну страницу. Переменные ниже — те самые, что подсвечиваются по шагам."
                  : "На выбранной странице нет интерактива, поэтому и переменных синхронизации нет."
              }
            >
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                  hasViz
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
                tabIndex={0}
              >
                <Link2 className="w-3.5 h-3.5" />
                {hasViz ? "Синхронизировано с визуализацией" : "Нет визуализации на странице"}
              </span>
            </Tooltip>

            <Tooltip side="bottom" content="Открыть эту страницу в пособии и посмотреть демонстрацию рядом с текстом.">
              <button
                type="button"
                onClick={onOpenGuide}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors max-w-[16rem]"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{chapterTitle}</span>
              </button>
            </Tooltip>

            {desyncedFrom !== null && (
              <Tooltip
                side="bottom"
                content="В редакторе ваш код, а страница сменилась. Кнопка вернёт комментарий с переменными текущей страницы (ваш код будет заменён)."
              >
                <button
                  type="button"
                  onClick={resync}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Страница сменилась — подставить её переменные
                </button>
              </Tooltip>
            )}
          </div>

          {hasViz && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mr-1">
                <Variable className="w-3.5 h-3.5" /> Переменные шага:
              </span>
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
                    className="cursor-help rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-[12px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    {v.name}
                  </code>
                </Tooltip>
              ))}
              {sync.stepNote && (
                <Tooltip side="bottom" content={`Шаг визуализации = ${sync.stepNote}`}>
                  <span
                    tabIndex={0}
                    className="cursor-help inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors max-w-full"
                  >
                    <ArrowRightLeft className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-64 sm:max-w-96">{sync.stepNote}</span>
                  </span>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-5 items-start">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${desyncedFrom !== null ? "bg-amber-400" : "bg-emerald-400"}`} />
                <span className="text-sm font-bold text-white">main.py</span>
                <span className="text-[11px] text-slate-500">Python 3 · Pyodide</span>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip side="bottom" content="Скопировать содержимое редактора в буфер обмена.">
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Скопировано" : "Копировать"}
                  </button>
                </Tooltip>
                <Tooltip
                  side="bottom"
                  content="Вернуть комментарий с переменными текущей страницы. Кода алгоритма тут нет по замыслу — вы повторяете шаги сами."
                >
                  <button
                    type="button"
                    onClick={resync}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Сбросить
                  </button>
                </Tooltip>
                <Tooltip side="bottom" content="Запустить код (Ctrl/Cmd + Enter). Первый запуск скачивает Python в браузер.">
                  <button
                    type="button"
                    onClick={() => void runCode()}
                    disabled={running}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                  >
                    {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    {running ? "Запускаю…" : "Запустить"}
                  </button>
                </Tooltip>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  void runCode();
                }
              }}
              spellCheck={false}
              aria-label="Код Python"
              className="block w-full min-h-[380px] resize-y bg-[#0b1220] px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 placeholder:text-slate-600"
              placeholder="Напишите Python-код…"
            />

            <div className="border-t border-slate-800 bg-slate-950/70">
              <label className="block px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="python-stdin">
                Ввод для input() · по одной строке на каждый вызов
              </label>
              <textarea
                id="python-stdin"
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                spellCheck={false}
                rows={2}
                placeholder={"Например:\nАлиса"}
                className="block w-full resize-y bg-transparent px-4 py-2 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Terminal className="w-4 h-4 text-emerald-400" /> Результат
              </div>
              <Tooltip
                side="bottom"
                content={
                  runtimeReady
                    ? "Python уже загружен в браузер (WebAssembly), код выполняется локально."
                    : "Python ещё не скачан — это произойдёт при первом запуске."
                }
              >
                <span
                  tabIndex={0}
                  className={`cursor-help inline-flex items-center gap-1.5 text-[11px] ${runtimeReady ? "text-emerald-400" : "text-slate-500"}`}
                >
                  {runtimeReady && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {runtimeReady ? "готов" : "не загружен"}
                </span>
              </Tooltip>
            </div>
            <pre className="min-h-[380px] max-h-[560px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] p-4 font-mono text-[13px] leading-6 text-slate-300">
              {output}
            </pre>
            <div className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">{runtimeMessage}</div>
          </section>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>Ctrl или Cmd + Enter запускает код. Вывод и ошибки появляются справа.</span>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>Первый запуск скачивает примерно несколько мегабайт Pyodide и может занять время.</span>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>Код выполняется в браузере и не отправляется на сервер пособия.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
