import { useMemo, useState } from "react";
import { Palette, RotateCcw, Wand2 } from "lucide-react";
import { useVizRuntime, vizNumber, vizRecord, vizArray, vizString } from "../data/vizStepBus";

/**
 * Тема 7 «Графы. Планарные. Покраска».
 * Жадная раскраска планарного графа: кликни цвет, потом вершину.
 * Компилятор читает v (текущая вершина), color[] (массив цветов), k (число цветов).
 */

interface V {
  id: number;
  label: string;
  x: number;
  y: number;
}

// Планарный граф (триангуляция): 7 вершин, все рёбра без пересечений.
const NODES: V[] = [
  { id: 0, label: "A", x: 210, y: 40 },
  { id: 1, label: "B", x: 350, y: 110 },
  { id: 2, label: "C", x: 320, y: 250 },
  { id: 3, label: "D", x: 110, y: 260 },
  { id: 4, label: "E", x: 70, y: 110 },
  { id: 5, label: "F", x: 210, y: 150 },
  { id: 6, label: "G", x: 205, y: 285 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
  [2, 6], [3, 6], [5, 6],
];

const ADJ: number[][] = (() => {
  const adj: number[][] = NODES.map(() => []);
  EDGES.forEach(([u, v]) => {
    adj[u].push(v);
    adj[v].push(u);
  });
  return adj;
})();

const COLORS = [
  { name: "красный", hex: "#ef4444" },
  { name: "синий", hex: "#3b82f6" },
  { name: "зелёный", hex: "#22c55e" },
  { name: "жёлтый", hex: "#eab308" },
];

const CONFLICT = "#e11d48";

/** Жадная раскраска по возрастанию номеров — честный учебный алгоритм. */
function greedy(): number[] {
  const color: number[] = NODES.map(() => -1);
  for (let v = 0; v < NODES.length; v++) {
    const used = new Set(ADJ[v].map((u) => color[u]).filter((c) => c >= 0));
    let c = 0;
    while (used.has(c)) c++;
    color[v] = c;
  }
  return color;
}

export function ColoringViz() {
  const [colors, setColors] = useState<number[]>(NODES.map(() => -1));
  const [brush, setBrush] = useState(0);

  // ── Синхронизация с Python-компилятором.
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const liveVLabel = vizString(vars?.v);
  const liveVNum = vizNumber(vars?.v);
  const liveColorRec = vizRecord(vars?.color) ?? vizRecord(vars?.colors);
  const liveColorArr = vizArray(vars?.color) ?? vizArray(vars?.colors);
  const liveK = vizNumber(vars?.k);

  const liveColors: number[] | null = (() => {
    if (liveColorArr) {
      const arr = liveColorArr.map((c) => vizNumber(c));
      if (arr.every((c) => c === null || c >= -1)) {
        const padded = [...arr.map((c) => c ?? -1)];
        while (padded.length < NODES.length) padded.push(-1);
        return padded.slice(0, NODES.length);
      }
      return null;
    }
    if (liveColorRec) {
      return NODES.map((n) => {
        const byLabel = liveColorRec[n.label];
        const byId = liveColorRec[String(n.id)];
        const raw = byLabel !== undefined ? byLabel : byId;
        const c = typeof raw === "string" ? COLORS.findIndex((x) => x.name.startsWith(raw)) : vizNumber(raw);
        return c === null || c === undefined ? -1 : c;
      });
    }
    return null;
  })();

  const compilerLinked = liveColors !== null || liveVLabel !== null || liveVNum !== null || liveK !== null;
  const shownColors = liveColors ?? colors;

  const liveCurrent = (() => {
    if (liveVLabel) {
      const i = NODES.findIndex((n) => n.label === liveVLabel);
      if (i >= 0) return i;
    }
    if (liveVNum !== null && liveVNum >= 0 && liveVNum < NODES.length) return liveVNum;
    return null;
  })();

  const conflicts = useMemo(() => {
    const bad = new Set<number>();
    EDGES.forEach(([u, v]) => {
      const cu = shownColors[u];
      const cv = shownColors[v];
      if (cu >= 0 && cu === cv) {
        bad.add(u);
        bad.add(v);
      }
    });
    return bad;
  }, [shownColors]);

  const usedColors = useMemo(
    () => new Set(shownColors.filter((c) => c >= 0)).size,
    [shownColors]
  );

  const paint = (id: number) => {
    const next = [...colors];
    next[id] = next[id] === brush ? -1 : brush;
    setColors(next);
  };

  return (
    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl max-w-5xl mx-auto my-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">🎨 Раскраска планарного графа</h3>
          <p className="text-xs text-slate-400">
            Смежные вершины не должны совпадать по цвету. Теорема о четырёх красках: планарному графу хватит 4.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setColors(greedy())}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <Wand2 className="w-3.5 h-3.5" /> Жадная раскраска
          </button>
          <button
            onClick={() => setColors(NODES.map(() => -1))}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Сброс
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        <div className="bg-slate-950 rounded-xl border border-slate-800 relative min-h-[320px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <svg className="w-full h-[340px] relative z-10" viewBox="0 0 420 330">
            {EDGES.map(([u, v], i) => (
              <line key={i} x1={NODES[u].x} y1={NODES[u].y} x2={NODES[v].x} y2={NODES[v].y}
                stroke="#475569" strokeWidth={2.2} />
            ))}
            {NODES.map((n) => {
              const c = shownColors[n.id];
              const isConflict = conflicts.has(n.id);
              const isCurrent = liveCurrent === n.id;
              const fill = isConflict ? CONFLICT : c >= 0 ? COLORS[c].hex : "#1e293b";
              return (
                <g key={n.id} className="cursor-pointer" onClick={() => !compilerLinked && paint(n.id)}>
                  {isCurrent && <circle cx={n.x} cy={n.y} r={19} fill="none" stroke="#22d3ee" strokeWidth={2.5} className="animate-pulse" />}
                  <circle cx={n.x} cy={n.y} r={14} fill={fill} stroke={isConflict ? "#fff" : "#0f172a"} strokeWidth={isConflict ? 3 : 2} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="pointer-events-none">
                    {n.label}
                  </text>
                  {c >= 0 && (
                    <text x={n.x} y={n.y - 20} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace" className="pointer-events-none">
                      color[{n.id}]={c}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {compilerLinked && (
            <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-500/40 px-2 py-1 rounded-md text-[10px] text-emerald-300 z-20">
              🐍 Python красит: {liveVLabel ?? ((liveVNum !== null ? NODES[liveVNum]?.label : "") || "—")}
            </div>
          )}
          {conflicts.size > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-rose-950/90 border border-rose-500/50 px-3 py-1 rounded-lg text-[11px] text-rose-300 z-20">
              ⚠️ Конфликт: смежные вершины одного цвета
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Кисть
            </div>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setBrush(i)}
                  title={c.name}
                  className={`h-8 rounded-lg border-2 transition-transform ${brush === i ? "scale-110 border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Использовано цветов k</div>
            <div className={`text-2xl font-extrabold font-mono ${usedColors > 4 ? "text-rose-400" : "text-emerald-400"}`}>
              {compilerLinked && liveK !== null ? liveK : usedColors}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">для планарного всегда ≤ 4</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed">
            <b className="text-slate-200">Жадный алгоритм:</b> идём по вершинам v = 0…n−1 и красим в минимальный цвет, которого нет у соседей.
            На этом графе жадная раскраска даёт 4 цвета. Для любого планарного графа существует порядок вершин, при котором жадная даст ≤ 6 цветов (в планарном всегда есть вершина степени ≤ 5), а существование 4-цветной раскраски — теорема Аппеля и Хакена (1976, перебор на компьютере).
          </div>
        </div>
      </div>
    </div>
  );
}
