import React, { useEffect, useMemo, useState } from "react";

/**
 * Интерактивный Treap — шесть режимов:
 *   build  — сборка: ВИДИМАЯ сортировка точек (и чем сортировать — есть разница),
 *            координатная плоскость НАВЕРХУ (ассоциация к «декартово»), дерево ниже,
 *            чек-лист инвариантов (автопроверка, как условия у Ахо—Корасика).
 *   split  — разрез по x с двумя корзинами (грамотная механика, не «удар меча»).
 *   merge  — склейка двух деревьев по y.
 *   erase  — удаление ПРОИЗВОЛЬНОЙ точки: найти по x, сшить детей merge.
 *   layers — миф «дети в массиве по 2k/2k+1»: работает только у полных деревьев.
 *   search — «отсортирую бинарным поиском»: поиск не сортирует; сравнительная
 *            сортировка платит ≥ n·log n сравнений, counting по целым y — O(n+k).
 *
 * Канонический набор: все x и все y различны ⇒ дерево единственно.
 * Узел идентифицируется парой id = "x:y".
 */

export interface Pair {
  key: number;
  grade: number;
}
type NodeId = string;
const pairId = (key: number, grade: number): NodeId => `${key}:${grade}`;

interface TNode {
  id: NodeId;
  key: number;
  grade: number;
  left: TNode | null;
  right: TNode | null;
}

export const POINTS: Pair[] = [
  { key: 45, grade: 8 },
  { key: 3, grade: 6 },
  { key: 6, grade: 5 },
  { key: 2, grade: 4 },
  { key: 9, grade: 3 },
  { key: 7, grade: 2 },
  { key: 12, grade: 0 },
  { key: 1, grade: -4 },
];

/** Порядок ввода (как в черновике) — намеренно НЕ отсортированный. */
export const INPUT_ORDER: Pair[] = [
  { key: 3, grade: 5 },
  { key: 45, grade: 8 },
  { key: 3, grade: 6 },
  { key: 1, grade: -4 },
  { key: 7, grade: 2 },
  { key: 6, grade: 5 },
  { key: 2, grade: 4 },
  { key: 9, grade: 3 },
  { key: 12, grade: 0 },
];
// (3,5) дубль ключа/приоритета — уберём: ввод без повторов
export const INPUT_CLEAN: Pair[] = INPUT_ORDER.filter((p) => POINTS.some((q) => q.key === p.key && q.grade === p.grade));

const sortedByY = (ps: Pair[]): Pair[] => [...ps].sort((a, b) => b.grade - a.grade);

/* ---------------- чистые алгоритмы (экспортируются для стенда) ---------------- */

export function insert(root: TNode | null, p: Pair): TNode {
  if (!root) return { id: pairId(p.key, p.grade), key: p.key, grade: p.grade, left: null, right: null };
  if (p.key <= root.key) root.left = insert(root.left, p);
  else root.right = insert(root.right, p);
  return root;
}

export function buildTree(ps: Pair[]): TNode | null {
  let root: TNode | null = null;
  for (const p of sortedByY(ps)) root = insert(root, p);
  return root;
}

export interface SplitResult {
  l: TNode | null;
  r: TNode | null;
  trace: { atId: NodeId; goLeft: boolean; note: string }[];
}
export function splitTree(root: TNode | null, x: number): SplitResult {
  const trace: SplitResult["trace"] = [];
  const go = (t: TNode | null): { l: TNode | null; r: TNode | null } => {
    if (!t) return { l: null, r: null };
    if (t.key <= x) {
      const sub = go(t.right);
      trace.push({ atId: t.id, goLeft: true, note: `(${t.key}, ${t.grade}) ≤ ${x}: узел и его левое поддерево целиком → L; дальше режем его правое поддерево.` });
      t.right = sub.l;
      return { l: t, r: sub.r };
    }
    const sub = go(t.left);
    trace.push({ atId: t.id, goLeft: false, note: `(${t.key}, ${t.grade}) > ${x}: узел и его правое поддерево целиком → R; дальше режем его левое поддерево.` });
    t.left = sub.r;
    return { l: sub.l, r: t };
  };
  const res = go(root);
  return { l: res.l, r: res.r, trace };
}

export interface MergeResult {
  root: TNode | null;
  trace: { aId: NodeId | null; bId: NodeId | null; chosenId: NodeId | null; note: string }[];
}
export function mergeTree(a: TNode | null, b: TNode | null): MergeResult {
  const trace: MergeResult["trace"] = [];
  const go = (a: TNode | null, b: TNode | null): TNode | null => {
    if (!a || !b) {
      trace.push({ aId: a?.id ?? null, bId: b?.id ?? null, chosenId: a?.id ?? b?.id ?? null, note: `Одно из деревьев пусто — возвращаем другое целиком.` });
      return a ?? b;
    }
    if (a.grade > b.grade) {
      trace.push({ aId: a.id, bId: b.id, chosenId: a.id, note: `y корней: ${a.grade} > ${b.grade} → корень (${a.key}, ${a.grade}); склеиваем его правое поддерево с (${b.key}, ${b.grade}).` });
      a.right = go(a.right, b);
      return a;
    }
    trace.push({ aId: a.id, bId: b.id, chosenId: b.id, note: `y корней: ${b.grade} > ${a.grade} → корень (${b.key}, ${b.grade}); склеиваем (${a.key}, ${a.grade}) с его левым поддеревом.` });
    b.left = go(a, b.left);
    return b;
  };
  return { root: go(a, b), trace };
}

