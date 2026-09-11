import { useEffect, useMemo, useState } from "react";

/**
 * Интерактивное построение декартова дерева по стандарту DijkstraViz:
 * сценарий-легенда (корпорация), пошаговая симуляция с логом,
 * четыре панели (Дерево ⟷ Очередь найма ⟷ Штат ⟷ Код), плеер.
 *
 * Канонический набор страницы: 3 5 · 3 6 · 1 -4 · 7 2 · 6 5 · 2 4 · 9 3 · 45 8.
 * Грейд (приоритет, Y) решает, КТО наверху; табельный № (ключ, X) — ГДЕ стоять.
 */

interface Pair {
  key: number;
  grade: number;
}
interface TNode {
  key: number;
  grade: number;
  left: TNode | null;
  right: TNode | null;
  parentKey: number | null;
  side: "L" | "R" | null;
}
interface Placed {
  key: number;
  grade: number;
  x: number;
  y: number;
  parentKey: number | null;
}
interface PathHit {
  atKey: number;
  cmp: string;
  dir: "L" | "R";
}
interface Step {
  tree: Placed[];
  edges: { from: number; to: number; fresh: boolean }[];
  candidate: Pair | null;
  candidateAt: { x: number; y: number } | null;
  pathKeys: number[];
  justPlacedKey: number | null;
  doneKeys: number[];
  log: string;
  codeLine: number;
}

const HIRES: Pair[] = [
  { key: 45, grade: 8 },
  { key: 3, grade: 6 },
  { key: 3, grade: 5 },
  { key: 6, grade: 5 },
  { key: 2, grade: 4 },
  { key: 9, grade: 3 },
  { key: 7, grade: 2 },
  { key: 1, grade: -4 },
];

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

