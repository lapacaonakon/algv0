import { useState, useEffect, useMemo } from 'react';
import { useVizSync } from '../hooks/useVizSync';
import { useVizControl } from '../hooks/useVizControl';
import { VizObject } from '../viz/VizObject';

interface Step {
  k: number; i: number; j: number;
  matrix: number[][]; updated: boolean;
  log: string; activeCodeLine: number;
}

export default function FloydViz() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nodeNames = ['А 0', 'Б 1', 'В 2', 'Г 3', 'Д 4', 'Е 5', 'Ж 6'];
  const nodesSvg = [
    { id: 0, name: 'Аэропорт 0', x: 100, y: 60 },
    { id: 1, name: 'Аэропорт 1', x: 250, y: 60 },
    { id: 2, name: 'Аэропорт 2', x: 400, y: 60 },
    { id: 3, name: 'Аэропорт 3', x: 100, y: 180 },
    { id: 4, name: 'Аэропорт 4', x: 400, y: 180 },
    { id: 5, name: 'Аэропорт 5', x: 175, y: 280 },
    { id: 6, name: 'Аэропорт 6', x: 325, y: 280 },
  ];

  const initialMatrix = [
    [0, 4, 999, 2, 999, 999, 999],
    [999, 0, 3, 999, 999, 3, 999],
    [999, 999, 0, 999, 2, 999, 999],
    [999, 999, 999, 0, 4, 2, 999],
    [999, 999, 999, 999, 0, 999, 1],
    [999, 999, 999, 999, 999, 0, 5],
    [999, 1, 999, 999, 999, 999, 0]
  ];

  const adjList: { [key: number]: { v: number; w: number }[] } = {
    0: [{ v: 1, w: 4 }, { v: 3, w: 2 }],
    1: [{ v: 2, w: 3 }, { v: 5, w: 3 }],
    2: [{ v: 4, w: 2 }],
    3: [{ v: 4, w: 4 }, { v: 5, w: 2 }],
    4: [{ v: 6, w: 1 }],
    5: [{ v: 6, w: 5 }],
    6: [{ v: 1, w: 1 }],
  };

  const codeLines = [
    { line: 1, text: 'function floyd_warshall(matrix, V):' },
    { line: 2, text: '    dist = copy(matrix)' },
    { line: 3, text: '    for k from 0 to V - 1: // Посредник k' },
    { line: 4, text: '        for i from 0 to V - 1:' },
    { line: 5, text: '            for j from 0 to V - 1:' },
    { line: 6, text: '                if dist[i][k] + dist[k][j] < dist[i][j]:' },
    { line: 7, text: '                    dist[i][j] = dist[i][k] + dist[k][j]' },
    { line: 8, text: '    return dist' },
  ];

  useEffect(() => {
    const simulationSteps: Step[] = [];
    const dist = initialMatrix.map(row => [...row]);

    simulationSteps.push({
      k: -1, i: -1, j: -1, matrix: dist.map(r => [...r]), updated: false,
      log: '🌐 Инициализация матрицы прямых путей, ∞ (999) = нет прямого рейса.',
      activeCodeLine: 2,
    });

    const N = 7;
    for (let k = 0; k < N; k++) {
      simulationSteps.push({
        k, i: -1, j: -1, matrix: dist.map(r => [...r]), updated: false,
        log: `✈️ Внешний цикл. Разрешаем пути через промежуточный Аэропорт [${k}]. Ищем улучшения...`,
        activeCodeLine: 3,
      });

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (i === j || i === k || j === k) continue;
          
          const oldVal = dist[i][j];
          const viaVal = dist[i][k] + dist[k][j];
          if (dist[i][k] !== 999 && dist[k][j] !== 999 && viaVal < oldVal) {
            dist[i][j] = viaVal;
            simulationSteps.push({
              k, i, j, matrix: dist.map(r => [...r]), updated: true,
              log: `✅ Улучшение пути [${i}]➔[${j}] через [${k}]! ${dist[i][k]} + ${dist[k][j]} = ${viaVal} < ${oldVal !== 999 ? oldVal : '∞'}.`,
              activeCodeLine: 7,
            });
          }
        }
      }
    }

    simulationSteps.push({
      k: 7, i: -1, j: -1, matrix: dist.map(r => [...r]), updated: false,
      log: '🏁 Все пары отработаны. Алгоритм Флойда завершён.',
      activeCodeLine: 8,
    });

    setSteps(simulationSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => setCurrentStepIndex((p) => p + 1), 1000);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex] || null;
  const vizObj = useMemo(() => new VizObject("floyd", ["k, i, j = 0, 0, 0  # k — промежут., i — строка, j — столбец"], { k: 0, i: 0, j: 0, n: 7 }), []);
  useVizSync("floyd", {
    n: 7,
    m: "-",
    k: currentStep ? (currentStep.k >= 0 ? currentStep.k : "—") : "—",
    i: currentStep ? (currentStep.i >= 0 ? currentStep.i : "—") : "—",
    j: currentStep ? (currentStep.j >= 0 ? currentStep.j : "—") : "—",
  }, currentStepIndex);
  useVizControl("floyd", {
    onStep: (line) => { setIsPlaying(false); if (typeof line === "number") setCurrentStepIndex(Math.min(line, steps.length - 1)); else setCurrentStepIndex((v) => Math.min(v + 1, steps.length - 1)); },
    onReset: () => { setIsPlaying(false); setCurrentStepIndex(0); },
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
  });
  // подсветка из компилятора: k,i,j = 0,0,0 → шаг
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d.chapterId && d.chapterId !== "floyd") return;
      const v = d.vars as Record<string, any>;
      if (!v) return;
      if (v.k !== undefined && v.i !== undefined && v.j !== undefined) {
        const k = Number(v.k), i = Number(v.i), j = Number(v.j);
        vizObj.vars.set("k", k); vizObj.vars.set("i", i); vizObj.vars.set("j", j);
        const idx = steps.findIndex((s) => s.k === k && s.i === i && s.j === j);
        if (idx !== -1) { setIsPlaying(false); setCurrentStepIndex(idx); }
      } else if (v.i !== undefined && v.j !== undefined) {
        const i = Number(v.i), j = Number(v.j);
        const idx = steps.findIndex((s) => s.i === i && s.j === j);
        if (idx !== -1) { setIsPlaying(false); setCurrentStepIndex(idx); }
      }
    };
    window.addEventListener("viz:highlight", h as EventListener);
    return () => window.removeEventListener("viz:highlight", h as EventListener);
  }, [steps, vizObj]);
  if (!currentStep) return <div>Загрузка...</div>;

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/30">
            <span className="text-2xl">🌐</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Флойд-Уоршелл (Фсе-ко-Фсем)</h3>
            <p className="text-sm text-emerald-300">Полный дашборд: Матрица ⟷ Граф ⟷ Список смежности</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }} className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">🔄 Сброс</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${isPlaying ? 'bg-amber-600' : 'bg-emerald-600'}`}>{isPlaying ? '⏸️ Пауза' : '▶️ Пуск'}</button>
          <button onClick={() => { setIsPlaying(false); if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1); }} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Шаг ⏭️</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Граф */}
        <div className="w-full lg:w-2/3 bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/40 relative flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-3 left-3 bg-indigo-900/80 text-xs px-3 py-1 rounded-full text-indigo-200 border border-indigo-500 font-bold shadow-sm">
             {currentStep.k >= 0 && currentStep.k < 7 ? `Цикл k = ${currentStep.k}` : 'Итог'}
          </div>

          <svg className="w-full h-auto max-h-[500px]" viewBox="0 0 500 340" preserveAspectRatio="xMidYMid meet">
             <defs>
              <marker id="arrow-fw-normal" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#475569" /></marker>
              <marker id="arrow-fw-active" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#10b981" /></marker>
              <marker id="arrow-fw-via" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L6,3 L0,6 z" fill="#818cf8" /></marker>
            </defs>
            {Object.keys(adjList).flatMap((uStr) => {
              const u = parseInt(uStr);
              return adjList[u].map((edge) => {
                const uNode = nodesSvg.find((n) => n.id === u)!;
                const vNode = nodesSvg.find((n) => n.id === edge.v)!;
                const isTarget = currentStep.i === u && currentStep.j === edge.v && currentStep.updated;
                const isVia = (currentStep.i === u && currentStep.k === edge.v) || (currentStep.k === u && currentStep.j === edge.v);
                let strokeColor = '#475569'; let marker = 'url(#arrow-fw-normal)';
                if (isTarget) { strokeColor = '#10b981'; marker = 'url(#arrow-fw-active)'; } 
                else if (isVia) { strokeColor = '#818cf8'; marker = 'url(#arrow-fw-via)'; }
                return (
                  <g key={`${u}-${edge.v}`}>
                    <line x1={uNode.x} y1={uNode.y} x2={vNode.x} y2={vNode.y} stroke={strokeColor} strokeWidth={isTarget || isVia ? 4 : 2} markerEnd={marker} strokeDasharray={isTarget ? '4,4' : 'none'} className="transition-colors duration-300" />
                    <circle cx={(uNode.x + vNode.x) / 2} cy={(uNode.y + vNode.y) / 2} r="10" fill="#1e293b" stroke={isTarget ? '#10b981' : isVia ? '#818cf8' : '#64748b'} strokeWidth="1.5" />
                    <text x={(uNode.x + vNode.x) / 2} y={(uNode.y + vNode.y) / 2 + 3} fill={isTarget ? '#10b981' : isVia ? '#c7d2fe' : '#f8fafc'} fontSize="10" fontWeight="bold" textAnchor="middle">{edge.w}</text>
                  </g>
                );
              });
            })}
            {nodesSvg.map((node) => {
              const isK = currentStep.k === node.id;
              const isI = currentStep.i === node.id;
              const isJ = currentStep.j === node.id;
              let fill = '#1e293b'; let stroke = '#64748b';
              if (isK) { fill = '#4f46e5'; stroke = '#a5b4fc'; }
              else if (isI) { fill = '#b45309'; stroke = '#fcd34d'; }
              else if (isJ) { fill = '#047857'; stroke = '#6ee7b7'; }
              return (
                <g key={node.id} className="transition-transform duration-300">
                  <circle cx={node.x} cy={node.y} r={isK || isI || isJ ? 22 : 18} fill={fill} stroke={stroke} strokeWidth={isK || isI || isJ ? 4 : 2} className="transition-colors duration-300" />
                  <text x={node.x} y={node.y + 5} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">{node.id}</text>
                  <text x={node.x} y={node.y + 32} fill="#cbd5e1" fontSize="10" textAnchor="middle" className="drop-shadow-md">{node.name}</text>
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
          <h4 className="text-lg font-bold text-emerald-300 mb-3">🔗 Список смежности</h4>
          <div className="space-y-2 text-sm font-mono text-slate-300 flex-1 overflow-y-auto pr-1">
             {Object.keys(adjList).map((uStr) => {
               const u = parseInt(uStr);
               const isI = currentStep.i === u;
               const isK = currentStep.k === u;
               return (
                 <div key={u} className={`flex flex-wrap gap-2 items-center p-2 rounded border transition-colors ${
                     isI ? 'bg-amber-900/40 border-amber-500/50' : 
                     isK ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700/60'
                   }`}>
                    <span className="font-bold text-white bg-slate-700 px-2 rounded w-6 text-center">{u}</span> <span className="text-slate-400">➔</span>
                    {adjList[u].map((edge, idx) => {
                      const isUpd = currentStep.i === u && currentStep.j === edge.v && currentStep.updated;
                      const isVia = currentStep.k !== -1 && (currentStep.i === u && currentStep.k === edge.v || currentStep.k === u && currentStep.j === edge.v);
                      return (
                        <span key={idx} className={`px-2 py-0.5 rounded border ${isUpd ? 'bg-emerald-500 text-black border-emerald-400 shadow' : isVia ? 'bg-indigo-500 text-white border-indigo-400 shadow' : 'bg-slate-900 border-slate-600'}`}>
                          {edge.v} ({edge.w})
                        </span>
                      )
                    })}
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Матрица расстояний */}
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-rose-300">🔁 Матрица расстояний d[i][j]</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-rose-900/50">
              <thead><tr className="bg-rose-950/40 text-slate-300 text-[10px] uppercase border-b border-rose-900">
                <th className="p-2 border-r border-rose-900/50">i\j</th>
                {nodeNames.map((n, idx) => <th key={idx} className={`p-2 border-r border-rose-900/50 ${currentStep.k === idx ? 'text-amber-400 font-bold' : ''}`}>{n.split(' ')[0]} {idx}</th>)}
              </tr></thead>
              <tbody className="text-xs font-mono">
                {currentStep.matrix.map((row, i) => (
                  <tr key={i} className="border-b border-rose-900/50">
                    <td className={`p-2 bg-rose-950/40 text-slate-300 text-[10px] font-sans font-bold border-r border-rose-900/50 ${currentStep.k === i ? 'text-amber-400' : ''}`}>
                       {nodeNames[i].split(' ')[0]} {i}
                    </td>
                    {row.map((val, j) => {
                      const isUpd = currentStep.i === i && currentStep.j === j && currentStep.updated;
                      const isVia = currentStep.k !== -1 && (currentStep.i === i && currentStep.k === j || currentStep.k === i && currentStep.j === j);
                      let bg = 'bg-slate-900/40 text-slate-300';
                      if (isUpd) bg = 'bg-emerald-900/80 text-emerald-200 border-2 border-emerald-500 shadow-inner z-10 relative';
                      else if (isVia) bg = 'bg-indigo-950/80 text-indigo-200 border border-indigo-500 shadow-inner z-10 relative';
                      else if (i === j) bg = 'bg-slate-950/60 text-slate-500';
                      return (<td key={j} className={`p-2 border-r border-rose-900/50 transition-colors ${bg}`}>{val === 999 ? '∞' : val}</td>);
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
