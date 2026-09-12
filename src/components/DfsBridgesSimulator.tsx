import { useState, useEffect, useRef } from "react";
import { useVizStepSync, vizNumber, vizString } from '../data/vizStepBus';
import { Undo, Play, Pause, SkipForward, RefreshCw } from "lucide-react";

interface CodeLine {
  line: string;
  highlight: string;
}

const CODE_LINES: CodeLine[] = [
  { line: "void dfs(int v, int p = -1) {", highlight: "normal" },
  { line: "    visited[v] = true;", highlight: "normal" },
  { line: "    tin[v] = low[v] = timer++;", highlight: "normal" },
  { line: "", highlight: "normal" },
  { line: "    for (int to : adj[v]) {", highlight: "normal" },
  { line: "        if (to == p) continue;", highlight: "normal" },
  { line: "", highlight: "normal" },
  { line: "        if (visited[to]) {", highlight: "normal" },
  { line: '            low[v] = min(low[v], tin[to]);', highlight: "normal" },
  { line: "        } else {", highlight: "normal" },
  { line: "            dfs(to, v);", highlight: "normal" },
  { line: "            low[v] = min(low[v], low[to]);", highlight: "normal" },
  { line: "", highlight: "normal" },
  { line: "            if (low[to] > tin[v]) {", highlight: "normal" },
  { line: '                // ЭТО МОСТ!', highlight: "normal" },
  { line: "            }", highlight: "normal" },
  { line: "        }", highlight: "normal" },
  { line: "    }", highlight: "normal" },
  { line: "}", highlight: "normal" },
];

interface DfsStep {
  currentNode: number | null;
  visitedIndices: number[];
  tin: Record<number, number>;
  low: Record<number, number>;
  stack: number[];
  bridges: string[];
  log: string;
  activeEdge: [number, number] | null;
  backEdge: [number, number] | null;
  activeCodeLine: number[];
}

const GRAPH_NODES = [
  { id: 0, label: "A", x: 100, y: 120 },
  { id: 1, label: "B", x: 260, y: 120 },
  { id: 2, label: "C", x: 180, y: 200 },
  { id: 3, label: "D", x: 180, y: 300 },
  { id: 4, label: "E", x: 100, y: 370 },
  { id: 5, label: "F", x: 260, y: 370 },
  { id: 6, label: "G", x: 340, y: 200 }
];

const GRAPH_EDGES = [
  { u: 0, v: 1, key: "0-1" },
  { u: 1, v: 2, key: "1-2" },
  { u: 2, v: 0, key: "0-2" },
  { u: 2, v: 3, key: "2-3" },
  { u: 3, v: 4, key: "3-4" },
  { u: 4, v: 5, key: "4-5" },
  { u: 5, v: 3, key: "3-5" },
  { u: 1, v: 6, key: "1-6" }
];

