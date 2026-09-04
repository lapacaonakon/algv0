import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, RefreshCw, Hammer, Search, Info } from 'lucide-react';

// ===== TYPES =====
interface Step {
  id: number;
  desc: string;
  codeLine: number;
  treeState: Record<number, number>;        // node index → value
  highlightNodes: number[];                  // currently active nodes
  mergeChildren?: [number, number];          // pair being merged
  arrayHighlight?: [number, number];         // [L, R] range in source array
  result?: number;                           // partial result for query
}

// ===== PURE LOGIC: build tree =====
function buildTreeFull(arr: number[]): Record<number, number> {
  const n = arr.length;
  const tree: Record<number, number> = {};
  function go(v: number, l: number, r: number) {
    if (l === r) { tree[v] = arr[l]; return; }
    const m = (l + r) >> 1;
    go(2 * v, l, m);
    go(2 * v + 1, m + 1, r);
    tree[v] = (tree[2 * v] ?? 0) + (tree[2 * v + 1] ?? 0);
  }
  go(1, 0, n - 1);
  return tree;
}

// ===== STEP GENERATORS =====

// 1. Build steps (recursive top-down)
function genBuildSteps(arr: number[]): Step[] {
  const n = arr.length;
  const steps: Step[] = [];
  let id = 0;
  const tree: Record<number, number> = {};

  const CODE = [
    "build(v, l, r) {",          // 1
    "  if (l === r) {",           // 2
    "    tree[v] = A[l]; return", // 3
    "  }",                        // 4
    "  mid = (l + r) >> 1",       // 5
    "  build(2v, l, mid)",        // 6
    "  build(2v+1, mid+1, r)",    // 7
    "  tree[v] = tree[2v]+tree[2v+1]", // 8
    "}",                          // 9
  ];
  void CODE;

  function go(v: number, l: number, r: number) {
    if (l === r) {
      steps.push({ id: id++, desc: `build(${v}, ${l}, ${r}): лист → tree[${v}] = A[${l}] = ${arr[l]}`, codeLine: 3, treeState: { ...tree }, highlightNodes: [v], arrayHighlight: [l, r] });
      tree[v] = arr[l];
      steps.push({ id: id++, desc: `tree[${v}] = ${arr[l]} ✓`, codeLine: 3, treeState: { ...tree }, highlightNodes: [v], arrayHighlight: [l, r] });
      return;
    }
    const m = (l + r) >> 1;
    steps.push({ id: id++, desc: `build(${v}, ${l}, ${r}): mid = ⌊(${l}+${r})/2⌋ = ${m}. Идём в левого ребёнка.`, codeLine: 5, treeState: { ...tree }, highlightNodes: [v], arrayHighlight: [l, r] });
    go(2 * v, l, m);
    steps.push({ id: id++, desc: `Вернулись в build(${v}, ${l}, ${r}). Идём в правого ребёнка.`, codeLine: 7, treeState: { ...tree }, highlightNodes: [v], arrayHighlight: [l, r] });
    go(2 * v + 1, m + 1, r);
    tree[v] = (tree[2 * v] ?? 0) + (tree[2 * v + 1] ?? 0);
    steps.push({ id: id++, desc: `Объединяем: tree[${v}] = ${tree[2 * v] ?? 0} + ${tree[2 * v + 1] ?? 0} = ${tree[v]}`, codeLine: 8, treeState: { ...tree }, highlightNodes: [v], mergeChildren: [2 * v, 2 * v + 1], arrayHighlight: [l, r] });
  }
  go(1, 0, n - 1);
  steps.push({ id: id++, desc: `🎉 Дерево построено! Корень = ${tree[1]}`, codeLine: 9, treeState: { ...tree }, highlightNodes: [1], arrayHighlight: [0, n - 1] });
  return steps;
}

