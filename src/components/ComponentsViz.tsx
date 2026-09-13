import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useVizRuntime, vizArray, vizNumber, vizRecord, vizString } from "../data/vizStepBus";

/**
 * Тема 8 «Графы. Компоненты связности».
 * Обход в ширину помечает каждую вершину номером её компоненты comp[v];
 * сколько раз пришлось запускать обход — столько и компонент (count).
 */

interface V {
  id: number;
  label: string;
  x: number;
  y: number;
}

// Демо-граф: три «острова» по 3–4 вершины.
const NODES: V[] = [
  { id: 0, label: "A", x: 60, y: 60 },
  { id: 1, label: "B", x: 170, y: 30 },
  { id: 2, label: "C", x: 150, y: 130 },
  { id: 3, label: "D", x: 40, y: 160 },
  { id: 4, label: "E", x: 300, y: 60 },
  { id: 5, label: "F", x: 410, y: 90 },
  { id: 6, label: "G", x: 330, y: 160 },
  { id: 7, label: "H", x: 90, y: 260 },
  { id: 8, label: "I", x: 200, y: 240 },
  { id: 9, label: "J", x: 330, y: 270 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], // остров 1: A B C D
  [4, 5], [5, 6], [6, 4], // остров 2: E F G (цикл)
  [7, 8], [8, 9], // остров 3: H I J
];

const ADJ: number[][] = (() => {
  const adj: number[][] = NODES.map(() => []);
  EDGES.forEach(([u, v]) => {
    adj[u].push(v);
    adj[v].push(u);
  });
  return adj;
})();

const COMP_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4"];

interface StepFrame {
  comp: (number | null)[];
  queue: number[];
  current: number | null;
  scanning: number | null;
  count: number;
  log: string;
}

/** Полный прогон BFS-разметки: кадры строим заранее (чистая функция). */
function buildFrames(): StepFrame[] {
  const frames: StepFrame[] = [];
  const comp: (number | null)[] = NODES.map(() => null);
  let count = 0;
  const push = (f: Omit<StepFrame, "comp" | "count"> & { count?: number }) =>
    frames.push({ comp: [...comp], count, ...f });

  push({ queue: [], current: null, scanning: null, log: "Граф без разметки: все вершины «не посещены». Запускаем обход от каждой непосещённой вершины." });

  for (let s = 0; s < NODES.length; s++) {
    if (comp[s] !== null) continue;
    count += 1;
    const queue = [s];
    comp[s] = count - 1;
    push({ queue: [...queue], current: s, scanning: null, log: `Вершина ${NODES[s].label} не посещена → новая компонента №${count}. BFS стартует с неё.` });
    while (queue.length) {
      const v = queue.shift()!;
      push({ queue: [...queue], current: v, scanning: null, log: `Достали из очереди ${NODES[v].label} (comp = ${comp[v]}). Смотрим соседей.` });
      for (const to of ADJ[v]) {
        if (comp[to] === null) {
          comp[to] = comp[v];
          queue.push(to);
          push({ queue: [...queue], current: v, scanning: to, log: `Сосед ${NODES[to].label} ещё не помечен → comp[${NODES[to].label}] = ${comp[v]}, в очередь.` });
        } else {
          push({ queue: [...queue], current: v, scanning: to, log: `Сосед ${NODES[to].label} уже в компоненте ${comp[to]} — пропускаем.` });
        }
      }
    }
    push({ queue: [], current: null, scanning: null, log: `Очередь пуста → компонента №${count} собрана полностью.` });
  }
  push({ queue: [], current: null, scanning: null, log: `Готово: count = ${count} — число запусков BFS равно числу компонент связности.` });
  return frames;
}

const FRAMES = buildFrames();

