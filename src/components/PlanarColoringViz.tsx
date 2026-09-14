import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Palette, Network, GitBranch, Terminal, Layers } from "lucide-react";
import { PlanarityDemo } from "./PlanarityDemo";
import { VizChapterContext, emitVizDemo, useVizRuntime, vizArray, vizNumber } from "../data/vizStepBus";

/**
 * Билет 7 — «Графы. Планарные. Покраска».
 *
 * Четыре вкладки:
 *  1. «Планарность» — K5 и K3,3 с подсвеченными пересечениями (PlanarityDemo);
 *  2. «Жадная покраска» — χ ≤ Δ + 1: вершины красятся по порядку, каждой
 *     достаётся наименьший цвет, не занятый соседями;
 *  3. «Двудольность» — проверка 2-раскрашиваемости BFS-ом: конфликт =
 *     нечётный цикл = двумя красками не обойтись;
 *  4. «Покраска рёбер» — χ′ ≤ Δ + 1 (Визинг), а для двудольного графа
 *     χ′ = Δ (теорема Кёнига).
 *
 * Два графа на выбор: «основной» (8 вершин, Δ = 3, есть треугольник → χ = 3)
 * и «двудольный» (6 вершин, Δ = 3, χ = 2, χ′ = 3).
 *
 * Синхронизация с Python-компилятором (PAGE_SYNC["planarity-euler-formula"]):
 *  color/col — массив цветов вершин (красит кружки напрямую),
 *  ecolor/ec — массив цветов рёбер, v — текущая вершина, e — текущее ребро,
 *  u — сосед, chi/k — число цветов, delta/D — максимальная степень,
 *  i/step — номер кадра.
 */

type Tab = "planar" | "greedy" | "bipartite" | "edges";
type GraphKey = "main" | "bip";

interface Graph {
  key: GraphKey;
  label: string;
  n: number;
  edges: [number, number][];
  adj: number[][];
  pos: { x: number; y: number }[];
  names: string[];
}

const PALETTE = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#06b6d4", "#a855f7", "#ec4899"];
const colorOf = (c: number) => (c >= 1 && c <= PALETTE.length ? PALETTE[c - 1] : "#334155");

function makeGraph(key: GraphKey): Graph {
  if (key === "bip") {
    const edges: [number, number][] = [[0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5]];
    const pos = [
      { x: 80, y: 60 }, { x: 80, y: 150 }, { x: 80, y: 240 },
      { x: 380, y: 60 }, { x: 380, y: 150 }, { x: 380, y: 240 },
    ];
    const g: Graph = { key, label: "Двудольный (6 вершин, Δ = 3)", n: 6, edges, adj: [], pos, names: ["A", "B", "C", "D", "E", "F"] };
    g.adj = buildAdj(g);
    return g;
  }
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7], [6, 7]];
  const pos = [
    { x: 70, y: 60 }, { x: 175, y: 40 }, { x: 150, y: 145 }, { x: 275, y: 70 },
    { x: 250, y: 185 }, { x: 365, y: 110 }, { x: 350, y: 225 }, { x: 435, y: 170 },
  ];
  const g: Graph = { key, label: "Основной (8 вершин, Δ = 3, есть треугольник)", n: 8, edges, adj: [], pos, names: ["0", "1", "2", "3", "4", "5", "6", "7"] };
  g.adj = buildAdj(g);
  return g;
}

function buildAdj(g: Graph): number[][] {
  const adj: number[][] = g.edges.reduce((acc: number[][], [u, v]) => {
    acc[u].push(v);
    acc[v].push(u);
    return acc;
  }, Array.from({ length: g.n }, () => [] as number[]));
  adj.forEach((a) => a.sort((x, y) => x - y));
  return adj;
}

interface Frame {
  title: string;
  note: string;
  color: number[];        // 0 = не покрашена
  ecolor?: number[];      // 0 = не покрашено
  v: number | null;
  u: number | null;
  e: number | null;
  used?: number[];
  bad?: [number, number] | null;
}

