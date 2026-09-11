import { useEffect, useState, useMemo } from "react";
import { Copy, Play, RotateCcw, StepForward, Pause, Terminal } from "lucide-react";
import { getFallbackMeta, getMinimalStarter } from "../data/compilerVars";
import { VizObject, parseAssignments } from "../viz/VizObject";

interface Props {
  chapterId: string;
  onOpenFull: () => void;
  onClose?: () => void;
}

export function CompilerPanelContent({ chapterId, onOpenFull, onClose }: Props) {
  const meta = getFallbackMeta(chapterId);
  const starter = getMinimalStarter(chapterId);
  const lines = useMemo(() => starter.split("\n"), [starter]);
  const vizObj = useMemo(() => new VizObject(chapterId, lines, {}), [chapterId, lines]);

  const [live, setLive] = useState<Record<string, string | number> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(0);

  // внешний highlight от viz (когда viz шагает сама)
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.chapterId === chapterId || !d?.chapterId) setLive(d.vars ?? null);
    };
    window.addEventListener("viz:sync", handler as EventListener);
    return () => window.removeEventListener("viz:sync", handler as EventListener);
  }, [chapterId]);

  useEffect(() => {
    setLine(0);
    setLive(null);
  }, [chapterId]);

  const emitHighlight = (nextLine: number) => {
    const codeLine = lines[nextLine] ?? "";
    const parsed = parseAssignments(codeLine);
    // обновляем объект
    for (const [k, v] of Object.entries(parsed)) vizObj.vars.set(k, v as number);
    const vars = { ...vizObj.vars.vars } as Record<string, string | number>;
    // если есть распарсенные vars — шлём в визуализацию
    if (Object.keys(parsed).length > 0) {
      window.dispatchEvent(new CustomEvent("viz:highlight", { detail: { chapterId, vars, line: nextLine } }));
      setLive(vars);
    } else {
      // для строк без присваивания (ans = min...) — просто подсветить строку, оставить прежние vars
      window.dispatchEvent(new CustomEvent("viz:highlight", { detail: { chapterId, vars, line: nextLine } }));
    }
  };

  const sendControl = (action: "step" | "play" | "pause" | "reset") => {
    if (action === "step") {
      const next = Math.min(line + 1, lines.length - 1);
      // если на нулевой строке и ещё не эмитили — эмитим текущую
      if (line === 0 && Object.keys(vizObj.vars.vars).length === 0) {
        emitHighlight(0);
        if (lines.length > 1) {
          // следующий шаг будет на 1
          setLine(1);
          emitHighlight(1);
          return;
        }
        setLine(next);
        emitHighlight(next);
        return;
      }
      setLine(next);
      emitHighlight(next);
      // также дёргаем viz для совместимости
      window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action: "step" } }));
    } else if (action === "reset") {
      setLine(0);
      vizObj.vars.vars = {};
      setLive(null);
      window.dispatchEvent(new CustomEvent("viz:highlight", { detail: { chapterId, vars: {}, line: 0 } }));
      window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action: "reset" } }));
      emitHighlight(0);
    } else if (action === "play" || action === "pause") {
      window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action } }));
      setPlaying(action === "play");
      // при play — начать автопроход по строкам
      if (action === "play") {
        let cur = line;
        const iv = setInterval(() => {
          cur = Math.min(cur + 1, lines.length - 1);
          setLine(cur);
          emitHighlight(cur);
          if (cur >= lines.length - 1) {
            clearInterval(iv);
            setPlaying(false);
          }
        }, 900);
        // сохранить interval для паузы — упрощённо через событие pause
        window.addEventListener("viz:control", function h(e: Event) {
          const d = (e as CustomEvent).detail;
          if (d?.action === "pause") {
            clearInterval(iv);
            window.removeEventListener("viz:control", h as EventListener);
          }
        } as EventListener);
      }
    }
  };

  const copy = () => navigator.clipboard.writeText(starter).catch(() => {});

  // при первом рендере подсветить строку 0 (i,j=0,0)
  useEffect(() => {
    // небольшая задержка чтобы viz успел подписаться
    const t = setTimeout(() => emitHighlight(0), 200);
    return () => clearTimeout(t);
  }, [chapterId, starter]);

  return (
    <div className="flex flex-col h-full bg-[#0b1220]">
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-800 bg-[#0f172a]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs font-bold text-slate-200">main.py</span>
          <span className="hidden sm:inline text-[11px] text-slate-500 truncate">· {meta.vizId ?? chapterId}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Копировать">
            <Copy className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Закрыть">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900/40">
        <button onClick={() => sendControl("reset")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700">
          <RotateCcw className="w-3 h-3" /> Сброс
        </button>
        <button onClick={() => sendControl("step")} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
          <StepForward className="w-3 h-3" /> Шаг
        </button>
        <button onClick={() => sendControl(playing ? "pause" : "play")} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-white text-xs font-bold ${playing ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} {playing ? "Пауза" : "Пуск"}
        </button>
        <div className="flex-1" />
        <button onClick={onOpenFull} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
          <Terminal className="w-3 h-3" /> Терминал
        </button>
      </div>

      <div className="shrink-0 px-3 py-2 border-b border-slate-800 bg-slate-900/30 font-mono text-[11px] leading-5">
        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
          <span className={`w-2 h-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
          WATCHES — шаг {line + 1}/{lines.length} · {vizObj.describe()}
        </div>
        <div className="flex flex-wrap gap-1">
          {live && Object.keys(live).length > 0 ? (
            Object.entries(live).map(([k, v]) => (
              <span key={k} className="px-1.5 py-0.5 rounded bg-[#0f172a] border border-emerald-600/30 text-emerald-300">
                {k} = {String(v)}
              </span>
            ))
          ) : (
            <span className="text-slate-500">{lines[line]?.split("#")[0].trim() || "i,j = 0,0"} — жми Шаг</span>
          )}
        </div>
        <div className="mt-1 text-[10px] text-slate-500">строка кода → подсветка в визуализации слева (отдельный объект: CodeImpl + VarsStruct)</div>
      </div>

      <div className="flex-1 overflow-auto bg-[#080d14] font-mono text-[13px] leading-6">
        <div className="flex min-h-full">
          <div className="shrink-0 bg-[#0f172a] border-r border-slate-800 px-2 py-3 text-right select-none text-[11px] leading-6">
            {lines.map((_, i) => (
              <div key={i} className={`px-1 rounded ${i === line ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 py-3">
            {lines.map((l, i) => (
              <div key={i} className={`px-3 whitespace-pre-wrap break-words ${i === line ? "bg-indigo-600/20 border-l-2 border-indigo-500 text-white" : "text-slate-300 border-l-2 border-transparent"}`}>
                {l || " "}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>viz:{meta.vizId ?? chapterId} · {vizObj.code.describe()} · {vizObj.vars.describe()}</span>
        <button onClick={onOpenFull} className="text-emerald-400 hover:text-white">терминал →</button>
      </div>
    </div>
  );
}
