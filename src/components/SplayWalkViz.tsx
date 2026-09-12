import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Splay на БОЛЬШОМ дереве — пошагово.
 *
 * Проблема, которую решает: на игрушечных A/B/C-схемах zig-zig неотличим от
 * «двух зигов подряд», а мгновенный splay в большом дереве — просто «было →
 * стало». Здесь каждый ОДИНОЧНЫЙ поворот — атомарный шаг: прицел на ребро →
 * поворот → текст, какие рёбра развернулись и какие поддеревья переехали.
 * Порядок поворотов виден явно: Zig-Zig — ВЕРХНЕЕ ребро первым, Zig-Zag —
 * НИЖНЕЕ первым.
 *
 * Раскладка — слоты in-order: ключи не двигаются по горизонтали никогда,
 * поворот меняет только глубину. Поэтому «что переехало» читается сразу.
 *
 * Чистые функции (splaySteps, rotateUp, collectEdges) экспортированы для стенда.
 */

export interface SN {
  key: number;
  left: SN | null;
  right: SN | null;
  parent: SN | null;
}

export function cloneWithParents(t: SN | null): SN | null {
  if (!t) return null;
  const n: SN = { key: t.key, left: null, right: null, parent: null };
  const l = t.left ? cloneWithParents(t.left) : null;
  const r = t.right ? cloneWithParents(t.right) : null;
  if (l) {
    n.left = l;
    l.parent = n;
  }
  if (r) {
    n.right = r;
    r.parent = n;
  }
  return n;
}

export function bstInsert(root: SN | null, key: number): SN {
  if (!root) return { key, left: null, right: null, parent: null };
  const r = cloneWithParents(root)!;
  let cur: SN = r;
  for (;;) {
    if (key < cur.key) {
      if (!cur.left) {
        cur.left = { key, left: null, right: null, parent: cur };
        return r;
      }
      cur = cur.left;
    } else {
      if (!cur.right) {
        cur.right = { key, left: null, right: null, parent: cur };
        return r;
      }
      cur = cur.right;
    }
  }
}

/** Поднять child над его родителем (один атомарный поворот). */
export function rotateUp(child: SN): void {
  const p = child.parent;
  if (!p) return;
  const g = p.parent;
  if (p.left === child) {
    p.left = child.right;
    if (child.right) child.right.parent = p;
    child.right = p;
    p.parent = child;
  } else {
    p.right = child.left;
    if (child.left) child.left.parent = p;
    child.left = p;
    p.parent = child;
  }
  child.parent = g;
  if (!g) return;
  if (g.left === p) g.left = child;
  else g.right = child;
}

/** Рёбра в направленном виде "p→c": для diff между шагами. */
export function collectEdges(t: SN | null): string[] {
  const es: string[] = [];
  const walk = (n: SN | null) => {
    if (!n) return;
    if (n.left) es.push(`${n.key}→${n.left.key}`);
    if (n.right) es.push(`${n.key}→${n.right.key}`);
    walk(n.left);
    walk(n.right);
  };
  walk(t);
  return es.sort();
}

const diffEdges = (before: string[], after: string[]): string => {
  const rm = before.filter((e) => !after.includes(e));
  const ad = after.filter((e) => !before.includes(e));
  const parts: string[] = [];
  for (const a of ad) {
    const [p, c] = a.split("→");
    if (rm.includes(`${c}→${p}`)) parts.push(`ребро ${p}⇄${c} развернулось: ${c} теперь папа`);
    else parts.push(`поддерево ${c} переехало к ${p}`);
  }
  return parts.join("; ");
};

export type SplayStepKind = "search" | "aim" | "rot" | "done";
export interface SplayStep {
  kind: SplayStepKind;
  root: SN | null;
  aimEdge?: [number, number];
  pathKeys?: number[];
  caseLabel?: string;
  note: string;
  rotCount: number;
}