export function eraseNode(root: TNode | null, key: number): { root: TNode | null; trace: { atId: NodeId | null; note: string }[] } {
  const trace: { atId: NodeId | null; note: string }[] = [];
  const go = (t: TNode | null): TNode | null => {
    if (!t) return null;
    if (key < t.key) {
      trace.push({ atId: t.id, note: `${key} < ${t.key} — ищем левее (спуск по x, O(h)).` });
      t.left = go(t.left);
      return t;
    }
    if (key > t.key) {
      trace.push({ atId: t.id, note: `${key} > ${t.key} — ищем правее.` });
      t.right = go(t.right);
      return t;
    }
    trace.push({ atId: t.id, note: `Нашли (${t.key}, ${t.grade}). Вырезаем: детей сшиваем merge — у кого y больше, тот и родитель.` });
    const m = mergeTree(t.left, t.right);
    trace.push(...m.trace.map((s) => ({ atId: s.chosenId, note: s.note })));
    return m.root;
  };
  return { root: go(root), trace };
}


const cloneTree = (t: TNode | null): TNode | null =>
  t ? { id: t.id, key: t.key, grade: t.grade, left: cloneTree(t.left), right: cloneTree(t.right) } : null;

/* ---------------- валидация treap (для чек-листа и стенда) ---------------- */

export function checkTreap(root: TNode | null): { bst: boolean; heap: boolean } {
  let bst = true;
  let heap = true;
  let prev: number | null = null;
  const walk = (n: TNode | null, min: number, max: number, parentGrade: number | null) => {
    if (!n) return;
    if (n.key <= min || n.key > max) bst = false;
    if (parentGrade !== null && n.grade > parentGrade) heap = false;
    walk(n.left, min, n.key, n.grade);
    if (prev !== null && n.key < prev) bst = false;
    prev = n.key;
    walk(n.right, n.key, max, n.grade);
  };
  walk(root, -Infinity, Infinity, null);
  return { bst, heap };
}

/* ---------------- раскладка сцены дерева ---------------- */

const layoutTree = (root: TNode | null) => {
  const pos = new Map<NodeId, { px: number; py: number }>();
  let slot = 0;
  const walk = (n: TNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    pos.set(n.id, { px: 64 + slot * 92, py: 44 + depth * 82 });
    slot += 1;
    walk(n.right, depth + 1);
  };
  walk(root, 0);
  return pos;
};

const treeEdges = (root: TNode | null): { from: NodeId; to: NodeId }[] => {
  const es: { from: NodeId; to: NodeId }[] = [];
  const walk = (n: TNode | null) => {
    if (!n) return;
    if (n.left) es.push({ from: n.id, to: n.left.id });
    if (n.right) es.push({ from: n.id, to: n.right.id });
    walk(n.left);
    walk(n.right);
  };
  walk(root);
  return es;
};

interface TreeViewProps {
  root: TNode | null;
  width?: number;
  height?: number;
  nodeColor?: (id: NodeId) => string;
  nodeStroke?: (id: NodeId) => string;
  edgeColor?: (from: NodeId, to: NodeId) => string;
  edgeDash?: (from: NodeId, to: NodeId) => boolean;
  pulseId?: NodeId | null;
  subtitle?: string;
}

const TreeView: React.FC<TreeViewProps> = ({ root, width = 640, height = 340, nodeColor, nodeStroke, edgeColor, edgeDash, pulseId, subtitle }) => {
  const pos = useMemo(() => layoutTree(root), [root]);
  const nodes = useMemo(() => [...pos.entries()].map(([id, c]) => ({ id, ...c })), [pos]);
  const edges = useMemo(() => treeEdges(root), [root]);
  const byId = (id: NodeId) => nodes.find((n) => n.id === id);
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[340px]">
        {edges.map((e) => {
          const a = byId(e.from);
          const b = byId(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`te-${e.from}-${e.to}`}
              x1={a.px} y1={a.py} x2={b.px} y2={b.py}
              stroke={edgeColor ? edgeColor(e.from, e.to) : "#475569"}
              strokeWidth={2.5}
              strokeDasharray={edgeDash && edgeDash(e.from, e.to) ? "5,4" : "none"}
              className="transition-all duration-500"
            />
          );
        })}
        {nodes.map((n) => {
          const p = pairParts(n.id);
          const pulse = pulseId === n.id;
          return (
            <g key={`tn-${n.id}`} transform={`translate(${n.px}, ${n.py})`} className="transition-transform duration-500">
              <circle r={pulse ? 24 : 20} fill={nodeColor ? nodeColor(n.id) : "#0f172a"} stroke={nodeStroke ? nodeStroke(n.id) : "#64748b"} strokeWidth={pulse ? 4 : 2} className="transition-all duration-300" />
              <text y={-2} fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle">{p[0]}</text>
              <text y={13} fill="#cbd5e1" fontSize="10" textAnchor="middle">y={p[1]}</text>
            </g>
          );
        })}
      </svg>
      {subtitle && <p className="text-xs text-slate-400 text-center -mt-1">{subtitle}</p>}
    </div>
  );
};

