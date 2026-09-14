import { useState, useEffect, useMemo } from 'react';
import { useVizStepSync, vizArray, vizString } from '../data/vizStepBus';
import { Play, Pause, SkipForward, Undo, RefreshCw } from 'lucide-react';

type Node = { id: string; label: string; x: number; y: number };
type Edge = { u: string; v: string };

const nodes: Node[] = [
    { id: 'A', label: 'A', x: 200, y: 40 },
    { id: 'B', label: 'B', x: 100, y: 120 },
    { id: 'C', label: 'C', x: 300, y: 120 },
    { id: 'D', label: 'D', x: 50, y: 200 },
    { id: 'E', label: 'E', x: 150, y: 200 },
    { id: 'F', label: 'F', x: 250, y: 200 },
    { id: 'G', label: 'G', x: 350, y: 200 },
];

const edges: Edge[] = [
    { u: 'A', v: 'B' }, { u: 'A', v: 'C' },
    { u: 'B', v: 'D' }, { u: 'B', v: 'E' },
    { u: 'C', v: 'F' }, { u: 'C', v: 'G' },
];

const adj: Record<string, string[]> = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F', 'G'],
    'D': ['B'],
    'E': ['B'],
    'F': ['C'],
    'G': ['C'],
};

type Action = {
    type: 'visit' | 'process' | 'backtrack';
    node: string;
    desc: string;
    queueOrStack?: string[];
    visitedNodes?: string[];
};

function generateDFSSteps(start: string) {
    const steps: Action[] = [];
    const vis = new Set<string>();
    const stack: string[] = []; // for visualization, just the call stack

    function dfs(v: string) {
        vis.add(v);
        stack.push(v);
        steps.push({ type: 'visit', node: v, desc: `Зашли в ${v}. Идем вглубь первой непосещенной вершины!`, queueOrStack: [...stack], visitedNodes: Array.from(vis) });

        for (const u of adj[v]) {
            if (!vis.has(u)) {
                steps.push({ type: 'process', node: v, desc: `Из ${v} видим соседа ${u}. Он не посещен, ныряем в него!`, queueOrStack: [...stack], visitedNodes: Array.from(vis) });
                dfs(u);
            }
        }
        
        stack.pop();
        steps.push({ type: 'backtrack', node: v, desc: `Для ${v} все соседи проверены. Делаем шаг назад из тупика (выходим из ${v}).`, queueOrStack: [...stack], visitedNodes: Array.from(vis) });
    }

    dfs(start);
    return steps;
}

function generateBFSSteps(start: string) {
    const steps: Action[] = [];
    const vis = new Set<string>();
    const q: string[] = [];

    q.push(start);
    vis.add(start);
    steps.push({ type: 'visit', node: start, desc: `Начинаем с ${start}. Добавляем в очередь.`, queueOrStack: [...q], visitedNodes: [...Array.from(vis)] });

    while (q.length > 0) {
        const v = q[0];
        steps.push({ type: 'process', node: v, desc: `Достаем ${v} из очереди. Осматриваем всех его соседей (волна!).`, queueOrStack: [...q], visitedNodes: [...Array.from(vis)] });
        q.shift();
        
        for (const u of adj[v]) {
            if (!vis.has(u)) {
                vis.add(u);
                q.push(u);
                steps.push({ type: 'visit', node: u, desc: `Нашли ${u} через ${v}. Помечаем посещенным, ставим в конец очереди.`, queueOrStack: [...q], visitedNodes: [...Array.from(vis)] });
            }
        }
    }
    
    steps.push({ type: 'backtrack', node: '', desc: `Очередь пуста. Волна обошла весь граф!`, queueOrStack: [], visitedNodes: [...Array.from(vis)] });

    return steps;
}


