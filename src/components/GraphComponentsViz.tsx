import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Terminal, Layers, Network } from "lucide-react";
import { VizChapterContext, emitVizDemo, useVizRuntime, vizArray, vizNumber } from "../data/vizStepBus";

/**
 * Билет 8 — «Графы. Компоненты связности».
 *
 * Две вкладки:
 *  1. «Обход» — DFS/BFS-покраска: внешний цикл по непосещённым вершинам,
 *     каждый новый запуск = +1 к счётчику компонент.
 *  2. «DSU» — рёбра приходят по одному, union склеивает множества,
 *     comps уменьшается.
 *
 * Синхронизация с Python-компилятором (PAGE_SYNC["graph-components"]):
 *  - comp / color / used  — массив разметки: вершины красятся ПРЯМО по нему;
 *  - parent / p           — массив DSU: рисуем множества по корням;
 *  - v                    — текущая вершина (пульсирует);
 *  - stack / dq / q       — фронт обхода (подсвечивается);
 *  - comps / c            — счётчик компонент (большая цифра);
 *  - i / e / step         — номер шага: двигает покадровую демонстрацию.
 */

type Mode = "dfs" | "dsu";

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
}

/** Граф из 10 вершин и трёх компонент — ровно как в тексте билета. */
const NODES: Node[] = [
  { id: 0, label: "0", x: 90, y: 80 },
  { id: 1, label: "1", x: 175, y: 45 },
  { id: 2, label: "2", x: 205, y: 140 },
  { id: 3, label: "3", x: 105, y: 175 },
  { id: 4, label: "4", x: 330, y: 70 },
  { id: 5, label: "5", x: 420, y: 45 },
  { id: 6, label: "6", x: 380, y: 145 },
  { id: 7, label: "7", x: 130, y: 290 },
  { id: 8, label: "8", x: 230, y: 320 },
  { id: 9, label: "9", x: 330, y: 275 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 3], [1, 3], // компонента A: 0-1-2-3
  [4, 5], [5, 6], [4, 6],                 // компонента B: 4-5-6
  [7, 8], [8, 9],                         // компонента C: 7-8-9
];

const ADJ: number[][] = NODES.map(() => []);
EDGES.forEach(([u, v]) => {
  ADJ[u].push(v);
  ADJ[v].push(u);
});
ADJ.forEach((a) => a.sort((x, y) => x - y));

/** Палитра компонент. */
const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#06b6d4", "#a855f7"];

interface DfsFrame {
  title: string;
  note: string;
  comp: number[];          // 0 = не покрашена, иначе номер компоненты (1-based)
  cur: number | null;      // текущая вершина
  frontier: number[];      // стек/очередь
  comps: number;           // счётчик компонент
  edge: [number, number] | null;
}

/** Покадровая раскладка DFS-обхода: ровно тот порядок, что в коде билета. */
function buildDfsFrames(): DfsFrame[] {
  const frames: DfsFrame[] = [];
  const comp = new Array(NODES.length).fill(0);
  const push = (cur: number | null, frontier: number[], comps: number, title: string, note: string, edge: [number, number] | null = null) => {
    frames.push({ title, note, comp: [...comp], cur, frontier: [...frontier], comps, edge });
  };
  let c = 0;
  push(null, [], c, "Старт: все вершины серые", "comp = [-1]·n, счётчик c = 0. Внешний цикл пойдёт по вершинам 0…9 и запустит обход из каждой непокрашенной.");
  for (let start = 0; start < NODES.length; start++) {
    if (comp[start] !== 0) continue;
    c += 1;
    const stack = [start];
    comp[start] = c;
    push(start, stack, c, `Новый запуск: c = ${c}, старт из ${start}`, `Вершина ${start} не покрашена → это НОВАЯ компонента. Красим её в цвет ${c} и кладём в стек.`);
    while (stack.length) {
      const v = stack[stack.length - 1];
      const next = ADJ[v].find((to) => comp[to] === 0);
      if (next === undefined) {
        stack.pop();
        push(v, stack, c, `Из ${v} идти некуда — возврат`, `Все соседи ${v} уже покрашены. Снимаем ${v} со стека (это и есть откат DFS).`);
        continue;
      }
      comp[next] = c;
      stack.push(next);
      push(next, stack, c, `${v} → ${next}: красим в цвет ${c}`, `Ребро (${v}, ${next}) ведёт в непокрашенную вершину: comp[${next}] = ${c}, кладём ${next} в стек.`, [v, next]);
    }
    push(null, [], c, `Компонента ${c} готова`, `Стек пуст: обход закончился. В компоненте ${c} ровно ${comp.filter((x) => x === c).length} вершин. Ищем следующую серую вершину.`);
  }
  push(null, [], c, "Готово: компонент = " + c, `Внешний цикл прошёл все вершины, новых запусков больше не будет. Ответ: ${c} компоненты связности.`);
  return frames;
}

