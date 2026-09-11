import { useEffect, useMemo, useState } from "react";

/**
 * Интерактивное построение декартова дерева.
 *
 * Рабочая сцена — ДЕРЕВО (узлы, рёбра, анимация спуска и появления).
 * Клетчатая бумага с точками (x = ключ, y = приоритет) — яркая ассоциация:
 * маленькая статичная карта справа, показывающая ту же структуру в координатах.
 * Панель «Аналогия процесса» меняется вместе с фазой шага:
 * порядок соединения → спуск → проведение линии → финал.
 *
 * Канонический набор страницы — восемь пар, все x и все y различны:
 *   (45,8) (3,6) (6,5) (2,4) (9,3) (7,2) (12,0) (1,-4)
 *
 * Узел идентифицируется ПАРОЙ (id = "x:y"), не ключом.
 */

interface Pair {
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
  parentId: NodeId | null;
  side: "L" | "R" | null;
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
  candidateAt: { x: number; y: number } | null;
  pathIds: NodeId[];
  justPlacedId: NodeId | null;
  doneIds: NodeId[];
  log: string;
  codeLine: number;
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

/** Сцена дерева: x — слот in-order, y — глубина. */
const VIEW_W = 760;
const VIEW_H = 430;
const treeLayout = (root: TNode | null) => {
  const placed: { node: TNode; px: number; py: number }[] = [];
  let slot = 0;
  const walk = (n: TNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    placed.push({ node: n, px: 70 + slot * 92, py: 46 + depth * 84 });
    slot += 1;
    walk(n.right, depth + 1);
  };
  walk(root, 0);
  return placed;
};

const collect = (root: TNode | null) => {
  const points: Placed[] = [];
  const edges: Edge[] = [];
  const pos = new Map<NodeId, { px: number; py: number }>();
  for (const p of treeLayout(root)) pos.set(p.node.id, { px: p.px, py: p.py });
  const walk = (n: TNode | null) => {
    if (!n) return;
    walk(n.left);
    const c = pos.get(n.id)!;
    points.push({ id: n.id, key: n.key, grade: n.grade, px: c.px, py: c.py, parentId: n.parentId, side: n.side });
    if (n.parentId) edges.push({ from: n.parentId, to: n.id });
    walk(n.right);
  };
  walk(root);
  return { points, edges };
};

/** Мини-карта «клетчатая бумага»: точки прибиты, линии те же. */
const MAP_W = 300;
const MAP_H = 210;
const MX = (key: number) => 34 + (key - 1) * ((MAP_W - 50) / 44);
const MY = (grade: number) => 18 + (8 - grade) * ((MAP_H - 40) / 12);

const MiniCoordMap: React.FC<{
  points: Placed[];
  edges: (Edge & { fresh: boolean })[];
  candidate: Pair | null;
  pathIds: NodeId[];
  justPlacedId: NodeId | null;
}> = ({ points, edges, candidate, pathIds, justPlacedId }) => {
  const byId = new Map(points.map((p) => [p.id, p]));
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full">
      <defs>
        <pattern id="treap-mini-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#1e293b" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="28" y="12" width={MAP_W - 40} height={MAP_H - 22} fill="url(#treap-mini-grid)" opacity="0.5" />
      <text x={MAP_W - 8} y={MY(0) - 6} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
        x →
      </text>
      <text x="4" y="14" fill="#64748b" fontSize="9" fontFamily="monospace">
        y ↑
      </text>

      {edges.map((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const onPath = pathIds.includes(e.from) && pathIds.includes(e.to);
        return (
          <line
            key={`m-${e.from}-${e.to}`}
            x1={MX(a.key)}
            y1={MY(a.grade)}
            x2={MX(b.key)}
            y2={MY(b.grade)}
            stroke={e.fresh ? "#10b981" : onPath ? "#f59e0b" : "#64748b"}
            strokeWidth={e.fresh ? 2.5 : 1.5}
            className="transition-all duration-500"
          />
        );
      })}

      {points.map((p) => (
        <circle
          key={`mp-${p.id}`}
          cx={MX(p.key)}
          cy={MY(p.grade)}
          r={justPlacedId === p.id ? 6 : 5}
          fill={justPlacedId === p.id ? "#059669" : pathIds.includes(p.id) ? "#78350f" : "#0f172a"}
          stroke={justPlacedId === p.id ? "#34d399" : pathIds.includes(p.id) ? "#f59e0b" : "#38bdf8"}
          strokeWidth={1.5}
          className="transition-all duration-500"
        />
      ))}

      {candidate && (
        <circle
          cx={MX(candidate.key)}
          cy={MY(candidate.grade)}
          r={6}
          fill="none"
          stroke="#818cf8"
          strokeWidth={2}
          strokeDasharray="3,2"
          className="transition-all duration-500"
        />
      )}
    </svg>
  );
};