export function ComponentsViz() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= FRAMES.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, FRAMES.length - 1)), 1100);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  // ── Синхронизация с Python-компилятором: v — текущая вершина, comp — словарь
  // или список меток, q — очередь, count — число компонент.
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const liveVLabel = vizString(vars?.v);
  const liveVNum = vizNumber(vars?.v);
  const liveCompRec = vizRecord(vars?.comp);
  const liveCompArr = vizArray(vars?.comp);
  const liveQ = vizArray(vars?.q);
  const liveCount = vizNumber(vars?.count);

  const liveCompByLabel = useMemo(() => {
    if (liveCompRec) return liveCompRec;
    if (liveCompArr) return Object.fromEntries(liveCompArr.map((c, i) => [String(i), c]));
    return null;
  }, [liveCompRec, liveCompArr]);

  const frame = FRAMES[Math.min(step, FRAMES.length - 1)];
  const compilerLinked =
    liveVLabel !== null || liveVNum !== null || !!liveCompByLabel || liveCount !== null;

  const liveIndexOf = () => {
    if (liveVLabel) {
      const idx = NODES.findIndex((n) => n.label === liveVLabel);
      return idx >= 0 ? idx : null;
    }
    return liveVNum !== null && liveVNum >= 0 && liveVNum < NODES.length ? liveVNum : null;
  };
  const liveCurrent = liveIndexOf();

  const liveCompOf = (n: V): number | null => {
    if (liveCompByLabel && n.label in liveCompByLabel) {
      const c = vizNumber(liveCompByLabel[n.label]);
      if (c !== null) return c;
    }
    if (liveCompByLabel && String(n.id) in liveCompByLabel) {
      const c = vizNumber(liveCompByLabel[String(n.id)]);
      if (c !== null) return c;
    }
    return frame.comp[n.id];
  };
  const liveQueueLabels = (liveQ
    ? liveQ.map((x) => (typeof x === "string" ? x : vizString(x) ?? String(vizNumber(x) ?? "")))
    : null
  )?.filter(Boolean);
  const displayCount = liveCount ?? frame.count;
  const displayLog = compilerLinked
    ? `🐍 Компилятор: v=${liveVLabel ?? liveVNum ?? "—"}; count=${displayCount}; очередь=[${(liveQueueLabels ?? frame.queue.map((q) => NODES[q].label)).join(", ")}]`
    : frame.log;

  const shownCurrent = compilerLinked ? liveCurrent : frame.current;
  const shownScanning = compilerLinked ? null : frame.scanning;
  const shownQueue: number[] = liveQueueLabels
    ? liveQueueLabels
        .map((lab) => NODES.findIndex((n) => n.label === lab))
        .filter((i) => i >= 0)
    : frame.queue;

  return (
    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl max-w-5xl mx-auto my-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">🏝️ Компоненты связности: BFS-разметка островов</h3>
          <p className="text-xs text-slate-400">
            Каждой вершине присваивается номер компоненты comp[v]; число запусков обхода = число компонент.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPlaying(false); setStep(0); }}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Сброс
          </button>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            ◀ Шаг
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white ${playing ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Пауза" : "Пуск"}
          </button>
          <button
            onClick={() => { setPlaying(false); setStep((s) => Math.min(FRAMES.length - 1, s + 1)); }}
            disabled={step >= FRAMES.length - 1}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <SkipForward className="w-3.5 h-3.5" /> Шаг
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div className="bg-slate-950 rounded-xl border border-slate-800 relative min-h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <svg className="w-full h-[320px] relative z-10" viewBox="0 0 450 320">
            {EDGES.map(([u, v], i) => {
              const a = NODES[u];
              const b = NODES[v];
              const sameComp = liveCompOf(a) !== null && liveCompOf(a) === liveCompOf(b);
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={sameComp ? (COMP_COLORS[(liveCompOf(a) ?? 0) % COMP_COLORS.length]) : "#475569"}
                  strokeWidth={sameComp ? 3.5 : 2}
                  opacity={sameComp ? 0.9 : 0.6}
                />
              );
            })}
            {NODES.map((n) => {
              const c = liveCompOf(n);
              const isCurrent = shownCurrent === n.id;
              const isScanned = shownScanning === n.id;
              const inQueue = shownQueue.includes(n.id);
              const color = c === null ? "#334155" : COMP_COLORS[c % COMP_COLORS.length];
              return (
                <g key={n.id}>
                  {(isCurrent || isScanned) && (
                    <circle cx={n.x} cy={n.y} r={18} fill="none" stroke={isCurrent ? "#fff" : "#fbbf24"} strokeWidth={2} className="animate-pulse" />
                  )}
                  <circle cx={n.x} cy={n.y} r={13} fill={color} stroke={inQueue ? "#fbbf24" : "#0f172a"} strokeWidth={inQueue ? 3 : 2} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="pointer-events-none">{n.label}</text>
                  <text x={n.x} y={n.y - 18} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace" className="pointer-events-none">
                    {c === null ? "—" : `c${c}`}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700/60 px-2 py-1 rounded-md text-[10px] text-slate-300 z-20">
            Компонент: <span className="font-bold text-white">{displayCount}</span> · шаг {step + 1}/{FRAMES.length}
          </div>
          {compilerLinked && (
            <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-500/40 px-2 py-1 rounded-md text-[10px] text-emerald-300 z-20">
              🐍 синхронизация с Python
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Очередь BFS</div>
            <div className="flex flex-wrap gap-1 min-h-[26px]">
              {shownQueue.length === 0 && <span className="text-xs text-slate-600">пусто</span>}
              {shownQueue.map((q, i) => (
                <span key={`${q}-${i}`} className="px-2 py-0.5 rounded bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-mono">
                  {NODES[q].label}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Массив comp[]</div>
            <div className="grid grid-cols-5 gap-1">
              {NODES.map((n) => {
                const c = liveCompOf(n);
                return (
                  <div key={n.id} className={`text-center rounded px-1 py-0.5 text-[10px] font-mono border ${c === null ? "border-slate-800 text-slate-500" : "border-transparent text-white"}`}
                    style={c === null ? {} : { backgroundColor: COMP_COLORS[c % COMP_COLORS.length] + "33", color: COMP_COLORS[c % COMP_COLORS.length] }}>
                    <div className="text-slate-400">{n.label}</div>
                    <div>{c === null ? "—" : c}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-xs text-slate-300 min-h-[64px]">
            {displayLog}
          </div>
        </div>
      </div>
    </div>
  );
}
