import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useVizRuntime, vizArray, vizString } from "../data/vizStepBus";

/**
 * Тема 24 «Классы сложности, сведение задач».
 * Диаграмма вложенности классов P ⊆ NP ⊆ PSPACE ⊆ EXPTIME и стрелки
 * полиномиальных сведений A ≤p B: если B решается легко, то и A — легко.
 */

type ClassId = "P" | "NP" | "PSPACE" | "EXPTIME";

interface Problem {
  id: string;
  name: string;
  cls: ClassId;
  x: number;
  y: number;
  npComplete?: boolean;
}

const PROBLEMS: Problem[] = [
  { id: "sort", name: "сортировка\nO(n log n)", cls: "P", x: 130, y: 255 },
  { id: "mst", name: "остов (Краскал)", cls: "P", x: 150, y: 215 },
  { id: "2sat", name: "2-SAT", cls: "P", x: 115, y: 185 },
  { id: "shortpath", name: "Дейкстра / Флойд", cls: "P", x: 170, y: 155 },
  { id: "sat", name: "3-SAT", cls: "NP", x: 330, y: 120, npComplete: true },
  { id: "vc", name: "Vertex Cover", cls: "NP", x: 385, y: 175, npComplete: true },
  { id: "ham", name: "Гамильтонов цикл", cls: "NP", x: 300, y: 200, npComplete: true },
  { id: "knap", name: "Рюкзак (точный)", cls: "NP", x: 355, y: 235, npComplete: true },
  { id: "circuit", name: "QBF / игра на формуле", cls: "PSPACE", x: 262, y: 292 },
  { id: "chess", name: "обобщённые шахматы", cls: "EXPTIME", x: 250, y: 340 },
];

const REDUCTIONS: [string, string, string][] = [
  ["sat", "vc", "3-SAT ≤p VC"],
  ["sat", "ham", "3-SAT ≤p Гамильтон"],
  ["vc", "knap", "VC ≤p Рюкзак"],
];

const CLASS_META: Record<ClassId, { title: string; color: string; note: string }> = {
  P: { title: "P", color: "#34d399", note: "решаются за полиномиальное время: сортировка, Дейкстра, Флойд, потоки" },
  NP: { title: "NP", color: "#fbbf24", note: "решение проверяется за полином: 3-SAT, Vertex Cover, Гамильтонов цикл" },
  PSPACE: { title: "PSPACE", color: "#818cf8", note: "полином по памяти: игры и QBF — перебор с откатами без хранения всего дерева" },
  EXPTIME: { title: "EXPTIME", color: "#f472b6", note: "экспоненциальное время: обобщённые шахматы и го" },
};

const CLASS_INFO: Record<ClassId, string> = {
  P: "P — класс задач, у которых ЕСТЬ быстрый (полиномиальный) алгоритм. Дейкстра, Краскал, Флойд, КМП — всё отсюда.",
  NP: "NP — задачи, у которых быстрой проверки ПРОЧЕСТЬ решение: дали ответ — проверим за полином. 3-SAT: подставили значения → убедились. P ⊆ NP: нашёл быстро → и проверяй быстро.",
  PSPACE: "PSPACE — хватает полиномиальной ПАМЯТИ (время может расти экспоненциально). QBF: кванторы ∀∃ чередуются — храним только текущую ветку рекурсии.",
  EXPTIME: "EXPTIME — есть алгоритм за 2^(poly n). Обобщённые шахматы: дерево игры экспоненциально, и полиномиальной памяти уже не хватает.",
};

const RECT: Record<ClassId, { x: number; y: number; w: number; h: number }> = {
  P: { x: 40, y: 90, w: 220, h: 210 },
  NP: { x: 30, y: 40, w: 400, h: 260 },
  PSPACE: { x: 15, y: 20, w: 440, h: 320 },
  EXPTIME: { x: 5, y: 5, w: 470, h: 360 },
};