/** Аналогия процесса — меняется вместе с фазой шага. */
const analogyFor = (codeLine: number): { emoji: string; title: string; text: string } => {
  if (codeLine <= 2)
    return {
      emoji: "⛰️",
      title: "Порядок: сверху вниз по y",
      text: "Выше точка — раньше соединяем. Линия не может повиснуть в воздухе: каждая новая цепляется за того, кто уже стоит выше. Поэтому начинаем с самой высокой — (45, 8).",
    };
  if (codeLine <= 6)
    return {
      emoji: "🪜",
      title: "Спуск: один вопрос на уровень",
      text: "Точка знает только свой x. На каждом уровне один вопрос: «я левее (≤) или правее (>)?» — и вниз по ответу. Проверяется вся высота пути, а не одна площадка: сравнить себя только с соседом по списку — всё равно что спросить первую встречную ступеньку.",
    };
  if (codeLine === 7)
    return {
      emoji: "💧",
      title: "Линия: всегда вниз по y",
      text: "Ребро проводится от высшей точки к низшей — вверх линии не бывает, как у воды. Так куча держится сама: каждый родитель выше своих детей.",
    };
  return {
    emoji: "🎯",
    title: "Дерево единственно",
    text: "Точки прибиты, правила заданы — любая верная рука проведёт те же линии. Слева-направо по x читается отсортированный порядок, сверху-вниз по y — куча.",
  };
};

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
      candidateAt: null,
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
      const pos = treeLayout(root).find((p) => p.node.id === atNode.id)!;
      steps.push({
        ...snap(
          `⚖️ Точка ${label} против (${atNode.key}, ${atNode.grade}): ${hire.key} ${dir === "L" ? "≤" : ">"} ${atNode.key} — ${dir === "L" ? "левее" : "правее"}.`,
          6,
          { candidate: hire, pathIds: [...pathIds] },
        ),
        candidateAt: { x: pos.px, y: pos.py - 58 },
      });
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

    const placed = collect(root).points.find((p) => p.id === hireId)!;
    steps.push(
      snap(
        parent
          ? `🔗 Ребро проведено: ${label} — ${side === "L" ? "левый" : "правый"} ребёнок (${parent.key}, ${parent.grade}). Линия ушла вниз по y — куча цела.`
          : `🔗 Точка ${label} первая — она корень.`,
        7,
        { candidate: hire, pathIds: [...pathIds], justPlacedId: hireId, candidateAt: { x: placed.px, y: placed.py } },
      ),
    );
  }

  steps.push(
    snap(
      "🏁 Все точки соединены. Другой корректный алгоритм провёл бы те же линии: точки прибиты, дерево одно.",
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
  const analogy = analogyFor(step.codeLine);

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
            <p className="text-sm text-emerald-300">Точки постоянны: x = ключ, y = приоритет. Соединяем по правилам</p>
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
        {/* Дерево — рабочая сцена */}
        <div className="w-full lg:w-2/3 bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/40 relative flex flex-col items-center justify-center min-h-[430px]">
          <div className="absolute top-3 left-3 bg-emerald-900/80 text-xs px-3 py-1 rounded-full text-emerald-200 border border-emerald-500 font-bold shadow-sm">
            Шаг {idx + 1} из {steps.length}
          </div>
          {step.candidate && (
            <div className="absolute top-3 right-3 bg-indigo-900/90 text-xs px-3 py-1.5 rounded-full text-white border border-indigo-400 font-bold shadow">
              Соединяем точку ({step.candidate.key}, {step.candidate.grade})
            </div>
          )}

          <svg
            className="w-full h-auto max-h-[430px] mt-6"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
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
                  stroke={isFresh ? "#10b981" : onPath ? "#f59e0b" : "#475569"}
                  strokeWidth={isFresh ? 4 : onPath ? 3 : 2}
                  strokeDasharray={onPath && !isFresh ? "5,4" : "none"}
                  className="transition-all duration-500"
                />
              );
            })}

            {step.points.map((p) => {
              const onPath = step.pathIds.includes(p.id);
              const isCandidateHere = step.justPlacedId === p.id;
              const isDone = doneSet.has(p.id);
              return (
                <g key={`pt-${p.id}`} transform={`translate(${p.px}, ${p.py})`} className="transition-transform duration-500">
                  <circle
                    r={isCandidateHere ? 24 : 20}
                    fill={isCandidateHere ? "#059669" : onPath ? "#78350f" : "#0f172a"}
                    stroke={isCandidateHere ? "#34d399" : onPath ? "#f59e0b" : isDone ? "#38bdf8" : "#64748b"}
                    strokeWidth={isCandidateHere ? 4 : 2}
                    className="transition-all duration-300"
                  />
                  <text y={-2} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    {p.key}
                  </text>
                  <text y={13} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                    y={p.grade}
                  </text>
                </g>
              );
            })}

            {/* Кандидат парит над узлом, с которым сравнивается */}
            {step.candidate && step.candidateAt && !step.justPlacedId && (
              <g transform={`translate(${step.candidateAt.x}, ${step.candidateAt.y})`} className="transition-transform duration-500">
                <circle r={17} fill="#4f46e5" stroke="#a5b4fc" strokeWidth={3} strokeDasharray="4,3" />
                <text y={-2} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {step.candidate.key}
                </text>
                <text y={10} fill="#c7d2fe" fontSize="9" textAnchor="middle">
                  y={step.candidate.grade}
                </text>
              </g>
            )}
          </svg>

          <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-emerald-500/30 mt-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Статус симуляции:</p>
            <p className="min-h-[40px] flex items-center">{step.log}</p>
          </div>
        </div>

        {/* Аналогия процесса + клетчатая бумага */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
            <div className="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
              {analogy.emoji} {analogy.title}
            </div>
            <p className="text-slate-300 text-sm">{analogy.text}</p>
            <p className="text-slate-500 text-xs mt-3">Аналогия меняется вместе с шагом</p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 flex-1">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">🗺️ Та же картина в координатах</h4>
            <p className="text-xs text-slate-500 mb-2">Точки прибиты к клетчатой бумаге: соединяем — линии падают вниз по y.</p>
            <MiniCoordMap
              points={step.points}
              edges={step.edges}
              candidate={step.candidate}
              pathIds={step.pathIds}
              justPlacedId={step.justPlacedId}
            />
          </div>
        </div>
      </div>

      {/* Код */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-600/50">
        <h4 className="text-lg font-bold text-slate-200 mb-3">📄 Выполнение кода алгоритма</h4>
        <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-mono text-xs overflow-x-auto">
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
  );
};
