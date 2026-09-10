import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Info, Loader2, Play, RotateCcw, Terminal, Copy, Feather } from "lucide-react";
import { getFallbackMeta } from "../data/compilerVars";

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const STARTER_CODE = `# Первый запуск загрузит Python в браузер.
name = "алгоритмы"

for number in range(1, 4):
    print(f"{number}. Учим {name}!")
`;

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

interface Props {
  chapterId?: string;
}

export function PythonCompiler({ chapterId }: Props) {
  const meta = chapterId ? getFallbackMeta(chapterId) : null;

  // Минималистичный хардкод — 5 строк, без перегрузки
  const syncedStarter = meta
    ? `# ${meta.title} — хардкод (кода нет, только комменты)\n# viz: ${meta.vizId ?? "—"}\n${Object.entries(meta.vars)
        .map(([k, v]) => {
          const short = v.desc.split(" — ")[0].split(" (")[0].slice(0, 28);
          return `# ${k} = ${v.example}  # ${short}`;
        })
        .join("\n")}\n`
    : STARTER_CODE;

  const [code, setCode] = useState(syncedStarter);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Нажмите «Запустить», чтобы увидеть результат.");
  const [running, setRunning] = useState(false);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeMessage, setRuntimeMessage] = useState("Python загружается только после первого запуска");
  const [liveVars, setLiveVars] = useState<Record<string, string> | null>(null);

  // синхронизация с демо (side panel шлёт viz:sync)
  useEffect(() => {
    const hook = (vars: Record<string, string>) => setLiveVars(vars);
    (globalThis as unknown as { __compilerSyncHook?: typeof hook }).__compilerSyncHook = hook;
    const onSync = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d?.vars) return;
      if (chapterId && d.chapterId && d.chapterId !== chapterId) return;
      setLiveVars(d.vars);
    };
    window.addEventListener("viz:sync", onSync as EventListener);
    return () => window.removeEventListener("viz:sync", onSync as EventListener);
  }, [chapterId]);

  // обновить код при смене главы
  useEffect(() => {
    setCode(syncedStarter);
    setLiveVars(null);
  }, [chapterId]);

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

  const reset = () => {
    setCode(syncedStarter);
    setStdin("");
    setOutput("Нажмите «Запустить», чтобы увидеть результат.");
    setLiveVars(null);
  };

  const insertSyncedComment = () => {
    if (!meta) return;
    const comment = `# ${meta.title}\n${Object.entries(meta.vars)
      .map(([k, v]) => `# ${k} = ${v.example}  # ${v.desc.split(" — ")[0].slice(0, 32)}`)
      .join("\n")}\n`;
    setCode((prev) => comment + "\n" + prev);
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Terminal className="w-4 h-4" /> Python
              {meta && <span className="text-slate-500 normal-case font-normal">· {meta.title}</span>}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Мини-компилятор Python</h2>
            <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed text-sm">
              Пиши код и жми <b className="text-white">Запустить</b> — Pyodide выполнит его в браузере.
              {meta && (
                <span className="block mt-1 text-emerald-300 text-xs">
                  Хардкод этой страницы: <code className="bg-emerald-950 px-1 rounded">{Object.keys(meta.vars).join(", ")}</code> — только комменты в редакторе.
                </span>
              )}
            </p>
          </div>
          <a href="https://pyodide.org/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            Как это работает <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {liveVars && (
          <div className="mb-4 rounded-xl border border-emerald-600/40 bg-emerald-950/30 px-3 py-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
            {Object.entries(liveVars).map(([k, v]) => (
              <span key={k} className="text-xs font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-200">
                {k}={String(v)}
              </span>
            ))}
            <button onClick={() => setLiveVars(null)} className="ml-auto text-[11px] text-slate-400 hover:text-white">
              скрыть
            </button>
          </div>
        )}

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] gap-5 items-start">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-white">main.py</span>
                <span className="text-[11px] text-slate-500">Pyodide</span>
                {meta && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">{meta.vizId}</span>}
              </div>
              <div className="flex items-center gap-2">
                {meta && (
                  <button type="button" onClick={insertSyncedComment} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-indigo-300 hover:text-white hover:bg-indigo-900/50 transition-colors border border-indigo-800">
                    <Feather className="w-3.5 h-3.5" /> i,k,j
                  </button>
                )}
                <button type="button" onClick={() => navigator.clipboard.writeText(code).catch(() => {})} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                  <RotateCcw className="w-3.5 h-3.5" /> Сбросить
                </button>
                <button type="button" onClick={() => void runCode()} disabled={running} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold">
                  {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {running ? "Запускаю…" : "Запустить"}
                </button>
              </div>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void runCode(); }}} spellCheck={false} aria-label="Код Python" className="block w-full min-h-[360px] resize-y bg-[#0b1220] px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50" placeholder="Напишите Python-код…" />
            <div className="border-t border-slate-800 bg-slate-950/70">
              <label className="block px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="python-stdin">Ввод для input()</label>
              <textarea id="python-stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} spellCheck={false} rows={2} placeholder={"Пример:\nАлиса"} className="block w-full resize-y bg-transparent px-4 py-2 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700" />
            </div>
          </section>
          <section className="rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white"><Terminal className="w-4 h-4 text-emerald-400" /> Результат</div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${runtimeReady ? "text-emerald-400" : "text-slate-500"}`}>{runtimeReady && <CheckCircle2 className="w-3.5 h-3.5" />}{runtimeReady ? "готов" : "не загружен"}</span>
            </div>
            <pre className="min-h-[360px] max-h-[560px] overflow-auto whitespace-pre-wrap break-words bg-[#080d18] p-4 font-mono text-[13px] leading-6 text-slate-300">{output}</pre>
            <div className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">{runtimeMessage}</div>
          </section>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400"><Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" /><span>Ctrl/Cmd + Enter — запуск.</span></div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400"><Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" /><span>Первый запуск качает Pyodide ~8 MB.</span></div>
          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-slate-400"><Info className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /><span>Код в браузере, на сервер не уходит.</span></div>
        </div>
      </div>
    </main>
  );
}