/** Жадная покраска вершин: χ ≤ Δ + 1. */
function greedyFrames(g: Graph): Frame[] {
  const frames: Frame[] = [];
  const color = new Array(g.n).fill(0);
  const delta = Math.max(...g.adj.map((a) => a.length));
  frames.push({
    title: "Старт: ни одна вершина не покрашена",
    note: `color = [0]·n. Порядок обхода — просто по номерам вершин. Максимальная степень Δ = ${delta}, значит жадный алгоритм гарантированно уложится в Δ + 1 = ${delta + 1} цветов: у вершины не больше Δ соседей, и каждый «забирает» по одному цвету.`,
    color: [...color], v: null, u: null, e: null,
  });
  for (let v = 0; v < g.n; v++) {
    const used = Array.from(new Set(g.adj[v].filter((x) => color[x] > 0).map((x) => color[x]))).sort((a, b) => a - b);
    let c = 1;
    while (used.includes(c)) c += 1;
    color[v] = c;
    const deg = g.adj[v].length;
    frames.push({
      title: `Вершина ${g.names[v]}: берём цвет ${c}`,
      note: used.length
        ? `Соседи уже заняли цвета {${used.join(", ")}} → наименьший свободный = ${c}. Степень вершины ${deg}, поэтому цветов 1…${deg + 1} всегда хватит (χ ≤ Δ + 1).`
        : `У вершины ${g.names[v]} ещё нет покрашенных соседей (степень ${deg}) → подходит цвет 1.`,
      color: [...color], v, u: null, e: null, used,
    });
  }
  const chi = Math.max(...color);
  frames.push({
    title: `Готово: жадная покраска использовала ${chi} ${chi === 1 ? "цвет" : chi < 5 ? "цвета" : "цветов"}`,
    note: `χ_жадн = ${chi}. Истинное хроматическое число не больше: χ ≤ ${chi}. Оценка Δ + 1 = ${delta + 1} не превышена${chi <= delta ? `, а теорема Брукса (χ ≤ Δ, если граф не полный и не нечётный цикл) здесь выполняется: ${chi} ≤ ${delta}` : ""}.`,
    color: [...color], v: null, u: null, e: null,
  });
  return frames;
}

/** Проверка двудольности BFS-ом: 2 краски ⟺ нет нечётного цикла. */
function bipartiteFrames(g: Graph): Frame[] {
  const frames: Frame[] = [];
  const color = new Array(g.n).fill(0);
  const queue: number[] = [];
  let conflict: [number, number] | null = null;
  frames.push({
    title: "Старт: пробуем покрасить в 2 цвета",
    note: "BFS красит вершину в цвет, противоположный родителю. Если где-то два соседа получат один цвет — найден нечётный цикл и граф НЕ двудольный (χ > 2).",
    color: [...color], v: null, u: null, e: null,
  });
  for (let start = 0; start < g.n && !conflict; start++) {
    if (color[start] !== 0) continue;
    color[start] = 1;
    queue.push(start);
    frames.push({
      title: `Запускаем BFS из ${g.names[start]}: цвет 1`,
      note: `Вершина ${g.names[start]} ещё не покрашена — начинаем новую долю. Все достижимые из неё вершины получат чередующиеся цвета 1 и 2.`,
      color: [...color], v: start, u: null, e: null,
    });
    while (queue.length && !conflict) {
      const v = queue.shift() as number;
      for (const u of g.adj[v]) {
        if (color[u] === 0) {
          color[u] = 3 - color[v];
          queue.push(u);
          frames.push({
            title: `${g.names[v]} → ${g.names[u]}: цвет ${color[u]}`,
            note: `Сосед не покрашен: color[${g.names[u]}] = 3 − color[${g.names[v]}] = ${color[u]}. Очередь: [${queue.map((x) => g.names[x]).join(", ") || "пуста"}].`,
            color: [...color], v, u, e: null,
          });
        } else if (color[u] === color[v]) {
          conflict = [v, u];
          frames.push({
            title: `Конфликт: ${g.names[v]} и ${g.names[u]} одного цвета`,
            note: `Ребро (${g.names[v]}, ${g.names[u]}) соединяет вершины одного цвета → в графе есть НЕЧЁТНЫЙ цикл. Двумя красками его не покрасить: χ ≥ 3.`,
            color: [...color], v, u, e: null, bad: conflict,
          });
        }
      }
    }
  }
  frames.push({
    title: conflict ? "Граф НЕ двудольный" : "Граф двудольный: хватило 2 цветов",
    note: conflict
      ? `BFS упёрся в нечётный цикл (${g.names[conflict[0]]}—${g.names[conflict[1]]}). Для двудольных графов χ = 2, здесь нужно хотя бы 3 краски — их и даёт жадный алгоритм на вкладке «Покраска вершин».`
      : "Все вершины разбиты на две доли, рёбер внутри доли нет: это ровно определение двудольного графа, и χ = 2. Для двудольного графа справедлива теорема Кёнига: χ′ = Δ (рёберная покраска обходится Δ цветами).",
    color: [...color], v: null, u: null, e: null, bad: conflict,
  });
  return frames;
}

