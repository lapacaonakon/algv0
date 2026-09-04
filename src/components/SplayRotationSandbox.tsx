import React, { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Dices, Eye, EyeOff, RotateCcw, Undo2, XCircle } from "lucide-react";

/**
 * Песочница поворотов.
 *
 * Здесь ничего не подсказывается: дано настоящее дерево поиска и цель —
 * поднять отмеченный узел в корень. Клик по узлу = один поворот с его родителем.
 * Порядок поворотов выбираешь сам; правильный ли он по splay — проверка скажет
 * только после того, как узел окажется наверху (или по кнопке «Показать разбор»).
 */

export interface TNode {
  key: number;
  left: TNode | null;
  right: TNode | null;
}

const leaf = (key: number): TNode => ({ key, left: null, right: null });

const clone = (t: TNode | null): TNode | null =>
  t ? { key: t.key, left: clone(t.left), right: clone(t.right) } : null;

/** Заготовки: линия (zig-zig), змейка (zig-zag) и простой случай (zig). */
export const PRESETS: { name: string; hintCase: string; build: () => TNode; target: number }[] = [
  {
    name: "Линия влево",
    hintCase: "Zig-Zig",
    target: 1,
    build: () => {
      const n1 = leaf(1);
      const n2: TNode = { key: 2, left: n1, right: leaf(3) };
      const n4: TNode = { key: 4, left: n2, right: leaf(5) };
      return { key: 6, left: n4, right: leaf(7) };
    },
  },
  {
    name: "Змейка",
    hintCase: "Zig-Zag",
    target: 3,
    build: () => {
      const n3 = leaf(3);
      const n2: TNode = { key: 2, left: leaf(1), right: n3 };
      const n4: TNode = { key: 4, left: n2, right: leaf(5) };
      return { key: 6, left: n4, right: leaf(7) };
    },
  },
  {
    name: "Один уровень",
    hintCase: "Zig",
    target: 2,
    build: () => ({ key: 4, left: { key: 2, left: leaf(1), right: leaf(3) }, right: leaf(6) }),
  },
  {
    name: "Смешанный",
    hintCase: "Zig-Zag, затем Zig-Zig",
    target: 5,
    build: () => {
      const n5 = leaf(5);
      const n6: TNode = { key: 6, left: n5, right: leaf(7) };
      const n4: TNode = { key: 4, left: leaf(3), right: n6 };
      return { key: 8, left: n4, right: leaf(9) };
    },
  },
];

/* ------------------------- операции над деревом ------------------------- */

export const findPath = (root: TNode | null, key: number): TNode[] => {
  const path: TNode[] = [];
  let cur = root;
  while (cur) {
    path.push(cur);
    if (key === cur.key) return path;
    cur = key < cur.key ? cur.left : cur.right;
  }
  return [];
};

/** Поднять узел key на один уровень (поворот с родителем). Возвращает новый корень. */
export function rotateUp(root: TNode, key: number): TNode {
  const path = findPath(root, key);
  if (path.length < 2) return root;

  const x = path[path.length - 1];
  const p = path[path.length - 2];
  const gg = path.length >= 3 ? path[path.length - 3] : null;

  if (p.left === x) {
    p.left = x.right;
    x.right = p;
  } else {
    p.right = x.left;
    x.left = p;
  }

  if (!gg) return x;
  if (gg.left === p) gg.left = x;
  else gg.right = x;
  return root;
}

/** Какой поворот сделал бы настоящий splay из текущего состояния. */
export function canonicalNext(root: TNode, key: number): { node: number; kind: string } | null {
  const path = findPath(root, key);
  if (path.length < 2) return null;
  const x = path[path.length - 1];
  const p = path[path.length - 2];
  const g = path.length >= 3 ? path[path.length - 3] : null;

  if (!g) return { node: x.key, kind: "Zig" };

  const xLeft = p.left === x;
  const pLeft = g.left === p;
  if (xLeft === pLeft) return { node: p.key, kind: "Zig-Zig (сначала верхняя пара)" };
  return { node: x.key, kind: "Zig-Zag (сначала нижняя пара)" };
}

/* ------------------------------- раскладка ------------------------------- */

interface Placed {
  key: number;
  x: number;
  y: number;
  depth: number;
}

function layout(root: TNode | null): { nodes: Placed[]; edges: [number, number][]; width: number; height: number } {
  const nodes: Placed[] = [];
  const edges: [number, number][] = [];
  let order = 0;

  const walk = (n: TNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    nodes.push({ key: n.key, x: order++, y: depth, depth });
    if (n.left) edges.push([n.key, n.left.key]);
    if (n.right) edges.push([n.key, n.right.key]);
    walk(n.right, depth + 1);
  };
  walk(root, 0);

  const cols = Math.max(1, order);
  const rows = Math.max(1, Math.max(...nodes.map((n) => n.depth), 0) + 1);
  const colW = 46;
  const rowH = 62;
  return {
    nodes: nodes.map((n) => ({ ...n, x: n.x * colW + colW / 2, y: n.y * rowH + 32 })),
    edges,
    width: cols * colW,
    height: rows * rowH + 20,
  };
}

/* ------------------------------- компонент ------------------------------- */