// 2. Top-Down Query steps
function genQueryTopDownSteps(arr: number[], qL: number, qR: number): Step[] {
  const n = arr.length;
  const tree = buildTreeFull(arr);
  const steps: Step[] = [];
  let id = 0;

  function go(v: number, l: number, r: number, ql: number, qr: number): number {
    if (ql > r || qr < l) {
      steps.push({ id: id++, desc: `query(${v}, [${l}..${r}]): отрезок [${l}..${r}] не пересекает запрос [${ql}..${qr}] → возвращаем 0`, codeLine: 2, treeState: tree, highlightNodes: [v], arrayHighlight: [l, r], result: 0 });
      return 0;
    }
    if (ql <= l && r <= qr) {
      steps.push({ id: id++, desc: `query(${v}, [${l}..${r}]): отрезок [${l}..${r}] полностью внутри [${ql}..${qr}] → возвращаем tree[${v}] = ${tree[v]}`, codeLine: 4, treeState: tree, highlightNodes: [v], arrayHighlight: [l, r], result: tree[v] });
      return tree[v];
    }
    const m = (l + r) >> 1;
    steps.push({ id: id++, desc: `query(${v}, [${l}..${r}]): частичное пересечение с [${ql}..${qr}]. mid=${m}. Спускаемся в обоих детей.`, codeLine: 6, treeState: tree, highlightNodes: [v], arrayHighlight: [l, r] });
    const left = go(2 * v, l, m, ql, qr);
    const right = go(2 * v + 1, m + 1, r, ql, qr);
    const res = left + right;
    steps.push({ id: id++, desc: `Возврат в узел ${v}: ${left} + ${right} = ${res}`, codeLine: 8, treeState: tree, highlightNodes: [v], mergeChildren: [2 * v, 2 * v + 1], arrayHighlight: [l, r], result: res });
    return res;
  }
  const ans = go(1, 0, n - 1, qL, qR);
  steps.push({ id: id++, desc: `🎉 Запрос sum([${qL}..${qR}]) = ${ans} (сверху-вниз, рекурсивный обход)`, codeLine: 9, treeState: tree, highlightNodes: [1], arrayHighlight: [qL, qR], result: ans });
  return steps;
}

// 3. Bottom-Up Query steps (iterative on implicit tree of size 2n)
function genQueryBottomUpSteps(arr: number[], qL: number, qR: number): Step[] {
  const n = arr.length;
  // Build iterative tree: leaves at [n..2n-1]
  const tree: Record<number, number> = {};
  for (let i = 0; i < n; i++) tree[n + i] = arr[i];
  for (let i = n - 1; i > 0; --i) tree[i] = (tree[2 * i] ?? 0) + (tree[2 * i + 1] ?? 0);

  const steps: Step[] = [];
  let id = 0;
  let l = qL + n;
  let r = qR + n + 1; // half-open [l, r)
  let res = 0;

  steps.push({ id: id++, desc: `Старт: l = qL + n = ${qL} + ${n} = ${l}, r = qR + n + 1 = ${qR} + ${n} + 1 = ${r}. Итеративно поднимаемся.`, codeLine: 3, treeState: tree, highlightNodes: [l, r - 1], arrayHighlight: [qL, qR] });

  while (l < r) {
    const highlights: number[] = [];
    if (l & 1) {
      res += tree[l] ?? 0;
      steps.push({ id: id++, desc: `l=${l} нечётный → l — правый ребёнок, не покрывается родителем целиком. Берём tree[${l}]=${tree[l] ?? 0}. Сумма = ${res}. l++.`, codeLine: 5, treeState: tree, highlightNodes: [l], arrayHighlight: [qL, qR], result: res });
      highlights.push(l);
      l++;
    }
    if (r & 1) {
      r--;
      res += tree[r] ?? 0;
      steps.push({ id: id++, desc: `r=${r + 1} нечётный → r-- = ${r}. Берём tree[${r}]=${tree[r] ?? 0}. Сумма = ${res}. r--.`, codeLine: 7, treeState: tree, highlightNodes: [r], arrayHighlight: [qL, qR], result: res });
      highlights.push(r);
    }
    l >>= 1;
    r >>= 1;
    if (l < r) {
      steps.push({ id: id++, desc: `Поднимаемся: l = ${l}, r = ${r}`, codeLine: 9, treeState: tree, highlightNodes: [l, r > l ? r - 1 : l], arrayHighlight: [qL, qR], result: res });
    }
  }
  steps.push({ id: id++, desc: `🎉 Запрос sum([${qL}..${qR}]) = ${res} (снизу-вверх, итеративный обход)`, codeLine: 10, treeState: tree, highlightNodes: [1], arrayHighlight: [qL, qR], result: res });
  return steps;
}

// ===== TREE RENDERING HELPER =====
interface VNode { v: number; l: number; r: number; val: number | null; left?: VNode; right?: VNode; }

