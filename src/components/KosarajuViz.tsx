import React, { useState, useEffect } from "react";
import { useVizStepSync, vizArray, vizNumber } from '../data/vizStepBus';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
} from "lucide-react";

interface GNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface GEdge {
  u: number;
  v: number;
}

const initialNodes: GNode[] = [
  { id: 0, x: 150, y: 100, label: "0" },
  { id: 1, x: 300, y: 100, label: "1" },
  { id: 2, x: 225, y: 220, label: "2" }, // 0->1->2->0 (First SCC)
  { id: 3, x: 450, y: 160, label: "3" },
  { id: 4, x: 600, y: 160, label: "4" }, // 3 <-> 4 (Second SCC)
];

const initialEdges: GEdge[] = [
  { u: 0, v: 1 },
  { u: 1, v: 2 },
  { u: 2, v: 0 },
  { u: 2, v: 3 }, // Connection edge
  { u: 3, v: 4 },
  { u: 4, v: 3 },
];

interface AlgoStep {
  phase: "init" | "dfs1" | "transpose" | "dfs2" | "finished";
  desc: string;
  visited: Set<number>;
  currentNode: number | null;
  order: number[];
  transposed: boolean;
  sccMap: Record<number, number>; // node -> sccId
  currentSccId: number;
  activeEdges: GEdge[];
}