export function GraphTraversalViz() {
    const [mode, setMode] = useState<"dfs" | "bfs">("dfs");
    const [autoPlay, setAutoPlay] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);

    const steps = useMemo(() => mode === 'dfs' ? generateDFSSteps('A') : generateBFSSteps('A'), [mode]);
    useVizStepSync(stepIdx, setStepIdx, steps.length - 1, (vars) => {
      const v = vizString(vars.v);
      const structure = vizArray(vars.stack) ?? vizArray(vars.q);
      const visited = vizArray(vars.visited);
      if (v === null && !structure && !visited) return null;
      const candidates = steps
        .map((step, index) => ({ step, index }))
        .filter(({ step }) =>
          (v === null || step.node === v) &&
          (!structure || step.queueOrStack?.length === structure.length) &&
          (!visited || step.visitedNodes?.length === visited.length)
        );
      return candidates.at(-1)?.index ?? null;
    });

    useEffect(() => {
        setStepIdx(0);
        setAutoPlay(false);
    }, [mode]);

    useEffect(() => {
        if (autoPlay) {
            const t = setInterval(() => {
                setStepIdx(p => {
                    if (p >= steps.length - 1) {
                        setAutoPlay(false);
                        return p;
                    }
                    return p + 1;
                });
            }, 1200);
            return () => clearInterval(t);
        }
    }, [autoPlay, steps.length]);

    const step = steps[stepIdx] || steps[0];

    const isVisited = (nodeId: string) => step.visitedNodes?.includes(nodeId) || false;
    const isCurrent = (nodeId: string) => step.node === nodeId;

    return (
        <div className="space-y-4">
             <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1.5 w-max">
                <button onClick={() => setMode("dfs")}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${mode === "dfs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-300"}`}>
                    DFS (В глубину)
                </button>
                <button onClick={() => setMode("bfs")}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${mode === "bfs" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-300"}`}>
                    BFS (В ширину / Волна)
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* SVG Graph View */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                     <svg className="w-full h-full max-w-[400px] overflow-visible" viewBox="0 0 400 250">
                        {/* Edges */}
                        {edges.map((e, i) => {
                            const u = nodes.find(n => n.id === e.u)!;
                            const v = nodes.find(n => n.id === e.v)!;
                            // Check if edge is part of traversal
                            const edgeTraversed = isVisited(u.id) && isVisited(v.id);
                            
                            return (
                                <line key={i} x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                                      className={`stroke-2 transition-all duration-500 ${edgeTraversed ? (mode === 'dfs' ? 'stroke-indigo-500' : 'stroke-emerald-500') : 'stroke-slate-700'}`} />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map(n => {
                            const visited = isVisited(n.id);
                            const current = isCurrent(n.id);
                            
                            let fillColor = "fill-slate-800";
                            let strokeColor = "stroke-slate-600";
                            let textColor = "fill-slate-400";
                            let radius = 18;

                            if (visited) {
                                fillColor = mode === 'dfs' ? "fill-indigo-900" : "fill-emerald-900";
                                strokeColor = mode === 'dfs' ? "stroke-indigo-500" : "stroke-emerald-500";
                                textColor = "fill-white";
                            }
                            
                            if (current && step.type !== 'backtrack') {
                                strokeColor = "stroke-amber-400";
                                textColor = "fill-amber-400";
                                radius = 22;
                            }

                            return (
                                <g key={n.id} className="transition-all duration-300">
                                    <circle cx={n.x} cy={n.y} r={radius} 
                                        className={`stroke-2 ${fillColor} ${strokeColor} transition-all duration-300`} />
                                    <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" 
                                        className={`text-sm font-bold font-mono ${textColor} transition-colors duration-300`}>
                                        {n.label}
                                    </text>
                                    
                                    {/* Ripple for BFS wave */}
                                    {current && mode === 'bfs' && (
                                         <circle cx={n.x} cy={n.y} r={radius + 10} 
                                         className="stroke-2 fill-emerald-500/20 stroke-emerald-500 animate-ping opacity-50" />
                                    )}
                                </g>
                            )
                        })}
                     </svg>
                </div>

                {/* Structure View (Stack / Queue) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full md:w-64 flex flex-col pt-6 relative items-center">
                   <div className={`absolute -top-3 left-4 text-xs px-3 py-1 rounded-full font-bold uppercase shadow-md
                                  ${mode === 'dfs' ? 'bg-indigo-900 text-indigo-300 border border-indigo-500' : 'bg-emerald-900 text-emerald-300 border border-emerald-500'}`}>
                         {mode === 'dfs' ? 'Стек вызовов' : 'Очередь (FIFO)'}
                   </div>
                   
                   <div className="flex flex-col gap-2 w-full mt-4 flex-1 justify-end">
                       {step.queueOrStack && step.queueOrStack.map((item, idx) => (
                           <div key={idx} className={`w-full py-2 text-center text-sm font-bold font-mono rounded border
                                ${mode === 'dfs' ? 'bg-indigo-950 border-indigo-800 text-indigo-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'}
                                ${idx === (mode === 'dfs' ? step.queueOrStack!.length-1 : 0) ? 'border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}
                           `}>
                               Узел: {item}
                               {idx === (mode === 'dfs' ? step.queueOrStack!.length-1 : 0) && (
                                   <span className="ml-2 text-xs opacity-70">← {mode==='dfs' ? 'Топ' : 'Фронт'}</span>
                               )}
                           </div>
                       ))}
                       {(!step.queueOrStack || step.queueOrStack.length === 0) && (
                           <div className="text-slate-500 text-center italic text-sm py-4">Пусто</div>
                       )}
                   </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* Controls */}
                <div className="flex bg-slate-900 border border-slate-800 p-2 rounded-xl justify-center shadow-lg gap-1 shrink-0">
                    <button onClick={() => {setAutoPlay(false); setStepIdx(i => Math.max(0, i - 1));}} disabled={stepIdx === 0} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                        <Undo strokeWidth={3} size={16} />
                    </button>
                    <button onClick={() => setAutoPlay(!autoPlay)} className={`px-4 py-2 text-white rounded-lg font-bold flex items-center justify-center min-w-[80px] ${mode === 'dfs' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        {autoPlay ? <><Pause size={16} className="mr-1"/> Пауза</> : <><Play size={16} className="mr-1"/> Авто</>}
                    </button>
                    <button onClick={() => {setAutoPlay(false); setStepIdx(i => Math.min(steps.length - 1, i + 1));}} disabled={stepIdx === steps.length - 1} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                        <SkipForward strokeWidth={3} size={16} />
                    </button>
                    <button onClick={() => {setAutoPlay(false); setStepIdx(0);}} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg ml-2 border-l border-slate-800">
                        <RefreshCw strokeWidth={3} size={16} />
                    </button>
                </div>
                
                {/* Description Log */}
                <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-1 uppercase">Лог выполнения [Шаг {stepIdx + 1}/{steps.length}]</div>
                    <div className="text-sm text-slate-200 font-medium leading-relaxed relative z-10">
                        {step.desc}
                    </div>
                </div>
            </div>
        </div>
    );
}
