import { useEffect, useMemo, useState } from "react";

/**
 * Интерактивное построение декартова дерева в координатной плоскости.
 *
 * Идея страницы: каждая пара (x, y) — точка, прибитая к клетчатой бумаге
 * (x = ключ, y = приоритет). Точки НЕ двигаются никогда; построить дерево —
 * значит правильно соединить их линиями: ребро всегда идёт от большего y к
 * меньшему (куча), а «левее/правее» решает x (BST).
 *
 * Канонический набор страницы — восемь пар со ВСЕМИ различными ключами и
 * приоритетами (дерево единственно):
 *   (45,8) (3,6) (6,5) (2,4) (9,3) (7,2) (12,0) (1,-4)
 *
 * Все структуры ниже идентифицируют узел ПАРОЙ (id = "x:y"), а не ключом:
 * ключ уникален в каноническом наборе, но код не должен полагаться на это.
 */

interface Pair {
  key: number;
  grade: number;
}
type NodeId = string; // "x:y"

const pairId = (key: number, grade: number): NodeId => `${key}:${grade}`;

interface TNode {
  id: NodeId;
  key: number;
  grade: number;
  left: TNode | null;
  right: TNode | null;
  parentId: NodeId | null;
  side: "L" | "R" | null; // каким ребёнком встал (у корня — null)
}
interface Placed {
  id: NodeId;
  key: number;
  grade: number;
  px: number;
  py: number;
  parentId: NodeId | null;
  side: "L" | "R" | null;
}
interface Edge {
  from: NodeId;
  to: NodeId;
}
interface Step {
  points: Placed[];
  edges: (Edge & { fresh: boolean })[];
  candidate: Pair | null;
  pathIds: NodeId[];
  justPlacedId: NodeId | null;
  doneIds: NodeId[];
  log: string;
  codeLine: number;
}

/** Канонический набор страницы: все x различны, все y различны. */
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

/** Порядок соединения: по убыванию y (стабильно). */
export const CONNECTION_ORDER: Pair[] = [...POINTS].sort((a, b) => b.grade - a.grade);

const CODE_LINES = [
  { line: 1, text: "root = None" },
  { line: 2, text: "for key, pri in pairs_sorted_by_pri_desc:" },
  { line: 3, text: "    cur, parent = root, None" },
  { line: 4, text: "    while cur:                      # спуск от корня" },
  { line: 5, text: "        parent = cur" },
  { line: 6, text: "        cur = cur.left if key <= cur.key else cur.right" },
  { line: 7, text: "    <пустое место под parent> = Node(key, pri)" },
  { line: 8, text: "# pri приходят по убыванию — куча не нарушится сама" },
];

/** Перевод координат точки в пиксели SVG. */
const VIEW_W = 820;
const VIEW_H = 470;
const X = (key: number) => 50 + (key - 1) * ((VIEW_W - 80) / 44); // ключи 1..45
const Y = (grade: number) => 34 + (8 - grade) * ((VIEW_H - 80) / 12); // грейды -4..8

function collect(root: TNode | null): { points: Placed[]; edges: Edge[] } {
  const points: Placed[] = [];
  const edges: Edge[] = [];
  const walk = (n: TNode | null) => {
    if (!n) return;
    walk(n.left);
    points.push({
      id: n.id,
      key: n.key,
      grade: n.grade,
      px: X(n.key),
      py: Y(n.grade),
      parentId: n.parentId,
      side: n.side,
    });
    if (n.parentId) edges.push({ from: n.parentId, to: n.id });
    walk(n.right);
  };
  walk(root);
  return { points, edges };
}