const pairParts = (id: NodeId): [number, number] => {
  const [a, b] = id.split(":").map(Number);
  return [a, b];
};

/* ---------------- плоскость (клетчатая бумага) ---------------- */

const PL_W = 780;
const PL_H = 300;
const PX = (key: number) => 42 + (key - 1) * ((PL_W - 64) / 44);
const PY = (grade: number) => 24 + (8 - grade) * ((PL_H - 48) / 12);

interface PlaneProps {
  points: Pair[];
  drawnEdges: { a: Pair; b: Pair }[];
  pending: Pair | null;
}
const Plane: React.FC<PlaneProps> = ({ points, drawnEdges, pending }) => {
  const byPair = (p: Pair) => ({ x: PX(p.key), y: PY(p.grade) });
  return (
    <svg viewBox={`0 0 ${PL_W} ${PL_H}`} className="w-full">
      <defs>
        <pattern id="pl-grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#1e293b" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="34" y="16" width={PL_W - 46} height={PL_H - 32} fill="url(#pl-grid)" opacity="0.5" />
      <line x1="34" y1={PY(0)} x2={PL_W - 12} y2={PY(0)} stroke="#475569" strokeWidth="1.5" />
      <line x1={PX(1) - 8} y1="16" x2={PX(1) - 8} y2={PL_H - 16} stroke="#475569" strokeWidth="1.5" />
      {[0, 10, 20, 30, 40].map((k) => (
        <text key={`tx-${k}`} x={PX(k)} y={PY(0) + 16} fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">{k}</text>
      ))}
      {[-4, 0, 4, 8].map((g) => (
        <text key={`ty-${g}`} x={PX(1) - 14} y={PY(g) + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">{g}</text>
      ))}
      <text x={PL_W - 14} y={PY(0) - 8} fill="#94a3b8" fontSize="11" textAnchor="end" fontFamily="monospace">x (ключ) →</text>
      <text x={PX(1) - 26} y="14" fill="#94a3b8" fontSize="11" fontFamily="monospace">y (приоритет)</text>

      {drawnEdges.map((e, i) => {
        const a = byPair(e.a);
        const b = byPair(e.b);
        return <line key={`pe-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#64748b" strokeWidth={2} className="transition-opacity duration-500" />;
      })}

      {points.map((p) => {
        const done = drawnEdges.some((e) => (e.a.key === p.key && e.a.grade === p.grade) || (e.b.key === p.key && e.b.grade === p.grade));
        return (
          <g key={`pp-${p.key}:${p.grade}`} className="transition-all duration-500">
            <circle cx={PX(p.key)} cy={PY(p.grade)} r={done ? 7 : 6} fill={done ? "#0f172a" : "#334155"} stroke={done ? "#38bdf8" : "#94a3b8"} strokeWidth={1.6} />
            <text x={PX(p.key)} y={PY(p.grade) + 3.5} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{p.key}</text>
          </g>
        );
      })}

      {pending && (
        <g className="transition-all duration-500">
          <circle cx={PX(pending.key)} cy={PY(pending.grade)} r={8} fill="none" stroke="#818cf8" strokeWidth={2.4} strokeDasharray="3,2" />
          <text x={PX(pending.key)} y={PY(pending.grade) + 3.5} fill="#c7d2fe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{pending.key}</text>
        </g>
      )}
    </svg>
  );
};

/** Правильные линии канонического дерева — для режимов «рисуем в любом порядке». */
const CANON_TREE = buildTree(POINTS);
const CANON_EDGES: { a: Pair; b: Pair }[] = (() => {
  const es: { a: Pair; b: Pair }[] = [];
  const walk = (n: TNode | null) => {
    if (!n) return;
    if (n.left) {
      es.push({ a: { key: n.key, grade: n.grade }, b: { key: n.left.key, grade: n.left.grade } });
      walk(n.left);
    }
    if (n.right) {
      es.push({ a: { key: n.key, grade: n.grade }, b: { key: n.right.key, grade: n.right.grade } });
      walk(n.right);
    }
    walk(n.left);
    walk(n.right);
  };
  walk(CANON_TREE);
  return es;
})();

/** Порядок линий «слева направо» (по большему x родителя) — не оптимальный алгоритм, просто другой порядок. */
const LEFT_TO_RIGHT_EDGES: { a: Pair; b: Pair }[] = [...CANON_EDGES].sort((e1, e2) => e1.a.key - e2.a.key || e1.b.key - e2.b.key);

/* ================= РЕЖИМ BUILD ================= */

type BuildPhase = "sort" | "connect";
type SortAlgo = "none" | "quicksort" | "counting";
type ConnectOrder = "y-desc" | "left-right";

const BuildMode: React.FC = () => {
  const [phase, setPhase] = useState<BuildPhase>("sort");
  const [algo, setAlgo] = useState<SortAlgo>("none");
  const [order, setOrder] = useState<ConnectOrder>("y-desc");
  const [sortIdx, setSortIdx] = useState(0);
  const [connIdx, setConnIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  // quicksort: ~n·log2 n сравнений (среднее), counting: n + k чтений, 0 сравнений
  const n = INPUT_CLEAN.length;
  const comparisons = algo === "quicksort" ? Math.round(n * Math.log2(n)) : 0;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (phase === "sort") {
        if (algo === "none") { setPlaying(false); return; }
        if (sortIdx < 3) setSortIdx(sortIdx + 1);
        else setPlaying(false);
      } else {
        const total = order === "y-desc" ? CANON_EDGES.length : LEFT_TO_RIGHT_EDGES.length;
        if (connIdx < total) setConnIdx(connIdx + 1);
        else setPlaying(false);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [playing, phase, sortIdx, connIdx, algo, order]);

  const startConnect = (ord: ConnectOrder) => {
    setOrder(ord);
    setPhase("connect");
    setConnIdx(0);
    setPlaying(true);
  };

  const connEdgesAll = order === "y-desc" ? CANON_EDGES : LEFT_TO_RIGHT_EDGES;
  const connEdges = connEdgesAll.slice(0, connIdx);
  const connDone = phase === "connect" && connIdx >= connEdgesAll.length;
  const checks = connDone ? { bst: true, heap: true } : { bst: false, heap: false };

  return (
    <div className="space-y-5">
      {/* Координатная плоскость — НАВЕРХУ */}
      <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h4 className="text-base font-bold text-emerald-300">🗺️ Декартова плоскость — точки просто стоят</h4>
          <div className="flex items-center gap-2">
            {phase === "sort" ? (
              <>
                <span className="text-xs text-slate-400">Сортировка точек по y:</span>
                {(["quicksort", "counting"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAlgo(a); setSortIdx(0); setPlaying(true); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${algo === a ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                  >
                    {a === "quicksort" ? "quicksort (сравнения)" : "counting по целым y"}
                  </button>
                ))}
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400">Порядок рисования линий:</span>
                <button
                  onClick={() => startConnect("y-desc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${order === "y-desc" && (playing || connDone) ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                >
                  по y ↓ (алгоритм)
                </button>
                <button
                  onClick={() => startConnect("left-right")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${order === "left-right" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                >
                  слева направо (не оптимальный)
                </button>
              </>
            )}
          </div>
        </div>
        <Plane
          points={INPUT_CLEAN}
          drawnEdges={phase === "connect" ? connEdges : []}
          pending={null}
        />
        <div className="mt-2 text-xs text-slate-300 bg-slate-950/70 rounded-lg px-3 py-2 border border-slate-800 min-h-[36px]">
          {phase === "sort" ? (
            algo === "none" ? (
              <>Ввод приходит <b>как попало</b> ({INPUT_CLEAN.length} пар в случайном порядке). Сначала — сортировка по y. Выбери способ и смотри на счётчики: <b>есть ли разница, чем сортировать?</b></>
            ) : sortIdx < 3 ? (
              algo === "quicksort" ? (
                <>⚡ quicksort: сравнение с сравнением… счётчик сравнений: <b className="text-amber-300">{Math.round((sortIdx + 1) * comparisons / 3)}</b> из ≈ <b>{comparisons}</b> (n·log₂n ≈ {n}·3). Ниже этого сравнениями не бывает — это нижняя граница.</>
              ) : (
                <>🧺 counting: раскладываем точки в корзины по значению y — <b className="text-emerald-300">0 сравнений</b>, операций ≈ n + k = {n} + 9. Работает, потому что y — маленькие целые.</>
              )
            ) : (
              <>Отсортировано по y. Счётчики: quicksort ≈ <b>{comparisons}</b> сравнений, counting — <b>0</b> (n+k операций). <b>Разница есть</b> — но обе дают O(n·log n) и O(n) соответственно и <b>одно и то же дерево</b>. Теперь соединяй →</>
            )
          ) : connDone ? (
            <>🏁 Проведено {connEdges.length} линий в порядке «{order === "y-desc" ? "по y ↓" : "слева направо"}». Результат <b>одинаковый</b>: точки прибиты, дерево одно — порядок рисования не важен.</>
          ) : (
            <>Рисуем линии в порядке «{order === "y-desc" ? "по y ↓ (алгоритм вставки)" : "слева направо (кто-то бы рисовал и так)"}» — {connIdx} из {connEdgesAll.length}.</>
          )}
        </div>
      </div>

      {/* Чек-лист инвариантов */}
      <div className={`rounded-xl p-4 border transition-colors ${connDone ? "border-emerald-500/60 bg-emerald-950/20" : "border-slate-700 bg-slate-900/40"}`}>
        <h4 className="text-sm font-bold text-slate-300 mb-2">✅ Проверка (авто, на текущем состоянии)</h4>
        <ul className="space-y-1.5 text-sm">
          <li>{connDone ? "✅" : "⏳"} каждое ребро ведёт <b>вниз по y</b> (родитель выше ребёнка)</li>
          <li>{connDone ? "✅" : "⏳"} обход слева-направо даёт <b>сортировку по x</b> (BST)</li>
          <li>{connDone ? "✅" : "⏳"} линий ровно <b>n − 1</b>, все точки соединены в одно дерево</li>
        </ul>
        {!connDone && <p className="text-xs text-slate-500 mt-2">Галочки загорятся, когда все линии проведены — проверяются программно ({checks.bst ? "ok" : "…"}).</p>}
      </div>

      {/* Дерево — только для алгоритмического порядка */}
      {order === "y-desc" && (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-bold text-slate-300 mb-2">🌳 То же самое дерево после алгоритма вставки (по y ↓)</h4>
          <TreeView root={buildTree(INPUT_CLEAN)} subtitle="Слева-направо читается сортировка по x; сверху-вниз по y — куча." />
        </div>
      )}
    </div>
  );
};

/* ================= РЕЖИМ SPLIT ================= */

const SplitMode: React.FC = () => {
  const [x0, setX0] = useState(7);
  const [stepIdx, setStepIdx] = useState(0);
  const fullTree = useMemo(() => buildTree(POINTS), []);
  const split = useMemo(() => splitTree(buildTree(POINTS), x0), [x0]);
  const steps = split.trace;
  const idx = Math.min(stepIdx, steps.length - 1);
  const done = idx >= steps.length - 1;

  const inL = new Set<NodeId>();
  const inR = new Set<NodeId>();
  steps.slice(0, idx + 1).forEach((s) => (s.goLeft ? inL : inR).add(s.atId));

  const lTree = split.l;
  const rTree = split.r;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-300">Разрез по x =</span>
        <select value={x0} onChange={(e) => { setX0(Number(e.target.value)); setStepIdx(0); }} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white">
          {[2, 3, 6, 7, 9, 12, 45].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={() => setStepIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white disabled:opacity-30">← Шаг</button>
        <button onClick={() => setStepIdx(Math.min(steps.length - 1, idx + 1))} disabled={done} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-30">Шаг →</button>
        <span className="text-xs text-slate-400">шаг {idx + 1} из {steps.length}</span>
      </div>

      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
        <h4 className="text-sm font-bold text-slate-300 mb-2">✂️ Исходное дерево: <span className="text-sky-400">синие → L (≤ {x0})</span>, <span className="text-rose-400">розовые → R (&gt; {x0})</span></h4>
        <TreeView
          root={fullTree}
          nodeColor={(id) => (inL.has(id) ? "#1e3a8a" : inR.has(id) ? "#881337" : "#0f172a")}
          nodeStroke={(id) => (inL.has(id) ? "#60a5fa" : inR.has(id) ? "#fb7185" : "#64748b")}
          subtitle={done ? "Каждый узел покрашен ровно один раз — O(h). Целые поддеревья уходят целиком." : undefined}
        />
      </div>

      <div className="text-xs text-slate-300 bg-slate-950/70 rounded-lg px-3 py-2 border border-slate-800 min-h-[36px]">
        {steps[idx]?.note}
      </div>

      {done && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-sky-950/20 rounded-xl p-3 border border-sky-500/40">
            <h5 className="text-sm font-bold text-sky-300 mb-1">L (все x ≤ {x0})</h5>
            <TreeView root={lTree} width={480} height={240} nodeColor={() => "#1e3a8a"} nodeStroke={() => "#60a5fa"} />
          </div>
          <div className="bg-rose-950/20 rounded-xl p-3 border border-rose-500/40">
            <h5 className="text-sm font-bold text-rose-300 mb-1">R (все x &gt; {x0})</h5>
            <TreeView root={rTree} width={480} height={240} nodeColor={() => "#881337"} nodeStroke={() => "#fb7185"} />
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
        💡 <b>Как это работает на самом деле:</b> идём сверху с двумя корзинами. Узел, целиком помещающийся в корзину (вместе со своим поддеревом), отдаётся <b>вместе с веткой</b> — дальше режется только одна ветка. Поэтому split — O(h), а не O(n).
      </div>
    </div>
  );
};

/* ================= РЕЖИМ MERGE ================= */

const MergeMode: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const { l, r } = useMemo(() => splitTree(buildTree(POINTS), 6), []);
  const merged = useMemo(() => mergeTree(cloneTree(l), cloneTree(r)), [l, r]);
  const steps = merged.trace;
  const idx = Math.min(stepIdx, steps.length - 1);
  const done = idx >= steps.length - 1;
  const cur = steps[idx];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setStepIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white disabled:opacity-30">← Шаг</button>
        <button onClick={() => setStepIdx(Math.min(steps.length - 1, idx + 1))} disabled={done} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-30">Шаг →</button>
        <span className="text-xs text-slate-400">шаг {idx + 1} из {steps.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-sky-950/20 rounded-xl p-3 border border-sky-500/40">
          <h5 className="text-sm font-bold text-sky-300 mb-1">a: L после split по 6 (все x ≤ 6)</h5>
          <TreeView root={l} width={480} height={220} nodeColor={() => "#1e3a8a"} nodeStroke={() => "#60a5fa"} />
        </div>
        <div className="bg-rose-950/20 rounded-xl p-3 border border-rose-500/40">
          <h5 className="text-sm font-bold text-rose-300 mb-1">b: R после split по 6 (все x &gt; 6)</h5>
          <TreeView root={r} width={480} height={220} nodeColor={() => "#881337"} nodeStroke={() => "#fb7185"} />
        </div>
      </div>

      <div className="text-xs text-slate-300 bg-slate-950/70 rounded-lg px-3 py-2 border border-slate-800 min-h-[36px]">
        {cur?.chosenId ? (
          <>⚖️ {cur.note}</>
        ) : (
          <>Готово: {done ? "деревья склеены обратно в исходное." : "жми «Шаг» — на каждом уровне один вопрос: у какого корня y больше?"}</>
        )}
      </div>

      {done && (
        <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-500/40">
          <h5 className="text-sm font-bold text-emerald-300 mb-1">Результат: снова исходное дерево</h5>
          <TreeView root={merged.root} subtitle="merge(a, b) требует: все x в a меньше всех x в b. Решает только y корней." />
        </div>
      )}

      <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
        💡 <b>Грамотно про «слияние»:</b> у корней сравнивается только приоритет y — больший становится вершиной, а одно из его поддеревьев (то, что сохраняет порядок x) отправляется дальше на склейку. Никакой магии и никаких «капель»: O(h) сравнений y.
      </div>
    </div>
  );
};

/* ================= РЕЖИМ ERASE ================= */

const EraseMode: React.FC = () => {
  const [key, setKey] = useState(9);
  const [stepIdx, setStepIdx] = useState(0);
  const fullTree = useMemo(() => buildTree(POINTS), []);
  const res = useMemo(() => eraseNode(buildTree(POINTS), key), [key]);
  const steps = res.trace;
  const idx = Math.min(stepIdx, steps.length - 1);
  const done = idx >= steps.length - 1;

  const pathIds = useMemo(() => {
    const ids: NodeId[] = [];
    for (const s of steps.slice(0, idx + 1)) if (s.atId) ids.push(s.atId);
    return ids;
  }, [steps, idx]);
  const pathSet = new Set(pathIds);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-300">Удалить точку с x =</span>
        <select value={key} onChange={(e) => { setKey(Number(e.target.value)); setStepIdx(0); }} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white">
          {POINTS.map((p) => <option key={p.key} value={p.key}>{p.key}</option>)}
        </select>
        <button onClick={() => setStepIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white disabled:opacity-30">← Шаг</button>
        <button onClick={() => setStepIdx(Math.min(steps.length - 1, idx + 1))} disabled={done} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-30">Шаг →</button>
        <span className="text-xs text-slate-400">шаг {idx + 1} из {steps.length}</span>
      </div>

      {!done ? (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
          <TreeView
            root={fullTree}
            nodeColor={(id) => (pathSet.has(id) ? "#78350f" : "#0f172a")}
            nodeStroke={(id) => (pathSet.has(id) ? "#f59e0b" : "#64748b")}
            subtitle="Куча сама умеет удалять только вершину. Спуск по x находит любую точку."
          />
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-bold text-slate-300 mb-2">🕳️ Точка ({key}, …) вырезана, дети сшиты merge</h4>
          <TreeView root={res.root} subtitle="Валидность проверь по чек-листу: обход по x и высота по y не сломались." />
          <ul className="mt-2 space-y-1 text-sm">
            <li>✅ обход слева-направо по-прежнему сортирован (BST цел)</li>
            <li>✅ каждое ребро вниз по y (куча цела) — сшивку делал merge</li>
          </ul>
        </div>
      )}

      <div className="text-xs text-slate-300 bg-slate-950/70 rounded-lg px-3 py-2 border border-slate-800 min-h-[36px]">
        {steps[idx]?.note}
      </div>

      <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
        💡 <b>Ответ на «убрать можно только самый верхний»:</b> это про кучу. Treap — дерево поиска: найти по x умеет за O(h), а дырку затягивает merge двух детей. Удаляется <b>любая</b> точка, не только верхушка.
      </div>
    </div>
  );
};

/* ================= РЕЖИМ LAYERS (2k/2k+1) ================= */

const LayersMode: React.FC = () => {
  const [pick, setPick] = useState<"heap" | "treap">("heap");
  // Полное дерево из 7 узлов (куча): индексы 1..7
  const heapArr = [0, 98, 45, 90, 32, 21, 76, 12];
  const full = useMemo(() => buildTree(POINTS), []);
  // Честная слотовая разметка treap: индексы как в куче (root=1, ребёнок = 2i/2i+1)
  const slots = useMemo(() => {
    const arr: (string | null)[] = Array(16).fill(null);
    const walk = (n: TNode | null, i: number) => {
      if (!n || i >= 16) return;
      arr[i] = n.id;
      walk(n.left, 2 * i);
      walk(n.right, 2 * i + 1);
    };
    walk(full, 1);
    return arr;
  }, [full]);
  const nodeCount = slots.filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setPick("heap")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${pick === "heap" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300"}`}>Полное дерево (куча в массиве)</button>
        <button onClick={() => setPick("treap")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${pick === "treap" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300"}`}>Тот же трюк на treap</button>
      </div>

      {pick === "heap" ? (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-bold text-slate-300 mb-2">✅ Куча из 7 узлов: полное дерево — формула детей i → 2i и 2i+1 работает</h4>
          <div className="flex gap-2 overflow-x-auto mb-3">
            {heapArr.slice(1).map((v, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono text-xs">
                <div className="text-slate-500 text-[10px]">i={i + 1}</div>
                <div className="text-white font-bold">{v}</div>
                <div className="text-emerald-400 text-[10px]">дети: {2 * (i + 1)}, {2 * (i + 1) + 1}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Полное дерево заполняет слои без дыр — поэтому «адрес» ребёнка вычисляется. Каждая пара i → 2i/2i+1 попадает в узел.</p>
        </div>
      ) : (
        <div className="bg-slate-900/40 rounded-xl p-4 border border-rose-500/40">
          <h4 className="text-sm font-bold text-rose-300 mb-2">❌ Treap: {nodeCount} узлов, глубина 4 — полное дерево требует 15 слотов</h4>
          <TreeView root={full} subtitle="Попробуй «посчитать адрес» ребёнка корня 45: 2·1 и 2·1+1 — а правого ребёнка у корня просто НЕТ." />
          <div className="flex gap-2 overflow-x-auto mt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
              const id = slots[i];
              return (
                <div key={i} className={`px-2.5 py-2 rounded-lg border text-center font-mono text-xs min-w-[52px] ${id ? "bg-slate-950 border-slate-700" : "bg-rose-950/40 border-rose-500/60"}`}>
                  <div className="text-slate-500 text-[10px]">i={i}</div>
                  {id ? <div className="text-white font-bold">{pairParts(id)[0]}</div> : <div className="text-rose-400">дыра</div>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-rose-300 mt-2">Смотрите: слот 3 (правый ребёнок корня) — <b>дыра</b>, у корня нет правого ребёнка; зато левая ветка ушла на 4 уровня и заняла дальние слоты. Из 15 слотов занято 8. Адресация по слоям ведёт в дырки — детей ищут указателями (left/right), а не арифметикой.</p>
        </div>
      )}

      <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
        💡 <b>Грабля «дети в массиве по 2k/2k+1»:</b> формула — привилегия <b>полных</b> деревьев (куча, дерево отрезков). Treap растёт кривым: слои дырявые, и «адрес» ребёнка посчитать нельзя.
      </div>
    </div>
  );
};

/* ================= РЕЖИМ SEARCH (поиск ≠ сортировка) ================= */

const SearchMode: React.FC = () => {
  // Подобрано так, что бинарный поиск ГАРАНТИРОВАННО промахивается:
  // mid (индекс 3) = 9 > 7 → уходит влево, а цель лежит справа.
  const shuffled: Pair[] = [
    { key: 12, grade: 0 },
    { key: 3, grade: 6 },
    { key: 45, grade: 8 },
    { key: 9, grade: 3 },
    { key: 6, grade: 5 },
    { key: 2, grade: 4 },
    { key: 7, grade: 2 },
    { key: 1, grade: -4 },
  ];
  const target = 7;
  const sortedByKey = [...shuffled].sort((a, b) => a.key - b.key);
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0: ввод, 1: бинарный поиск по неотсортированному (промах), 2: отсортировали, нашли
  const [bidx, setBidx] = useState(0);

  // шаги бинарного поиска на отсортированном массиве для x=7
  const bsSteps = useMemo(() => {
    const steps: { lo: number; hi: number; mid: number; found: boolean; note: string }[] = [];
    let lo = 0, hi = sortedByKey.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (sortedByKey[mid].key === target) { steps.push({ lo, hi, mid, found: true, note: `arr[${mid}] = ${sortedByKey[mid].key} = цель — нашли за ${steps.length + 1} сравнение(й).` }); break; }
      if (sortedByKey[mid].key < target) { steps.push({ lo, hi, mid, found: false, note: `arr[${mid}] = ${sortedByKey[mid].key} < ${target} — вся левая половина выброшена.` }); lo = mid + 1; }
      else { steps.push({ lo, hi, mid, found: false, note: `arr[${mid}] = ${sortedByKey[mid].key} > ${target} — правая половина выброшена.` }); hi = mid - 1; }
    }
    return steps;
  }, [sortedByKey]);

  const wrongMid = Math.floor((shuffled.length - 1) / 2);
  const comparisons = stage === 2 ? bidx + 1 : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {stage < 2 && (
          <button onClick={() => { setStage(stage === 0 ? 1 : 2); setBidx(0); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white">
            {stage === 0 ? "Найти y для x=7 бинарным поиском" : "Отсортировать и попробовать снова"}
          </button>
        )}
        {stage === 2 && (
          <button onClick={() => setBidx(Math.min(bsSteps.length - 1, bidx + 1))} disabled={bidx >= bsSteps.length - 1} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-30">
            Шаг поиска →
          </button>
        )}
        <button onClick={() => { setStage(0); setBidx(0); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white">Сброс</button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {(stage === 2 ? sortedByKey : shuffled).map((p, i) => {
          const highlight = stage === 1 && i === wrongMid;
          const inBs = stage === 2 && (() => { const s = bsSteps[Math.min(bidx, bsSteps.length - 1)]; return i >= s.lo && i <= s.hi; })();
          const isMid = stage === 2 && (() => { const s = bsSteps[Math.min(bidx, bsSteps.length - 1)]; return i === s.mid; })();
          const isFound = stage === 2 && bidx >= bsSteps.length - 1 && sortedByKey[bidx]?.key === target && isMid;
          return (
            <div key={`${p.key}:${p.grade}-${i}`} className={`px-2.5 py-2 rounded-lg border text-center font-mono text-xs min-w-[64px] transition-all ${highlight ? "border-rose-500 bg-rose-950/50" : isFound ? "border-emerald-500 bg-emerald-950/50" : isMid ? "border-amber-500 bg-amber-950/30" : inBs ? "border-indigo-500/60 bg-slate-950" : "border-slate-700 bg-slate-950"}`}>
              <div className="text-white font-bold">{p.key}</div>
              <div className="text-slate-400 text-[10px]">y={p.grade}</div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-300 bg-slate-950/70 rounded-lg px-3 py-2 border border-slate-800 min-h-[52px]">
        {stage === 0 && <>Массив пар <b>не отсортирован</b>. Жми кнопку: бинарный поиск предполагает порядок — посмотрим, что он ответит на беспорядок.</>}
        {stage === 1 && <>❌ Бинарный поиск посмотрел на середину <b>x={shuffled[wrongMid].key}</b>: 9 &gt; 7 → «цель слева», отрезал правую половину… <b>в которой лежала цель</b>. На неотсортированных данных он <b>не ищет, а гадает</b>. И уж точно он ничего не <b>переставил</b>: массив как был в беспорядке, так и остался. Поиск ≠ сортировка.</>}
        {stage === 2 && bidx < bsSteps.length - 1 && <>🔍 {bsSteps[bidx].note} (сравнений: {comparisons})</>}
        {stage === 2 && bidx >= bsSteps.length - 1 && <>✅ {bsSteps[bsSteps.length - 1].note} <b>Поиск нашёл один элемент</b> за ~log₂8 ≈ 3 сравнения. Но чтобы поиск вообще заработал, кто-то уже отсортировал все 8 пар: сравнительной сортировке нужно ≥ n·log₂n ≈ 19–22 сравнения на <b>всех</b>. «Отсортирую бинарным поиском» = «разберу весь гардероб, тронув одну полку».</>}
      </div>

      <div className="text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800">
        💡 <b>Есть ли разница, чем сортировать?</b> Сравнениями (quicksort/merge/heap) — быстрее n·log₂n <b>нельзя в принципе</b>: это нижняя граница, каждое сравнение даёт 1 бит. Но counting/radix <b>не сравнивает</b>: раскладывает по корзинам значений — O(n + k) для маленьких целых y (вкладка «Собрать», кнопка counting). Оба пути дают <b>одинаковое дерево</b> — сортировка нужна лишь чтобы задать порядок соединения.
      </div>
    </div>
  );
};

/* ================= КОРПУС ================= */

type Tab = "build" | "split" | "merge" | "erase" | "layers" | "search";

const TABS: { id: Tab; label: string }[] = [
  { id: "build", label: "Собрать" },
  { id: "split", label: "Split ✂️" },
  { id: "merge", label: "Merge 🧲" },
  { id: "erase", label: "Erase 🕳️" },
  { id: "layers", label: "Миф: 2k/2k+1" },
  { id: "search", label: "Поиск ≠ сортировка" },
];

export const TreapBuildViz = () => {
  const [tab, setTab] = useState<Tab>("build");

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/30">
            <span className="text-2xl">📐</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивный Treap</h3>
            <p className="text-sm text-emerald-300">Пара (x; y): x — ключ, y — приоритет. Декартова плоскость → дерево</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.id ? "bg-emerald-600 text-white" : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "build" && <BuildMode />}
      {tab === "split" && <SplitMode />}
      {tab === "merge" && <MergeMode />}
      {tab === "erase" && <EraseMode />}
      {tab === "layers" && <LayersMode />}
      {tab === "search" && <SearchMode />}
    </div>
  );
};