/** Полный пошаговый прогон splay(key): спуск → пары (прицел, поворот) → готово. */
export function splaySteps(
  rootIn: SN | null,
  key: number,
  isInsert = false,
): { steps: SplayStep[]; found: boolean } {
  let root: SN | null = cloneWithParents(rootIn);
  const steps: SplayStep[] = [];
  if (!root) return { steps: [{ kind: "done", root, note: "Дерево пустое — нечего поднимать.", rotCount: 0 }], found: false };

  // --- спуск ---
  let cur: SN | null = root;
  const pathKeys: number[] = [];
  let found = false;
  let last: SN = root;
  while (cur) {
    last = cur;
    pathKeys.push(cur.key);
    if (key === cur.key) {
      found = true;
      break;
    }
    cur = key < cur.key ? cur.left : cur.right;
  }
  const x = found ? cur : last;
  steps.push({
    kind: "search",
    root: cloneWithParents(root)!,
    pathKeys: [...pathKeys],
    note: isInsert
      ? `Вставили ${key} обычным BST-спуском. Теперь поднимаем его в корень.`
      : found
        ? `Спуск по ключу ${key}: путь ${pathKeys.join(" → ")}. Найден — поднимаем его в корень.`
        : `Ключа ${key} нет. Спуск упёрся в ${last.key} — поднимаем в корень его (так splay ищет: пусто — но дерево стало лучше).`,
    rotCount: 0,
  });

  // --- подъём ---
  let rotCount = 0;
  let target: SN = x as SN;
  const fixRoot = () => {
    while (root && root.parent) root = root.parent;
  };
  while (target.parent) {
    const p = target.parent;
    const g = p.parent;
    if (!g) {
      steps.push({
        kind: "aim",
        root: cloneWithParents(root)!,
        aimEdge: [p.key, target.key],
        caseLabel: "Zig",
        note: `Zig: у ${target.key} нет деда — хватит одного поворота ребра ${p.key}–${target.key}.`,
        rotCount,
      });
      const before = collectEdges(root);
      rotateUp(target);
      fixRoot();
      rotCount += 1;
      steps.push({
        kind: "rot",
        root: cloneWithParents(root)!,
        caseLabel: "Zig",
        note: `Поворот: ${diffEdges(before, collectEdges(root)) || `${target.key} встал над ${p.key}`}.`,
        rotCount,
      });
      continue;
    }
    const pIsLeft = g.left === p;
    const xIsLeft = p.left === target;
    if (pIsLeft === xIsLeft) {
      const side = pIsLeft ? "оба слева" : "оба справа";
      steps.push({
        kind: "aim",
        root: cloneWithParents(root)!,
        aimEdge: [g.key, p.key],
        caseLabel: "Zig-Zig",
        note: `Zig-Zig (${side}, линия ${g.key}–${p.key}–${target.key}). Главная хитрость: первым крутим ВЕРХНЕЕ ребро ${g.key}–${p.key}, а ${target.key} пока не трогаем.`,
        rotCount,
      });
      let before = collectEdges(root);
      rotateUp(p);
      fixRoot();
      rotCount += 1;
      steps.push({
        kind: "rot",
        root: cloneWithParents(root)!,
        caseLabel: "Zig-Zig",
        note: `Поворот 1: ${diffEdges(before, collectEdges(root))}.`,
        rotCount,
      });
      steps.push({
        kind: "aim",
        root: cloneWithParents(root)!,
        aimEdge: [target.parent.key, target.key],
        caseLabel: "Zig-Zig",
        note: `Теперь обычный зиг: ребро ${target.parent.key}–${target.key}.`,
        rotCount,
      });
      before = collectEdges(root);
      rotateUp(target);
      fixRoot();
      rotCount += 1;
      steps.push({
        kind: "rot",
        root: cloneWithParents(root)!,
        caseLabel: "Zig-Zig",
        note: `Поворот 2: ${diffEdges(before, collectEdges(root))}.`,
        rotCount,
      });
    } else {
      const side = `${g.key} → ${pIsLeft ? "влево" : "вправо"} → ${xIsLeft ? "вправо" : "влево"} → ${target.key}`;
      steps.push({
        kind: "aim",
        root: cloneWithParents(root)!,
        aimEdge: [p.key, target.key],
        caseLabel: "Zig-Zag",
        note: `Zig-Zag (змейка: ${side}). Порядок ОБРАТНЫЙ: первым НИЖНЕЕ ребро ${p.key}–${target.key}, дед ${g.key} стоит на месте.`,
        rotCount,
      });
      let before = collectEdges(root);
      rotateUp(target);
      fixRoot();
      rotCount += 1;
      steps.push({
        kind: "rot",
        root: cloneWithParents(root)!,
        caseLabel: "Zig-Zag",
        note: `Поворот 1: ${diffEdges(before, collectEdges(root))}. Змейка выпрямилась в линию.`,
        rotCount,
      });
      steps.push({
        kind: "aim",
        root: cloneWithParents(root)!,
        aimEdge: [target.parent.key, target.key],
        caseLabel: "Zig-Zag",
        note: `Второе ребро: ${target.parent.key}–${target.key} — теперь это обычный зиг.`,
        rotCount,
      });
      before = collectEdges(root);
      rotateUp(target);
      fixRoot();
      rotCount += 1;
      steps.push({
        kind: "rot",
        root: cloneWithParents(root)!,
        caseLabel: "Zig-Zag",
        note: `Поворот 2: ${diffEdges(before, collectEdges(root))}.`,
        rotCount,
      });
    }
  }

  steps.push({
    kind: "done",
    root: cloneWithParents(root)!,
    note: `🏁 ${target.key} в корне за ${rotCount} ${rotCount === 1 ? "поворот" : "поворотов"}.`,
    rotCount,
  });
  return { steps, found };
}