export function buildSteps(): Step[] {
  const steps: Step[] = [];
  let root: TNode | null = null;
  const doneIds: NodeId[] = [];

  const snap = (log: string, codeLine: number, extra: Partial<Step> = {}): Step => {
    const { points, edges } = collect(root);
    return {
      points,
      edges: edges.map((e) => ({ ...e, fresh: false })),
      candidate: null,
      pathIds: [],
      justPlacedId: null,
      doneIds: [...doneIds],
      log,
      codeLine,
      ...extra,
    };
  };

  steps.push(
    snap(
      "📐 Восемь точек на клетчатой бумаге — все x и все y различны, поэтому дерево получится ровно одно. Соединяем по убыванию y: линия идёт вниз, сторону подсказывает x.",
      1,
    ),
  );

  for (const hire of CONNECTION_ORDER) {
    const label = `(${hire.key}, ${hire.grade})`;
    const hireId = pairId(hire.key, hire.grade);

    steps.push(
      snap(`🖊️ Соединяем следующую точку — ${label}. Порядок задаёт y: от 8 к −4. Спуск от корня, сравнение по x.`, 2, {
        candidate: hire,
      }),
    );

    let cur = root;
    let parent: TNode | null = null;
    let side: "L" | "R" | null = null;
    const pathIds: NodeId[] = [];

    while (cur) {
      const atNode = cur;
      const dir: "L" | "R" = hire.key <= atNode.key ? "L" : "R";
      pathIds.push(atNode.id);
      steps.push(
        snap(
          `⚖️ Точка ${label} против (${atNode.key}, ${atNode.grade}): ${hire.key} ${dir === "L" ? "≤" : ">"} ${atNode.key} — ${dir === "L" ? "левее" : "правее"}.`,
          6,
          { candidate: hire, pathIds: [...pathIds] },
        ),
      );
      parent = atNode;
      side = dir;
      cur = dir === "L" ? atNode.left : atNode.right;
    }

    const node: TNode = {
      id: hireId,
      key: hire.key,
      grade: hire.grade,
      left: null,
      right: null,
      parentId: parent ? parent.id : null,
      side,
    };
    if (!root) root = node;
    else if (side === "L") parent!.left = node;
    else parent!.right = node;
    doneIds.push(hireId);

    steps.push({
      ...snap(
        parent
          ? `🔗 Ребро проведено: ${label} — ${side === "L" ? "левый" : "правый"} ребёнок (${parent.key}, ${parent.grade}). Линия ушла вниз по y — куча цела.`
          : `🔗 Точка ${label} первая — пока ни с кем не соединена: она корень.`,
        7,
        { candidate: hire, pathIds: [...pathIds], justPlacedId: hireId },
      ),
    });
  }

  steps.push(
    snap(
      "🏁 Все точки соединены. Слева-направо по x читается отсортированный порядок, сверху-вниз по y — куча. Любой другой корректный алгоритм провёл бы те же линии: точки прибиты.",
      8,
    ),
  );

  return steps;
}