interface DsuFrame {
  title: string;
  note: string;
  parent: number[];
  comps: number;
  edge: [number, number] | null;
  merged: boolean;
}

function buildDsuFrames(): DsuFrame[] {
  const frames: DsuFrame[] = [];
  const parent = NODES.map((n) => n.id);
  const find = (v: number): number => (parent[v] === v ? v : find(parent[v]));
  let comps = NODES.length;
  const push = (title: string, note: string, edge: [number, number] | null, merged: boolean) =>
    frames.push({ title, note, parent: [...parent], comps, edge, merged });
  push("Старт: каждая вершина сама по себе", `parent[v] = v, comps = ${comps}. Ни одного ребра ещё не добавили — 10 изолированных множеств.`, null, false);
  EDGES.forEach(([u, v], i) => {
    const ru = find(u);
    const rv = find(v);
    if (ru === rv) {
      push(`Ребро ${i}: (${u}, ${v}) — корни совпали`, `find(${u}) = ${ru} = find(${v}): вершины уже в одной компоненте. Ребро замыкает цикл, union ничего не меняет, comps остаётся ${comps}.`, [u, v], false);
      return;
    }
    parent[rv] = ru;
    comps -= 1;
    push(`Ребро ${i}: union(${u}, ${v})`, `find(${u}) = ${ru}, find(${v}) = ${rv} — разные корни. Склеиваем: parent[${rv}] = ${ru}. Компонент стало ${comps}.`, [u, v], true);
  });
  push(`Готово: comps = ${comps}`, `Все ${EDGES.length} рёбер обработаны. Различных корней осталось ${comps} — это и есть число компонент связности.`, null, false);
  return frames;
}

const DFS_FRAMES = buildDfsFrames();
const DSU_FRAMES = buildDsuFrames();

/** Корень DSU-множества с полным сжатием пути. */
const dsuRoot = (parent: number[], v: number): number => {
  let cur = v;
  const seen = new Set<number>();
  while (parent[cur] !== cur && !seen.has(cur)) {
    seen.add(cur);
    cur = parent[cur];
  }
  return cur;
};