/** Жадная покраска рёбер: Δ ≤ χ′ ≤ Δ + 1 (Визинг), для двудольных χ′ = Δ (Кёниг). */
function edgeFrames(g: Graph): Frame[] {
  const frames: Frame[] = [];
  const ecolor = new Array(g.edges.length).fill(0);
  const inc: Map<number, number>[] = Array.from({ length: g.n }, () => new Map<number, number>());
  const delta = Math.max(...g.adj.map((a) => a.length));
  frames.push({
    title: "Старт: рёбра не покрашены",
    note: `Правильная рёберная покраска: у каждой вершины все инцидентные рёбра разного цвета. Минимум нужно Δ = ${delta} цветов (все Δ рёбер одной вершины различны), а по теореме Визинга всегда хватает Δ + 1 = ${delta + 1}.`,
    color: new Array(g.n).fill(0), ecolor: [...ecolor], v: null, u: null, e: null,
  });
  g.edges.forEach(([a, b], i) => {
    const usedA = Array.from(inc[a].values());
    const usedB = Array.from(inc[b].values());
    const used = Array.from(new Set([...usedA, ...usedB])).sort((x, y) => x - y);
    let c = 1;
    while (used.includes(c)) c += 1;
    ecolor[i] = c;
    inc[a].set(i, c);
    inc[b].set(i, c);
    frames.push({
      title: `Ребро (${g.names[a]}, ${g.names[b]}): цвет ${c}`,
      note: `В вершине ${g.names[a]} заняты цвета {${usedA.sort((x, y) => x - y).join(", ") || "—"}}, в ${g.names[b]} — {${usedB.sort((x, y) => x - y).join(", ") || "—"}}. Наименьший свободный = ${c}. Больше Δ + 1 = ${delta + 1} цветов жадный алгоритм не возьмёт никогда.`,
      color: new Array(g.n).fill(0), ecolor: [...ecolor], v: a, u: b, e: i, used,
    });
  });
  const chiE = Math.max(...ecolor);
  frames.push({
    title: `Готово: χ′ = ${chiE} при Δ = ${delta}`,
    note:
      g.key === "bip"
        ? `Двудольный граф: χ′ = Δ = ${delta} — это теорема Кёнига (для двудольных жадная рёберная покраска не требует лишнего цвета). Класс 1 по Визингу.`
        : `χ′ = ${chiE}. Теорема Визинга: Δ ≤ χ′ ≤ Δ + 1, то есть ${delta} ≤ ${chiE} ≤ ${delta + 1}. Графы с χ′ = Δ называют классом 1, с χ′ = Δ + 1 — классом 2 (например, K3 и любой граф с «перегруженной» вершиной).`,
    color: new Array(g.n).fill(0), ecolor: [...ecolor], v: null, u: null, e: null,
  });
  return frames;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "planar", label: "1 · Планарность: K5 и K3,3", icon: <Network className="w-3.5 h-3.5" /> },
  { id: "greedy", label: "2 · Покраска вершин (χ ≤ Δ+1)", icon: <Palette className="w-3.5 h-3.5" /> },
  { id: "bipartite", label: "3 · Двудольность (2 краски)", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "edges", label: "4 · Покраска рёбер (Визинг, Кёниг)", icon: <GitBranch className="w-3.5 h-3.5" /> },
];