const DFS_STEPS: DfsStep[] = [
  {
    currentNode: 0, visitedIndices: [0],
    tin: {0:1}, low: {0:1}, stack: [0], bridges: [],
    activeEdge: null, backEdge: null,
    log: "Входим в A. tin[A]=1, low[A]=1.",
    activeCodeLine: [0,1,2]
  },
  {
    currentNode: 1, visitedIndices: [0,1],
    tin: {0:1,1:2}, low: {0:1,1:2}, stack: [0,1], bridges: [],
    activeEdge: [0,1], backEdge: null,
    log: "Идём (A,B). B впервые. tin[B]=2, low[B]=2.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 6, visitedIndices: [0,1,6],
    tin: {0:1,1:2,6:3}, low: {0:1,1:2,6:3}, stack: [0,1,6], bridges: [],
    activeEdge: [1,6], backEdge: null,
    log: "Из B идём в G. tin[G]=3, low[G]=3.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 1, visitedIndices: [0,1,6],
    tin: {0:1,1:2,6:3}, low: {0:1,1:2,6:3}, stack: [0,1], bridges: ["1-6"],
    activeEdge: null, backEdge: null,
    log: "У G нет соседей (кроме B). Возврат. low[G]=3 > tin[B]=2 → (B,G) МОСТ!",
    activeCodeLine: [13,14,15]
  },
  {
    currentNode: 2, visitedIndices: [0,1,6,2],
    tin: {0:1,1:2,6:3,2:4}, low: {0:1,1:2,6:3,2:4}, stack: [0,1,2], bridges: ["1-6"],
    activeEdge: [1,2], backEdge: null,
    log: "Из B идём в C. tin[C]=4, low[C]=4.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 2, visitedIndices: [0,1,6,2],
    tin: {0:1,1:2,6:3,2:4}, low: {0:1,1:2,6:3,2:1}, stack: [0,1,2], bridges: ["1-6"],
    activeEdge: null, backEdge: [2,0],
    log: "Видим соседа A (уже посещён)! Обратное ребро (C,A). low[C]=min(4,1)=1.",
    activeCodeLine: [7,8,9]
  },
  {
    currentNode: 3, visitedIndices: [0,1,6,2,3],
    tin: {0:1,1:2,6:3,2:4,3:5}, low: {0:1,1:2,6:3,2:1,3:5}, stack: [0,1,2,3], bridges: ["1-6"],
    activeEdge: [2,3], backEdge: null,
    log: "Идём C→D. tin[D]=5, low[D]=5.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 4, visitedIndices: [0,1,6,2,3,4],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6}, low: {0:1,1:2,6:3,2:1,3:5,4:6}, stack: [0,1,2,3,4], bridges: ["1-6"],
    activeEdge: [3,4], backEdge: null,
    log: "D→E. tin[E]=6, low[E]=6.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 5, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:2,6:3,2:1,3:5,4:6,5:7}, stack: [0,1,2,3,4,5], bridges: ["1-6"],
    activeEdge: [4,5], backEdge: null,
    log: "E→F. tin[F]=7, low[F]=7.",
    activeCodeLine: [4,5,7,10,11]
  },
  {
    currentNode: 5, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:2,6:3,2:1,3:5,4:6,5:5}, stack: [0,1,2,3,4,5], bridges: ["1-6"],
    activeEdge: null, backEdge: [5,3],
    log: "Из F видим D (посещён). Обратное ребро (F,D). low[F]=min(7,5)=5.",
    activeCodeLine: [7,8,9]
  },
  {
    currentNode: 4, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:2,6:3,2:1,3:5,4:5,5:5}, stack: [0,1,2,3,4], bridges: ["1-6"],
    activeEdge: null, backEdge: null,
    log: "Возврат F→E. low[E]=min(6,5)=5. (E,F) — не мост (5≤6).",
    activeCodeLine: [11,13,16,17]
  },
  {
    currentNode: 3, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:2,6:3,2:1,3:5,4:5,5:5}, stack: [0,1,2,3], bridges: ["1-6"],
    activeEdge: null, backEdge: null,
    log: "Возврат E→D. low[D]=min(6,5)=5. (D,E) — не мост.",
    activeCodeLine: [11,13,16,17]
  },
  {
    currentNode: 2, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:2,6:3,2:1,3:5,4:5,5:5}, stack: [0,1,2], bridges: ["1-6", "2-3"],
    activeEdge: null, backEdge: null,
    log: "Возврат D→C. low[5] = 5 > tin[2] = 4! (C,D) — МОСТ!",
    activeCodeLine: [13,14,15,16,17]
  },
  {
    currentNode: 1, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:1,6:3,2:1,3:5,4:5,5:5}, stack: [0,1], bridges: ["1-6", "2-3"],
    activeEdge: null, backEdge: null,
    log: "Возврат C→B. low[B]=min(low[B],low[C])=1. (B,C) — не мост.",
    activeCodeLine: [11,13,16,17]
  },
  {
    currentNode: 0, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:1,6:3,2:1,3:5,4:5,5:5}, stack: [0], bridges: ["1-6", "2-3"],
    activeEdge: null, backEdge: null,
    log: "Возврат B→A. DFS завершён! Мосты: (B,G) и (C,D).",
    activeCodeLine: [11,13,16,17,18]
  },
  {
    currentNode: null, visitedIndices: [0,1,6,2,3,4,5],
    tin: {0:1,1:2,6:3,2:4,3:5,4:6,5:7}, low: {0:1,1:1,6:3,2:1,3:5,4:5,5:5}, stack: [], bridges: ["1-6", "2-3"],
    activeEdge: null, backEdge: null,
    log: "Готово! Найдены мосты: (B,G) и (C,D). Алгоритм O(V+E) отработал.",
    activeCodeLine: []
  },
];

