import { useEffect, useState } from "react";
import { Copy, ExternalLink, Play, RotateCcw, StepForward, Pause, Terminal } from "lucide-react";
import { getFallbackMeta } from "../data/compilerVars";

interface Props {
  chapterId: string;
  onOpenFull: () => void;
  onClose?: () => void;
  compact?: boolean;
}

export function CompilerPanelContent({ chapterId, onOpenFull, onClose, compact }: Props) {
  const meta = getFallbackMeta(chapterId);
  const [live, setLive] = useState<Record<string, string | number> | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.chapterId === chapterId || !d?.chapterId) setLive(d.vars ?? null);
    };
    window.addEventListener("viz:sync", handler as EventListener);
    return () => window.removeEventListener("viz:sync", handler as EventListener);
  }, [chapterId]);

  // отправляем команды демо
  const sendControl = (action: "step" | "play" | "pause" | "reset") => {
    window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action } }));
    // fallback — пробуем кликнуть реальные кнопки демо
    const viz = document.getElementById("chapter-viz");
    if (!viz) return;
    if (action === "step") {
      const btn = Array.from(viz.querySelectorAll("button")).find((b) => /Шаг|Step/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
    } else if (action === "reset") {
      const btn = Array.from(viz.querySelectorAll("button")).find((b) => /Сброс|Reset/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
    } else if (action === "play" || action === "pause") {
      const btn = Array.from(viz.querySelectorAll("button")).find((b) => /Пуск|Пауза|Play|Pause/i.test(b.textContent || ""));
      (btn as HTMLButtonElement | undefined)?.click();
      setPlaying(action === "play");
    }
  };

  const commentOnly = `# ${meta.title}\n# viz: ${meta.vizId ?? "—"}\n${Object.entries(meta.vars)
    .map(([k, v]) => `# ${k} = ${v.example}  # ${v.desc.split(" — ")[0].split(" (")[0].slice(0, 24)}`)
    .join("\n")}`;

  const copy = () => navigator.clipboard.writeText(commentOnly).catch(() => {});

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-emerald-600 p-1.5 rounded-lg shrink-0">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-emerald-400 leading-none">КОМПИЛЯТОР</div>
            <div className="text-sm font-bold text-white truncate">{meta.title}</div>
            <div className="text-[11px] text-slate-500 truncate">{meta.vizId ?? chapterId}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            ✕
          </button>
        )}
      </div>

      {/* controls — ход по шагам + запуск */}
      <div className="shrink-0 p-3 border-b border-slate-800 bg-slate-900/50 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => sendControl("reset")} className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg border border-slate-700">
            <RotateCcw className="w-3.5 h-3.5" /> Сброс
          </button>
          <button onClick={() => sendControl("step")} className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg">
            <StepForward className="w-3.5 h-3.5" /> Шаг
          </button>
          <button onClick={() => sendControl(playing ? "pause" : "play")} className={`flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2 rounded-lg ${playing ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Пауза" : "Пуск"}
          </button>
        </div>
        <button onClick={onOpenFull} className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg">
          <Play className="w-3.5 h-3.5" /> Запустить · полный Python
        </button>
        <div className="text-[11px] text-slate-500 text-center">Кнопки управляют демо ниже — компилятор синхронен с визуализацией</div>
      </div>

      {/* live */}
      {live ? (
        <div className="mx-3 mt-3 rounded-xl border border-emerald-600/30 bg-emerald-950/30 px-3 py-2 flex flex-wrap gap-1.5 items-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>
          {Object.entries(live).map(([k, v]) => (
            <span key={k} className="font-mono text-xs bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-emerald-300">{k}={String(v)}</span>
          ))}
        </div>
      ) : (
        <div className="mx-3 mt-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[11px] text-slate-500">
          LIVE: <span className="font-mono text-slate-300">{Object.keys(meta.vars).join(", ")}</span> — подсветка при шаге демо
        </div>
      )}

      {/* code — только комменты, минималистично */}
      <div className="flex-1 overflow-auto p-3">
        <div className="rounded-xl border border-slate-800 bg-[#080d14] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/70">
            <span className="text-xs font-mono text-slate-400">main.py — только комменты</span>
            <button onClick={copy} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs">
              <Copy className="w-3 h-3" /> Копировать
            </button>
          </div>
          <pre className="p-3 text-[13px] leading-6 font-mono text-slate-300 whitespace-pre-wrap break-words">{commentOnly}</pre>
        </div>

        {!compact && (
          <div className="mt-3 space-y-1.5">
            {Object.entries(meta.vars).map(([k, v]) => {
              const isLive = live && k in live;
              return (
                <div key={k} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isLive ? "bg-emerald-950/30 border-emerald-600/40" : "bg-slate-900 border-slate-800"}`}>
                  <span className={`font-mono text-sm font-bold ${isLive ? "text-emerald-300" : "text-white"}`}>{k}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${isLive ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>{isLive ? String(live![k]) : v.example}</span>
                  <span className="text-[11px] text-slate-500 ml-2 truncate max-w-[150px]">{v.desc.split(" — ")[0].slice(0, 32)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-950 p-3 flex gap-2">
        <button onClick={onOpenFull} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg border border-slate-700">
          Открыть полный <ExternalLink className="w-3 h-3 inline ml-1" />
        </button>
        {onClose && <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs">Закрыть</button>}
      </div>
    </div>
  );
}
