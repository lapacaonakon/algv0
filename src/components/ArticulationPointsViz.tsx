import React, { useState, useEffect } from "react";
import { useVizStepSync } from '../data/vizStepBus';
import { Play, Pause, RotateCcw, Info } from "lucide-react";

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  u: number;
  v: number;
}

const nodes: Node[] = [
  { id: 0, x: 250, y: 50, label: "0" },
  { id: 1, x: 100, y: 150, label: "1" },
  { id: 2, x: 250, y: 250, label: "2" },
  { id: 3, x: 400, y: 150, label: "3" },
  { id: 4, x: 550, y: 150, label: "4" },
  { id: 5, x: 700, y: 50, label: "5" },
  { id: 6, x: 700, y: 250, label: "6" },
];

const edges: Edge[] = [
  { u: 0, v: 1 },
  { u: 1, v: 2 },
  { u: 2, v: 0 },
  { u: 2, v: 3 },
  { u: 3, v: 4 }, // 3 and 4 are articulation points (3 is right before the bridge, 4 is right after)
  { u: 4, v: 5 },
  { u: 5, v: 6 },
  { u: 6, v: 4 },
];

// Adjacency list
const adj: number[][] = Array.from(
  { length: Object.keys(nodes).length },
  () => [],
);
edges.forEach((e) => {
  adj[e.u].push(e.v);
  adj[e.v].push(e.u);
});

interface StepInfo {
  desc: string;
  visited: Set<number>;
  ap: Set<number>;
  currentNode: number | null;
  tin: number[];
  low: number[];
}

export const ArticulationPointsViz: React.FC = () => {
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  useVizStepSync(currentStepIndex, setCurrentStepIndex, steps.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const newSteps: StepInfo[] = [];
    let timer = 0;
    const visited = new Set<number>();
    const ap = new Set<number>();
    const currentTin = Array(nodes.length).fill(-1);
    const currentLow = Array(nodes.length).fill(-1);

    const recordStep = (desc: string, u: number | null) => {
      newSteps.push({
        desc,
        visited: new Set(visited),
        ap: new Set(ap),
        currentNode: u,
        tin: [...currentTin],
        low: [...currentLow],
      });
    };

    recordStep("Начало DFS (Тарьян) для поиска точек сочленения.", null);

    const dfs = (v: number, p: number = -1) => {
      visited.add(v);
      currentTin[v] = currentLow[v] = timer++;
      let children = 0;

      recordStep(`Заходим в вершину ${v}. tin[${v}]=${currentTin[v]}`, v);

      for (const to of adj[v]) {
        if (to === p) continue;

        if (visited.has(to)) {
          currentLow[v] = Math.min(currentLow[v], currentTin[to]);
          recordStep(
            `Обратное ребро ${v}-${to}. Обновляем low[${v}] = min(low[${v}], tin[${to}]) = ${currentLow[v]}`,
            v,
          );
        } else {
          children++;
          dfs(to, v);
          currentLow[v] = Math.min(currentLow[v], currentLow[to]);

          recordStep(
            `Возврат в ${v} из ${to}. Обновляем low[${v}] = min(low[${v}], low[${to}]) = ${currentLow[v]}`,
            v,
          );

          if (currentLow[to] >= currentTin[v] && p !== -1) {
            ap.add(v);
            recordStep(
              `🚨 Найдена точка сочленения: вершина ${v}! Потому что low[${to}] (${currentLow[to]}) >= tin[${v}] (${currentTin[v]}).`,
              v,
            );
          }
        }
      }

      if (p === -1 && children > 1) {
        ap.add(v);
        recordStep(
          `🚨 Корень дерева DFS ${v} имеет >1 детей. Это тоже точка сочленения.`,
          v,
        );
      } else if (p === -1) {
        recordStep(
          `Корень дерева DFS ${v} имеет <=1 ребенка, он не точка сочленения.`,
          v,
        );
      }
    };

    for (let i = 0; i < nodes.length; i++) {
      if (!visited.has(i)) {
        dfs(i);
      }
    }

    recordStep("Алгоритм завершен. Найдены все точки сочленения.", null);
    setSteps(newSteps);
  }, []);

  const currentStep = steps[currentStepIndex] || {
    desc: "",
    visited: new Set(),
    ap: new Set(),
    currentNode: null,
    tin: [],
    low: [],
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 1500);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-rose-500 overflow-hidden shadow-xl my-6">
      <div className="bg-slate-800 p-4 border-b border-rose-600/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-rose-400" />
          Моделирование поиска точек сочленения
        </h3>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-rose-600 hover:bg-rose-500 text-white"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 relative h-96 lg:h-[500px] w-full bg-[#0B1120]">
          <svg className="w-full h-full" viewBox="0 0 800 350">
            {/* Edges */}
            {edges.map((edge, i) => {
              const u = nodes.find((n) => n.id === edge.u)!;
              const v = nodes.find((n) => n.id === edge.v)!;

              const isBridge =
                (edge.u === 3 && edge.v === 4) ||
                (edge.u === 4 && edge.v === 3);

              return (
                <line
                  key={"edge-" + i}
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isBridge ? "#f43f5e" : "#475569"}
                  strokeWidth={isBridge ? "4" : "2"}
                  strokeDasharray={isBridge ? "8,4" : "none"}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isCurrent = currentStep.currentNode === node.id;
              const isVisited = currentStep.visited.has(node.id);
              const isAp = currentStep.ap.has(node.id);

              const fill = isCurrent
                ? "#3b82f6"
                : isAp
                  ? "#e11d48"
                  : isVisited
                    ? "#10b981"
                    : "#1e293b";
              const stroke = isCurrent
                ? "#60a5fa"
                : isAp
                  ? "#f43f5e"
                  : isVisited
                    ? "#34d399"
                    : "#334155";
              const r = isAp ? 24 : 20;

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="3"
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    dy=".3em"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14px"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {isVisited && (
                    <>
                      <text
                        x={node.x}
                        y={node.y - r - 15}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10px"
                      >
                        tin:{" "}
                        {currentStep.tin[node.id] >= 0
                          ? currentStep.tin[node.id]
                          : "-"}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + r + 20}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10px"
                      >
                        low:{" "}
                        {currentStep.low[node.id] >= 0
                          ? currentStep.low[node.id]
                          : "-"}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="bg-slate-950 p-6 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full overflow-hidden">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
            Статус алгоритма
          </h4>

          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-lg mb-4 shadow-inner">
            <p className="text-white font-medium min-h-[3rem]">
              {currentStep.desc}
            </p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="mb-4">
              <h5 className="text-xs text-slate-500 font-bold mb-2">ЛЕГЕНДА</h5>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400"></div>{" "}
                Точка сочленения
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400"></div>{" "}
                Посещена
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-400"></div>{" "}
                Текущая
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <div className="w-8 h-1 bg-rose-500 border-dashed border-t"></div>{" "}
                Мост
              </div>
            </div>

            <div>
              <h5 className="text-xs text-slate-500 font-bold mb-2">
                ЛОГ ДЕЙСТВИЙ:
              </h5>
              <div className="space-y-2">
                {steps
                  .slice(0, currentStepIndex + 1)
                  .reverse()
                  .map((step, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded ${idx === 0 ? "bg-slate-800 text-white font-medium border-l-2 border-rose-500" : "text-slate-500"}`}
                    >
                      {step.desc}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="mt-4 shrink-0">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{
                  width: `${(currentStepIndex / Math.max(1, steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