export const TreapBuildViz = () => {
  const steps = useMemo(buildSteps, []);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (playing && idx < steps.length - 1) {
      timer = setTimeout(() => setIdx((v) => v + 1), 1400);
    } else if (idx >= steps.length - 1) {
      setPlaying(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [playing, idx, steps.length]);

  const step = steps[idx];
  const byId = new Map(step.points.map((p) => [p.id, p]));
  const freshEdge = step.edges.find((e) => e.fresh);
  const doneSet = new Set(step.doneIds);
  const candidatePlaced = step.candidate
    ? byId.get(pairId(step.candidate.key, step.candidate.grade))
    : undefined;

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/30">
            <span className="text-2xl">📐</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивный Treap</h3>
            <p className="text-sm text-emerald-300">
              Точки постоянны: x = ключ, y = приоритет. Соединяем по правилам
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPlaying(false);
              setIdx(0);
            }}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Сброс
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
              playing ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {playing ? "⏸️ Пауза" : "▶️ Пуск"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              if (idx < steps.length - 1) setIdx(idx + 1);
            }}
            disabled={idx >= steps.length - 1}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Шаг ⏭️
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Координатная плоскость */}
        <div className="w-full lg:w-2/3 bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/40 relative flex flex-col items-center justify-center min-h-[420px]">
          <div className="absolute top-3 left-3 bg-emerald-900/80 text-xs px-3 py-1 rounded-full text-emerald-200 border border-emerald-500 font-bold shadow-sm">
            Шаг {idx + 1} из {steps.length}
          </div>
          {step.candidate && (
            <div className="absolute top-3 right-3 bg-indigo-900/90 text-xs px-3 py-1.5 rounded-full text-white border border-indigo-400 font-bold shadow">
              Соединяем точку ({step.candidate.key}, {step.candidate.grade})
            </div>
          )}

          <svg
            className="w-full h-auto max-h-[460px] mt-6"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="treap-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1e293b" strokeWidth="1" />
              </pattern>
              <marker
                id="treap-arrow-fresh"
                markerWidth="7"
                markerHeight="7"
                refX="20"
                refY="3.5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L7,3.5 L0,7 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Клетчатая бумага */}
            <rect x="40" y="24" width={VIEW_W - 60} height={VIEW_H - 50} fill="url(#treap-grid)" opacity="0.55" />

            {/* Оси и шкалы */}
            <line x1="40" y1={Y(0)} x2={VIEW_W - 20} y2={Y(0)} stroke="#475569" strokeWidth="1.5" />
            <line x1={X(1) - 10} y1="24" x2={X(1) - 10} y2={VIEW_H - 26} stroke="#475569" strokeWidth="1.5" />
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map((k) => (
              <g key={`xl-${k}`}>
                <line x1={X(k)} y1={Y(0) - 4} x2={X(k)} y2={Y(0) + 4} stroke="#64748b" strokeWidth="1.5" />
                <text x={X(k)} y={Y(0) + 18} fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="monospace">
                  {k}
                </text>
              </g>
            ))}
            {[-4, -2, 0, 2, 4, 6, 8].map((g) => (
              <g key={`yl-${g}`}>
                <line x1={X(1) - 14} y1={Y(g)} x2={X(1) - 6} y2={Y(g)} stroke="#64748b" strokeWidth="1.5" />
                <text x={X(1) - 20} y={Y(g) + 4} fill="#64748b" fontSize="11" textAnchor="end" fontFamily="monospace">
                  {g}
                </text>
              </g>
            ))}
            <text x={VIEW_W - 24} y={Y(0) - 10} fill="#94a3b8" fontSize="12" textAnchor="end" fontFamily="monospace">
              x (ключ) →
            </text>
            <text x={X(1) - 34} y="20" fill="#94a3b8" fontSize="12" fontFamily="monospace">
              y (приоритет)
            </text>

            {/* Линии (рёбра) — концы ищутся строго по id пары */}
            {step.edges.map((e) => {
              const a = byId.get(e.from);
              const b = byId.get(e.to);
              if (!a || !b) return null;
              const onPath = step.pathIds.includes(e.from) && step.pathIds.includes(e.to);
              const isFresh = freshEdge && freshEdge.to === e.to;
              return (
                <line
                  key={`e-${e.from}-${e.to}`}
                  x1={a.px}
                  y1={a.py}
                  x2={b.px}
                  y2={b.py}
                  stroke={isFresh ? "#10b981" : onPath ? "#f59e0b" : "#64748b"}
                  strokeWidth={isFresh ? 4 : onPath ? 3 : 2}
                  strokeDasharray={onPath && !isFresh ? "5,4" : "none"}
                  markerEnd={isFresh ? "url(#treap-arrow-fresh)" : undefined}
                  className="transition-all duration-500"
                />
              );
            })}

            {/* Точки — неподвижны в своих координатах */}
            {step.points.map((p) => {
              const onPath = step.pathIds.includes(p.id);
              const isCandidateHere = step.justPlacedId === p.id;
              const isDone = doneSet.has(p.id);
              return (
                <g key={`pt-${p.id}`} className="transition-all duration-500">
                  <circle
                    cx={p.px}
                    cy={p.py}
                    r={isCandidateHere ? 13 : 11}
                    fill={isCandidateHere ? "#059669" : onPath ? "#78350f" : "#0f172a"}
                    stroke={isCandidateHere ? "#34d399" : onPath ? "#f59e0b" : isDone ? "#38bdf8" : "#94a3b8"}
                    strokeWidth={isCandidateHere ? 3.5 : 2}
                    className="transition-all duration-300"
                  />
                  <text
                    x={p.px}
                    y={p.py + 4}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {p.key}
                  </text>
                </g>
              );
            })}

            {/* Кандидат: бледное пунктирное кольцо на СВОЕЙ координате */}
            {step.candidate && !candidatePlaced && (
              <g className="transition-all duration-500">
                <circle
                  cx={X(step.candidate.key)}
                  cy={Y(step.candidate.grade)}
                  r={13}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  strokeDasharray="4,3"
                />
                <text
                  x={X(step.candidate.key)}
                  y={Y(step.candidate.grade) + 4}
                  fill="#c7d2fe"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {step.candidate.key}
                </text>
              </g>
            )}
          </svg>

          <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-emerald-500/30 mt-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Статус симуляции:</p>
            <p className="min-h-[40px] flex items-center">{step.log}</p>
          </div>
        </div>

        {/* Порядок соединения */}
        <div className="w-full lg:w-1/3 bg-emerald-950/10 rounded-xl p-4 border border-emerald-500/40 flex flex-col items-stretch">
          <h4 className="text-lg font-bold text-emerald-300 mb-1 flex items-center gap-2">📋 Порядок соединения</h4>
          <p className="text-xs text-slate-400 mb-3">Точки берутся по убыванию y — «кто выше, тот раньше».</p>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {CONNECTION_ORDER.map((h) => {
              const hid = pairId(h.key, h.grade);
              const isCurrent = step.candidate?.key === h.key && step.candidate?.grade === h.grade && step.justPlacedId !== hid;
              const isDone = doneSet.has(hid);
              return (
                <div
                  key={`q-${hid}`}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between font-mono text-sm ${
                    isCurrent
                      ? "bg-indigo-900/70 border-indigo-400 text-white shadow-md"
                      : isDone
                        ? "bg-emerald-950/30 border-emerald-700/50 text-slate-300"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400"
                  }`}
                >
                  <span className="font-bold">
                    ({h.key}, {h.grade})
                  </span>
                  <span>{isDone ? "✅ соединена" : isCurrent ? "⬅️ сейчас" : "⏳"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Соединения */}
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40">
          <h4 className="text-lg font-bold text-rose-300 mb-3">🔗 Кто с кем соединён</h4>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rose-900 text-slate-400 text-xs uppercase">
                <th className="py-2 px-3">Точка (x, y)</th>
                <th className="py-2 px-3">Соединена с</th>
                <th className="py-2 px-3">Сторона</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {CONNECTION_ORDER.map((h) => {
                const hid = pairId(h.key, h.grade);
                const placed = byId.get(hid);
                const isCur = step.justPlacedId === hid;
                const parent = placed && placed.parentId ? byId.get(placed.parentId) : undefined;
                return (
                  <tr
                    key={`c-${hid}`}
                    className={`border-b border-slate-800/50 transition-colors ${
                      isCur ? "bg-emerald-950/50 font-semibold" : placed ? "bg-slate-900/20" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-white">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${placed ? "bg-emerald-500" : "bg-slate-600"}`}
                      />
                      ({h.key}, {h.grade})
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {placed ? (parent ? `(${parent.key}, ${parent.grade})` : "— корень") : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {placed && parent ? (placed.side === "L" ? "← левая" : "правая →") : placed ? "—" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Код */}
        <div className="w-full lg:w-1/2 bg-slate-900/60 rounded-xl p-4 border border-slate-600/50">
          <h4 className="text-lg font-bold text-slate-200 mb-3">📄 Выполнение кода алгоритма</h4>
          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs overflow-x-auto min-h-[240px]">
            {CODE_LINES.map((item) => {
              const isActive = step.codeLine === item.line;
              return (
                <div
                  key={item.line}
                  className={`py-1.5 px-3 rounded flex items-center gap-4 transition-colors ${
                    isActive ? "bg-indigo-900/80 text-amber-300 font-bold border-l-4 border-amber-400" : "text-slate-400"
                  }`}
                >
                  <span className="text-slate-600 select-none w-6 text-right cursor-default">{item.line}</span>
                  <span className="whitespace-pre flex-1">{item.text}</span>
                  {isActive && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold uppercase">
                      Активно
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
