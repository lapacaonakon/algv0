import React from "react";
import { C, Edge, Node, Svg, useLoop } from "./demoKit";

export const HeapDemo: React.FC = () => {
  const states = [[4, 8, 9, 12, 2], [4, 2, 9, 12, 8], [2, 4, 9, 12, 8]];
  const step = useLoop(states.length, 1000);
  const heap = states[step];
  const pos: [number, number][] = [[130, 24], [80, 68], [186, 68], [50, 110], [112, 110]];
  const moving = step === 0 ? 4 : step === 1 ? 1 : 0;
  return (
    <Svg caption="Новый элемент всплывает наверх, пока меньше родителя (sift-up)">
      <Edge a={pos[0]} b={pos[1]} /><Edge a={pos[0]} b={pos[2]} />
      <Edge a={pos[1]} b={pos[3]} /><Edge a={pos[1]} b={pos[4]} />
      {heap.map((v, i) => (
        <Node key={i} x={pos[i][0]} y={pos[i][1]} label={v} fill={i === moving ? C.active : i === 0 ? C.done : C.idle} />
      ))}
    </Svg>
  );
};

export const StackDemo: React.FC = () => {
  const states = [["A"], ["A", "B"], ["A", "B", "C"], ["A", "B"], ["A"]];
  const step = useLoop(states.length, 800);
  const items = states[step];
  const popping = step >= 3;
  return (
    <Svg caption={popping ? "pop: забираем ВЕРХНЮЮ тарелку" : "push: кладём сверху"}>
      <rect x={90} y={22} width={80} height={96} rx={6} fill="none" stroke={C.idleStroke} strokeDasharray="4 3" />
      {items.map((v, i) => (
        <g key={v} style={{ transition: "all .3s" }}>
          <rect x={94} y={100 - i * 26} width={72} height={22} rx={5}
            fill={i === items.length - 1 ? (popping ? C.bad : C.active) : C.idle} />
          <text x={130} y={111 - i * 26} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">{v}</text>
        </g>
      ))}
      <text x={130} y={16} textAnchor="middle" fontSize={9} fill={C.dim}>верх (LIFO)</text>
    </Svg>
  );
};

export const QueueDemo: React.FC = () => {
  const states = [["A", "B"], ["A", "B", "C"], ["B", "C"], ["C"], ["C", "D"]];
  const step = useLoop(states.length, 800);
  const items = states[step];
  return (
    <Svg caption="pop_front слева, push_back справа — кто первым встал, тот первым и вышел">
      <defs>
        <marker id="mdArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.done} />
        </marker>
      </defs>
      <text x={12} y={44} fontSize={9} fill={C.dim}>выход</text>
      <text x={206} y={44} fontSize={9} fill={C.dim}>вход</text>
      {items.map((v, i) => (
        <g key={v} style={{ transition: "all .3s" }}>
          <rect x={30 + i * 54} y={56} width={46} height={30} rx={6} fill={i === 0 ? C.done : C.idle} />
          <text x={53 + i * 54} y={71} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="700" fill="#fff">{v}</text>
        </g>
      ))}
      <line x1={24} y1={71} x2={10} y2={71} stroke={C.done} strokeWidth={2} markerEnd="url(#mdArrow)" />
    </Svg>
  );
};

export const DsuDemo: React.FC = () => {
  const parents = [[0, 1, 2, 3], [0, 0, 2, 3], [0, 0, 2, 2], [0, 0, 0, 2]];
  const step = useLoop(parents.length, 950);
  const p = parents[step];
  const pos: [number, number][] = [[50, 95], [105, 95], [160, 95], [215, 95]];
  const rootColor = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e"];
  const root = (i: number): number => (p[i] === i ? i : root(p[i]));
  return (
    <Svg caption="find = «кто твой староста», union = один староста подчиняется другому">
      {p.map((par, i) =>
        par !== i ? (
          <path key={i} d={`M ${pos[i][0]} ${pos[i][1] - 14} Q ${(pos[i][0] + pos[par][0]) / 2} 34 ${pos[par][0]} ${pos[par][1] - 14}`}
            fill="none" stroke={rootColor[root(i)]} strokeWidth={2} />
        ) : null
      )}
      {pos.map(([x, y], i) => (<Node key={i} x={x} y={y} label={i} fill={rootColor[root(i)]} />))}
    </Svg>
  );
};