/* ------------------------- служебное ------------------------- */

const depthOf = (t: SN | null, key: number): number => {
  let d = 0;
  let cur = t;
  while (cur) {
    if (key === cur.key) return d;
    cur = key < cur.key ? cur.left : cur.right;
    d += 1;
  }
  return -1;
};
const heightOf = (t: SN | null): number => (t ? 1 + Math.max(heightOf(t.left), heightOf(t.right)) : 0);
const inorderKeys = (t: SN | null): number[] => (t ? [...inorderKeys(t.left), t.key, ...inorderKeys(t.right)] : []);

export const INITIAL_KEYS = [50, 40, 35, 32, 30, 60, 55, 70];

const buildInitial = (): SN => {
  let t: SN | null = null;
  for (const k of INITIAL_KEYS) t = bstInsert(t, k);
  return t!;
};

const CODE_LINES = [
  { line: 1, text: "while x has parent:" },
  { line: 2, text: "    p = parent(x); g = parent(p)" },
  { line: 3, text: "    if g is None:              # Zig" },
  { line: 4, text: "        rotate(x over p)" },
  { line: 5, text: "    elif p,g,x на одной линии:  # Zig-Zig" },
  { line: 6, text: "        rotate(p over g)       # ВЕРХНЕЕ первым" },
  { line: 7, text: "        rotate(x over p)" },
  { line: 8, text: "    else:                      # Zig-Zag" },
  { line: 9, text: "        rotate(x over p)       # НИЖНЕЕ первым" },
  { line: 10, text: "        rotate(x over g)" },
];

/* ------------------------- рендер ------------------------- */

const VIEW_W = 760;
const SLOT_W = 88;
const LEVEL_H = 76;

const layout = (root: SN | null) => {
  const pos = new Map<number, { px: number; py: number }>();
  let slot = 0;
  const walk = (n: SN | null, d: number) => {
    if (!n) return;
    walk(n.left, d + 1);
    pos.set(n.key, { px: 56 + slot * SLOT_W, py: 40 + d * LEVEL_H });
    slot += 1;
    walk(n.right, d + 1);
  };
  walk(root, 0);
  return pos;
};