function buildVisualTree(treeState: Record<number, number>, n: number, v: number, l: number, r: number): VNode {
  if (l === r) return { v, l, r, val: treeState[v] ?? null };
  const m = (l + r) >> 1;
  return { v, l, r, val: treeState[v] ?? null, left: buildVisualTree(treeState, n, 2 * v, l, m), right: buildVisualTree(treeState, n, 2 * v + 1, m + 1, r) };
}

// ===== CODE SNIPPETS =====
const BUILD_CODE = [
  "build(v, l, r) {",
  "  if (l === r) { tree[v] = A[l]; return; }",
  "  // -----",
  "  // -----",
  "  mid = (l + r) >> 1;",
  "  build(2*v, l, mid);",
  "  build(2*v+1, mid+1, r);",
  "  tree[v] = tree[2*v] + tree[2*v+1];",
  "}"
];
const QUERY_TD_CODE = [
  "query(v, l, r, ql, qr) {",
  "  if (ql > r || qr < l) return 0;",
  "  // -----",
  "  if (ql <= l && r <= qr) return tree[v];",
  "  // -----",
  "  mid = (l + r) >> 1;",
  "  // спускаемся в обоих детей",
  "  return query(left) + query(right);",
  "}"
];
const QUERY_BU_CODE = [
  "queryBU(ql, qr) {",
  "  res = 0;",
  "  l = ql + n; r = qr + n + 1;",
  "  // -----",
  "  while (l < r) {",
  "    if (l & 1) res += tree[l++];",
  "    // -----",
  "    if (r & 1) res += tree[--r];",
  "    l >>= 1; r >>= 1;",
  "  return res; }"
];

// ===== PLAYER COMPONENT =====
function Player({ steps, color }: { steps: Step[]; color: 'indigo' | 'emerald' | 'amber' }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);

  useEffect(() => { setIdx(0); setPlaying(false); }, [steps]);

  useEffect(() => {
    if (!playing || idx >= steps.length - 1) { if (idx >= steps.length - 1) setPlaying(false); return; }
    const t = setTimeout(() => setIdx(i => i + 1), speed);
    return () => clearTimeout(t);
  }, [playing, idx, steps, speed]);

  const step = steps[idx] || steps[0];
  if (!step) return null;

  const clr = { indigo: { btn: 'bg-indigo-600 hover:bg-indigo-500', dot: 'bg-indigo-500', bar: 'bg-indigo-500', ring: 'ring-indigo-500/30 border-indigo-500 bg-indigo-600', childRing: 'ring-amber-500/30 border-amber-500 bg-amber-950', filled: 'border-indigo-500/40 bg-slate-900' }, emerald: { btn: 'bg-emerald-600 hover:bg-emerald-500', dot: 'bg-emerald-500', bar: 'bg-emerald-500', ring: 'ring-emerald-500/30 border-emerald-500 bg-emerald-600', childRing: 'ring-amber-500/30 border-amber-500 bg-amber-950', filled: 'border-emerald-500/40 bg-slate-900' }, amber: { btn: 'bg-amber-600 hover:bg-amber-500', dot: 'bg-amber-500', bar: 'bg-amber-500', ring: 'ring-amber-500/30 border-amber-500 bg-amber-600', childRing: 'ring-rose-500/30 border-rose-500 bg-rose-950', filled: 'border-amber-500/40 bg-slate-900' } }[color];

  return { step, idx, setIdx, playing, setPlaying, speed, setSpeed, clr, total: steps.length };
}