const TRIE_NODES = [
  { id: 0, x: 130, y: 22, ch: "•", parent: null as number | null },
  { id: 1, x: 72, y: 62, ch: "a", parent: 0 },
  { id: 2, x: 188, y: 62, ch: "b", parent: 0 },
  { id: 3, x: 42, y: 104, ch: "b", parent: 1 },
  { id: 4, x: 102, y: 104, ch: "c", parent: 1 },
  { id: 5, x: 188, y: 104, ch: "c", parent: 2 },
];

export const TrieDemo: React.FC = () => {
  const step = useLoop(TRIE_NODES.length + 1, 700);
  return (
    <Svg caption="Путь от корня по буквам = слово; общие приставки делят один путь">
      {TRIE_NODES.filter((n) => n.parent !== null).map((n) => {
        const p = TRIE_NODES[n.parent as number];
        return <Edge key={n.id} a={[p.x, p.y]} b={[n.x, n.y]} color={n.id < step ? C.active : C.edge} />;
      })}
      {TRIE_NODES.map((n) => (<Node key={n.id} x={n.x} y={n.y} label={n.ch} fill={n.id < step ? C.active : C.idle} r={12} />))}
    </Svg>
  );
};

export const TrieBfsDemo: React.FC = () => {
  const levels = [[0], [1, 2], [3, 4, 5]];
  const step = useLoop(levels.length + 1, 950);
  const doneIds = new Set(levels.slice(0, step).flat());
  const wave = step > 0 && step <= levels.length ? levels[step - 1] : [];
  return (
    <Svg caption={`BFS по бору: уровень ${Math.max(0, Math.min(step, levels.length) - 1)} — ссылки родителей уже готовы`}>
      {TRIE_NODES.filter((n) => n.parent !== null).map((n) => {
        const p = TRIE_NODES[n.parent as number];
        return <Edge key={n.id} a={[p.x, p.y]} b={[n.x, n.y]} color={doneIds.has(n.id) ? C.done : C.edge} />;
      })}
      {TRIE_NODES.map((n) => (
        <Node key={n.id} x={n.x} y={n.y} label={n.ch}
          fill={wave.includes(n.id) ? C.active : doneIds.has(n.id) ? C.done : C.idle} r={12} />
      ))}
      <text x={6} y={12} fontSize={9} fill={C.dim}>очередь →</text>
    </Svg>
  );
};

