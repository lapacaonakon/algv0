import { useEffect, useState } from "react";
import { Copy, Play, RotateCcw, StepForward, Pause, Terminal } from "lucide-react";
import { getFallbackMeta, getMinimalStarter } from "../data/compilerVars";

interface Props {
  chapterId: string;
  onOpenFull: () => void;
  onClose?: () => void;
}

export function CompilerPanelContent({ chapterId, onOpenFull, onClose }: Props) {
  const meta = getFallbackMeta(chapterId);
  const starter = getMinimalStarter(chapterId);
  const [live, setLive] = useState<Record<string, string | number> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(0);
  const lines = starter.split("\n");

  useEffect(() => {
    setLine(0);
    setLive(null);
  }, [chapterId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.chapterId === chapterId || !d?.chapterId) setLive(d.vars ?? null);
    };
    window.addEventListener("viz:sync", handler as EventListener);
    return () => window.removeEventListener("viz:sync", handler as EventListener);
  }, [chapterId]);

  const sendControl = (action: "step" | "play" | "pause" | "reset") => {
    window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action } }));
    const viz = document.getElementById("chapter-viz");
    if (action === "step") {
      setLine((v) => Math.min(v + 1, lines.length - 1));
      const btn = Array.from(viz?.querySelectorAll("button") ?? []).find((b) => /Шаг|Step/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
    } else if (action === "reset") {
      setLine(0);
      const btn = Array.from(viz?.querySelectorAll("button") ?? []).find((b) => /Сброс|Reset/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
    } else if (action === "play" || action === "pause") {
      const btn = Array.from(viz?.querySelectorAll("button") ?? []).find((b) => /Пуск|Пауза|Play|Pause/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
      setPlaying(action === "play");
    }
    if (action === "step" && !viz) {
      setLine((v) => Math.min(v + 1, lines.length - 1));
    }
  };

  const copy = () => navigator.clipboard.writeText(starter).catch(() => {});

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
          WATCHES {live ? <span className="text-emerald-400">· шаг {line + 1}/{lines.length}</span> : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {live ? (
            Object.entries(live).map(([k, v]) => (
              <span key={k} className="px-1.5 py-0.5 rounded bg-[#0f172a] border border-emerald-600/30 text-emerald-300">
                {k} = {String(v)}
              </span>
            ))
          ) : (
            <span className="text-slate-500">{Object.keys(meta.vars).join("  ·  ")} — жми Шаг</span>
          )}
        </div>
        {live && <div className="mt-1 text-[10px] text-slate-500">подсветка в визуализации слева соответствует строке {line + 1}</div>}
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
        <span>строка {line + 1} · шаг = подсветка слева</span>
        <button onClick={onOpenFull} className="text-emerald-400 hover:text-white">терминал →</button>
      </div>
    </div>
  );
}