export const GraphComponentsViz: React.FC = () => {
  const chapterId = useContext(VizChapterContext);
  const runtime = useVizRuntime();
  const [mode, setMode] = useState<Mode>("dfs");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const frames = mode === "dfs" ? DFS_FRAMES : DSU_FRAMES;
  const maxStep = frames.length - 1;
  const frame = frames[Math.min(step, maxStep)] as DfsFrame & DsuFrame;

  /* ── вкладка сообщает компилятору, какой код подставлять ── */
  useEffect(() => {
    if (chapterId) emitVizDemo(chapterId, mode);
  }, [chapterId, mode]);

  /* ── автопроигрывание ── */
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, maxStep]);

  const goTo = useCallback((n: number) => setStep(Math.max(0, Math.min(maxStep, n))), [maxStep]);

  /* ── переменные компилятора, которые рисуются НАПРЯМУЮ ── */
  const vars = runtime?.variables;
  /** comp / color / used из кода пользователя → своя разметка вершин. */
  const liveComp = useMemo(() => {
    const arr = vars ? (vizArray(vars.comp) ?? vizArray(vars.color) ?? vizArray(vars.used)) : null;
    if (!arr) return null;
    return arr.slice(0, NODES.length).map((v) => (typeof v === "boolean" ? (v ? 1 : 0) : vizNumber(v) ?? 0));
  }, [vars]);
  /** parent / p из кода → DSU-множества по корням. */
  const liveParent = useMemo(() => {
    const arr = vars ? (vizArray(vars.parent) ?? vizArray(vars.p)) : null;
    if (!arr || arr.length < NODES.length) return null;
    return arr.slice(0, NODES.length).map((v) => vizNumber(v) ?? 0);
  }, [vars]);
  const liveCur = vars ? (vizNumber(vars.v) ?? vizNumber(vars.u)) : null;
  const liveComps = vars ? (vizNumber(vars.comps) ?? vizNumber(vars.c)) : null;
  const liveFrontier = useMemo(() => {
    if (!vars) return null;
    const arr = vizArray(vars.stack) ?? vizArray(vars.dq) ?? vizArray(vars.q);
    if (!arr) return null;
    return arr.map((v) => vizNumber(v)).filter((v): v is number => v !== null);
  }, [vars]);
  /** Шаг из кода: i / e / step — двигает покадровую демонстрацию. */
  const liveStep = vars ? (vizNumber(vars.step) ?? vizNumber(vars.i) ?? vizNumber(vars.e)) : null;

  useEffect(() => {
    if (liveStep === null || !Number.isFinite(liveStep)) return;
    goTo(liveStep);
  }, [liveStep, goTo]);

  /* ── какая разметка сейчас в силе: код пользователя или кадр демо ── */
  /** Массив parent, который сейчас рисуем: из кода пользователя, иначе из кадра. */
  const parentNow = liveParent ?? (mode === "dsu" ? frame.parent : undefined);
  /** Номер множества по parent[]: корни нумеруются в порядке появления. */
  const setOf = useCallback(
    (parent: number[], id: number): number => {
      const roots = Array.from(new Set(parent.map((_, i) => dsuRoot(parent, i)))).sort((a, b) => a - b);
      return roots.indexOf(dsuRoot(parent, id)) + 1;
    },
    []
  );

  const compOf = (id: number): number => {
    if (liveComp && liveComp[id] !== undefined && liveComp[id] !== -1) return liveComp[id];
    if (parentNow) return setOf(parentNow, id);
    return frame.comp?.[id] ?? 0;
  };

  const frontier = liveFrontier ?? (mode === "dfs" ? (frame as DfsFrame).frontier ?? [] : []);
  const cur = liveCur ?? frame.cur;
  const comps = liveComps ?? frame.comps;
  const edge = frame.edge;
  const title = runtime && vars ? `${frame.title}  ·  код ведёт демонстрацию` : frame.title;

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(0);
    setPlaying(false);
  };

  return (
    <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Компоненты связности</h3>
            <p className="text-xs text-emerald-300">10 вершин · 10 рёбер · 3 компоненты</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => switchMode("dfs")}
            className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all " + (mode === "dfs" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200")}
          >
            <Layers className="w-3.5 h-3.5" /> Обход (DFS)
          </button>
          <button
            onClick={() => switchMode("dsu")}
            className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all " + (mode === "dsu" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200")}
          >
            <Network className="w-3.5 h-3.5" /> DSU (рёбра по одному)
          </button>
        </div>
      </div>

      {/* панель управления */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => { setStep(0); setPlaying(false); }} title="В начало" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={() => { setPlaying(false); goTo(step - 1); }} disabled={step === 0} title="Шаг назад" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {playing ? "Пауза" : "Запустить"}
        </button>
        <button onClick={() => { setPlaying(false); goTo(step + 1); }} disabled={step >= maxStep} title="Шаг вперёд" className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-500 ml-1">кадр {step + 1} / {maxStep + 1}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-700/40 rounded-lg px-2.5 py-1.5">
          компонент: {comps}
        </span>
      </div>

      {/* поле */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px] opacity-10" />
        <svg viewBox="0 0 500 370" className="w-full h-auto relative z-10" style={{ maxHeight: 380 }}>
          {EDGES.map(([u, v], i) => {
            const a = NODES[u];
            const b = NODES[v];
            const active = edge && ((edge[0] === u && edge[1] === v) || (edge[0] === v && edge[1] === u));
            const sameComp = compOf(u) > 0 && compOf(u) === compOf(v);
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={active ? "#fbbf24" : sameComp ? COLORS[(compOf(u) - 1) % COLORS.length] : "#475569"}
                strokeWidth={active ? 4 : sameComp ? 2.5 : 1.5}
                strokeDasharray={sameComp ? undefined : "4 4"}
                className="transition-all duration-300"
                opacity={sameComp || active ? 1 : 0.55}
              />
            );
          })}
          {NODES.map((n) => {
            const c = compOf(n.id);
            const color = c > 0 ? COLORS[(c - 1) % COLORS.length] : "#334155";
            const isCur = cur === n.id;
            const inFrontier = frontier.includes(n.id);
            return (
              <g key={n.id} onClick={() => goTo(step)} className="cursor-default">
                {isCur && <circle cx={n.x} cy={n.y} r={20} fill="none" stroke="#fbbf24" strokeWidth={2.5} className="animate-pulse" />}
                {inFrontier && !isCur && <circle cx={n.x} cy={n.y} r={17} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="3 3" />}
                <circle cx={n.x} cy={n.y} r={13} fill={c > 0 ? color : "#0f172a"} stroke={c > 0 ? "#fff" : "#64748b"} strokeWidth={isCur ? 3 : 1.5} className="transition-all duration-300" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" className="pointer-events-none">{n.label}</text>
                {c > 0 && <text x={n.x} y={n.y - 19} textAnchor="middle" fill={color} fontSize="9" fontWeight="bold" className="pointer-events-none">c{c}</text>}
              </g>
            );
          })}
          {/* стек/очередь и DSU-таблица справа */}
          <g>
            <text x={470} y={24} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="bold">
              {mode === "dfs" ? "стек DFS" : "parent[]"}
            </text>
            {mode === "dfs"
              ? frontier.slice(-8).map((v, i) => (
                  <g key={i}>
                    <rect x={440} y={32 + i * 20} width={26} height={16} rx={4} fill="#0ea5e9" opacity={0.25 + i * 0.08} />
                    <text x={453} y={44 + i * 20} textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold">{v}</text>
                  </g>
                ))
              : (parentNow ?? []).slice(0, 10).map((pv, i) => {
                  const color = COLORS[(setOf(parentNow ?? [], i) - 1) % COLORS.length];
                  return (
                    <g key={i}>
                      <rect x={432} y={32 + i * 15} width={38} height={12} rx={3} fill={color} opacity={0.22} />
                      <text x={436} y={41.5 + i * 15} fill="#94a3b8" fontSize="8" fontFamily="monospace">{i}→{pv}</text>
                    </g>
                  );
                })}
          </g>
        </svg>
      </div>

      {/* подпись кадра */}
      <div className="mt-3 bg-slate-900/70 border border-slate-700 rounded-xl p-3.5">
        <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          {runtime && vars && <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
          {title}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">{frame.note}</p>
      </div>

      {/* живые переменные из компилятора */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">из компилятора:</span>
        {vars ? (
          ["v", "comps", "c", "i", "e", "comp", "parent", "stack"].map((name) =>
            vars[name] === undefined ? null : (
              <span key={name} className="text-[11px] font-mono bg-slate-950 border border-emerald-700/40 text-emerald-300 rounded-md px-2 py-1">
                {name} = {JSON.stringify(vars[name]).slice(0, 42)}
              </span>
            )
          )
        ) : (
          <span className="text-[11px] text-slate-500">
            открой панель Python — переменные <code className="font-mono text-emerald-400">comp</code>, <code className="font-mono text-emerald-400">parent</code>, <code className="font-mono text-emerald-400">v</code>, <code className="font-mono text-emerald-400">comps</code> покрасят этот граф сами
          </span>
        )}
      </div>
    </div>
  );
};

export default GraphComponentsViz;
