import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

const NODES = [
  { id: 0, label: '0', x: 300, y: 50 },
  { id: 1, label: '1', x: 150, y: 150 },
  { id: 2, label: '2', x: 450, y: 150 },
  { id: 3, label: '3', x: 75,  y: 250 },
  { id: 4, label: '4', x: 225, y: 250 },
  { id: 5, label: '5', x: 375, y: 250 },
  { id: 6, label: '6', x: 525, y: 250 },
];

const EDGES = [
  { from: 0, to: 1 }, { from: 0, to: 2 },
  { from: 1, to: 3 }, { from: 1, to: 4 },
  { from: 2, to: 5 }, { from: 2, to: 6 }
];

const ADJ: { [key: number]: number[] } = {
  0: [1, 2], 1: [3, 4], 2: [5, 6], 3: [], 4: [], 5: [], 6: []
};

interface Step {
  activeLine: number;
  queue: number[];
  visited: number[];
  currentNode: number | null;
  logs: string;
}

const generateBfsSteps = (): Step[] => {
  const steps: Step[] = [];
  const queue: number[] = [];
  const visited = new Set<number>();
  
  // Init
  steps.push({
    activeLine: 1,
    queue: [],
    visited: [],
    currentNode: null,
    logs: "Инициализация: начинаем с корня (0)."
  });

  queue.push(0);
  visited.add(0);
  steps.push({
    activeLine: 2,
    queue: [...queue],
    visited: Array.from(visited),
    currentNode: null,
    logs: "Добавляем стартовую вершину 0 в очередь и помечаем посещенной."
  });

  while (queue.length > 0) {
    steps.push({
      activeLine: 4,
      queue: [...queue],
      visited: Array.from(visited),
      currentNode: null,
      logs: `Очередь не пуста, элементов: ${queue.length}.`
    });

    const curr = queue.shift()!;
    steps.push({
      activeLine: 5,
      queue: [...queue],
      visited: Array.from(visited),
      currentNode: curr,
      logs: `Достаем из очереди (${curr}).`
    });

    const neighbors = ADJ[curr];
    if (neighbors.length > 0) {
      for (const n of neighbors) {
        if (!visited.has(n)) {
          steps.push({
            activeLine: 7,
            queue: [...queue],
            visited: Array.from(visited),
            currentNode: curr,
            logs: `Рассматриваем соседа: ${n}. Он еще не посещен.`
          });
          
          visited.add(n);
          queue.push(n);
          
          steps.push({
            activeLine: 9,
            queue: [...queue],
            visited: Array.from(visited),
            currentNode: curr,
            logs: `Помечаем ${n} как посещенную и добавляем в очередь.`
          });
        }
      }
    } else {
        steps.push({
            activeLine: 6,
            queue: [...queue],
            visited: Array.from(visited),
            currentNode: curr,
            logs: `Соседей нет или все уже посещены.`
        });
    }
  }

  steps.push({
    activeLine: 12,
    queue: [],
    visited: Array.from(visited),
    currentNode: null,
    logs: "Очередь пуста. Алгоритм завершен!"
  });

  return steps;
};

const STEPS = generateBfsSteps();

