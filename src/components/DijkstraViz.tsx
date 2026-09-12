import { useState, useEffect } from 'react';
import { useVizRuntime, vizArray, vizNumber, vizRecord, vizString } from '../data/vizStepBus';

interface Node { id: string; x: number; y: number; name: string; }
interface Edge { u: string; v: string; w: number; }
interface Step {
  currentNode: string | null;
  checkingEdge: { u: string; v: string } | null;
  distances: { [key: string]: number };
  visited: { [key: string]: boolean };
  previous: { [key: string]: string | null };
  log: string;
  activeCodeLine: number;
}

export default function DijkstraViz() {
  const nodes: Node[] = [
    { id: 'A', x: 60, y: 150, name: 'Пиццерия (A)' },
    { id: 'B', x: 160, y: 60, name: 'Дом 1 (B)' },
    { id: 'C', x: 160, y: 240, name: 'Парк (C)' },
    { id: 'D', x: 340, y: 60, name: 'Офис (D)' },
    { id: 'E', x: 340, y: 240, name: 'Дом 2 (E)' },
    { id: 'F', x: 450, y: 150, name: 'ТЦ (F)' },
    { id: 'G', x: 250, y: 150, name: 'Метро (G)' },
  ];

  const edges: Edge[] = [
    { u: 'A', v: 'B', w: 4 },
    { u: 'A', v: 'C', w: 2 },
    { u: 'C', v: 'B', w: 1 },
    { u: 'C', v: 'G', w: 3 },
    { u: 'C', v: 'E', w: 8 },
    { u: 'B', v: 'G', w: 4 },
    { u: 'B', v: 'D', w: 5 },
    { u: 'G', v: 'D', w: 1 },
    { u: 'G', v: 'E', w: 2 },
    { u: 'D', v: 'F', w: 3 },
    { u: 'E', v: 'F', w: 1 },
  ];

  const adjList: { [key: string]: { v: string; w: number }[] } = {};
  nodes.forEach(n => (adjList[n.id] = []));
  edges.forEach(e => {
    adjList[e.u].push({ v: e.v, w: e.w });
  });

  const codeLines = [
    { line: 1, text: 'function dijkstra(graph, start):' },
    { line: 2, text: '    dist = {v: ∞}; dist[start] = 0' },
    { line: 3, text: '    pq = PriorityQueue(); pq.push((0, start))' },
    { line: 4, text: '    while not pq.empty():' },
    { line: 5, text: '        d, u = pq.pop() // Извлекаем минимум' },
    { line: 6, text: '        if d > dist[u]: continue' },
    { line: 7, text: '        for v, weight in graph.neighbors(u):' },
    { line: 8, text: '            if dist[u] + weight < dist[v]: // Релаксация' },
    { line: 9, text: '                dist[v] = dist[u] + weight' },
    { line: 10, text: '                pq.push((dist[v], v))' },
    { line: 11, text: '    return dist // Все кратчайшие пути найдены' },
  ];

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const runtime = useVizRuntime();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const simulationSteps: Step[] = [];
    const dist: Record<string, number> = { A: 0, B: 999, C: 999, D: 999, E: 999, F: 999, G: 999 };
    const visited: Record<string, boolean> = { A: false, B: false, C: false, D: false, E: false, F: false, G: false };
    const prev: Record<string, string | null> = { A: null, B: null, C: null, D: null, E: null, F: null, G: null };
    
    simulationSteps.push({
      currentNode: null, checkingEdge: null,
      distances: { ...dist }, visited: { ...visited }, previous: { ...prev },
      log: '🍕 Дейкстра готов к доставке. Начинаем из Пиццерии (A). Расстояние до A = 0, остальные = ∞.',
      activeCodeLine: 2,
    });

    for (let iter = 0; iter < nodes.length; iter++) {
      let minD = 999;
      let u = null;
      for (const n of nodes) {
        if (!visited[n.id] && dist[n.id] < minD) {
          minD = dist[n.id];
          u = n.id;
        }
      }

      if (!u) break;

      visited[u] = true;
      simulationSteps.push({
        currentNode: u, checkingEdge: null,
        distances: { ...dist }, visited: { ...visited }, previous: { ...prev },
        log: `🛵 Выбираем вершину ${u} с мин. непосещённым расстоянием (${dist[u]}).`,
        activeCodeLine: 5,
      });

      const neighbors = edges.filter(e => e.u === u);
      for (const edge of neighbors) {
        const v = edge.v;
        if (visited[v]) continue;

        simulationSteps.push({
          currentNode: u, checkingEdge: { u, v },
          distances: { ...dist }, visited: { ...visited }, previous: { ...prev },
          log: `👀 Смотрим соседа ${v}. Текущее расстояние: ${dist[v] === 999 ? '∞' : dist[v]}. Путь через ${u}: ${dist[u]} + ${edge.w} = ${dist[u] + edge.w}.`,
          activeCodeLine: 8,
        });

        if (dist[u] + edge.w < dist[v]) {
          dist[v] = dist[u] + edge.w;
          prev[v] = u;
          simulationSteps.push({
            currentNode: u, checkingEdge: { u, v },
            distances: { ...dist }, visited: { ...visited }, previous: { ...prev },
            log: `✅ Улучшение (Релаксация)! Новое кратчайшее расстояние до ${v} = ${dist[v]}.`,
            activeCodeLine: 9,
          });
        }
      }
    }

    simulationSteps.push({
      currentNode: null, checkingEdge: null,
      distances: { ...dist }, visited: { ...visited }, previous: { ...prev },
      log: '🏁 Дейкстра всё доставил! Все возможные кратчайшие пути построены.',
      activeCodeLine: 11,
    });

    setSteps(simulationSteps);
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 1500);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length]);

  const baseStep = steps[currentStepIndex] || null;

  if (!baseStep) return <div className="text-white">Загрузка симулятора...</div>;
  const vars = runtime?.variables;
  const liveU = vizString(vars?.u);
  const liveV = vizString(vars?.v);
  const liveDist = vizRecord(vars?.dist);
  const livePrev = vizRecord(vars?.prev);
  const liveDone = vizArray(vars?.done) ?? vizArray(vars?.visited);
  const compilerLinked = liveU !== null || liveV !== null || !!liveDist;
  const currentStep: Step = compilerLinked
    ? {
        ...baseStep,
        currentNode: liveU,
        checkingEdge: liveU && liveV ? { u: liveU, v: liveV } : null,
        distances: Object.fromEntries(nodes.map((node) => [node.id, vizNumber(liveDist?.[node.id]) ?? 999])),
        previous: Object.fromEntries(nodes.map((node) => [node.id, vizString(livePrev?.[node.id])])),
        visited: Object.fromEntries(nodes.map((node) => [node.id, !!liveDone?.includes(node.id)])),
        log: `Компилятор: u=${liveU ?? "—"}, v=${liveV ?? "—"}; граф читает dist/done/prev напрямую.`,
      }
    : baseStep;

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      {/* Шапка симулятора */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
            <span className="text-2xl">🍕</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивный Дейкстра</h3>
            <p className="text-sm text-indigo-300">Полный дашборд: Граф ⟷ Таблица ⟷ Список смежности ⟷ Код</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Сброс
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? '⏸️ Пауза' : '▶️ Пуск'}
          </button>
          <button
            onClick={() => { setIsPlaying(false); if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1); }}
            disabled={currentStepIndex >= steps.length - 1}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Шаг ⏭️
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Граф */}
        <div className="w-full lg:w-2/3 bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/40 relative flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-3 left-3 bg-indigo-900/80 text-xs px-3 py-1 rounded-full text-indigo-200 border border-indigo-500 font-bold shadow-sm">
            Шаг {currentStepIndex + 1} из {steps.length}
          </div>

          <svg className="w-full h-auto max-h-[500px]" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
             <defs>
              <marker id="arrow-dh-normal" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L6,3 L0,6 z" fill="#475569" />
              </marker>
              <marker id="arrow-dh-active" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L6,3 L0,6 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-dh-opt" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L6,3 L0,6 z" fill="#10b981" />
              </marker>
            </defs>
            {/* Рёбра */}
            {edges.map((edge, idx) => {
              const uNode = nodes.find((n) => n.id === edge.u)!;
              const vNode = nodes.find((n) => n.id === edge.v)!;
              const isChecking =
                currentStep.checkingEdge &&
                (currentStep.checkingEdge.u === edge.u && currentStep.checkingEdge.v === edge.v);

              const isOptimal = currentStep.previous[edge.v] === edge.u;
              
              let marker = 'url(#arrow-dh-normal)';
              if (isChecking) marker = 'url(#arrow-dh-active)';
              else if (isOptimal) marker = 'url(#arrow-dh-opt)';

              return (
                <g key={idx}>
                  <line
                    x1={uNode.x} y1={uNode.y}
                    x2={vNode.x} y2={vNode.y}
                    stroke={isChecking ? '#f59e0b' : isOptimal ? '#10b981' : '#475569'}
                    strokeWidth={isChecking ? 5 : isOptimal ? 3 : 2}
                    markerEnd={marker}
                    className="transition-all duration-300"
                    strokeDasharray={isChecking ? '4,4' : 'none'}
                  />
                  <circle
                    cx={(uNode.x + vNode.x) / 2} cy={(uNode.y + vNode.y) / 2}
                    r="12" fill="#1e293b"
                    stroke={isChecking ? '#f59e0b' : '#64748b'} strokeWidth="2"
                  />
                  <text
                    x={(uNode.x + vNode.x) / 2} y={(uNode.y + vNode.y) / 2 + 4}
                    fill={isChecking ? '#f59e0b' : '#f8fafc'}
                    fontSize="11" fontWeight="bold" textAnchor="middle"
                  >
                    {edge.w}
                  </text>
                </g>
              );
            })}

            {/* Вершины */}
            {nodes.map((node) => {
              const isCurrent = currentStep.currentNode === node.id;
              const isVisited = currentStep.visited[node.id];
              const dist = currentStep.distances[node.id];

              return (
                <g key={node.id} className="transition-transform duration-300">
                  <circle
                    cx={node.x} cy={node.y}
                    r={isCurrent ? 22 : 18}
                    fill={isCurrent ? '#4f46e5' : isVisited ? '#059669' : '#334155'}
                    stroke={isCurrent ? '#a5b4fc' : isVisited ? '#34d399' : '#64748b'}
                    strokeWidth={isCurrent ? 4 : 2}
                    className="transition-all duration-300"
                  />
                  <text x={node.x} y={node.y + 5} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    {node.id}
                  </text>
                  <text x={node.x} y={node.y - 28} fill={dist === 999 ? '#94a3b8' : '#38bdf8'} fontSize="12" fontWeight="bold" textAnchor="middle" className="bg-indigo-950 px-1 py-0.5 rounded shadow">
                    {dist === 999 ? '∞' : `d=${dist}`}
                  </text>
                  <text x={node.x} y={node.y + 35} fill="#cbd5e1" fontSize="11" textAnchor="middle" className="drop-shadow-md">
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-indigo-500/30 mt-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Статус симуляции:</p>
            <p className="min-h-[40px] flex items-center">{currentStep.log}</p>
          </div>
        </div>

        {/* Список смежности */}
        <div className="w-full lg:w-1/3 bg-emerald-950/10 rounded-xl p-4 border border-emerald-500/40 flex flex-col items-stretch">
          <h4 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">🔗 Список смежности</h4>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {Object.keys(adjList).map((u) => {
              const isCurrentNode = currentStep.currentNode === u;
              return (
                <div key={u} className={`p-3 rounded-lg border transition-all ${
                    isCurrentNode ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-md' : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                  }`}>
                  <div className="flex items-center gap-2 font-mono text-sm mb-1.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${isCurrentNode ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {u}
                    </span>
                    <span className="text-slate-400">➔</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    {adjList[u].map((edge, idx) => {
                      const isCheckingThis = currentStep.checkingEdge?.u === u && currentStep.checkingEdge?.v === edge.v;
                      return (
                        <span key={idx} className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 border ${
                            isCheckingThis ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow' : 'bg-slate-900 border-slate-600 text-slate-300'
                          }`}>
                          <span>{edge.v}</span><span className="text-slate-500">|</span>
                          <span className={isCheckingThis ? 'text-slate-950 font-extrabold' : 'text-emerald-400 font-bold'}>w:{edge.w}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Таблица расстояний */}
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-rose-300 mb-3 flex items-center gap-2">🛡️ Таблица расстояний d[v]</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rose-900 text-slate-400 text-xs uppercase">
                    <th className="py-2 px-3">Вершина</th>
                    <th className="py-2 px-3">Расстояние</th>
                    <th className="py-2 px-3">Из (пред.)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {nodes.map((n) => {
                    const dist = currentStep.distances[n.id];
                    const prev = currentStep.previous[n.id];
                    const vis = currentStep.visited[n.id];
                    const isCurr = currentStep.currentNode === n.id;

                    return (
                      <tr key={n.id} className={`border-b border-slate-800/50 transition-colors ${
                          isCurr ? 'bg-indigo-950/60 font-semibold' : vis ? 'bg-emerald-950/20' : ''
                        }`}>
                        <td className="py-2.5 px-3 flex items-center gap-2 text-white">
                          <span className={`w-2 h-2 rounded-full ${vis ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                          {n.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-indigo-300">
                          {dist === 999 ? '∞' : dist}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {prev || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Код алгоритма */}
        <div className="w-full lg:w-1/2 bg-slate-900/60 rounded-xl p-4 border border-slate-600/50 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">📄 Выполнение кода алгоритма</h4>
            <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs overflow-x-auto min-h-[300px]">
              {codeLines.map((item) => {
                const isActive = currentStep.activeCodeLine === item.line;
                return (
                  <div key={item.line} className={`py-1.5 px-3 rounded flex items-center gap-4 transition-colors ${
                      isActive ? 'bg-indigo-900/80 text-amber-300 font-bold border-l-4 border-amber-400' : 'text-slate-400'
                    }`}>
                    <span className="text-slate-600 select-none w-6 text-right cursor-default">{item.line}</span>
                    <span className="whitespace-pre flex-1">{item.text}</span>
                    {isActive && <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold uppercase">Активно</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
