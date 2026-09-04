import React from "react";
import { C, Edge, Node, Svg, useLoop } from "./demoKit";

const GRAPH_POS: Record<string, [number, number]> = {
  A: [32, 65], B: [92, 30], C: [92, 100], D: [152, 65], E: [212, 30], F: [212, 100],
};
const GRAPH_EDGES: [string, string][] = [
  ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["D", "F"], ["E", "F"],
];

export const BfsDemo: React.FC = () => {
  const order = [["A"], ["B", "C"], ["D"], ["E", "F"]];
  const step = useLoop(order.length + 1, 850);
  const visited = new Set(order.slice(0, step).flat());
  const wave = step > 0 && step <= order.length ? order[step - 1] : [];
  return (
    <Svg caption={`Уровень ${Math.max(0, Math.min(step, order.length) - 1)}: волна расходится по слоям`}>
      {GRAPH_EDGES.map(([u, v], i) => (
        <Edge key={i} a={GRAPH_POS[u]} b={GRAPH_POS[v]} color={visited.has(u) && visited.has(v) ? C.done : C.edge} />
      ))}
      {Object.entries(GRAPH_POS).map(([k, [x, y]]) => (
        <Node key={k} x={x} y={y} label={k}
          fill={wave.includes(k) ? C.active : visited.has(k) ? C.done : C.idle}
          stroke={wave.includes(k) ? "#a5b4fc" : undefined} />
      ))}
    </Svg>
  );
};

export const DfsDemo: React.FC = () => {
  const path = ["A", "B", "D", "E", "F", "C"];
  const step = useLoop(path.length + 1, 750);
  const visited = path.slice(0, step);
  const head = visited[visited.length - 1];
  return (
    <Svg caption={head ? `Идём вглубь: ${visited.join(" → ")}` : "Стартуем из A"}>
      {GRAPH_EDGES.map(([u, v], i) => {
        const iu = visited.indexOf(u);
        const iv = visited.indexOf(v);
        const onPath = iu >= 0 && iv >= 0 && Math.abs(iu - iv) === 1;
        return <Edge key={i} a={GRAPH_POS[u]} b={GRAPH_POS[v]} color={onPath ? C.active : C.edge} width={onPath ? 3 : 2} />;
      })}
      {Object.entries(GRAPH_POS).map(([k, [x, y]]) => (
        <Node key={k} x={x} y={y} label={k} fill={k === head ? C.warn : visited.includes(k) ? C.active : C.idle} />
      ))}
    </Svg>
  );
};

export const ToposortDemo: React.FC = () => {
  const nodes = [
    { id: "трусы", x: 52, y: 32 }, { id: "штаны", x: 148, y: 32 },
    { id: "носки", x: 52, y: 98 }, { id: "боты", x: 148, y: 98 },
  ];
  const edges: [string, string][] = [["трусы", "штаны"], ["носки", "боты"], ["штаны", "боты"]];
  const order = ["трусы", "носки", "штаны", "боты"];
  const step = useLoop(order.length + 1, 800);
  const placed = order.slice(0, step);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, [n.x, n.y] as [number, number]]));
  return (
    <Svg caption={`Порядок: ${placed.join(" → ") || "…"}`}>
      {edges.map(([u, v], i) => (
        <Edge key={i} a={pos[u]} b={pos[v]} color={placed.includes(u) && placed.includes(v) ? C.done : C.edge} />
      ))}
      {nodes.map((n) => {
        const idx = placed.indexOf(n.id);
        return (
          <g key={n.id}>
            <rect x={n.x - 34} y={n.y - 12} width={68} height={24} rx={6} fill={idx >= 0 ? C.done : C.idle} style={{ transition: "fill .3s" }} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="700" fill="#fff">{n.id}</text>
            {idx >= 0 && <circle cx={n.x + 30} cy={n.y - 12} r={7} fill={C.active} />}
            {idx >= 0 && (
              <text x={n.x + 30} y={n.y - 12} textAnchor="middle" dominantBaseline="central" fontSize={8} fontWeight="700" fill="#fff">{idx + 1}</text>
            )}
          </g>
        );
      })}
      <text x={224} y={62} textAnchor="middle" fontSize={8} fill={C.dim}>стрелки</text>
      <text x={224} y={74} textAnchor="middle" fontSize={8} fill={C.dim}>только →</text>
    </Svg>
  );
};

export const RelaxDemo: React.FC = () => {
  const step = useLoop(3, 1100);
  const dV = [12, 12, 7][step];
  const improved = step === 2;
  return (
    <Svg caption={improved ? "12 > 3 + 4 → пишем 7. Путь через u короче!" : "Проверяем: d[v] > d[u] + w(u,v)?"}>
      <Edge a={[60, 70]} b={[200, 70]} color={improved ? C.done : C.warn} width={3} />
      <text x={130} y={54} textAnchor="middle" fontSize={11} fontWeight="700" fill={C.warn}>w = 4</text>
      <Node x={60} y={70} r={20} fill={C.active} label="u" />
      <Node x={200} y={70} r={20} fill={improved ? C.done : C.idle} label="v" />
      <text x={60} y={106} textAnchor="middle" fontSize={10} fill={C.text}>d = 3</text>
      <text x={200} y={106} textAnchor="middle" fontSize={10} fontWeight="700" fill={improved ? C.done : C.bad}>d = {dV}</text>
      <text x={130} y={22} textAnchor="middle" fontSize={9} fill={C.dim}>3 + 4 = 7</text>
    </Svg>
  );
};

