import { useEffect, useState } from "react";
import { Copy, Play, RotateCcw, StepForward, Pause, Terminal } from "lucide-react";
import { getFallbackMeta } from "../data/compilerVars";

interface Props {
  chapterId: string;
  onOpenFull: () => void;
  onClose?: () => void;
  compact?: boolean;
}

export function CompilerPanelContent({ chapterId, onOpenFull, onClose }: Props) {
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

  const sendControl = (action: "step" | "play" | "pause" | "reset") => {
    window.dispatchEvent(new CustomEvent("viz:control", { detail: { chapterId, action } }));
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

  const lines = commentOnly.split("\n");
  const copy = () => navigator.clipboard.writeText(commentOnly).catch(() => {});

  return (
    <div className="flex flex-col h-full bg-[#0b1220]">
      {/* вкладка редактора */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-800 bg-[#0f172a]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs font-bold text-slate-200">main.py</span>
          <span className="hidden sm:inline text-[11px] text-slate-500 truncate">· {meta.vizId ?? chapterId} · {Object.keys(meta.vars).join(",")}</span>
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

      {/* тулбар IDE */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900/40">
        <button onClick={() => sendControl("reset")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700" title="Сброс">
          <RotateCcw className="w-3 h-3" /> Сброс
        </button>
        <button onClick={() => sendControl("step")} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold" title="Шаг">
          <StepForward className="w-3 h-3" /> Шаг
        </button>
        <button onClick={() => sendControl(playing ? "pause" : "play")} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-white text-xs font-bold ${playing ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} {playing ? "Пауза" : "Пуск"}
        </button>
        <div className="flex-1" />
        <button onClick={onOpenFull} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold" title="Полный Python">
          <Terminal className="w-3 h-3" /> Запустить
        </button>
      </div>

      {/* LIVE полоска */}
      <div className="shrink-0 px-3 py-1.5 border-b border-slate-800 bg-slate-900/30 flex flex-wrap gap-1 items-center text-[11px] font-mono">
        <span className={`w-2 h-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
        <span className="text-slate-400">{live ? Object.entries(live).map(([k, v]) => `${k}=${v}`).join("  ") : `ожидание шага · ${Object.keys(meta.vars).join(" ")}`}</span>
        {live && <span className="ml-auto text-emerald-400 font-bold">LIVE</span>}
      </div>

      {/* редактор с нумерацией */}
      <div className="flex-1 overflow-auto bg-[#080d14] font-mono text-[13px] leading-6">
        <div className="flex">
          <div className="shrink-0 bg-[#0f172a] border-r border-slate-800 px-2 py-3 text-right select-none text-slate-500 text-[11px] leading-6">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 p-3 whitespace-pre-wrap break-words text-slate-300">{commentOnly}</pre>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>кода нет — только хардкод · {Object.keys(meta.vars).join(", ")}</span>
        <button onClick={onOpenFull} className="text-emerald-400 hover:text-white">полный →</button>
      </div>
    </div>
  );
}
