import { useState, useEffect } from 'react';
import { useVizRuntime, vizArray, vizNumber, vizRecord } from '../data/vizStepBus';
import { LiveDistTable } from './LiveDistTable';

interface GraphNode { id: number; x: number; y: number; name: string; }
interface GraphEdge { u: number; v: number; w: number; }

interface Step {
  x: number | null;
  checkingEdge: { u: number; v: number; w: number } | null;
  minWay: number[];
  seen: number[];
  pred?: number[];
  ostov?: [number, number, number][];
  queue?: number[];
  log: string;
}

export function CheatSheetViz() {
  const [activeTab, setActiveTab] = useState<'dexter' | 'prima' | 'bfs'>('dexter');

  const nodes: GraphNode[] = [
    { id: 0, x: 70, y: 150, name: '0 (Старт)' },
    { id: 1, x: 190, y: 70, name: '1' },
    { id: 2, x: 190, y: 230, name: '2' },
    { id: 3, x: 330, y: 70, name: '3' },
    { id: 4, x: 330, y: 230, name: '4' },
  ];

  const rawEdges: GraphEdge[] = [
    { u: 0, v: 1, w: 4 },
    { u: 0, v: 2, w: 2 },
    { u: 1, v: 2, w: 1 },
    { u: 1, v: 3, w: 5 },
    { u: 2, v: 3, w: 8 },
    { u: 2, v: 4, w: 10 },
    { u: 3, v: 4, w: 2 },
  ];

  const n = nodes.length;
  const adjList: { [key: number]: [number, number][] } = {};
  for (let i = 0; i < n; i++) adjList[i] = [];
  rawEdges.forEach(({ u, v, w }) => {
    adjList[u].push([v, w]);
    adjList[v].push([u, w]);
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const runtime = useVizRuntime();

  useEffect(() => {
    const simSteps: Step[] = [];

    if (activeTab === 'dexter') {
      const minWay = Array(n).fill(999);
      minWay[0] = 0;
      const seen = new Set<number>();

      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen),
        log: '🏁 Декстер: min_way[0] = 0, остальные ∞. Готовы искать вершины с мин. ПОЛНОЙ стоимостью пути.'
      });

      for (let iter = 0; iter < n; iter++) {
        let x = -1;
        for (let i = 0; i < n; i++) {
          if (!seen.has(i)) {
            if (x === -1 || minWay[i] < minWay[x]) x = i;
          }
        }
        if (x === -1 || minWay[x] === 999) break;

        seen.add(x);
        simSteps.push({
          x, checkingEdge: null,
          minWay: [...minWay], seen: Array.from(seen),
          log: `📍 Извлечена вершина x=${x} с min_way[${x}] = ${minWay[x]}. Фиксируем в seen.`
        });

        for (const [neighbor, w] of adjList[x]) {
          if (!seen.has(neighbor)) {
            simSteps.push({
              x, checkingEdge: { u: x, v: neighbor, w },
              minWay: [...minWay], seen: Array.from(seen),
              log: `👀 Проверяем ребро (${x} ➔ ${neighbor}, w=${w}). Сравниваем min_way[${x}] + ${w} = ${minWay[x] + w} с min_way[${neighbor}] = ${minWay[neighbor] === 999 ? '∞' : minWay[neighbor]}.`
            });

            if (minWay[x] + w < minWay[neighbor]) {
              minWay[neighbor] = minWay[x] + w;
              simSteps.push({
                x, checkingEdge: { u: x, v: neighbor, w },
                minWay: [...minWay], seen: Array.from(seen),
                log: `⚡ Улучшение (полный чек)! min_way[${neighbor}] = ${minWay[neighbor]}.`
              });
            }
          }
        }
      }
      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen),
        log: '✅ Декстер завершил работу. Найдены кратчайшие расстояния до всех вершин.'
      });
    } else if (activeTab === 'prima') {
      const minWay = Array(n).fill(999);
      minWay[0] = 0;
      const seen = new Set<number>();
      const pred = Array(n).fill(-1);
      const ostov: [number, number, number][] = [];

      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen), pred: [...pred], ostov: [...ostov],
        log: '🏁 Прима: min_way[0] = 0 (стоимость отдельного ребра), остальные ∞. Остов пуст.'
      });

      for (let iter = 0; iter < n; iter++) {
        let x = -1;
        for (let i = 0; i < n; i++) {
          if (!seen.has(i)) {
            if (x === -1 || minWay[i] < minWay[x]) x = i;
          }
        }
        if (x === -1 || minWay[x] === 999) break;

        seen.add(x);
        if (pred[x] !== -1) {
          ostov.push([pred[x], x, minWay[x]]);
        }

        simSteps.push({
          x, checkingEdge: null,
          minWay: [...minWay], seen: Array.from(seen), pred: [...pred], ostov: [...ostov],
          log: `📍 Вершина x=${x} присоединена к остову самым дешёвым ребром веса ${minWay[x]}.`
        });

        for (const [neighbor, w] of adjList[x]) {
          if (!seen.has(neighbor)) {
            simSteps.push({
              x, checkingEdge: { u: x, v: neighbor, w },
              minWay: [...minWay], seen: Array.from(seen), pred: [...pred], ostov: [...ostov],
              log: `👀 Проверяем укус ребра (${x} ➔ ${neighbor}, w=${w}). Сравниваем вес ребра ${w} с тек. min_way[${neighbor}] = ${minWay[neighbor] === 999 ? '∞' : minWay[neighbor]}.`
            });

            if (w < minWay[neighbor]) {
              minWay[neighbor] = w;
              pred[neighbor] = x;
              simSteps.push({
                x, checkingEdge: { u: x, v: neighbor, w },
                minWay: [...minWay], seen: Array.from(seen), pred: [...pred], ostov: [...ostov],
                log: `🥩 Следующий укус! min_way[${neighbor}] = ${w} (запомнили родителя pred[${neighbor}] = ${x}).`
              });
            }
          }
        }
      }
      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen), pred: [...pred], ostov: [...ostov],
        log: `✅ Прима завершила работу. Построено остовное дерево из ${ostov.length} рёбер.`
      });
    } else {
      // BFS
      const minWay = Array(n).fill(999);
      minWay[0] = 0;
      const seen = new Set<number>([0]);
      const queue = [0];

      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen), queue: [...queue],
        log: '🏁 BFS: min_way[0] = 0, очередь = [0]. Каждое ребро стоит ровно 1.'
      });

      while (queue.length > 0) {
        const x = queue.shift()!;
        simSteps.push({
          x, checkingEdge: null,
          minWay: [...minWay], seen: Array.from(seen), queue: [...queue],
          log: `🌊 Извлечена вершина x=${x} из очереди.`
        });

        for (const [neighbor, w] of adjList[x]) {
          if (!seen.has(neighbor)) {
            seen.add(neighbor);
            minWay[neighbor] = minWay[x] + 1;
            queue.push(neighbor);

            simSteps.push({
              x, checkingEdge: { u: x, v: neighbor, w },
              minWay: [...minWay], seen: Array.from(seen), queue: [...queue],
              log: `🌊 Волна накрывает соседа ${neighbor}: min_way[${neighbor}] = min_way[${x}] + 1 = ${minWay[neighbor]}.`
            });
          }
        }
      }
      simSteps.push({
        x: null, checkingEdge: null,
        minWay: [...minWay], seen: Array.from(seen), queue: [...queue],
        log: '✅ BFS завершил работу. Рассчитаны расстояния в шагах.'
      });
    }

    setSteps(simSteps);
    setStepIndex(0);
    setIsPlaying(false);
  }, [activeTab]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && stepIdx < steps.length - 1) {
      timer = setTimeout(() => setStepIndex((prev) => prev + 1), 1300);
    } else if (stepIdx >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIdx, steps.length]);

  const baseStep = steps[stepIdx] || null;
  const vars = runtime?.variables;

  // Compiler live vars
  const liveX = vizNumber(vars?.x);
  const liveMinWay = vizArray(vars?.min_way) ?? vizArray(vars?.dist);
  const liveSeen = vizArray(vars?.seen);
  const compilerLinked = liveX !== null || !!liveMinWay;

  const currentStep: Step = compilerLinked
    ? {
        x: liveX,
        checkingEdge: null,
        minWay: nodes.map((_, i) => vizNumber(liveMinWay?.[i]) ?? 999),
        seen: nodes.map((_, i) => i).filter((i) => liveSeen?.includes(i)),
        log: `Компилятор: x=${liveX ?? "—"}, min_way читается из Python.`,
      }
    : baseStep ?? { x: null, checkingEdge: null, minWay: Array(n).fill(999), seen: [], log: "" };

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      {/* Шапка и вкладки */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Тренажёр: Декстер vs Прима vs BFS</h3>
            <p className="text-sm text-indigo-300">Один граф, один список смежности <code>edges[x] = [(y, w), ...]</code></p>
          </div>
        </div>

        {/* Переключатель алгоритма */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('dexter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dexter' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Декстер (Полный чек)
          </button>
          <button
            onClick={() => setActiveTab('prima')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'prima' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Прима (Следующий укус)
          </button>
          <button
            onClick={() => setActiveTab('bfs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bfs' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            BFS (Ребро = 1)
          </button>
        </div>

        {/* Управление */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsPlaying(false); setStepIndex(0); }}
            disabled={compilerLinked}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            Сброс
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={compilerLinked}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? 'Пауза' : 'Пуск'}
          </button>
          <button
            onClick={() => { setIsPlaying(false); if (stepIdx < steps.length - 1) setStepIndex(stepIdx + 1); }}
            disabled={compilerLinked || stepIdx >= steps.length - 1}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            Шаг
          </button>
        </div>
      </div>

      <LiveDistTable
        dist={liveMinWay}
        done={currentStep.seen}
        demoIds={nodes.map((node) => String(node.id))}
        title="Массив min_way из вашего кода"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Граф */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center relative min-h-[320px]">
          <div className="absolute top-3 left-3 bg-indigo-900/80 text-xs px-3 py-1 rounded-full text-indigo-200 border border-indigo-500 font-bold shadow-sm">
            Шаг {stepIdx + 1} из {steps.length}
          </div>

          <svg className="w-full h-auto max-h-[280px]" viewBox="0 0 400 280">
            {/* Рёбра */}
            {rawEdges.map((e, idx) => {
              const uNode = nodes.find((n) => n.id === e.u)!;
              const vNode = nodes.find((n) => n.id === e.v)!;

              const isChecking =
                currentStep.checkingEdge &&
                ((currentStep.checkingEdge.u === e.u && currentStep.checkingEdge.v === e.v) ||
                  (currentStep.checkingEdge.u === e.v && currentStep.checkingEdge.v === e.u));

              const inOstov = currentStep.ostov?.some(
                ([p, c]) => (p === e.u && c === e.v) || (p === e.v && c === e.u)
              );

              return (
                <g key={idx}>
                  <line
                    x1={uNode.x} y1={uNode.y}
                    x2={vNode.x} y2={vNode.y}
                    stroke={isChecking ? '#f59e0b' : inOstov ? '#10b981' : '#475569'}
                    strokeWidth={isChecking ? 4 : inOstov ? 4 : 2}
                  />
                  <circle
                    cx={(uNode.x + vNode.x) / 2} cy={(uNode.y + vNode.y) / 2}
                    r="10" fill="#1e293b" stroke={isChecking ? '#f59e0b' : '#64748b'} strokeWidth="1.5"
                  />
                  <text
                    x={(uNode.x + vNode.x) / 2} y={(uNode.y + vNode.y) / 2 + 3.5}
                    fill={isChecking ? '#f59e0b' : '#cbd5e1'}
                    fontSize="10" fontWeight="bold" textAnchor="middle"
                  >
                    {e.w}
                  </text>
                </g>
              );
            })}

            {/* Вершины */}
            {nodes.map((node) => {
              const isX = currentStep.x === node.id;
              const isSeen = currentStep.seen.includes(node.id);
              const val = currentStep.minWay[node.id];

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x} cy={node.y}
                    r={isX ? 20 : 16}
                    fill={isX ? '#4f46e5' : isSeen ? '#059669' : '#334155'}
                    stroke={isX ? '#a5b4fc' : isSeen ? '#34d399' : '#64748b'}
                    strokeWidth={isX ? 4 : 2}
                  />
                  <text x={node.x} y={node.y + 4} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {node.id}
                  </text>
                  <text
                    x={node.x} y={node.y - 24}
                    fill={val === 999 ? '#94a3b8' : '#38bdf8'}
                    fontSize="11" fontWeight="bold" textAnchor="middle"
                  >
                    {val === 999 ? '∞' : activeTab === 'bfs' ? `${val} шаг` : `w=${val}`}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="w-full bg-slate-950/80 p-3 rounded-lg border border-slate-700 mt-2 text-xs text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Ход работы:</p>
            <p className="min-h-[32px] flex items-center">{currentStep.log}</p>
          </div>
        </div>

        {/* Список смежности & состояние */}
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-2">Формат списка: <code>edges[x] = [(y, w), ...]</code></h4>
            <div className="space-y-1.5 font-mono text-xs mb-4">
              {Object.keys(adjList).map((key) => {
                const u = Number(key);
                const isX = currentStep.x === u;
                return (
                  <div
                    key={u}
                    className={`p-2 rounded border flex items-center gap-2 ${
                      isX ? 'bg-indigo-900/60 border-indigo-400 text-white font-bold' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-amber-300 font-bold">edges[{u}] =</span>
                    <span>
                      [{adjList[u].map(([y, w]) => `(${y}, ${w})`).join(', ')}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
            <p><span className="text-indigo-400 font-bold">min_way:</span> [{currentStep.minWay.map((v) => (v === 999 ? '∞' : v)).join(', ')}]</p>
            <p><span className="text-emerald-400 font-bold">seen:</span> &#123;{currentStep.seen.join(', ')}&#125;</p>
            {activeTab === 'prima' && currentStep.ostov && (
              <p><span className="text-amber-400 font-bold">ostov:</span> [{currentStep.ostov.map(([u, v, w]) => `(${u}–${v}: ${w})`).join(', ')}]</p>
            )}
            {activeTab === 'bfs' && currentStep.queue && (
              <p><span className="text-sky-400 font-bold">queue:</span> [{currentStep.queue.join(', ')}]</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