export const BridgeDemo: React.FC = () => {
  const step = useLoop(2, 1300);
  const pos: Record<string, [number, number]> = {
    A: [40, 40], B: [40, 95], C: [95, 68], D: [170, 68], E: [220, 40], F: [220, 95],
  };
  const edges: [string, string][] = [
    ["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "E"], ["D", "F"], ["E", "F"],
  ];
  const cut = step === 1;
  return (
    <Svg caption={cut ? "Убрали C—D → граф развалился на два куска. Это мост!" : "C—D — единственная дорога между кластерами"}>
      {edges.map(([u, v], i) => {
        const isBridge = u === "C" && v === "D";
        if (isBridge && cut) return null;
        return <Edge key={i} a={pos[u]} b={pos[v]} color={isBridge ? C.bad : C.edge} width={isBridge ? 3.5 : 2} dashed={isBridge} />;
      })}
      {Object.entries(pos).map(([k, [x, y]]) => (
        <Node key={k} x={x} y={y} label={k} fill={cut ? (["A", "B", "C"].includes(k) ? C.active : C.warn) : C.idle} r={12} />
      ))}
    </Svg>
  );
};

export const ArticulationDemo: React.FC = () => {
  const step = useLoop(2, 1300);
  const pos: Record<string, [number, number]> = {
    A: [36, 40], B: [36, 96], C: [130, 68], D: [224, 40], E: [224, 96],
  };
  const edges: [string, string][] = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["C", "E"], ["D", "E"]];
  const cut = step === 1;
  return (
    <Svg caption={cut ? "Убрали вершину C → две отдельные компоненты" : "C — единственный связующий сотрудник"}>
      {edges.map(([u, v], i) => (cut && (u === "C" || v === "C") ? null : <Edge key={i} a={pos[u]} b={pos[v]} />))}
      {Object.entries(pos).map(([k, [x, y]]) =>
        cut && k === "C" ? (
          <circle key={k} cx={x} cy={y} r={12} fill="none" stroke={C.bad} strokeWidth={2} strokeDasharray="3 3" />
        ) : (
          <Node key={k} x={x} y={y} label={k} fill={k === "C" ? C.bad : cut ? (["A", "B"].includes(k) ? C.active : C.warn) : C.idle} r={12} />
        )
      )}
    </Svg>
  );
};

export const MstDemo: React.FC = () => {
  const pos: Record<string, [number, number]> = {
    A: [40, 35], B: [130, 22], C: [220, 45], D: [70, 100], E: [180, 105],
  };
  const edges = [
    { u: "A", v: "B", w: 2 }, { u: "B", v: "C", w: 3 }, { u: "A", v: "D", w: 1 },
    { u: "D", v: "E", w: 4 }, { u: "B", v: "E", w: 6 }, { u: "C", v: "E", w: 5 },
  ];
  const chosen = ["A-D", "A-B", "B-C", "D-E"];
  const step = useLoop(chosen.length + 1, 800);
  const taken = new Set(chosen.slice(0, step));
  return (
    <Svg caption={`Жадно берём самые лёгкие рёбра без циклов (взято ${step} из 4)`}>
      {edges.map((e, i) => {
        const on = taken.has(`${e.u}-${e.v}`);
        return (
          <g key={i}>
            <Edge a={pos[e.u]} b={pos[e.v]} color={on ? C.done : C.edge} width={on ? 3.5 : 1.5} />
            <text x={(pos[e.u][0] + pos[e.v][0]) / 2} y={(pos[e.u][1] + pos[e.v][1]) / 2 - 4}
              textAnchor="middle" fontSize={9} fontWeight="700" fill={on ? C.done : C.dim}>{e.w}</text>
          </g>
        );
      })}
      {Object.entries(pos).map(([k, [x, y]]) => (<Node key={k} x={x} y={y} label={k} fill={C.idle} r={12} />))}
    </Svg>
  );
};

export const SccDemo: React.FC = () => {
  const pos: Record<string, [number, number]> = {
    A: [45, 35], B: [110, 35], C: [77, 95], D: [185, 45], E: [225, 95],
  };
  const edges: [string, string][] = [["A", "B"], ["B", "C"], ["C", "A"], ["B", "D"], ["D", "E"]];
  const step = useLoop(2, 1400);
  const scc = ["A", "B", "C"];
  const inScc = (u: string, v: string) => step === 1 && scc.includes(u) && scc.includes(v);
  return (
    <Svg caption={step === 1 ? "{A,B,C} — цикл: из каждой в каждую и обратно" : "Ищем группы с дорогой «туда и обратно»"}>
      {edges.map(([u, v], i) => (
        <Edge key={i} a={pos[u]} b={pos[v]} color={inScc(u, v) ? C.done : C.edge} width={inScc(u, v) ? 3 : 2} />
      ))}
      {Object.entries(pos).map(([k, [x, y]]) => (
        <Node key={k} x={x} y={y} label={k} fill={step === 1 && scc.includes(k) ? C.done : C.idle} r={12} />
      ))}
    </Svg>
  );
};