export const SuffixLinkDemo: React.FC = () => {
  const links: [number, number][] = [[1, 0], [2, 0], [3, 2], [4, 5]];
  const step = useLoop(links.length + 1, 900);
  return (
    <Svg caption="Суффиксная ссылка: «куда откатиться, если буква не подошла»">
      {TRIE_NODES.filter((n) => n.parent !== null).map((n) => {
        const p = TRIE_NODES[n.parent as number];
        return <Edge key={n.id} a={[p.x, p.y]} b={[n.x, n.y]} />;
      })}
      {links.slice(0, step).map(([from, to], i) => {
        const a = TRIE_NODES[from];
        const b = TRIE_NODES[to];
        return (
          <path key={i} d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${a.y + 26} ${b.x} ${b.y}`}
            fill="none" stroke={C.warn} strokeWidth={1.8} strokeDasharray="4 3" />
        );
      })}
      {TRIE_NODES.map((n) => (
        <Node key={n.id} x={n.x} y={n.y} label={n.ch} fill={step > 0 && links[step - 1]?.[0] === n.id ? C.warn : C.idle} r={12} />
      ))}
    </Svg>
  );
};

export const SegmentTreeDemo: React.FC = () => {
  const step = useLoop(3, 1000);
  const nodes = [
    { x: 130, y: 24, w: 226, label: "[0..7]", lvl: 0 },
    { x: 72, y: 60, w: 110, label: "[0..3]", lvl: 1 },
    { x: 188, y: 60, w: 110, label: "[4..7]", lvl: 1 },
    { x: 44, y: 96, w: 52, label: "[0..1]", lvl: 2 },
    { x: 100, y: 96, w: 52, label: "[2..3]", lvl: 2 },
    { x: 160, y: 96, w: 52, label: "[4..5]", lvl: 2 },
    { x: 216, y: 96, w: 52, label: "[6..7]", lvl: 2 },
  ];
  return (
    <Svg caption="Запрос собирается из O(log n) готовых узлов-матрёшек">
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - n.w / 2} y={n.y - 10} width={n.w} height={20} rx={5}
            fill={n.lvl === step ? C.active : C.idle} stroke={C.idleStroke} style={{ transition: "fill .3s" }} />
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="700" fill="#fff">{n.label}</text>
        </g>
      ))}
    </Svg>
  );
};

export const PrefixSumDemo: React.FC = () => {
  const a = [3, 1, 4, 1, 5, 9];
  const pref = a.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], [0]);
  const step = useLoop(4, 1200);
  const l = 1, r = 3;
  const show = step >= 1;
  return (
    <Svg caption={show ? `a[${l}..${r}] = P[${r + 1}] − P[${l}] = ${pref[r + 1]} − ${pref[l]} = ${pref[r + 1] - pref[l]}` : "массив a и его префиксные суммы P"}>
      <text x={4} y={18} fontSize={8} fill={C.dim}>a</text>
      {a.map((v, i) => (
        <g key={i}>
          <rect x={20 + i * 39} y={24} width={34} height={24} rx={5}
            fill={show && i >= l && i <= r ? C.active : C.idle} style={{ transition: "fill .3s" }} />
          <text x={37 + i * 39} y={36} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700" fill="#fff">{v}</text>
        </g>
      ))}
      <text x={4} y={72} fontSize={8} fill={C.dim}>P</text>
      {pref.map((v, i) => (
        <g key={i}>
          <rect x={20 + i * 33} y={78} width={29} height={24} rx={5}
            fill={show && i === l ? C.bad : show && i === r + 1 ? C.done : "#1e293b"}
            stroke={C.idleStroke} style={{ transition: "fill .3s" }} />
          <text x={34 + i * 33} y={90} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="700" fill="#fff">{v}</text>
        </g>
      ))}
    </Svg>
  );
};

export const SparseTableDemo: React.FC = () => {
  const step = useLoop(3, 1000);
  const len = [1, 2, 4][step];
  const count = 8 - len + 1;
  return (
    <Svg caption={`Уровень j=${step}: готовые ответы для всех отрезков длины ${len}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={12 + i * 30} y={18} width={26} height={22} rx={4} fill={C.idle} />
          <text x={25 + i * 30} y={29} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#fff">{i}</text>
        </g>
      ))}
      {Array.from({ length: count }).map((_, i) => (
        <rect key={i} x={12 + i * 30} y={52 + (i % 4) * 19} width={26 + (len - 1) * 30} height={14} rx={4}
          fill={C.active} opacity={i === 0 ? 1 : 0.4} style={{ transition: "all .3s" }} />
      ))}
    </Svg>
  );
};

export const AmortizedDemo: React.FC = () => {
  const costs = [1, 1, 1, 8, 1, 1, 1, 1];
  const step = useLoop(costs.length + 1, 550);
  const total = costs.slice(0, step).reduce((a, b) => a + b, 0);
  const avg = step ? (total / step).toFixed(2) : "—";
  return (
    <Svg caption={`Сделано ${step} операций, суммарно ${total} → средняя цена ${avg}`}>
      {costs.map((c, i) => (
        <rect key={i} x={14 + i * 30} y={104 - c * 10} width={22} height={c * 10} rx={3}
          fill={i < step ? (c > 2 ? C.bad : C.done) : C.idle} style={{ transition: "fill .2s" }} />
      ))}
      <line x1={8} y1={106} x2={252} y2={106} stroke={C.idleStroke} />
      <text x={130} y={20} textAnchor="middle" fontSize={8} fill={C.dim}>одна дорогая операция «оплачена» пачкой дешёвых</text>
    </Svg>
  );
};

export const NpDemo: React.FC = () => {
  const step = useLoop(2, 1400);
  return (
    <Svg caption={step === 0 ? "Найти решение — долго (перебор)" : "Проверить готовое решение — быстро"}>
      <ellipse cx={130} cy={64} rx={112} ry={48} fill="#1e293b" stroke={C.idleStroke} />
      <ellipse cx={92} cy={64} rx={52} ry={32} fill="#312e81" stroke={C.active} />
      <text x={92} y={64} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700" fill="#c7d2fe">P</text>
      <text x={206} y={34} textAnchor="middle" fontSize={13} fontWeight="700" fill={C.dim}>NP</text>
      <circle cx={196} cy={84} r={13} fill={step === 1 ? C.done : C.bad} style={{ transition: "fill .4s" }} />
      <text x={196} y={84} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700" fill="#fff">{step === 1 ? "✓" : "?"}</text>
      <text x={130} y={124} textAnchor="middle" fontSize={8} fill={C.dim}>NP-полные — самые трудные в NP</text>
    </Svg>
  );
};

export const PrefixFunctionDemo: React.FC = () => {
  const s = "abacaba";
  const pi = [0, 0, 1, 0, 1, 2, 3];
  const step = useLoop(s.length + 1, 700);
  const i = Math.max(0, step - 1);
  const len = step > 0 ? pi[i] : 0;
  return (
    <Svg caption={step > 0 ? `π[${i}] = ${len}: префикс длины ${len} совпал с суффиксом` : "Строка abacaba"}>
      {s.split("").map((ch, idx) => (
        <g key={idx}>
          <rect x={18 + idx * 33} y={26} width={28} height={28} rx={5}
            fill={step > 0 && (idx < len || (idx > i - len && idx <= i)) ? C.done : idx === i && step > 0 ? C.active : C.idle}
            style={{ transition: "fill .25s" }} />
          <text x={32 + idx * 33} y={40} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700" fill="#fff">{ch}</text>
          <text x={32 + idx * 33} y={70} textAnchor="middle" fontSize={10} fontWeight="700"
            fill={idx <= i && step > 0 ? C.warn : C.idle}>{idx <= i && step > 0 ? pi[idx] : "·"}</text>
        </g>
      ))}
      <text x={4} y={40} fontSize={8} fill={C.dim}>s</text>
      <text x={4} y={70} fontSize={8} fill={C.dim}>π</text>
      <text x={130} y={106} textAnchor="middle" fontSize={9} fill={C.dim}>
        π[i] — длина самого длинного «префикс = суффикс»
      </text>
    </Svg>
  );
};

export const DpDemo: React.FC = () => {
  const rows = 3, cols = 5;
  const step = useLoop(rows * cols + 1, 320);
  return (
    <Svg caption={`Заполняем таблицу подзадач: готово ${Math.min(step, rows * cols)} из ${rows * cols}`}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const idx = r * cols + c;
          const filled = idx < step;
          return (
            <g key={idx}>
              <rect x={40 + c * 38} y={22 + r * 32} width={34} height={28} rx={5}
                fill={idx === step - 1 ? C.active : filled ? C.done : C.idle} style={{ transition: "fill .2s" }} />
              {filled && (
                <text x={57 + c * 38} y={36 + r * 32} textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight="700" fill="#fff">{(r + 1) * (c + 1)}</text>
              )}
            </g>
          );
        })
      )}
      <text x={130} y={122} textAnchor="middle" fontSize={9} fill={C.dim}>
        каждая клетка считается один раз и переиспользуется
      </text>
    </Svg>
  );
};