const SplayWalkViz: React.FC = () => {
  const initial = useMemo(buildInitial, []);
  const [steps, setSteps] = useState<SplayStep[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [input, setInput] = useState("");
  const [treeVers, setTreeVers] = useState(0);
  const baseRef = useRef<SN>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runKey = (key: number, isInsert = false) => {
    const { steps: st } = splaySteps(baseRef.current, key, isInsert);
    setSteps(st);
    setIdx(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing || !steps) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      // фиксируем результат в базовом дереве
      baseRef.current = steps[steps.length - 1].root ?? baseRef.current;
      setTreeVers((v) => v + 1);
      return;
    }
    timer.current = setTimeout(() => setIdx((v) => v + 1), 1100);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, idx, steps]);

  const step = steps ? steps[Math.min(idx, steps.length - 1)] : null;
  const viewRoot = step ? step.root : baseRef.current;
  const pos = useMemo(() => layout(viewRoot), [viewRoot, treeVers, idx]);
  const nodes = useMemo(() => [...pos.entries()].map(([k, c]) => ({ key: k, ...c })), [pos]);
  const edges = useMemo(() => {
    const es: { a: number; b: number }[] = [];
    const walk = (n: SN | null) => {
      if (!n) return;
      if (n.left) es.push({ a: n.key, b: n.left.key });
      if (n.right) es.push({ a: n.key, b: n.right.key });
      walk(n.left);
      walk(n.right);
    };
    walk(viewRoot);
    return es;
  }, [viewRoot, treeVers, idx]);

  const autoW = Math.max(VIEW_W, ...nodes.map((n) => n.px + 60));
  const autoH = Math.max(300, ...nodes.map((n) => n.py + 60));

  const dBefore = useMemo(() => (steps ? depthOf(steps[0].root, steps[steps.length - 1].root?.key ?? NaN) : 0), [steps]);
  const dNow = steps ? depthOf(viewRoot, steps[steps.length - 1].root?.key ?? NaN) : 0;
  const hBefore = useMemo(() => (steps ? heightOf(steps[0].root) : 0), [steps]);
  const hNow = heightOf(viewRoot);

  const doInsert = () => {
    const v = parseInt(input, 10);
    if (Number.isNaN(v)) return;
    const withNew = bstInsert(baseRef.current, v);
    baseRef.current = withNew;
    setTreeVers((t) => t + 1);
    runKey(v, true);
    setInput("");
  };

  const stepColor = (k: number): string => {
    if (!step) return "#0f172a";
    if (step.kind === "search" && step.pathKeys?.includes(k)) return "#78350f";
    if (step.aimEdge && step.aimEdge.includes(k)) return "#78350f";
    return "#0f172a";
  };
  const strokeColor = (k: number): string => {
    if (!step) return "#64748b";
    if (step.kind !== "search" && step.pathKeys?.includes(k) && step.kind === "aim") return "#f59e0b";
    if (step.aimEdge?.includes(k)) return "#f59e0b";
    if (step.pathKeys?.includes(k)) return "#38bdf8";
    return "#64748b";
  };

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
            <span className="text-2xl">🩹</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивное Splay-дерево</h3>
            <p className="text-sm text-indigo-300">Кликни узел — поднимем его в корень, показывая каждый поворот</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = parseInt(input, 10);
                if (!Number.isNaN(v)) {
                  const has = inorderKeys(baseRef.current).includes(v);
                  if (has) runKey(v);
                  else doInsert();
                  setInput("");
                }
              }
            }}
            placeholder="ключ + Enter"
            className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
          />
          <button onClick={() => { baseRef.current = buildInitial(); setSteps(null); setIdx(0); setPlaying(false); setTreeVers((v) => v + 1); }} className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white">
            🔄 Исходное
          </button>
          <button
            onClick={() => {
              const t = buildInitial();
              const shuffled = [...INITIAL_KEYS].sort(() => Math.random() - 0.5);
              let r: SN | null = null;
              for (const k of shuffled) r = bstInsert(r, k);
              baseRef.current = r!;
              setSteps(null);
              setIdx(0);
              setPlaying(false);
              setTreeVers((v) => v + 1);
              void t;
            }}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white"
          >
            🎲 Перемешать
          </button>
        </div>
      </div>

      {/* Плеер */}
      {steps && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button onClick={() => { setIdx(0); setPlaying(false); }} disabled={idx === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white disabled:opacity-30">
            ⏮ В начало
          </button>
          <button onClick={() => { setPlaying(false); setIdx(Math.max(0, idx - 1)); }} disabled={idx === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white disabled:opacity-30">
            ← Шаг
          </button>
          <button onClick={() => setPlaying(!playing)} className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white ${playing ? "bg-amber-600" : "bg-emerald-600"}`}>
            {playing ? "⏸ Пауза" : "▶ Пуск"}
          </button>
          <button onClick={() => { setPlaying(false); setIdx(Math.min(steps.length - 1, idx + 1)); }} disabled={idx >= steps.length - 1} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-30">
            Шаг →
          </button>
          <span className="text-xs text-slate-400">
            Шаг {idx + 1} из {steps.length} · поворотов: {step?.rotCount ?? 0}
          </span>
          {step?.caseLabel && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/60">
              {step.caseLabel}
            </span>
          )}
        </div>
      )}

      {/* Дерево */}
      <div className="bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/40 relative min-h-[340px] flex flex-col items-center">
        {!steps && (
          <div className="absolute top-3 left-3 bg-indigo-900/80 text-xs px-3 py-1 rounded-full text-indigo-200 border border-indigo-500 font-bold">
            Кликни по любому узлу — splay
          </div>
        )}
        <svg viewBox={`0 0 ${autoW} ${autoH}`} className="w-full max-h-[400px] mt-4">
          {edges.map((e) => {
            const a = pos.get(e.a);
            const b = pos.get(e.b);
            if (!a || !b) return null;
            const isAim = step?.aimEdge && step.aimEdge.includes(e.a) && step.aimEdge.includes(e.b);
            return (
              <line
                key={`e-${e.a}-${e.b}`}
                x1={a.px}
                y1={a.py}
                x2={b.px}
                y2={b.py}
                stroke={isAim ? "#f59e0b" : "#475569"}
                strokeWidth={isAim ? 4 : 2}
                strokeDasharray={isAim ? "6,4" : "none"}
                className="transition-all duration-500"
              />
            );
          })}
          {nodes.map((n) => {
            const isAimNode = step?.aimEdge?.includes(n.key);
            return (
              <g
                key={`n-${n.key}-${treeVers}`}
                transform={`translate(${n.px}, ${n.py})`}
                onClick={() => {
                  if (playing) return;
                  const has = inorderKeys(baseRef.current).includes(n.key);
                  if (has) runKey(n.key);
                }}
                className="cursor-pointer"
              >
                <circle
                  r={isAimNode ? 24 : 20}
                  fill={stepColor(n.key)}
                  stroke={strokeColor(n.key)}
                  strokeWidth={isAimNode ? 4 : 2}
                  className="transition-all duration-300 hover:stroke-white"
                />
                <text y={4} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
                  {n.key}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Лог шага */}
        <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-indigo-500/30 mt-3 text-sm text-slate-200">
          <p className="font-semibold text-amber-400 mb-1">
            {step?.kind === "aim" ? "🎯 Прицел:" : step?.kind === "rot" ? "🔁 Поворот:" : step?.kind === "search" ? "🔍 Спуск:" : "Статус:"}
          </p>
          <p className="min-h-[40px] flex items-center">{step ? step.note : "Кликни по узлу или введи ключ — увидишь каждый поворот по отдельности: прицел на ребро, поворот, переехавшие поддеревья."}</p>
        </div>
      </div>

      {/* Счётчики + код */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40">
          <h4 className="text-sm font-bold text-rose-300 mb-3">📏 Что произошло</h4>
          {steps ? (
            <table className="w-full text-sm">
              <tbody className="font-mono">
                <tr className="border-b border-slate-800/60">
                  <td className="py-2 text-slate-400">глубина ключа {steps[steps.length - 1].root?.key}</td>
                  <td className="py-2 text-right text-slate-300">{dBefore} → {dNow}</td>
                </tr>
                <tr className="border-b border-slate-800/60">
                  <td className="py-2 text-slate-400">высота дерева</td>
                  <td className="py-2 text-right text-slate-300">{hBefore} → {hNow}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-400">поворотов</td>
                  <td className="py-2 text-right text-slate-300">{step?.rotCount ?? 0}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400">Запусти splay — здесь появится, как изменилась глубина поднятого ключа и высота дерева.</p>
          )}
          <p className="text-xs text-slate-500 mt-3">Одиночный splay может и увеличить высоту — выгода только амортизированная: серия обращений дешевеет.</p>
        </div>
        <div className="w-full lg:w-1/2 bg-slate-900/60 rounded-xl p-4 border border-slate-600/50">
          <h4 className="text-sm font-bold text-slate-200 mb-3">📄 Скелет splay</h4>
          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs">
            {CODE_LINES.map((l) => {
              const active =
                (step?.caseLabel === "Zig" && (l.line === 3 || l.line === 4)) ||
                (step?.caseLabel === "Zig-Zig" && step.kind === "aim" && idx > 0 && steps?.[idx - 1]?.caseLabel === "Zig-Zig" ? l.line === 7 : step?.caseLabel === "Zig-Zig" && l.line === 6) ||
                (step?.caseLabel === "Zig-Zag" && step.kind === "aim" && idx > 0 && steps?.[idx - 1]?.caseLabel === "Zig-Zag" ? l.line === 10 : step?.caseLabel === "Zig-Zag" && l.line === 9);
              return (
                <div key={l.line} className={`py-1 px-2 rounded ${active ? "bg-indigo-900/80 text-amber-300 font-bold border-l-4 border-amber-400" : "text-slate-400"}`}>
                  <span className="text-slate-600 select-none inline-block w-6 text-right mr-3">{l.line}</span>
                  {l.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplayWalkViz;