/** Позиции: X — слот in-order (порядок BST), Y — глубина (уровень иерархии). */
function layout(root: TNode | null): { placed: Placed[]; edges: { from: number; to: number }[] } {
  const placed: Placed[] = [];
  const edges: { from: number; to: number }[] = [];
  let slot = 0;
  const walk = (n: TNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    placed.push({ key: n.key, grade: n.grade, x: 70 + slot * 92, y: 46 + depth * 84, parentKey: n.parentKey });
    if (n.parentKey !== null) edges.push({ from: n.parentKey, to: n.key });
    slot += 1;
    walk(n.right, depth + 1);
  };
  walk(root, 0);
  return { placed, edges };
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  let root: TNode | null = null;
  const doneKeys: number[] = [];

  const snap = (
    log: string,
    codeLine: number,
    extra: Partial<Step> = {},
  ) => {
    const { placed, edges } = layout(root);
    steps.push({
      tree: placed,
      edges: edges.map((e) => ({ ...e, fresh: false })),
      candidate: null,
      candidateAt: null,
      pathKeys: [],
      justPlacedKey: null,
      doneKeys: [...doneKeys],
      log,
      codeLine,
      ...extra,
    });
  };

  snap("🏢 Корпорация пуста. Приказ о найме: всех выстроили по грейду — от 8 до −4.", 1);

  for (const hire of HIRES) {
    const label = `№${hire.key} (грейд ${hire.grade})`;
    let cur = root;
    let parent: TNode | null = null;
    let side: "L" | "R" | null = null;
    const pathHits: PathHit[] = [];
    const pathKeys: number[] = [];

    // кандидат «идёт» слева от входа, пока не начало спуска
    const candidateFloat = { x: 70, y: 40 };
    steps.push({
      ...snapToLists(),
      candidate: hire,
      candidateAt: candidateFloat,
      log: `👔 Вызывают кандидата ${label}. Вход в иерархию — через CEO.`,
      codeLine: 2,
    });

    while (cur) {
      const atNode = cur;
      const dir: "L" | "R" = hire.key <= atNode.key ? "L" : "R";
      const cmp = `${hire.key} ${dir === "L" ? "≤" : ">"} ${atNode.key}`;
      pathHits.push({ atKey: atNode.key, cmp, dir });
      pathKeys.push(atNode.key);
      const { placed, edges } = layout(root);
      const at = placed.find((p) => p.key === atNode.key)!;
      steps.push({
        tree: placed,
        edges: edges.map((e) => ({ ...e, fresh: false })),
        candidate: hire,
        candidateAt: { x: at.x, y: at.y - 58 },
        pathKeys: [...pathKeys],
        justPlacedKey: null,
        doneKeys: [...doneKeys],
        log: `🤝 ${label} vs №${atNode.key}: ${hire.key} ${dir === "L" ? "≤" : ">"} ${atNode.key} — ${dir === "L" ? "налево" : "направо"}.`,
        codeLine: 6,
      });
      parent = atNode;
      side = dir;
      cur = dir === "L" ? atNode.left : atNode.right;
    }

    const node: TNode = { key: hire.key, grade: hire.grade, left: null, right: null, parentKey: parent ? parent.key : null, side };
    if (!root) root = node;
    else if (side === "L") parent!.left = node;
    else parent!.right = node;
    doneKeys.push(hire.key);

    const { placed, edges } = layout(root);
    const at = placed.find((p) => p.key === hire.key)!;
    steps.push({
      tree: placed,
      edges: edges.map((e) => ({ ...e, fresh: e.to === hire.key })),
      candidate: hire,
      candidateAt: { x: at.x, y: at.y },
      pathKeys: [...pathKeys],
      justPlacedKey: hire.key,
      doneKeys: [...doneKeys],
      log: parent
        ? `💼 Пустое кресло! ${label} садится под №${parent.key} (${side === "L" ? "левый" : "правый"}).`
        : `💼 ${label} становится CEO — в компании ещё никого не было.`,
      codeLine: 7,
    });
  }

  snap("🏁 Штат укомплектован: BST по табельным №, куча по грейдам. И другим алгоритмом получилось бы то же самое дерево.", 8);

  function snapToLists(): Step {
    const { placed, edges } = layout(root);
    return {
      tree: placed,
      edges: edges.map((e) => ({ ...e, fresh: false })),
      candidate: null,
      candidateAt: null,
      pathKeys: [],
      justPlacedKey: null,
      doneKeys: [...doneKeys],
      log: "",
      codeLine: 3,
    };
  }

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
  const posByKey = new Map(step.tree.map((p) => [p.key, p]));
  const freshEdge = step.edges.find((e) => e.fresh);
  const doneSet = new Set(step.doneKeys);

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      {/* Шапка */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/30">
            <span className="text-2xl">🏢</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивный Treap</h3>
            <p className="text-sm text-emerald-300">Дашборд: Дерево ⟷ Очередь найма ⟷ Штат ⟷ Код</p>
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
        {/* Дерево */}
        <div className="w-full lg:w-2/3 bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/40 relative flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-3 left-3 bg-emerald-900/80 text-xs px-3 py-1 rounded-full text-emerald-200 border border-emerald-500 font-bold shadow-sm">
            Шаг {idx + 1} из {steps.length}
          </div>
          {step.candidate && (
            <div className="absolute top-3 right-3 bg-indigo-900/90 text-xs px-3 py-1.5 rounded-full text-white border border-indigo-400 font-bold shadow">
              Кандидат: №{step.candidate.key} · гр. {step.candidate.grade}
            </div>
          )}

          <svg className="w-full h-auto max-h-[440px] mt-6" viewBox="0 0 760 420" preserveAspectRatio="xMidYMid meet">
            {step.edges.map((e) => {
              const a = posByKey.get(e.from);
              const b = posByKey.get(e.to);
              if (!a || !b) return null;
              const onPath = step.pathKeys.includes(e.from) && step.pathKeys.includes(e.to);
              const isFresh = freshEdge && freshEdge.to === e.to;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isFresh ? "#10b981" : onPath ? "#f59e0b" : "#475569"}
                  strokeWidth={isFresh ? 4 : onPath ? 3 : 2}
                  strokeDasharray={onPath && !isFresh ? "5,4" : "none"}
                  className="transition-all duration-500"
                />
              );
            })}

            {step.tree.map((n) => {
              const onPath = step.pathKeys.includes(n.key);
              const isCandidateHere = step.justPlacedKey === n.key;
              const isDone = doneSet.has(n.key);
              return (
                <g
                  key={`n-${n.key}-${n.grade}`}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="transition-transform duration-500"
                >
                  <circle
                    r={isCandidateHere ? 24 : 20}
                    fill={isCandidateHere ? "#059669" : onPath ? "#78350f" : isDone ? "#1e3a5f" : "#334155"}
                    stroke={isCandidateHere ? "#34d399" : onPath ? "#f59e0b" : isDone ? "#38bdf8" : "#64748b"}
                    strokeWidth={isCandidateHere ? 4 : 2}
                    className="transition-all duration-300"
                  />
                  <text y={-2} fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    {n.key}
                  </text>
                  <text y={13} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                    гр.{n.grade}
                  </text>
                </g>
              );
            })}

            {/* Кандидат «парит» над узлом, с которым сравнивается */}
            {step.candidate && step.candidateAt && !step.justPlacedKey && (
              <g transform={`translate(${step.candidateAt.x}, ${step.candidateAt.y})`} className="transition-transform duration-500">
                <circle r={17} fill="#4f46e5" stroke="#a5b4fc" strokeWidth={3} strokeDasharray="4,3" />
                <text y={-2} fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {step.candidate.key}
                </text>
                <text y={10} fill="#c7d2fe" fontSize="9" textAnchor="middle">
                  гр.{step.candidate.grade}
                </text>
              </g>
            )}
          </svg>

          <div className="w-full bg-slate-950/80 p-4 rounded-lg border border-emerald-500/30 mt-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-400 mb-1">Статус симуляции:</p>
            <p className="min-h-[40px] flex items-center">{step.log}</p>
          </div>
        </div>

        {/* Очередь найма */}
        <div className="w-full lg:w-1/3 bg-emerald-950/10 rounded-xl p-4 border border-emerald-500/40 flex flex-col items-stretch">
          <h4 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">📋 Очередь найма (по грейду ↓)</h4>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {HIRES.map((h) => {
              const isCurrent = step.candidate?.key === h.key && !step.justPlacedKey;
              const isDone = doneSet.has(h.key);
              return (
                <div
                  key={`${h.key}-${h.grade}`}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isCurrent
                      ? "bg-indigo-900/70 border-indigo-400 text-white shadow-md"
                      : isDone
                        ? "bg-emerald-950/30 border-emerald-700/50 text-slate-300"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400"
                  }`}
                >
                  <span className="font-mono text-sm font-bold">
                    №{h.key}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${isCurrent ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                    гр. {h.grade}
                  </span>
                  <span>{isDone ? "✅" : isCurrent ? "⬅️ сейчас" : "⏳"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Штатное расписание */}
        <div className="w-full lg:w-1/2 bg-rose-950/10 rounded-xl p-4 border border-rose-500/40">
          <h4 className="text-lg font-bold text-rose-300 mb-3">🧾 Штатное расписание (кто где)</h4>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rose-900 text-slate-400 text-xs uppercase">
                <th className="py-2 px-3">Сотрудник</th>
                <th className="py-2 px-3">Таб. № (X)</th>
                <th className="py-2 px-3">Грейд (Y)</th>
                <th className="py-2 px-3">Босс</th>
                <th className="py-2 px-3">Сторона</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {HIRES.map((h) => {
                const isCur = (step.candidate?.key === h.key && step.justPlacedKey === h.key) || step.justPlacedKey === h.key;
                const placed = step.tree.find((p) => p.key === h.key);
                return (
                  <tr key={`${h.key}-${h.grade}`} className={`border-b border-slate-800/50 transition-colors ${isCur ? "bg-emerald-950/50 font-semibold" : doneSet.has(h.key) ? "bg-slate-900/20" : ""}`}>
                    <td className="py-2.5 px-3 text-white">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${placed ? "bg-emerald-500" : "bg-slate-600"}`} />
                      №{h.key}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-indigo-300">{h.key}</td>
                    <td className="py-2.5 px-3 font-mono text-rose-300">{h.grade}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{placed && placed.parentKey !== null ? `№${placed.parentKey}` : "—"}</td>
                    <td className="py-2.5 px-3 text-slate-400">{placed && placed.parentKey !== null ? (placed.x < (posByKey.get(placed.parentKey)?.x ?? placed.x) ? "← левый" : "правый →") : placed ? "— (CEO)" : "—"}</td>
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
                  {isActive && <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold uppercase">Активно</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