export const PlanarColoringViz: React.FC = () => {
  const chapterId = useContext(VizChapterContext);
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const [tab, setTab] = useState<Tab>("greedy");
  const [graphKey, setGraphKey] = useState<GraphKey>("main");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (chapterId) emitVizDemo(chapterId, tab);
  }, [chapterId, tab]);

  const graph = useMemo(() => makeGraph(graphKey), [graphKey]);
  const frames = useMemo(() => {
    if (tab === "greedy") return greedyFrames(graph);
    if (tab === "bipartite") return bipartiteFrames(graph);
    if (tab === "edges") return edgeFrames(graph);
    return [] as Frame[];
  }, [tab, graph]);
  const maxStep = Math.max(0, frames.length - 1);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [tab, graphKey]);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1300);
    return () => window.clearInterval(t);
  }, [playing, maxStep]);

  /* живые переменные компилятора */
  const liveStep = vars ? vizNumber(vars.step) ?? vizNumber(vars.i) : null;
  useEffect(() => {
    if (liveStep === null || !Number.isFinite(liveStep)) return;
    setStep(Math.max(0, Math.min(maxStep, liveStep)));
  }, [liveStep, maxStep]);

  const liveColor = vars ? vizArray(vars.color) ?? vizArray(vars.col) ?? vizArray(vars.colors) : null;
  const liveEcolor = vars ? vizArray(vars.ecolor) ?? vizArray(vars.ec) ?? vizArray(vars.edgeColor) : null;
  const liveV = vars ? vizNumber(vars.v) : null;
  const liveU = vars ? vizNumber(vars.u) : null;
  const liveE = vars ? vizNumber(vars.e) : null;
  const liveChi = vars ? vizNumber(vars.chi) ?? vizNumber(vars.k) ?? vizNumber(vars.colorsUsed) : null;
  const linked = Boolean(liveColor || liveEcolor || (liveV !== null && Number.isFinite(liveV)));

  const frame = frames[Math.min(step, maxStep)] ?? ({ title: "", note: "", color: [], v: null, u: null, e: null } as Frame);
  const nodeColor = (id: number): number => {
    if (liveColor && typeof liveColor[id] === "number") return Number(liveColor[id]);
    return frame.color?.[id] ?? 0;
  };
  const edgeColor = (i: number): number => {
    if (liveEcolor && typeof liveEcolor[i] === "number") return Number(liveEcolor[i]);
    return frame.ecolor?.[i] ?? 0;
  };
  const curV = liveV !== null && Number.isFinite(liveV) && liveV >= 0 && liveV < graph.n ? liveV : frame.v;
  const curU = liveU !== null && Number.isFinite(liveU) && liveU >= 0 && liveU < graph.n ? liveU : frame.u;
  const curE = liveE !== null && Number.isFinite(liveE) && liveE >= 0 && liveE < graph.edges.length ? liveE : frame.e;
  const delta = Math.max(...graph.adj.map((a) => a.length));
  const usedColors = Array.from(new Set(graph.pos.map((_, i) => nodeColor(i)).filter((c) => c > 0))).length;
  const usedEcolors = Array.from(new Set(graph.edges.map((_, i) => edgeColor(i)).filter((c) => c > 0))).length;

  const go = useCallback((d: number) => {
    setPlaying(false);
    setStep((s) => Math.max(0, Math.min(maxStep, s + d)));
  }, [maxStep]);

  if (tab === "planar") {
    return (
      <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-xl">
        <Header />
        <Tabs tab={tab} setTab={setTab} />
        <PlanarityDemo />
        <p className="text-[11px] text-slate-500 mt-2">
          Формула Эйлера V − E + F = 2 и оценка E ≤ 3V − 6 — на вкладке «Планарность»; покраска вершин и рёбер — на следующих трёх.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-xl">
      <Header />
      <Tabs tab={tab} setTab={setTab} />

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">граф:</span>
        {(["main", "bip"] as GraphKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setGraphKey(k)}
            className={"px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors " + (graphKey === k ? "bg-indigo-600 text-white" : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700")}
          >
            {makeGraph(k).label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => { setStep(0); setPlaying(false); }} aria-label="Сбросить покраску" title="Сбросить покраску" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => go(-1)} disabled={step === 0} aria-label="Шаг назад" title="Шаг назад" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {playing ? "Пауза" : "Запустить"}
        </button>
        <button onClick={() => go(1)} disabled={step >= maxStep} aria-label="Шаг вперёд" title="Шаг вперёд" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        <span className="text-[11px] text-slate-500 ml-1">кадр {step + 1} / {maxStep + 1}</span>
        <span className="ml-auto flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="bg-slate-950 border border-slate-700 text-slate-300 rounded-md px-2 py-1">Δ = {delta}</span>
          {tab === "edges"
            ? <span className="bg-slate-950 border border-fuchsia-700/40 text-fuchsia-300 rounded-md px-2 py-1">χ′ = {liveChi ?? usedEcolors}</span>
            : <span className="bg-slate-950 border border-fuchsia-700/40 text-fuchsia-300 rounded-md px-2 py-1">χ = {liveChi ?? usedColors}</span>}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 p-2">
          <svg viewBox="0 0 480 300" className="w-full h-auto">
            {graph.edges.map(([a, b], i) => {
              const ec = edgeColor(i);
              const isCur = i === curE;
              const isBad = Boolean(frame.bad && ((frame.bad[0] === a && frame.bad[1] === b) || (frame.bad[0] === b && frame.bad[1] === a)));
              return (
                <g key={i}>
                  <line
                    x1={graph.pos[a].x} y1={graph.pos[a].y} x2={graph.pos[b].x} y2={graph.pos[b].y}
                    stroke={isBad ? "#f43f5e" : ec > 0 ? colorOf(ec) : "#334155"}
                    strokeWidth={isCur ? 6 : isBad ? 5 : ec > 0 ? 4 : 2}
                    strokeDasharray={ec === 0 && !isBad ? "5 5" : undefined}
                    className="transition-all duration-300"
                    opacity={isCur || isBad ? 1 : 0.85}
                  />
                  {tab === "edges" && ec > 0 && (
                    <text x={(graph.pos[a].x + graph.pos[b].x) / 2} y={(graph.pos[a].y + graph.pos[b].y) / 2 - 5} textAnchor="middle" fill={colorOf(ec)} fontSize="10" fontWeight="bold">{ec}</text>
                  )}
                </g>
              );
            })}
            {graph.pos.map((p, id) => {
              const c = nodeColor(id);
              const isCur = id === curV;
              const isNbr = id === curU;
              return (
                <g key={id}>
                  <circle cx={p.x} cy={p.y} r={isCur ? 17 : 15} fill={c > 0 ? colorOf(c) : "#1e293b"} stroke={isCur ? "#fbbf24" : isNbr ? "#38bdf8" : c > 0 ? colorOf(c) : "#475569"} strokeWidth={isCur || isNbr ? 4 : 2} className="transition-all duration-300" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fill={c > 0 ? "#fff" : "#94a3b8"} fontSize="11" fontWeight="bold">{graph.names[id]}</text>
                  {c > 0 && tab !== "edges" && <text x={p.x} y={p.y - 21} textAnchor="middle" fill={colorOf(c)} fontSize="9" fontWeight="bold">цвет {c}</text>}
                  {tab === "edges" && <text x={p.x} y={p.y - 21} textAnchor="middle" fill="#64748b" fontSize="9">deg {graph.adj[id].length}</text>}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3.5">
            <p className="text-sm font-bold text-white mb-1">{frame.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{frame.note}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{tab === "edges" ? "цвета рёбер" : "цвета вершин"}</p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {(tab === "edges" ? graph.edges.map((_, i) => edgeColor(i)) : graph.pos.map((_, i) => nodeColor(i))).map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded border" style={{ borderColor: c > 0 ? colorOf(c) : "#334155", color: c > 0 ? colorOf(c) : "#475569", background: c > 0 ? colorOf(c) + "18" : "transparent" }}>
                  {tab === "edges" ? `e${i}` : graph.names[i]}:{c || "—"}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3.5 text-[11px] text-slate-400 leading-relaxed">
            {tab === "greedy" && <>Жадная покраска: <b className="text-slate-200">χ ≤ Δ + 1</b> для любого графа. Теорема Брукса усиливает: <b className="text-slate-200">χ ≤ Δ</b>, если граф не является полным K<sub>n</sub> или нечётным циклом. Для планарных графов χ ≤ 5 (доказывается через E ≤ 3V − 6 и цепи Кемпе), а χ ≤ 4 — теорема о четырёх красках (Аппель—Хакен, 1976, доказана перебором).</>}
            {tab === "bipartite" && <>Двудольный граф ⟺ нет нечётного цикла ⟺ <b className="text-slate-200">χ = 2</b>. Проверка — один BFS/DFS за O(V + E). Распознавание 3-раскрашиваемости уже NP-полно, даже для планарных графов.</>}
            {tab === "edges" && <>Рёберная покраска: <b className="text-slate-200">Δ ≤ χ′ ≤ Δ + 1</b> (Визинг). Для двудольных графов χ′ = Δ (Кёниг). Задача «χ′ = Δ?» NP-полна даже для кубических графов.</>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> из компилятора:</span>
        {vars && linked ? (
          ["v", "u", "e", "color", "ecolor", "chi"].map((name) =>
            vars[name] === undefined ? null : (
              <span key={name} className="text-[11px] font-mono bg-slate-950 border border-indigo-700/40 text-indigo-300 rounded-md px-2 py-1">
                {name} = {JSON.stringify(vars[name]).slice(0, 40)}
              </span>
            )
          )
        ) : (
          <span className="text-[11px] text-slate-500">
            открой панель Python: массив <code className="font-mono text-indigo-300">color</code> (или <code className="font-mono text-indigo-300">ecolor</code> для рёбер) и вершина <code className="font-mono text-indigo-300">v</code> перекрасят этот граф напрямую
          </span>
        )}
      </div>
    </div>
  );
};

const Header: React.FC = () => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-fuchsia-600 text-white rounded-xl shadow-lg shadow-fuchsia-600/20">
        <Palette className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Планарность и покраска графов</h3>
        <p className="text-xs text-fuchsia-300">K5/K3,3 · χ ≤ Δ+1 · Брукс · двудольность · Визинг и Кёниг</p>
      </div>
    </div>
  </div>
);

const Tabs: React.FC<{ tab: Tab; setTab: (t: Tab) => void }> = ({ tab, setTab }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {TABS.map((t) => (
      <button
        key={t.id}
        onClick={() => setTab(t.id)}
        className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors " + (tab === t.id ? "bg-fuchsia-600 text-white" : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700")}
      >
        {t.icon} {t.label}
      </button>
    ))}
  </div>
);

export default PlanarColoringViz;
