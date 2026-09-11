import { useState } from 'react';
import { RotateCcw, SkipForward, Undo } from 'lucide-react';
import { useVizStepSync } from '../data/vizStepBus';

export function JohnsonViz() {
    const [step, setStep] = useState(0);
    const MAX_STEP = 7;
    useVizStepSync(step, setStep, MAX_STEP);

    const nodes = [
        { id: 'S', x: 200, y: 150, label: 'S' },
        { id: 'A', x: 200, y: 50, label: 'A' },
        { id: 'B', x: 320, y: 220, label: 'B' },
        { id: 'C', x: 80, y: 220, label: 'C' },
    ];

    const edges = [
        { id: 'SA', u: 'S', v: 'A', weight: 0, labelDx: 15, labelDy: -10 },
        { id: 'SB', u: 'S', v: 'B', weight: 0, labelDx: -15, labelDy: -15 },
        { id: 'SC', u: 'S', v: 'C', weight: 0, labelDx: 15, labelDy: -15 },
        { id: 'AB', u: 'A', v: 'B', weight: -2, newWeight: 0, labelDx: 25, labelDy: -5 },
        { id: 'BC', u: 'B', v: 'C', weight: 1, newWeight: 0, labelDx: 0, labelDy: 20 },
        { id: 'CA', u: 'C', v: 'A', weight: 2, newWeight: 1, labelDx: -25, labelDy: -5 },
    ];

    const isNodeVisible = (id: string) => {
        if (id === 'S' && (step === 0 || step === 7)) return false;
        return true;
    };

    const getPotential = (id: string) => {
        if (step >= 2 && step < 7) {
            if (id === 'S') return 0;
            if (id === 'A') return 0;
            if (id === 'B') return -2;
            if (id === 'C') return -1;
        }
        return null;
    };

    const getEdgeColorClass = (e: any) => {
        if (e.u === 'S') {
            if (step === 0 || step === 7) return "opacity-0";
            if (step === 1) return "stroke-amber-500 stroke-dasharray-4 opacity-100 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]";
            if (step === 2) return "stroke-pink-500 stroke-dasharray-4 opacity-30"; // fade out S edges to focus on potentials
            return "stroke-slate-700 stroke-dasharray-4 opacity-30"; 
        }

        if (e.id === 'AB') {
            if (step === 4) return "stroke-amber-400 stroke-[3px] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]";
            if (step > 4) return "stroke-emerald-500";
        }
        if (e.id === 'BC') {
            if (step === 5) return "stroke-amber-400 stroke-[3px] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]";
            if (step > 5) return "stroke-emerald-500";
        }
        if (e.id === 'CA') {
            if (step === 6) return "stroke-amber-400 stroke-[3px] drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]";
            if (step > 6) return "stroke-emerald-500";
        }
        
        if (step >= 4) return "stroke-slate-600"; // other edges become dim while one is highlighted
        return "stroke-slate-500";
    };

    const getMarkerUrl = (e: any) => {
        if (e.u === 'S') {
            if (step === 0 || step === 7) return "";
            if (step === 1) return "url(#arrow-amber)";
            if (step === 2) return "url(#arrow-pink)";
            return "url(#arrow-slate-dim)";
        }
        if (e.id === 'AB' && step === 4) return "url(#arrow-amber)";
        if (e.id === 'AB' && step > 4) return "url(#arrow-emerald)";
        if (e.id === 'BC' && step === 5) return "url(#arrow-amber)";
        if (e.id === 'BC' && step > 5) return "url(#arrow-emerald)";
        if (e.id === 'CA' && step === 6) return "url(#arrow-amber)";
        if (e.id === 'CA' && step > 6) return "url(#arrow-emerald)";
        
        if (step >= 4) return "url(#arrow-slate-dim)";
        return "url(#arrow-slate)";
    };

    const getEdgeContent = (e: any) => {
        if (e.u === 'S') return e.weight;
        
        if (step < 4) return e.weight;

        if (e.id === 'AB') {
            if (step === 4) return `${e.weight} + (${0}) - (${-2}) = ${e.newWeight}`;
            return e.newWeight;
        }
        if (e.id === 'BC') {
            if (step < 5) return e.weight;
            if (step === 5) return `${e.weight} + (${-2}) - (${-1}) = ${e.newWeight}`;
            return e.newWeight;
        }
        if (e.id === 'CA') {
            if (step < 6) return e.weight;
            if (step === 6) return `${e.weight} + (${-1}) - (${0}) = ${e.newWeight}`;
            return e.newWeight;
        }
        return e.weight;
    };

    const isEdgeTextHighlighted = (e: any) => {
        if (e.id === 'AB' && step === 4) return true;
        if (e.id === 'BC' && step === 5) return true;
        if (e.id === 'CA' && step === 6) return true;
        return false;
    };

    const isEdgeTextEmerald = (e: any) => {
        if (e.id === 'AB' && step > 4) return true;
        if (e.id === 'BC' && step > 5) return true;
        if (e.id === 'CA' && step > 6) return true;
        return false;
    };

    const getDesc = () => {
        switch (step) {
            case 0: return (
                <div>
                    <b>Исходный граф.</b> Имеется ребро отрицательного веса (A → B = -2). 
                    Если мы запустим быстрый алгоритм Дейкстры, он отработает неверно и сломается на этом ребре.
                </div>
            );
            case 1: return (
                <div>
                    <b>Шаг 1: Точка отсчета.</b><br/> 
                    Добавляем фиктивную вершину S. Соединяем её со всеми <span className="text-amber-400">нулевыми однонаправленными ребрами</span>.
                    Это наша база для расчета потенциалов.
                </div>
            );
            case 2: return (
                <div>
                    <b>Шаг 2: Ищем потенциалы $h(v)$.</b><br/>
                    Запускаем медленный, но мощный алгоритм Форда-Беллмана из вершины S. Находим кратчайшие расстояния от S до всех остальных вершин: 
                    <span className="text-pink-300 ml-1">h(A)=0, h(B)=-2, h(C)=-1</span>.
                </div>
            );
            case 3: return (
                <div>
                    <b>Шаг 3: Магическая формула.</b><br/>
                    Всем ребрам графа назначаем новый вес:
                    <div className="text-center font-mono text-emerald-400 my-2 text-base">w'(u,v) = w(u,v) + h(u) - h(v)</div>
                    Это повышает или понижает вес ребра в зависимости от "высоты" потенциала.
                </div>
            );
            case 4: return (
                <div>
                    <b>Шаг 3.1: Пересчет ребра A → B.</b><br/>
                    Старый вес: <span className="text-rose-400 font-bold">-2</span>. <br/>
                    Вычисляем: -2 + 0 - (-2) = <span className="text-emerald-400 font-bold">0</span>.
                </div>
            );
            case 5: return (
                <div>
                    <b>Шаг 3.2: Пересчет ребра B → C.</b><br/>
                    Старый вес: 1. <br/>
                    Вычисляем: 1 + (-2) - (-1) = <span className="text-emerald-400 font-bold">0</span>.
                </div>
            );
            case 6: return (
                <div>
                    <b>Шаг 3.3: Пересчет ребра C → A.</b><br/>
                    Старый вес: 2. <br/>
                    Вычисляем: 2 + (-1) - 0 = <span className="text-emerald-400 font-bold">1</span>.
                </div>
            );
            case 7: return (
                <div className="text-emerald-300">
                    <b>Готово!</b> Фиктивную вершину S можно удалить.<br/>
                    Все новые веса ребер в графе стали ≥ 0 (0, 0, 1). 
                    При этом старые кратчайшие пути остались самыми короткими. Теперь можно безопасно и быстро запускать Дейкстру от N вершин!
                </div>
            );
            default: return "";
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl max-w-4xl w-full mx-auto">
            <h4 className="text-sm md:text-base font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                Визуализация: Перевзвешивание алгоритмом Джонсона 🎩
            </h4>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-[#0f172a] flex-1 min-h-[350px] border border-slate-800 rounded-xl relative flex items-center justify-center p-4">
                    <svg width="400" height="300" className="overflow-visible w-full max-w-[400px]">
                        <defs>
                            <marker id="arrow-slate" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                            </marker>
                            <marker id="arrow-slate-dim" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                            </marker>
                            <marker id="arrow-amber" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                            </marker>
                            <marker id="arrow-pink" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
                            </marker>
                            <marker id="arrow-emerald" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                            </marker>
                        </defs>

                        {/* Edges */}
                        {edges.map((e, i) => {
                            const u = nodes.find(n => n.id === e.u)!;
                            const v = nodes.find(n => n.id === e.v)!;
                            
                            const isS = e.u === 'S';
                            if (isS && (step === 0 || step === 7)) return null;

                            const midX = (u.x + v.x) / 2 + (e.labelDx || 0);
                            const midY = (u.y + v.y) / 2 + (e.labelDy || 0);
                            
                            const edgeColorClass = getEdgeColorClass(e);
                            const textHigh = isEdgeTextHighlighted(e);
                            const textEmer = isEdgeTextEmerald(e);

                            return (
                                <g key={i}>
                                    <line 
                                        x1={u.x} y1={u.y} x2={v.x} y2={v.y} 
                                        className={`stroke-2 transition-all duration-700 ${edgeColorClass}`} 
                                        markerEnd={getMarkerUrl(e)}
                                    />
                                    
                                    <text 
                                        x={midX} y={midY} 
                                        textAnchor="middle" 
                                        dominantBaseline="central"
                                        className={`text-xs md:text-sm font-bold font-mono transition-all duration-500
                                            ${textHigh ? 'fill-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] text-base' : 
                                              textEmer ? 'fill-emerald-400' : 
                                              isS ? 'fill-slate-500' : 'fill-slate-300'}
                                        `}>
                                        {getEdgeContent(e)}
                                    </text>
                                </g>
                            )
                        })}

                        {/* Nodes */}
                        {nodes.map(n => {
                            if (!isNodeVisible(n.id)) return null;
                            const pot = getPotential(n.id);
                            
                            return (
                                <g key={n.id} className="transition-all duration-500">
                                    <circle 
                                        cx={n.x} cy={n.y} r={18} 
                                        className={`stroke-2 transition-colors duration-500
                                        ${n.id === 'S' 
                                            ? 'fill-[#2d1b09] stroke-amber-500 stroke-dasharray-4' 
                                            : 'fill-slate-800 border stroke-slate-500'}`} 
                                    />
                                    <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" className="text-sm font-bold fill-white">
                                        {n.label}
                                    </text>
                                    
                                    {pot !== null && (
                                        <g transform={`translate(${n.x + (n.id === 'C' ? -25 : 25)}, ${n.y - 20})`} className="animate-in fade-in zoom-in duration-500">
                                            <rect x="-16" y="-10" width="32" height="20" rx="4" className="fill-pink-950 border stroke-pink-500 stroke-1" />
                                            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" className="text-xs font-mono font-bold fill-pink-400">
                                                {pot}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </div>

                <div className="w-full md:w-[320px] flex flex-col gap-4">
                    {/* Log Box */}
                    <div className="bg-[#0f172a] p-5 rounded-xl border border-indigo-900/50 shadow-inner flex-1 min-h-[160px] flex flex-col justify-center leading-relaxed text-sm text-slate-300">
                        {getDesc()}
                    </div>
                    
                    {/* Controls */}
                    <div className="flex bg-slate-900 border border-slate-700 p-2 rounded-xl justify-center gap-2">
                        <button onClick={() => setStep(0)} disabled={step === 0} 
                            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:text-slate-400 transition-colors" title="Сбросить (В начало)">
                            <RotateCcw strokeWidth={3} size={18} />
                        </button>
                        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                            className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:text-slate-400 transition-colors" title="Шаг назад">
                            <Undo strokeWidth={3} size={18} />
                        </button>
                        <button onClick={() => setStep(s => Math.min(MAX_STEP, s + 1))} disabled={step === MAX_STEP}
                            className={`flex-1 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors
                                ${step === MAX_STEP 
                                    ? 'bg-emerald-600/50 text-emerald-300 cursor-default' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}`}>
                            {step === MAX_STEP ? "Готово!" : step === 3 ? "К перевзвешиванию" : "Далее"}
                            {step !== MAX_STEP && <SkipForward size={18} strokeWidth={3} />}
                        </button>
                    </div>
                    
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1.5 mt-2">
                        {Array.from({length: MAX_STEP + 1}).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-400 scale-125' : i < step ? 'bg-indigo-900' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
