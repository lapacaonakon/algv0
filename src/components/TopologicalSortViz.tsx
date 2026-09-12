import React, { useState, useEffect } from "react";
import { useVizStepSync, vizArray, vizNumber } from '../data/vizStepBus';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
} from "lucide-react";

interface TNode {
  id: number;
  x: number;
  y: number;
  label: string;
  name: string;
}

interface TEdge {
  u: number;
  v: number;
}

const dagNodes: TNode[] = [
  { id: 0, x: 100, y: 150, label: "0", name: "Матан 1 (Основы)" },
  { id: 1, x: 280, y: 70, label: "1", name: "Дискретка" },
  { id: 2, x: 280, y: 230, label: "2", name: "Линейный Алгебраический" },
  { id: 3, x: 460, y: 150, label: "3", name: "Алгоритмы и Структуры" },
  { id: 4, x: 640, y: 150, label: "4", name: "Машинное Обучение" },
];

const dagEdges: TEdge[] = [
  { u: 0, v: 1 },
  { u: 0, v: 2 },
  { u: 1, v: 3 },
  { u: 2, v: 3 },
  { u: 3, v: 4 },
];

interface TStep {
  desc: string;
  visited: Set<number>;
  fullyProcessed: Set<number>;
  currentNode: number | null;
  topoList: number[];
  dfsStack: number[];
}