export function ComplexityClassesViz() {
  const [selected, setSelected] = useState<ClassId | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  // ── Синхронизация с Python-компилятором: cls — имя класса, task — задача,
  // reductions — список стрелок вида ["3-SAT", "Vertex Cover"].
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const liveCls = vizString(vars?.cls);
  const liveTask = vizString(vars?.task);
  const liveRed = vizArray(vars?.reductions);
  const compilerLinked = liveCls !== null || liveTask !== null || !!liveRed;

  const liveRedPair = useMemo(() => {
    if (!liveRed || liveRed.length < 2) return null;
    return [String(liveRed[0]), String(liveRed[1])] as [string, string];
  }, [liveRed]);

  const activeCls: ClassId | null =
    compilerLinked && liveCls
      ? (Object.keys(CLASS_META).find((k) => k.toLowerCase() === liveCls.trim().toLowerCase()) as ClassId | undefined) ?? null
      : selected;

  const problemHit = (p: Problem) => {
    if (compilerLinked && liveTask) return p.name.toLowerCase().includes(liveTask.trim().toLowerCase());
    return selectedProblem === p.id;
  };

  const infoText = (() => {
    if (compilerLinked && liveTask) {
      const p = PROBLEMS.find((q) => q.name.toLowerCase().includes(liveTask.trim().toLowerCase()));
      if (p) return `${p.name.replace("\n", " ")} ∈ ${p.cls}${p.npComplete ? ", NP-полная" : ""}. ${CLASS_INFO[p.cls]}`;
    }
    if (compilerLinked && liveCls) {
      const cls = (activeCls ?? "NP") as ClassId;
      return CLASS_INFO[cls];
    }
    if (selectedProblem) {
      const p = PROBLEMS.find((q) => q.id === selectedProblem)!;
      return `${p.name.replace("\n", " ")} ∈ ${p.cls}${p.npComplete ? ", NP-полная: к ней сводятся все задачи из NP" : ""}. ${CLASS_INFO[p.cls]}`;
    }
    if (activeCls) return CLASS_INFO[activeCls as ClassId];
    return "Кликни на класс или задачу. «A ≤p B» = «A не сложнее B»: возьми ответ B и за полином преврати в ответ A.";
  })();

  const reset = () => {
    setSelected(null);
    setSelectedProblem(null);
  };

  return (
    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl max-w-5xl mx-auto my-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white">🪆 Классы сложности: матрёшка P ⊆ NP ⊆ PSPACE ⊆ EXPTIME</h3>
          <p className="text-xs text-slate-400">Стрелки — полиномиальные сведения: «моя задача не сложнее вашей».</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Сброс
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <svg className="w-full" viewBox="0 0 480 380">
            {(["EXPTIME", "PSPACE", "NP", "P"] as ClassId[]).map((cls) => {
              const r = RECT[cls];
              const dim = activeCls !== null && activeCls !== cls;
              return (
                <g key={cls} onClick={() => setSelected(cls)} className="cursor-pointer">
                  <rect
                    x={r.x} y={r.y} width={r.w} height={r.h} rx={26}
                    fill={CLASS_META[cls].color + (dim ? "08" : "14")}
                    stroke={CLASS_META[cls].color}
                    strokeWidth={activeCls === cls ? 3.5 : 1.8}
                    opacity={dim ? 0.45 : 1}
                  />
                  <text x={r.x + 12} y={r.y + 22} fill={CLASS_META[cls].color} fontSize="16" fontWeight="bold" opacity={dim ? 0.5 : 1}>
                    {CLASS_META[cls].title}
                    {cls === "NP" && <tspan fontSize="10" fill="#94a3b8"> (P внутри слева, NP-полные справа)</tspan>}
                  </text>
                </g>
              );
            })}

            {/* стрелки сведений */}
            {REDUCTIONS.map(([from, to, label]) => {
              const a = PROBLEMS.find((p) => p.id === from)!;
              const b = PROBLEMS.find((p) => p.id === to)!;
              const hot = compilerLinked && liveRedPair
                ? (liveRedPair[0] && a.name.toLowerCase().includes(liveRedPair[0].toLowerCase()) &&
                   liveRedPair[1] && b.name.toLowerCase().includes(liveRedPair[1].toLowerCase()))
                : selectedProblem === from || selectedProblem === to;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2 - 4;
              return (
                <g key={`${from}-${to}`} opacity={hot ? 1 : 0.55}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hot ? "#f97316" : "#64748b"} strokeWidth={hot ? 3 : 1.5} strokeDasharray="5 4" markerEnd="url(#arrowhead)" />
                  <text x={mx} y={my} textAnchor="middle" fill={hot ? "#fb923c" : "#94a3b8"} fontSize="9" fontFamily="monospace">{label}</text>
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="#64748b" />
              </marker>
            </defs>

            {PROBLEMS.map((p) => {
              const dim = activeCls !== null && activeCls !== p.cls;
              const hit = problemHit(p);
              return (
                <g key={p.id} onClick={() => setSelectedProblem(p.id)} className="cursor-pointer" opacity={dim ? 0.4 : 1}>
                  <rect
                    x={p.x - 46} y={p.y - 13} width={92} height={p.name.includes("\n") ? 28 : 22} rx={7}
                    fill={hit ? "#c2410c" : p.npComplete ? "#78350f" : "#064e3b"}
                    stroke={hit ? "#fb923c" : CLASS_META[p.cls].color}
                    strokeWidth={hit ? 2.5 : 1.2}
                  />
                  {p.name.split("\n").map((line, li, arr) => (
                    <text key={li} x={p.x} y={p.y + 4 + (li - (arr.length - 1) / 2) * 11} textAnchor="middle" fill="#fff" fontSize="8.2" fontWeight="600">
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CLASS_META) as ClassId[]).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelected(selected === cls ? null : cls)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition-colors ${
                  activeCls === cls ? "text-white" : "text-slate-300 hover:text-white"
                }`}
                style={{
                  borderColor: CLASS_META[cls].color + (activeCls === cls ? "" : "66"),
                  backgroundColor: activeCls === cls ? CLASS_META[cls].color + "33" : "rgba(15,23,42,0.6)",
                }}
              >
                {CLASS_META[cls].title}
                <div className="text-[9px] font-normal text-slate-400 mt-0.5 leading-tight">
                  {cls === "P" ? "быстро решаем" : cls === "NP" ? "быстро проверяем" : cls === "PSPACE" ? "мало памяти" : "экспонента времени"}
                </div>
              </button>
            ))}
          </div>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-xs text-slate-300 min-h-[110px] leading-relaxed">
            {compilerLinked && (
              <div className="mb-2 text-[10px] font-mono text-emerald-300">🐍 Python: {liveCls ? `cls="${liveCls}" ` : ""}{liveTask ? `task="${liveTask}"` : ""}</div>
            )}
            {infoText}
          </div>
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200 leading-relaxed">
            <b>Главный вопрос</b> — P = NP? Все верят, что нет: у 3-SAT тысячи применений, и «спрятать» быстрый алгоритм было бы чудом.
            Несведение (P ≠ NP) доказать никто не смог — а «сведение задач» — главный инструмент, чтобы вообще что-то доказывать: сведи свою задачу к 3-SAT, и она автоматически сложна.
          </div>
        </div>
      </div>
    </div>
  );
}
