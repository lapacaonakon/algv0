import { useState } from "react";
import { Undo } from "lucide-react";

const C1_NODES = [
  { id: 0, label: "A", x: 190, y: 60 },
  { id: 1, label: "B", x: 280, y: 140 },
  { id: 2, label: "C", x: 100, y: 140 },
  { id: 3, label: "D", x: 280, y: 250 },
  { id: 4, label: "E", x: 100, y: 250 }
];

const C1_EDGES = [
  { u: 0, v: 1 }, { u: 0, v: 2 },
  { u: 1, v: 3 }, { u: 2, v: 4 },
  { u: 1, v: 2 },
  { u: 3, v: 4 }
];

export function EulerSimulator() {
  const [c1Path, setC1Path] = useState<number[]>([]);
  const [c1VisitedEdges, setC1VisitedEdges] = useState<string[]>([]);
  const [c1Msg, setC1Msg] = useState("Кликни на вершину, чтобы начать обход.");
  const [c1Done, setC1Done] = useState(false);

  const resetC1 = () => {
    setC1Path([]); setC1VisitedEdges([]); setC1Msg("Кликни на вершину, чтобы начать обход."); setC1Done(false);
  };

  const clickC1 = (vId: number) => {
    if (c1Done && c1Path.length > 0) return;
    if (c1Path.length === 0) {
      setC1Path([vId]);
      setC1Msg("Старт! Кликай соседние вершины, чтобы пройти по рёбрам.");
      return;
    }
    const last = c1Path[c1Path.length - 1];
    const edge = C1_EDGES.find(e => (e.u === last && e.v === vId) || (e.u === vId && e.v === last));
    if (!edge) {
      setC1Msg("Нет ребра между этими вершинами! Выбери соседа.");
      return;
    }
    const key = `${Math.min(last,vId)}-${Math.max(last,vId)}`;
    if (c1VisitedEdges.includes(key)) {
      setC1Msg("Это ребро уже пройдено! Эйлер не прощает повторных хождений. Сбрось!");
      setC1Done(true); return;
    }
    const nextEdges = [...c1VisitedEdges, key];
    const nextPath = [...c1Path, vId];
    setC1VisitedEdges(nextEdges);
    setC1Path(nextPath);

    if (nextEdges.length === C1_EDGES.length) {
      const startDegree = C1_EDGES.filter(e => e.u === nextPath[0] || e.v === nextPath[0]).length;
      const endDegree = C1_EDGES.filter(e => e.u === vId || e.v === vId).length;
      const isCycle = startDegree % 2 === 0 && endDegree % 2 === 0;
      if (isCycle && nextPath[0] === vId) {
        setC1Msg("🎉 ЭЙЛЕРОВ ЦИКЛ! Все рёбра пройдены, финиш = старт! Чётные степени рулят!");
      } else {
        setC1Msg(`🎉 ЭЙЛЕРОВ ПУТЬ! Все рёбра пройдены! Старт ≠ Финиш. Это путь, не цикл.`);
      }
      setC1Done(true);
    } else {
      setC1Msg(`Пройдено рёбер: ${nextEdges.length} / ${C1_EDGES.length}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-white">Эйлер: пройди все рёбра</h4>
        <button onClick={resetC1} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all">
          <Undo className="h-3.5 w-3.5" /> Сброс
        </button>
      </div>
      
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-center relative min-h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <svg className="w-full h-[260px] z-10 relative" viewBox="0 0 380 310">
          {C1_EDGES.map((e, i) => {
            const u = C1_NODES.find(n => n.id === e.u)!;
            const v = C1_NODES.find(n => n.id === e.v)!;
            const key = `${Math.min(e.u,e.v)}-${Math.max(e.u,e.v)}`;
            const used = c1VisitedEdges.includes(key);
            return <line key={i} x1={u.x} y1={u.y} x2={v.x} y2={v.y}
              stroke={used ? "#6366f1" : "#475569"}
              strokeWidth={used ? 4 : 2}
              className="transition-all duration-300" />;
          })}
          {C1_NODES.map(n => {
            const isLast = c1Path[c1Path.length-1] === n.id;
            const visited = c1Path.includes(n.id);
            return <g key={n.id} className="cursor-pointer" onClick={() => clickC1(n.id)}>
              {isLast && <circle cx={n.x} cy={n.y} r={17} fill="none" stroke="#6366f1" strokeWidth={2} className="animate-pulse" />}
              <circle cx={n.x} cy={n.y} r={11}
                fill={isLast ? "#6366f1" : visited ? "#1e293b" : "#0f172a"}
                stroke={isLast ? "#fff" : visited ? "#6366f1" : "#475569"}
                strokeWidth={2.5}
                className="transition-all duration-200 hover:scale-110" />
              <text x={n.x} y={n.y+4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" className="pointer-events-none">{n.label}</text>
            </g>;
          })}
        </svg>
        <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700/60 px-2 py-1 rounded-md text-[10px] text-slate-300">
          Ребёр: {c1VisitedEdges.length}/{C1_EDGES.length}
        </div>
      </div>
      
      <div className={`p-3 rounded-xl border text-sm ${
        c1Done && c1VisitedEdges.length === C1_EDGES.length
          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
          : c1Done
          ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
          : "bg-slate-900/50 border-slate-700 text-slate-300"
      }`}>
        {c1Msg}
      </div>
    </div>
  );
}