export const TopologicalSortViz: React.FC = () => {
  const [steps, setSteps] = useState<TStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  useVizStepSync(currentStepIdx, setCurrentStepIdx, steps.length - 1, (vars) => {
    const v = vizNumber(vars.v);
    const orderLength = vizArray(vars.order)?.length;
    if (v === null && orderLength === undefined) return null;
    const candidates = steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => (v === null || step.currentNode === v) && (orderLength === undefined || step.topoList.length === orderLength));
    return candidates.at(-1)?.index ?? null;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const listSteps: TStep[] = [];
    const visited = new Set<number>();
    const fullyProcessed = new Set<number>();
    const topoList: number[] = [];
    const dfsStack: number[] = [];

    const recordStep = (desc: string, currentNode: number | null) => {
      listSteps.push({
        desc,
        visited: new Set(visited),
        fullyProcessed: new Set(fullyProcessed),
        currentNode,
        topoList: [...topoList],
        dfsStack: [...dfsStack],
      });
    };

    recordStep(
      "Начало топологической сортировки. Используем классический DFS c обходом вершин post-order.",
      null,
    );

    // Adj list
    const adj: number[][] = Array.from({ length: 5 }, () => []);
    dagEdges.forEach((e) => adj[e.u].push(e.v));

    const dfs = (u: number) => {
      visited.add(u);
      dfsStack.push(u);
      recordStep(
        `DFS: зашли в вершину ${u} ("${dagNodes[u].name}"). Она стала серой (в процессе).`,
        u,
      );

      for (const to of adj[u]) {
        if (!visited.has(to)) {
          dfs(to);
        } else if (!fullyProcessed.has(to)) {
          // Explaining potential cycle detected (not in DAG but good for teaching)
          recordStep(
            `⚠️ Внимание: Рёбра в серую вершину ${to} означало бы цикл! Но в DAGе циклов нет.`,
            u,
          );
        }
      }

      fullyProcessed.add(u);
      dfsStack.pop();
      topoList.push(u); // prepend behavior: we write it, and reverse at the end
      recordStep(
        `DFS: закончили обработку '${dagNodes[u].name}'. Вершина стала чёрной. Добавляем в голову топологического результирующего списка.`,
        u,
      );
    };

    // Run DFS for all unvisited
    for (let i = 0; i < 5; i++) {
      if (!visited.has(i)) {
        recordStep(
          `Запускаем новый обход DFS от нетронутой вершины ${i} ("${dagNodes[i].name}").`,
          null,
        );
        dfs(i);
      }
    }

    recordStep(
      "Топологическая сортировка завершена! Полученный граф разложен по уровням зависимостей.",
      null,
    );
    setSteps(listSteps);
    setCurrentStepIdx(0);
  }, []);

  const step = steps[currentStepIdx] || {
    desc: "Запуск...",
    visited: new Set(),
    fullyProcessed: new Set(),
    currentNode: null,
    topoList: [],
    dfsStack: [],
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIdx < steps.length - 1) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, 1600);
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

  const getTopoListString = () => {
    return [...step.topoList]
      .reverse()
      .map((id) => dagNodes[id].name)
      .join(" ➔ ");
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-indigo-500 overflow-hidden shadow-xl my-6">
      <div className="bg-slate-800 p-4 border-b border-indigo-600/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Топологическая сортировка (Зависимости обучения)
        </h3>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-500 text-white"
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
            <defs>
              <marker
                id="dag-arrow"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
              </marker>
              <marker
                id="dag-arrow-active"
                viewBox="0 0 10 10"
                refX="24"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
            </defs>

            {/* Edges */}
            {dagEdges.map((edge, idx) => {
              const u = dagNodes.find((n) => n.id === edge.u)!;
              const v = dagNodes.find((n) => n.id === edge.v)!;

              const isActive =
                (step.currentNode === edge.u || step.currentNode === edge.v) &&
                step.visited.has(edge.v);

              return (
                <line
                  key={`edge-${idx}`}
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isActive ? "#818cf8" : "#334155"}
                  strokeWidth={isActive ? "3" : "2"}
                  markerEnd={`url(#${isActive ? "dag-arrow-active" : "dag-arrow"})`}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {dagNodes.map((node) => {
              const isCurrent = step.currentNode === node.id;
              const isVisited = step.visited.has(node.id);
              const isProcessed = step.fullyProcessed.has(node.id);

              let fill = "#1e293b";
              let stroke = "#334155";
              let textColor = "text-slate-400";
              void textColor;

              if (isCurrent) {
                fill = "#312e81";
                stroke = "#818cf8";
                textColor = "text-white font-bold";
              } else if (isProcessed) {
                fill = "#022c22";
                stroke = "#059669";
                textColor = "text-emerald-300";
              } else if (isVisited) {
                fill = "#3730a3";
                stroke = "#6366f1";
                textColor = "text-indigo-200";
              }

              return (
                <g key={node.id}>
                  <rect
                    x={node.x - 55}
                    y={node.y - 22}
                    width="110"
                    height="44"
                    rx="8"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11px"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    ({node.label}) {node.name.split(" ")[0]}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9px"
                    className="pointer-events-none"
                  >
                    {node.name.split(" ").slice(1).join(" ") || " "}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Console column */}
        <div className="lg:col-span-4 bg-slate-950 p-5 flex flex-col h-[380px] lg:h-auto border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
            Статус сортировки
          </h4>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded mb-3">
            <p className="text-xs text-indigo-300 min-h-[3.5rem] leading-relaxed">
              {step.desc}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Topological List output */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                РЕЗУЛЬТАТ (МАТРУТ ОБУЧЕНИЯ):
              </span>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px] font-medium min-h-[3rem] flex items-center pr-1 text-slate-300">
                {step.topoList.length === 0 ? (
                  <span className="text-slate-600 text-[11px]">
                    ожидаем обработку узлов...
                  </span>
                ) : (
                  getTopoListString()
                )}
              </div>
            </div>

            {/* Color key */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                ВЕРШИНЫ В DFS:
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-indigo-800 border border-indigo-500"></span>
                <span className="text-slate-400 text-[11px]">
                  Серые (зашли)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded bg-emerald-900 border border-emerald-600"></span>
                <span className="text-slate-400 text-[11px]">
                  Черные (готово)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Шаг {currentStepIdx + 1} из {steps.length}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => prev - 1)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2.5 py-1 rounded text-[11px] disabled:opacity-50 text-white"
              >
                Назад
              </button>
              <button
                disabled={currentStepIdx >= steps.length - 1}
                onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-2.5 py-1 rounded text-[11px] disabled:opacity-50 text-white"
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
