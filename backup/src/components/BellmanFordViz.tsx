import React, { useState, useEffect } from 'react';

interface Node { id: string; x: number; y: number; name: string; }
interface Edge { u: string; v: string; w: number; }
interface Step {
  iteration: number;
  checkingEdge: { u: string; v: string; w: number } | null;
  distances: { [key: string]: number };
  previous: { [key: string]: string | null };
  log: string;
  hasNegativeCycle?: boolean;
  activeCodeLine: number;
}

export default function BellmanFordViz() {
  const [hasCycle, setHasCycle] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nodes: Node[] = [
    { id: 'S', x: 60, y: 150, name: 'База (S)' },
    { id: 'A', x: 160, y: 60, name: 'Застава (A)' },
    { id: 'B', x: 160, y: 240, name: 'Топь 1 (B)' },
    { id: 'C', x: 260, y: 150, name: 'Мост (C)' },
    { id: 'D', x: 350, y: 60, name: 'Топь 2 (D)' },
    { id: 'E', x: 350, y: 240, name: 'Лес (E)' },
    { id: 'F', x: 450, y: 150, name: 'Склад (F)' },
  ];

  const getEdges = (cycle: boolean): Edge[] => {
    const defaultEdges = [
      { u: 'S', v: 'A', w: 4 },
      { u: 'S', v: 'B', w: 5 },
      { u: 'B', v: 'C', w: -2 },
      { u: 'A', v: 'C', w: 1 },
      { u: 'C', v: 'D', w: 3 },
      { u: 'C', v: 'E', w: 4 },
      { u: 'D', v: 'F', w: 2 },
      { u: 'E', v: 'F', w: 1 },
    ];
    if (cycle) {
      return [...defaultEdges, { u: 'D', v: 'A', w: -6 }];
    } else {
      return [...defaultEdges, { u: 'D', v: 'A', w: -2 }];
    }
  };

  const edges = getEdges(hasCycle);

  const getAdjList = (ed: Edge[]) => {
    const list: { [key: string]: { v: string; w: number }[] } = {};
    nodes.forEach(n => (list[n.id] = []));
    ed.forEach(e => list[e.u].push({ v: e.v, w: e.w }));
    return list;
  };
  const adjList = getAdjList(edges);

  const codeLines = [
    { line: 1, text: 'function bellman_ford(graph, start, V, E):' },
    { line: 2, text: '    dist = {v: ∞}; dist[start] = 0' },
    { line: 3, text: '    for i from 1 to V - 1: // |V|-1 итераций по ВСЕМ рёбрам' },
    { line: 4, text: '        for (u, v, weight) in E:' },
    { line: 5, text: '            if dist[u] + weight < dist[v]: // Релаксация' },
    { line: 6, text: '                dist[v] = dist[u] + weight' },
    { line: 7, text: '    for (u, v, weight) in E: // Проверка на отрицательный цикл' },
    { line: 8, text: '        if dist[u] + weight < dist[v]:' },
    { line: 9, text: '            return "ОБНАРУЖЕН ОТРИЦАТЕЛЬНЫЙ ЦИКЛ!"' },
    { line: 10, text: '    return dist' },
  ];

  useEffect(() => {
    const simulationSteps: Step[] = [];
    let dist: { [key: string]: number } = { S: 0, A: 999, B: 999, C: 999, D: 999, E: 999, F: 999 };
    let prev: { [key: string]: string | null } = { S: null, A: null, B: null, C: null, D: null, E: null, F: null };

    simulationSteps.push({
      iteration: 0, checkingEdge: null,
      distances: { ...dist }, previous: { ...prev },
      log: '🚛 Фура заведена. Начинаем с Базы (S). Расстояние до S = 0, остальные = ∞. Алгоритм требует |V|-1 итераций.',
      activeCodeLine: 2,
    });

    const vCount = nodes.length;
    for (let iter = 1; iter < vCount; iter++) {
      let anyUpdate = false;
      for (const edge of edges) {
        const uDist = dist[edge.u];
        const vDist = dist[edge.v];
        
        let updated = false;
        if (uDist !== 999 && uDist + edge.w < vDist) {
          dist = { ...dist, [edge.v]: uDist + edge.w };
          prev = { ...prev, [edge.v]: edge.u };
          updated = true;
          anyUpdate = true;
        }

        simulationSteps.push({
          iteration: iter, checkingEdge: { u: edge.u, v: edge.v, w: edge.w },
          distances: { ...dist }, previous: { ...prev },
          log: `Итерация ${iter}: Проверяем ${edge.u} ➔ ${edge.v} (${edge.w}). ${
            updated ? `✅ Релаксация успешна! dist[${edge.v}] = ${dist[edge.v]}` : 'Без изменений.'
          }`,
          activeCodeLine: updated ? 6 : 5,
        });
      }
      
      if (!anyUpdate && iter < vCount - 1) {
        simulationSteps.push({
           iteration: iter, checkingEdge: null, distances: {...dist}, previous: {...prev},
           log: `🏁 Ранний выход после итерации ${iter}. Больше улучшений нет!`, 
           activeCodeLine: 10
        });
        break;
      }
    }

    if (simulationSteps[simulationSteps.length - 1].iteration !== 10) { 
      let cycleFound = false;
      for (const edge of edges) {
        if (dist[edge.u] !== 999 && dist[edge.u] + edge.w < dist[edge.v]) {
          cycleFound = true;
          simulationSteps.push({
            iteration: vCount, checkingEdge: { u: edge.u, v: edge.v, w: edge.w },
            distances: { ...dist }, previous: { ...prev }, hasNegativeCycle: true,
            log: `🚨 ВНИМАНИЕ! Проверка цикла: Ребро ${edge.u} ➔ ${edge.v} всё ещё улучшает. ОБНАРУЖЕН ОТРИЦАТЕЛЬНЫЙ ЦИКЛ!`,
            activeCodeLine: 9,
          });
          break;
        }
      }

      if (!cycleFound) {
        simulationSteps.push({
          iteration: vCount, checkingEdge: null,
          distances: { ...dist }, previous: { ...prev }, hasNegativeCycle: false,
          log: '🏁 Проверка завершена. Ни одно ребро не релаксирует. Отрицательных циклов нет! Фура благополучно доехала.',
          activeCodeLine: 10,
        });
      }
    }

    setSteps(simulationSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [hasCycle]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => setCurrentStepIndex((p) => p + 1), 700);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex] || null;
  if (!currentStep) return <div>Загрузка...</div>;

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30">
            <span className="text-2xl">🚛</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Форд-Беллман (Фура)</h3>
            <p className="text-sm text-blue-300">Полный дашборд: Граф ⟷ Таблица ⟷ Список смежности</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex items-center gap-1">
            <button onClick={() => setHasCycle(false)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!hasCycle ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Обычный</button>
            <button onClick={() => setHasCycle(true)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${hasCycle ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>⚠️ С циклом</button>
          </div>
          <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">🔄 Сброс</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors text-white ${isPlaying ? 'bg-amber-600' : 'bg-emerald-600'}`}>{isPlaying ? '⏸️ Пауза' : '▶️ Пуск'}</button>
          <button onClick={() => { setIsPlaying(false); if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1); }} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm transition-colors">Шаг ⏭️</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Граф */}
        <div className="w-full lg:w-2/3 bg-blue-950/20 rounded-xl p-4 border border-blue-500/40 relative flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-3 left-3 bg-blue-900/80 text-xs px-3 py-1 rounded-full text-blue-200 border border-blue-500 font-bold shadow-sm">
            Итерация {currentStep.iteration} (Шаг {currentStepIndex + 1} из {steps.length})
          </div>

          {currentStep.hasNegativeCycle && (
            <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse shadow-lg shadow-rose-600/50">
              ⚠️ Отрицательный цикл!
            </div>
          )}

          <svg className="w-full h-auto max-h-[500px]" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrow-bf-normal" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#64748b" /></marker>
              <marker id="arrow-bf-active" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#f59e0b" /></marker>
              <marker id="arrow-bf-cycle" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#e11d48" /></marker>
            </defs>

            {edges.map((edge, idx) => {
              const uNode = nodes.find((n) => n.id === edge.u)!;
              const vNode = nodes.find((n) => n.id === edge.v)!;
              const isChecking = currentStep.checkingEdge && currentStep.checkingEdge.u === edge.u && currentStep.checkingEdge.v === edge.v;
              const isNeg = edge.w < 0;
              const isCyclePart = hasCycle && ((edge.u === 'D' && edge.v === 'A') || (edge.u === 'A' && edge.v === 'C') || (edge.u === 'C' && edge.v === 'D'));

              let strokeColor = '#475569';
              let marker = 'url(#arrow-bf-normal)';
              if (isChecking) { strokeColor = '#f59e0b'; marker = 'url(#arrow-bf-active)'; } 
              else if (currentStep.hasNegativeCycle && isCyclePart) { strokeColor = '#e11d48'; marker = 'url(#arrow-bf-cycle)'; }

              return (
                <g key={idx}>
                  <line x1={uNode.x} y1={uNode.y} x2={vNode.x} y2={vNode.y} stroke={strokeColor} strokeWidth={isChecking || (currentStep.hasNegativeCycle && isCyclePart) ? 4 : 2} markerEnd={marker} className="transition-all duration-300" strokeDasharray={isChecking ? '4,4' : 'none'} />
                  <circle cx={(uNode.x + vNode.x) / 2} cy={(uNode.y + vNode.y) / 2} r="12" fill={isNeg ? '#4c0519' : '#1e293b'} stroke={isChecking ? '#f59e0b' : isNeg ? '#f43f5e' : '#64748b'} strokeWidth="2" />
                  <text x={(uNode.x + vNode.x) / 2} y={(uNode.y + vNode.y) / 2 + 4} fill={isChecking ? '#f59e0b' : isNeg ? '#fbcfe8' : '#f8fafc'} fontSize="11" fontWeight="bold" textAnchor="middle">{edge.w}</text>
                </g>
              );
            })}

            {nodes.map((node) => {
              const dist = currentStep.distances[node.id];
              const isCheckingNode = currentStep.checkingEdge && (currentStep.checkingEdge.u === node.id || currentStep.checkingEdge.v === node.id);

              return (
                <g key={node.id} className="transition-transform duration-300">
                  <circle cx={node.x} cy={node.y} r={isCheckingNode ? 22 : 18} fill={isCheckingNode ? '#0284c7' : '#1e293b'} stroke={isCheckingNode ? '#7dd3fc' : '#64748b'} strokeWidth={isCheckingNode ? 4 : 2} className="transition-all duration-300" />
                  <text x={node.x} y={node.y + 5} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">{node.id}</text>
                  <text x={node.x} y={node.y - 28} fill={dist === 999 ? '#94a3b8' : dist < 0 ? '#f43f5e' : '#38bdf8'} fontSize="12" fontWeight="bold" textAnchor="middle" className="bg-blue-950 px-1 py-0.5 rounded shadow">{dist === 999 ? '∞' : `d=${dist}`}</text>
                  <text x={node.x} y={node.y + 35} fill="#cbd5e1" fontSize="11" textAnchor="middle" className="drop-shadow-md">{node.name.split(' ')[0]}</text>
                </g>
              );
            })}
          </svg>

          <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-blue-500/30 mt-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Статус симуляции:</p>
            <p className="min-h-[40px] flex items-center">{currentStep.log}</p>
          </div>
        </div>

        {/* Список смежности */}
        <div className="w-full lg:w-1/3 bg-emerald-950/10 rounded-xl p-4 border border-emerald-500/40 flex flex-col items-stretch">
          <h4 className="text-lg font-bold text-emerald-300 mb-3">🔗 Список смежности</h4>
          <div className="space-y-2 text-sm font-mono text-slate-300 flex-1 overflow-y-auto pr-1">
             {Object.keys(adjList).map(u => (
               <div key={u} className="flex flex-wrap gap-2 items-center bg-slate-800/40 p-2 rounded border border-slate-700/60 transition-colors">
                  <span className="font-bold text-white bg-slate-700 px-2 rounded">{u}</span> <span className="text-slate-400">➔</span>
                  {adjList[u].map((edge, idx) => {
                    const isChk = currentStep.checkingEdge?.u === u && currentStep.checkingEdge?.v === edge.v;
                    return (
                      <span key={idx} className={`px-2 py-0.5 rounded border ${isChk ? 'bg-amber-500 text-black border-amber-400 shadow' : edge.w < 0 ? 'bg-rose-900/80 text-rose-300 border-rose-700' : 'bg-slate-900 border-slate-600'}`}>
                        {edge.v} ({edge.w})
                      </span>
                    )
                  })}
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Таблица расстояний */}
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-rose-300 mb-3 flex items-center gap-2">🛡️ Таблица расстояний d[v]</h4>
            <div className="grid grid-cols-4 gap-2 text-sm text-center">
               {nodes.map(n => {
                 const d = currentStep.distances[n.id];
                 const isTgt = currentStep.checkingEdge?.v === n.id;
                 return (
                   <div key={n.id} className={`p-2 rounded-lg border transition-colors ${isTgt ? 'border-amber-500 bg-amber-900/30 shadow' : 'border-slate-700/60 bg-slate-800/40'}`}>
                     <div className="text-xs text-slate-400 mb-1">{n.id} - {n.name.split(' ')[0]}</div>
                     <div className={`font-mono font-bold text-lg ${d < 0 ? 'text-rose-400' : 'text-blue-300'}`}>{d === 999 ? '∞' : d}</div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Код алгоритма */}
        <div className="w-full lg:w-1/2 bg-slate-900/60 rounded-xl p-4 border border-slate-600/50 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-200 mb-3">📄 Код алгоритма</h4>
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 font-mono text-xs overflow-x-auto min-h-[300px]">
              {codeLines.map(item => (
                <div key={item.line} className={`py-1.5 px-2 rounded flex items-center gap-4 transition-colors ${currentStep.activeCodeLine === item.line ? 'bg-blue-900/80 text-amber-300 font-bold border-l-4 border-amber-400' : 'text-slate-400'}`}>
                  <span className="text-slate-600 w-5 select-none text-right cursor-default">{item.line}</span>
                  <span className="whitespace-pre flex-1">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