export function DfsBridgesSimulator() {
  const [dfsIdx, setDfsIdx] = useState(0);
  useVizStepSync(dfsIdx, setDfsIdx, DFS_STEPS.length - 1, (vars) => {
    const rawV = vizString(vars.v) ?? (vizNumber(vars.v)?.toString() ?? null);
    const rawTo = vizString(vars.to) ?? (vizNumber(vars.to)?.toString() ?? null);
    const toId = (value: string | null) => {
      if (value === null) return null;
      const byLabel = GRAPH_NODES.find((node) => node.label === value)?.id;
      return byLabel ?? (Number.isFinite(Number(value)) ? Number(value) : null);
    };
    const v = toId(rawV);
    const to = toId(rawTo);
    if (v === null) return null;
    const candidates = DFS_STEPS
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.currentNode === v && (to === null || step.activeEdge?.includes(to)));
    return candidates.at(-1)?.index ?? null;
  });
  const [dfsAuto, setDfsAuto] = useState(false);
  const dfsTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (dfsAuto) {
      dfsTimer.current = setInterval(() => {
        setDfsIdx(prev => {
          if (prev >= DFS_STEPS.length - 1) { setDfsAuto(false); return prev; }
          return prev + 1;
        });
      }, 2500);
    }
    return () => { if (dfsTimer.current) clearInterval(dfsTimer.current); };
  }, [dfsAuto]);

  const step = DFS_STEPS[dfsIdx];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-white">DFS: Визуализатор с кодом</h4>
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button onClick={() => { setDfsAuto(false); setDfsIdx(i => Math.max(0,i-1)); }}
            disabled={dfsIdx === 0}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30">
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDfsAuto(!dfsAuto)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
              dfsAuto ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
            }`}>
            {dfsAuto ? <><Pause className="h-3 w-3" /> Пауза</> : <><Play className="h-3 w-3" /> Авто</>}
          </button>
          <button onClick={() => { setDfsAuto(false); setDfsIdx(i => Math.min(DFS_STEPS.length-1,i+1)); }}
            disabled={dfsIdx === DFS_STEPS.length-1}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setDfsAuto(false); setDfsIdx(0); }}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Graph visualization */}
        <div className="md:col-span-3 bg-slate-950 rounded-xl p-3 border border-slate-800 min-h-[300px] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <svg className="w-full h-[280px] z-10 relative" viewBox="0 0 380 380">
            {GRAPH_EDGES.map(e => {
              const u = GRAPH_NODES.find(n => n.id === e.u)!;
              const v = GRAPH_NODES.find(n => n.id === e.v)!;
              const bridge = step.bridges.includes(e.key) || step.bridges.includes(`${e.v}-${e.u}`);
              const activeTree = step.activeEdge && (
                (step.activeEdge[0]===e.u && step.activeEdge[1]===e.v) ||
                (step.activeEdge[0]===e.v && step.activeEdge[1]===e.u)
              );
              const activeBack = step.backEdge && (
                (step.backEdge[0]===e.u && step.backEdge[1]===e.v) ||
                (step.backEdge[0]===e.v && step.backEdge[1]===e.u)
              );
              let sc = "#475569", sw = 2, dash = "none";
              if (bridge) { sc = "#eab308"; sw = 4; }
              else if (activeTree) { sc = "#10b981"; sw = 4; }
              else if (activeBack) { sc = "#f43f5e"; sw = 3; dash = "4 4"; }
              else if (step.visitedIndices.includes(e.u) && step.visitedIndices.includes(e.v)) { sc = "#334155"; }
              return <line key={e.key} x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                stroke={sc} strokeWidth={sw} strokeDasharray={dash}
                className="transition-all duration-500" />;
            })}
            {step.currentNode !== null && step.currentNode >= 0 && (() => {
              const n = GRAPH_NODES.find(x => x.id === step.currentNode);
              if (!n) return null;
              return <circle cx={n.x} cy={n.y} r={18} fill="none" stroke="#10b981" strokeWidth={1.5} className="animate-ping opacity-50" />;
            })()}
            {GRAPH_NODES.map(n => {
              const cur = step.currentNode === n.id;
              const vis = step.visitedIndices.includes(n.id);
              const st = step.stack.includes(n.id);
              return <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={12}
                  fill={cur ? "#10b981" : st ? "#064e3b" : vis ? "#1e293b" : "#0f172a"}
                  stroke={cur ? "#fff" : st ? "#34d399" : "#475569"}
                  strokeWidth={2.5}
                  className="transition-all duration-300" />
                <text x={n.x} y={n.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" className="pointer-events-none">{n.label}</text>
                {vis && (
                  <>
                    <rect x={n.x-18} y={n.y-28} width={36} height={12} rx={3} fill="#0f172a" stroke="#334155" strokeWidth={0.5} className="transition-all duration-300" />
                    <text x={n.x} y={n.y-20} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">t:{step.tin[n.id]||"?"} l:{step.low[n.id]||"?"}</text>
                  </>
                )}
              </g>;
            })}
          </svg>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>Шаг {dfsIdx+1}/{DFS_STEPS.length}</span>
            <div className="flex-1 mx-2 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-indigo-600 h-full transition-all duration-300" style={{width:`${((dfsIdx+1)/DFS_STEPS.length)*100}%`}}></div>
            </div>
          </div>
        </div>

        {/* Code panel + stack */}
        <div className="md:col-span-2 space-y-3">
          {/* Code panel */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-3 py-1.5 text-[10px] text-slate-400 font-mono border-b border-slate-800">find_bridges.cpp</div>
            <div className="p-2 overflow-x-auto">
              <pre className="text-[10px] font-mono leading-relaxed whitespace-pre">
                {CODE_LINES.map((cl, i) => {
                  const hl = step.activeCodeLine.includes(i);
                  return <div key={i}
                    className={`px-1 transition-all duration-300 ${
                      hl ? "bg-indigo-600/20 text-indigo-200 border-l-2 border-indigo-400" : "text-slate-500"
                    }`}>
                    <span className="text-slate-600 mr-2 select-none">{String(i+1).padStart(2,' ')}</span>
                    {cl.line || ' '}
                  </div>;
                })}
              </pre>
            </div>
          </div>
          
          {/* Stack */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
              <span>Стек DFS</span>
              <span className="text-indigo-400">{step.stack.length}</span>
            </div>
            <div className="flex flex-col-reverse gap-1 mt-2 min-h-[60px] bg-slate-950 p-2 rounded-lg border border-slate-800">
              {step.stack.length === 0
                ? <div className="text-[10px] text-slate-600 italic">пусто</div>
                : step.stack.map((id, i) => (
                    <div key={id} className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      i === step.stack.length-1
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>Вершина {GRAPH_NODES.find(n=>n.id===id)?.label} ({id})
                      <span className="text-slate-500 ml-1">t:{step.tin[id]||"?"} l:{step.low[id]||"?"}</span>
                    </div>
                  ))
              }
            </div>
          </div>
          
          {/* Log */}
          <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-xl p-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">{step.log}</p>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex justify-between text-[10px]">
              <span className="text-slate-400">Мосты:</span>
              <span className="font-mono font-bold text-amber-400">
                {step.bridges.length > 0 ? step.bridges.map(b=>`(${b})`).join(', ') : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