export default function BfsViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = STEPS[stepIdx];

  const handleNext = useCallback(() => {
    setStepIdx(prev => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setStepIdx(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIdx >= STEPS.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(handleNext, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIdx, handleNext]);

  return (
    <div className="bg-slate-900 border-2 border-slate-700/60 rounded-2xl p-6 shadow-2xl my-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">🌐</span> Алгоритм BFS (Обход в ширину)
          </h3>
          <p className="text-slate-400 text-sm mt-1">Визуализация слоевого обхода графа через Очередь.</p>
        </div>
        <div className="flex bg-slate-800 p-1.5 rounded-lg border border-slate-700 shadow-inner">
          <button
            onClick={() => { setIsPlaying(false); setStepIdx(0); }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Сброс"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition-colors"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={handleNext}
            disabled={stepIdx >= STEPS.length - 1}
            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Шаг вперед"
          >
            <StepForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Визуал графа */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[350px]">
          <svg className="w-full h-full min-h-[350px]" viewBox="0 0 600 350">
            {/* Рёбра */}
            {EDGES.map((e, idx) => {
              const n1 = NODES.find(n => n.id === e.from)!;
              const n2 = NODES.find(n => n.id === e.to)!;
              const isVisited = step.visited.includes(n2.id); // Показываем как активное, если ребенок уже visited
              return (
                <line
                  key={idx}
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                  className={`transition-all duration-500 ${isVisited ? 'stroke-blue-500/80 stroke-[4px]' : 'stroke-slate-600 stroke-[2px]'}`}
                />
              );
            })}

            {/* Вершины */}
            {NODES.map(n => {
              const isCurrent = step.currentNode === n.id;
              const isInQueue = step.queue.includes(n.id);
              const isVisited = step.visited.includes(n.id);

              let fill = '#1e293b'; // slate-800
              let stroke = '#475569'; // slate-600
              let scale = 1;

              if (isCurrent) {
                fill = '#3b82f6'; // blue-500
                stroke = '#60a5fa'; // blue-400
                scale = 1.3;
              } else if (isInQueue) {
                fill = '#059669'; // emerald-600
                stroke = '#34d399'; // emerald-400
                scale = 1.1;
              } else if (isVisited) {
                fill = '#0f172a'; // slate-900
                stroke = '#3b82f6'; // blue-500
              }

              return (
                <g key={n.id} className="transition-transform duration-500 ease-out">
                  {isCurrent && (
                    <circle cx={n.x} cy={n.y} r="30" fill="#3b82f6" className="animate-ping opacity-20" />
                  )}
                  <circle
                    cx={n.x} cy={n.y}
                    r="20"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="3"
                    className="transition-colors duration-500"
                  />
                  <text
                    x={n.x} y={n.y}
                    textAnchor="middle"
                    dy=".3em"
                    className="fill-white font-bold text-sm select-none"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Код и Очередь */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden font-mono text-sm leading-6 flex-1 shadow-inner">
            <div className="bg-slate-800 text-slate-400 px-4 py-2 border-b border-slate-700 flex justify-between text-xs font-bold uppercase tracking-wider">
              <span>bfs(graph, start)</span>
              <span className="text-blue-400">Шаг {stepIdx + 1}/{STEPS.length}</span>
            </div>
            <div className="p-4">
              {[
                { line: 1, code: 'queue = Queue()' },
                { line: 2, code: 'queue.push(start); visited.add(start)' },
                { line: 3, code: '' },
                { line: 4, code: 'while not queue.isEmpty():' },
                { line: 5, code: '  node = queue.pop()' },
                { line: 6, code: '  for neighbor in graph[node]:' },
                { line: 7, code: '    if neighbor not in visited:' },
                { line: 8, code: '       visited.add(neighbor)' },
                { line: 9, code: '       queue.push(neighbor)' },
              ].map((cl) => {
                const isActive = step.activeLine === cl.line;
                return (
                  <div key={cl.line} className={`px-2 py-0.5 rounded transition-colors ${isActive ? 'bg-blue-500/20 text-blue-300 font-bold border-l-2 border-blue-400 -ml-0.5' : 'text-slate-400 border-l-2 border-transparent'}`}>
                    <span className="opacity-40 w-6 inline-block select-none">{cl.line}</span>
                    <span className="whitespace-pre">{cl.code}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-inner flex flex-col gap-2">
             <div className="text-sm font-bold text-emerald-400 flex items-center justify-between">
                <span>Состояние Очереди (Queue):</span>
                <span className="text-xs text-slate-500">← Выход (Head) | Вход (Tail) ←</span>
             </div>
             <div className="flex items-center gap-2 min-h-[44px] p-2 bg-slate-900 rounded-lg border border-slate-700/50 overflow-x-auto">
               {step.queue.length === 0 ? (
                 <span className="text-slate-500 text-xs italic tracking-wider mx-auto">ОЧЕРЕДЬ ПУСТА</span>
               ) : (
                 step.queue.map((qId, i) => (
                   <span key={`${qId}-${i}`} className="bg-emerald-600 border border-emerald-400 text-white font-bold w-8 h-8 flex items-center justify-center rounded-md shadow-lg shrink-0 animate-in fade-in zoom-in slide-in-from-right-4">
                     {qId}
                   </span>
                 ))
               )}
             </div>
             <div className="mt-2 text-sm text-amber-300/90 font-medium italic border-t border-slate-700/50 pt-2 text-center h-10 flex items-center justify-center">
               "{step.logs}"
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