export const SplayRotationSandbox: React.FC = () => {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  const [tree, setTree] = useState<TNode>(() => preset.build());
  const [history, setHistory] = useState<TNode[]>([]);
  const [moves, setMoves] = useState<{ node: number; correct: boolean; expected: string }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const target = preset.target;
  const solved = tree.key === target;

  const reset = useCallback(
    (idx = presetIdx) => {
      setPresetIdx(idx);
      setTree(PRESETS[idx].build());
      setHistory([]);
      setMoves([]);
      setShowAnswer(false);
    },
    [presetIdx]
  );

  const { nodes, edges, width, height } = useMemo(() => layout(tree), [tree]);
  const path = useMemo(() => new Set(findPath(tree, target).map((n) => n.key)), [tree, target]);
  const expected = useMemo(() => (solved ? null : canonicalNext(tree, target)), [tree, target, solved]);

  const clickNode = (key: number) => {
    if (solved) return;
    const p = findPath(tree, key);
    if (p.length < 2) return; // корень крутить не с кем

    const want = canonicalNext(tree, target);
    setHistory((h) => [...h, clone(tree) as TNode]);
    setMoves((m) => [...m, { node: key, correct: want?.node === key, expected: want?.kind ?? "" }]);
    setTree((t) => rotateUp(clone(t) as TNode, key));
  };

  const undo = () => {
    if (history.length === 0) return;
    setTree(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => m.slice(0, -1));
  };

  const wrong = moves.filter((m) => !m.correct).length;
  const minimal = useMemo(() => findPath(preset.build(), target).length - 1, [preset, target]);

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white">Песочница: подними узел сам</h4>
          <p className="text-[12px] text-slate-400 leading-relaxed mt-0.5">
            Клик по узлу = один поворот с его родителем. Задача — загнать{" "}
            <span className="font-mono font-bold text-indigo-300">{target}</span> в корень. Подсказок нет: порядок
            поворотов выбираешь сам, разбор покажем в конце.
          </p>
        </div>
        <button
          onClick={() => reset((presetIdx + 1) % PRESETS.length)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors shrink-0"
        >
          <Dices className="w-3.5 h-3.5" /> Другое дерево
        </button>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              i === presetIdx ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto block mx-auto"
          style={{ minWidth: Math.min(width * 1.5, 420), width: "100%", maxWidth: width * 2 }}
          role="img"
        >
          {edges.map(([a, b], i) => {
            const na = nodes.find((n) => n.key === a);
            const nb = nodes.find((n) => n.key === b);
            if (!na || !nb) return null;
            const onPath = path.has(a) && path.has(b);
            return (
              <line
                key={i}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke={onPath ? "#6366f1" : "#475569"}
                strokeWidth={onPath ? 3 : 1.8}
                style={{ transition: "all 700ms cubic-bezier(.34,.01,.2,1)" }}
              />
            );
          })}

          {nodes.map((n) => {
            const isTarget = n.key === target;
            const clickable = !solved && n.depth > 0;
            return (
              <g
                key={n.key}
                onClick={() => clickable && clickNode(n.key)}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  transition: "transform 700ms cubic-bezier(.34,.01,.2,1)",
                  cursor: clickable ? "pointer" : "default",
                }}
              >
                {isTarget && (
                  <circle r={22} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" opacity={0.9} />
                )}
                <circle
                  r={16}
                  fill={isTarget ? "#6366f1" : path.has(n.key) ? "#1e40af" : "#1e293b"}
                  stroke={isTarget ? "#a5b4fc" : "#475569"}
                  strokeWidth={2}
                />
                <text textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700" fill="#fff">
                  {n.key}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 enabled:hover:text-white disabled:opacity-40 text-xs font-bold transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" /> Отменить
        </button>
        <button
          onClick={() => reset()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Заново
        </button>
        <button
          onClick={() => setShowAnswer((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            showAnswer
              ? "bg-amber-600/20 border-amber-500 text-amber-300"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showAnswer ? "Скрыть разбор" : "Сдаться / показать разбор"}
        </button>

        <span className="text-[11px] text-slate-500 ml-auto font-mono tabular-nums">
          поворотов: {moves.length} · минимум: {minimal}
        </span>
      </div>

      {showAnswer && !solved && expected && (
        <div className="mt-3 text-[12px] bg-amber-950/40 border border-amber-800/60 rounded-lg px-3 py-2 text-amber-200">
          Сейчас splay крутил бы узел{" "}
          <span className="font-mono font-bold">{expected.node}</span> — случай {expected.kind}.
        </div>
      )}

      {solved && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2.5 text-[12.5px] leading-relaxed ${
            wrong === 0
              ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
              : "bg-rose-950/30 border-rose-800/60 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            {wrong === 0 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {wrong === 0
              ? `Узел ${target} в корне за ${moves.length} поворотов — ровно как splay.`
              : `Узел ${target} в корне за ${moves.length} поворотов, но ${wrong} ход(а) разошлись со splay.`}
          </div>
          {wrong > 0 && (
            <ul className="list-disc pl-5 space-y-0.5">
              {moves.map(
                (m, i) =>
                  !m.correct && (
                    <li key={i}>
                      ход {i + 1}: крутили <span className="font-mono font-bold">{m.node}</span>, splay здесь сделал бы{" "}
                      {m.expected}
                    </li>
                  )
              )}
            </ul>
          )}
          {wrong === 0 && moves.length > minimal && (
            <div className="opacity-80">Порядок верный, но лишние повороты: минимум — {minimal}.</div>
          )}
        </div>
      )}
    </div>
  );
};