// ===== SIMULATION PANEL =====
function SimPanel({ title, icon, steps, code, color, arr }: { title: string; icon: string; steps: Step[]; code: string[]; color: 'indigo' | 'emerald' | 'amber'; arr: number[] }) {
  const p = Player({ steps, color });
  if (!p) return null;
  const { step, idx, setIdx, playing, setPlaying, speed, setSpeed, clr, total } = p;
  const n = arr.length;

  const vTree = useMemo(() => buildVisualTree(step.treeState, n, 1, 0, n - 1), [step.treeState, n]);

  const renderNode = useCallback((nd: VNode): React.ReactElement => {
    const isHigh = step.highlightNodes.includes(nd.v);
    const isChild = step.mergeChildren?.includes(nd.v);
    const has = nd.val !== null;

    let cls = 'bg-slate-800 border-slate-700 text-slate-400';
    if (isHigh) cls = `${clr.ring} text-white ring-2 scale-105 shadow-lg z-10`;
    else if (isChild) cls = `${clr.childRing} text-amber-300 ring-2`;
    else if (has) cls = `${clr.filled} text-slate-200`;

    return (
      <div key={nd.v} className="flex flex-col items-center">
        <div className={`flex flex-col items-center justify-center px-1 py-1 rounded-lg border-2 transition-all duration-200 min-w-[42px] ${cls}`}>
          <span className="text-[7px] opacity-60 font-mono">v{nd.v}</span>
          <span className="text-[9px] font-bold">[{nd.l}..{nd.r}]</span>
          <span className="text-xs font-extrabold font-mono text-white">{has ? nd.val : '·'}</span>
        </div>
        {(nd.left || nd.right) && (
          <div className="flex flex-col items-center mt-1 w-full">
            <div className="w-px h-2 bg-slate-700" />
            <div className="flex justify-around w-full border-t border-slate-700/60 pt-1 gap-1 px-0.5">
              {nd.left && renderNode(nd.left)}
              {nd.right && renderNode(nd.right)}
            </div>
          </div>
        )}
      </div>
    );
  }, [step, clr]);

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${color === 'indigo' ? 'border-indigo-500/30' : color === 'emerald' ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${color === 'indigo' ? 'bg-indigo-950/50' : color === 'emerald' ? 'bg-emerald-950/50' : 'bg-amber-950/50'} border-b border-slate-800/60`}>
        <h4 className="font-bold text-sm text-white flex items-center gap-2"><span>{icon}</span>{title}</h4>
        <span className="text-[10px] font-mono text-slate-500">{idx + 1}/{total}</span>
      </div>

      {/* Array strip */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800/50 flex flex-wrap gap-1 justify-center">
        {arr.map((v, i) => {
          const inRange = step.arrayHighlight && i >= step.arrayHighlight[0] && i <= step.arrayHighlight[1];
          return (
            <div key={i} className={`flex flex-col items-center px-1.5 py-0.5 rounded border transition-all ${inRange ? `${color === 'indigo' ? 'bg-indigo-950 border-indigo-500' : color === 'emerald' ? 'bg-emerald-950 border-emerald-500' : 'bg-amber-950 border-amber-500'} -translate-y-0.5` : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[7px] text-slate-500 font-mono">{i}</span>
              <span className="text-[11px] font-bold font-mono text-white">{v}</span>
            </div>
          );
        })}
      </div>

      {/* Tree */}
      <div className="flex-1 p-2 overflow-x-auto bg-slate-950/40 flex justify-center items-start min-h-[180px]">
        <div className="scale-[0.85] origin-top min-w-max">{renderNode(vTree)}</div>
      </div>

      {/* Code */}
      <pre className="px-3 py-2 text-[9px] md:text-[10px] font-mono bg-slate-900/50 border-t border-slate-800/50 overflow-x-auto space-y-px">
        {code.map((line, i) => {
          const ln = i + 1;
          const active = step.codeLine === ln;
          return (
            <div key={ln} className={`px-2 py-0.5 rounded transition-colors ${active ? `${color === 'indigo' ? 'bg-indigo-600/20 border-l-2 border-indigo-500 text-indigo-200' : color === 'emerald' ? 'bg-emerald-600/20 border-l-2 border-emerald-500 text-emerald-200' : 'bg-amber-600/20 border-l-2 border-amber-500 text-amber-200'} font-bold` : 'text-slate-500'}`}>
              <span className="inline-block w-4 text-slate-600 select-none">{ln}</span>{line}
            </div>
          );
        })}
      </pre>

      {/* Description + result */}
      <div className="px-3 py-2.5 bg-slate-900/60 border-t border-slate-800/50 text-[10px] text-slate-300 flex items-start gap-2 min-h-[44px]">
        <span className={`mt-0.5 inline-block w-2 h-2 rounded-full shrink-0 animate-pulse ${clr.dot}`} />
        <span className="leading-relaxed">{step.desc}</span>
        {step.result !== undefined && (
          <span className={`ml-auto shrink-0 font-mono font-bold px-2 py-0.5 rounded ${color === 'indigo' ? 'text-indigo-300 bg-indigo-950' : color === 'emerald' ? 'text-emerald-300 bg-emerald-950' : 'text-amber-300 bg-amber-950'}`}>
            = {step.result}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="px-3 py-2.5 bg-slate-950 border-t border-slate-800/50 flex items-center justify-between gap-2">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
          <button onClick={() => { setPlaying(false); setIdx(0); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded" title="Сброс"><RotateCcw className="w-3 h-3" /></button>
          <button onClick={() => { setPlaying(false); setIdx(Math.max(0, idx - 1)); }} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button onClick={() => setPlaying(!playing)} className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] text-white transition-all ${playing ? 'bg-rose-500 hover:bg-rose-400' : clr.btn}`}>
            {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}{playing ? 'Стоп' : 'Пуск'}
          </button>
          <button onClick={() => { setPlaying(false); setIdx(Math.min(total - 1, idx + 1)); }} disabled={idx === total - 1} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="bg-slate-900 border border-slate-800 text-white text-[9px] font-bold rounded px-1.5 py-1 outline-none cursor-pointer">
          <option value={1200}>Медл.</option>
          <option value={700}>Норма</option>
          <option value={350}>Быстро</option>
          <option value={120}>Турбо</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-950"><div className={`h-full transition-all duration-200 ${clr.bar}`} style={{ width: `${total ? ((idx + 1) / total) * 100 : 0}%` }} /></div>
    </div>
  );
}

// ==========================================================
// MAIN EXPORTED COMPONENT
// ==========================================================
export function SegmentTreeVisualizer() {
  const [arr, setArr] = useState<number[]>([5, 8, 3, 12, 7, 2]);
  const [customInput, setCustomInput] = useState('5, 8, 3, 12, 7, 2');
  const [qL, setQL] = useState(1);
  const [qR, setQR] = useState(4);
  const [view, setView] = useState<'build' | 'queries' | 'theory'>('build');

  // Clamp query range when array changes
  useEffect(() => {
    setQL(prev => Math.min(prev, arr.length - 1));
    setQR(prev => Math.min(prev, arr.length - 1));
  }, [arr]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customInput.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v) && v >= 0 && v <= 1000);
    if (parsed.length >= 2 && parsed.length <= 16) {
      setArr(parsed);
    }
  };

  const randomize = () => {
    const size = arr.length;
    const a = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    setArr(a);
    setCustomInput(a.join(', '));
  };

  const buildSteps = useMemo(() => genBuildSteps(arr), [arr]);
  const queryTDSteps = useMemo(() => genQueryTopDownSteps(arr, qL, qR), [arr, qL, qR]);
  const queryBUSteps = useMemo(() => genQueryBottomUpSteps(arr, qL, qR), [arr, qL, qR]);

  const totalSum = arr.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 my-12 shadow-2xl">
      {/* ---- TOP BAR: array editor + query range ---- */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Array input */}
          <form onSubmit={handleApply} className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Массив (2–16 элементов, значения 0–1000)</label>
              <button type="button" onClick={randomize} className="text-slate-400 hover:text-white transition-colors p-1" title="Случайный"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                placeholder="5, 8, 3, 12, 7, 2"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Применить</button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {arr.map((v, i) => (
                <span key={i} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-xs font-mono text-slate-200">
                  <span className="text-slate-500">A[{i}]=</span>{v}
                </span>
              ))}
              <span className="text-xs text-slate-500 flex items-center gap-1">| Σ = {totalSum}</span>
            </div>
          </form>

          {/* Query range */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Диапазон запроса [L..R]</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">L:</span>
                <input
                  type="number"
                  min={0}
                  max={arr.length - 1}
                  value={qL}
                  onChange={e => setQL(Math.min(Number(e.target.value), arr.length - 1))}
                  className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">R:</span>
                <input
                  type="number"
                  min={0}
                  max={arr.length - 1}
                  value={qR}
                  onChange={e => setQR(Math.min(Number(e.target.value), arr.length - 1))}
                  className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Запрос: sum(A[{qL}..{qR}]) = {arr.slice(qL, qR + 1).reduce((a, b) => a + b, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* ---- TABS ---- */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 mb-5">
        <button onClick={() => setView('build')} className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors ${view === 'build' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Hammer className="w-3.5 h-3.5" /> Построить дерево
        </button>
        <button onClick={() => setView('queries')} className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors ${view === 'queries' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Search className="w-3.5 h-3.5" /> Запрос: сверху ↓ vs снизу ↑
        </button>
        <button onClick={() => setView('theory')} className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors ${view === 'theory' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
          <Info className="w-3.5 h-3.5" /> Почему / Сравнение
        </button>
      </div>

      {/* ---- TAB CONTENT ---- */}
      {view === 'build' && (
        <SimPanel
          key={`build-${arr.join('-')}`}
          title="Построение дерева (рекурсия)"
          icon="🔨"
          steps={buildSteps}
          code={BUILD_CODE}
          color="indigo"
          arr={arr}
        />
      )}

      {view === 'queries' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <SimPanel
            key={`qtd-${arr.join('-')}-${qL}-${qR}`}
            title={`Запрос sum([${qL}..${qR}]) — Сверху-вниз`}
            icon="⬇️"
            steps={queryTDSteps}
            code={QUERY_TD_CODE}
            color="emerald"
            arr={arr}
          />
          <SimPanel
            key={`qbu-${arr.join('-')}-${qL}-${qR}`}
            title={`Запрос sum([${qL}..${qR}]) — Снизу-вверх`}
            icon="⬆️"
            steps={queryBUSteps}
            code={QUERY_BU_CODE}
            color="amber"
            arr={arr}
          />
        </div>
      )}

      {view === 'theory' && (
        <div className="space-y-5">
          {/* Why it splits this way */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2"><span className="text-indigo-400">🧮</span> Почему дерево разбилось именно так для N={arr.length}?</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Каждый узел берёт <code className="bg-slate-900 px-1 rounded font-mono text-indigo-300">mid = ⌊(L+R)/2⌋</code>. Левый ребёнок получает <code className="bg-slate-900 px-1 rounded font-mono text-indigo-300">[L..mid]</code>, правый — <code className="bg-slate-900 px-1 rounded font-mono text-emerald-300">[mid+1..R]</code>. Если длина чётная — делится ровно пополам. Нечётная — левая часть забирает на 1 больше (округление вниз).
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Корень: L=0, R={arr.length - 1}</div>
              <div className="text-slate-300">mid = ⌊(0 + {arr.length - 1}) / 2⌋ = {(arr.length - 1) >> 1}</div>
              <div className="text-indigo-300">→ Левый: [0..{(arr.length - 1) >> 1}] ({((arr.length - 1) >> 1) + 1} эл.)</div>
              <div className="text-emerald-300">→ Правый: [{((arr.length - 1) >> 1) + 1}..{arr.length - 1}] ({arr.length - 1 - ((arr.length - 1) >> 1)} эл.)</div>
              <div className="text-slate-500 mt-2">Всего узлов дерева: {2 * arr.length - 1}. Из них {arr.length} листьев и {arr.length - 1} внутренних.</div>
            </div>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/30 relative pt-8">
              <div className="absolute -top-3 left-4 bg-emerald-900 text-emerald-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                ⬇️ Запрос Сверху-вниз (Рекурсия)
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Начинаем с корня. Если отрезок узла полностью внутри запроса — возвращаем значение. Если не пересекается — возвращаем 0. Иначе спускаемся в обоих детей.
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-1"><span className="text-slate-400">Стек вызовов</span><span className="text-rose-400 font-mono">O(log N)</span></div>
                <div className="flex justify-between border-b border-slate-900 pb-1"><span className="text-slate-400">Память массива</span><span className="text-rose-400 font-mono">~4N</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Lazy Propagation</span><span className="text-emerald-400 font-bold">✓ легко</span></div>
              </div>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 relative pt-8">
              <div className="absolute -top-3 left-4 bg-amber-900 text-amber-300 text-[10px] px-3 py-1 rounded-full font-bold uppercase border border-amber-500 shadow-md">
                ⬆️ Запрос Снизу-вверх (Итерация)
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Стартуем с двух указателей (l и r) на листьях. Если l — правый ребёнок, берём его и сдвигаем. Если r — правый ребёнок, берём его левого соседа. Поднимаемся пока l {"<"} r.
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-slate-900 pb-1"><span className="text-slate-400">Стек вызовов</span><span className="text-emerald-400 font-mono">O(1)</span></div>
                <div className="flex justify-between border-b border-slate-900 pb-1"><span className="text-slate-400">Память массива</span><span className="text-emerald-400 font-mono">строго 2N</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Lazy Propagation</span><span className="text-rose-400 font-bold">✗ сложно</span></div>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="bg-slate-950 p-5 rounded-xl border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-400 mb-2">💡 Какой обход выгоднее?</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">Итеративный (снизу-вверх)</strong> выигрывает в скорости (в 2–3×), памяти (2N vs 4N) и кэш-локальности. Но если нужны <strong className="text-amber-300">range-update + Lazy Propagation</strong>, используй <strong className="text-white">рекурсивный (сверху-вниз)</strong> — встроить ленивость в итеративный подход крайне сложно.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