export const KosarajuViz: React.FC = () => {
  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  useVizStepSync(currentStepIdx, setCurrentStepIdx, steps.length - 1, (vars) => {
    const v = vizNumber(vars.v);
    const orderLength = vizArray(vars.order)?.length;
    if (v === null && orderLength === undefined) return null;
    const candidates = steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => (v === null || step.currentNode === v) && (orderLength === undefined || step.order.length === orderLength));
    return candidates.at(-1)?.index ?? null;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Generate step-by-step Kosaraju steps
    const generatedSteps: AlgoStep[] = [];
    const visited = new Set<number>();
    const order: number[] = [];
    const sccMap: Record<number, number> = {};

    const recordStep = (
      phase: AlgoStep["phase"],
      desc: string,
      currentNode: number | null,
      transposed: boolean,
      currentSccId: number,
    ) => {
      generatedSteps.push({
        phase,
        desc,
        visited: new Set(visited),
        currentNode,
        order: [...order],
        transposed,
        sccMap: { ...sccMap },
        currentSccId,
        activeEdges: transposed
          ? initialEdges.map((e) => ({ u: e.v, v: e.u })) // Reversed
          : [...initialEdges],
      });
    };

    recordStep(
      "init",
      "Инициализация алгоритма Косарайю. Начинаем первый проход DFS для поиска порядка выхода.",
      null,
      false,
      -1,
    );

    // Adj list
    const adj: number[][] = Array.from({ length: 5 }, () => []);
    initialEdges.forEach((e) => adj[e.u].push(e.v));

    // DFS 1: post-order list
    const dfs1 = (u: number) => {
      visited.add(u);
      recordStep(
        "dfs1",
        `DFS 1: зашли в вершину ${u}, помечаем посещенной.`,
        u,
        false,
        -1,
      );

      for (const to of adj[u]) {
        if (!visited.has(to)) {
          dfs1(to);
        }
      }

      order.push(u);
      recordStep(
        "dfs1",
        `DFS 1: вершина ${u} полностью обработана. Записываем в стек выхода: [${[...order].reverse().join(", ")}]`,
        u,
        false,
        -1,
      );
    };

    // Run DFS1 on all unvisited
    for (let i = 0; i < 5; i++) {
      if (!visited.has(i)) {
        dfs1(i);
      }
    }

    const topoOrder = [...order].reverse();
    recordStep(
      "transpose",
      `Первый проход завершен! Стек выхода в топологическом порядке: [${topoOrder.join(", ")}]. Шаг 2: транспонируем (разворачиваем) все ребра.`,
      null,
      true,
      -1,
    );

    // Transpose adj
    const adjT: number[][] = Array.from({ length: 5 }, () => []);
    initialEdges.forEach((e) => adjT[e.v].push(e.u));

    // Reset visited for phase 2
    visited.clear();
    let sccId = 0;

    const dfs2 = (u: number, currentScc: number) => {
      visited.add(u);
      sccMap[u] = currentScc;
      recordStep(
        "dfs2",
        `DFS 2: заходим в ${u} на транспонированном графе. Вершина ${u} принадлежит SCC #${currentScc}.`,
        u,
        true,
        currentScc,
      );

      for (const to of adjT[u]) {
        if (!visited.has(to)) {
          dfs2(to, currentScc);
        }
      }
    };

    // Run DFS2 using the order (reversed from back to front)
    for (let i = order.length - 1; i >= 0; i--) {
      const u = order[i];
      if (!visited.has(u)) {
        sccId++;
        recordStep(
          "dfs2",
          `DFS 2: берем следующую непосещенную из стека: ${u}. Открываем новую компоненту SCC #${sccId}.`,
          u,
          true,
          sccId,
        );
        dfs2(u, sccId);
      } else {
        recordStep(
          "dfs2",
          `DFS 2: вершина ${u} из стека уже покрашена в SCC #${sccMap[u]}. Пропускаем.`,
          u,
          true,
          sccId,
        );
      }
    }

    recordStep(
      "finished",
      `Алгоритм успешно завершен! Найдено ${sccId} компонент сильной связи (SCC): SCC#1 {0, 1, 2} и SCC#2 {3, 4}.`,
      null,
      true,
      sccId,
    );

    setSteps(generatedSteps);
    setCurrentStepIdx(0);
  }, []);

  const step = steps[currentStepIdx] || {
    phase: "init",
    desc: "Загрузка...",
    visited: new Set(),
    currentNode: null,
    order: [],
    transposed: false,
    sccMap: {},
    currentSccId: -1,
    activeEdges: initialEdges,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < steps.length - 1) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 1500);
    } else {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIdx, steps.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const getSccColor = (id: number) => {
    if (id === 1) return "fill-emerald-600 stroke-emerald-400";
    if (id === 2) return "fill-indigo-600 stroke-indigo-400";
    return "fill-slate-800 stroke-slate-500";
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-emerald-500 overflow-hidden shadow-xl my-6">
      <div className="bg-slate-800 p-4 border-b border-emerald-600/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Визуализатор Алгоритма Косарайю (Поиск SCC)
        </h3>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 ml-1" />
            ) : (
              <Play className="w-4 h-4 ml-1" />
            )}
            {isPlaying ? "Пауза " : "Старт "}
          </button>

          <button
            onClick={reset}
            className="flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Playfield SVG */}
        <div className="lg:col-span-8 bg-[#0B1120] relative h-[380px] w-full flex items-center justify-center">
          <svg className="w-full h-full max-w-[650px]" viewBox="0 0 750 320">
            {/* Markers for directed arrows */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-transposed"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
              </marker>
            </defs>

            {/* Edges */}
            {initialEdges.map((edge, idx) => {
              const u = initialNodes.find((n) => n.id === edge.u)!;
              const v = initialNodes.find((n) => n.id === edge.v)!;

              // If transposed, draw reversed coordinates
              const x1 = step.transposed ? v.x : u.x;
              const y1 = step.transposed ? v.y : u.y;
              const x2 = step.transposed ? u.x : v.x;
              const y2 = step.transposed ? u.y : v.y;

              const isSccEdge =
                step.sccMap[edge.u] &&
                step.sccMap[edge.v] &&
                step.sccMap[edge.u] === step.sccMap[edge.v];
              let stroke = "#475569";
              let markerId = "arrow";

              if (step.transposed) {
                stroke = isSccEdge ? "#818cf8" : "#4f46e5";
                markerId = "arrow-transposed";
              } else {
                if (
                  step.currentNode === edge.u ||
                  step.currentNode === edge.v
                ) {
                  stroke = "#10b981";
                  markerId = "arrow-active";
                }
              }

              // Adjust slightly for bidirectional link (3<->4)
              const isBidi =
                (edge.u === 3 && edge.v === 4) ||
                (edge.u === 4 && edge.v === 3);
              const dy = isBidi ? (edge.u === 3 ? -10 : 10) : 0;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={x1}
                  y1={y1 + dy}
                  x2={x2}
                  y2={y2 + dy}
                  stroke={stroke}
                  strokeWidth="2.5"
                  markerEnd={`url(#${markerId})`}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {initialNodes.map((node) => {
              const isCurrent = step.currentNode === node.id;
              const isVisited =
                step.visited.has(node.id) ||
                (step.phase === "dfs1" && step.currentNode === node.id);
              const sccId = step.sccMap[node.id];

              let classes = "fill-slate-800 stroke-slate-600";
              if (sccId) {
                classes = getSccColor(sccId);
              } else if (isCurrent) {
                classes = "fill-amber-600 stroke-amber-400";
              } else if (isVisited && step.phase === "dfs1") {
                classes = "fill-emerald-700 stroke-emerald-400";
              }

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    className={`transition-all duration-500 cursor-default ${classes}`}
                    strokeWidth="3"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    dy=".3em"
                    textAnchor="middle"
                    fill="white"
                    fontSize="13px"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {node.label}
                  </text>

                  {sccId && (
                    <text
                      x={node.x}
                      y={node.y - 28}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="10px"
                      fontWeight="bold"
                    >
                      SCC #{sccId}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {step.transposed && (
            <div className="absolute top-4 left-4 bg-indigo-900/80 border border-indigo-700 text-indigo-200 text-[11px] font-bold px-2 py-1 rounded">
              🔀 Граф транспонирован (Ребра обратные)
            </div>
          )}
        </div>

        {/* Logs & Stacks */}
        <div className="lg:col-span-4 bg-slate-950 p-5 flex flex-col h-[380px] lg:h-auto border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
            Порядок обхода и стек
          </h4>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded mb-4">
            <p className="text-xs text-white leading-relaxed min-h-[3rem]">
              {step.desc}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Top-Sort output / Order stack representation */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                СТЕК ВЫХОДА (DFS 1 ORDER):
              </span>
              <div className="flex flex-wrap gap-1 bg-slate-900/60 p-2.5 rounded border border-slate-800 min-h-[2.5rem] items-center">
                {step.order.length === 0 ? (
                  <span className="text-slate-600 text-xs">пусто</span>
                ) : (
                  [...step.order].reverse().map((val, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-950 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1"
                    >
                      {val}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* List of actions log */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1.5">
                ЛОГ ОПЕРАЦИЙ:
              </span>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                {steps
                  .slice(0, currentStepIdx + 1)
                  .reverse()
                  .slice(0, 5)
                  .map((s, idx) => (
                    <div
                      key={idx}
                      className={`text-[11px] p-1.5 rounded ${idx === 0 ? "bg-slate-800 text-slate-200" : "text-slate-500"}`}
                    >
                      {s.desc}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Шаг {currentStepIdx + 1} из {steps.length}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => prev - 1)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2 py-1 rounded text-[11px] disabled:opacity-50"
              >
                Назад
              </button>
              <button
                disabled={currentStepIdx >= steps.length - 1}
                onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2 py-1 rounded text-[11px] disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
