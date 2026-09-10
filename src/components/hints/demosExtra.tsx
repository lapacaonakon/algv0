import React from "react";
import { C, Edge, MOVE, Node, Svg, useLoop } from "./demoKit";

/** Флойд: внешний цикл по «разрешённой» промежуточной вершине k. */
export const FloydDemo: React.FC = () => {
  const step = useLoop(3, 1200);
  // i -> j напрямую 9; через k=1 получаем 3+4=7
  const pos: Record<string, [number, number]> = { i: [40, 95], k: [130, 30], j: [220, 95] };
  const viaOpen = step >= 1;
  const relaxed = step >= 2;
  return (
    <Svg
      caption={
        step === 0
          ? "k ещё запрещена: путь i → j = 9"
          : step === 1
            ? "Разрешаем пересадку через k: 3 + 4 = 7"
            : "7 < 9 → D[i][j] = 7"
      }
    >
      <Edge a={pos.i} b={pos.j} color={relaxed ? C.bad : C.edge} width={relaxed ? 2 : 3} dashed={relaxed} />
      <Edge a={pos.i} b={pos.k} color={viaOpen ? C.done : C.edge} width={viaOpen ? 3 : 2} />
      <Edge a={pos.k} b={pos.j} color={viaOpen ? C.done : C.edge} width={viaOpen ? 3 : 2} />

      <text x={130} y={112} textAnchor="middle" fontSize={11} fontWeight="700" fill={relaxed ? C.bad : C.dim}>
        9
      </text>
      <text x={72} y={54} textAnchor="middle" fontSize={11} fontWeight="700" fill={viaOpen ? C.done : C.dim}>
        3
      </text>
      <text x={188} y={54} textAnchor="middle" fontSize={11} fontWeight="700" fill={viaOpen ? C.done : C.dim}>
        4
      </text>

      <Node x={pos.i[0]} y={pos.i[1]} label="i" fill={C.idle} />
      <Node x={pos.k[0]} y={pos.k[1]} label="k" fill={viaOpen ? C.active : C.idle} stroke={viaOpen ? "#a5b4fc" : undefined} />
      <Node x={pos.j[0]} y={pos.j[1]} label="j" fill={relaxed ? C.done : C.idle} />
    </Svg>
  );
};

/** Компоненты связности: несколько «островов», которые красятся по одному. */
export const ComponentsDemo: React.FC = () => {
  const comps: [string, string][][] = [
    [["A", "B"], ["B", "C"]],
    [["D", "E"]],
    [["F", "G"], ["G", "H"], ["F", "H"]],
  ];
  const pos: Record<string, [number, number]> = {
    A: [26, 40], B: [62, 92], C: [26, 92],
    D: [120, 40], E: [120, 92],
    F: [190, 34], G: [232, 78], H: [178, 96],
  };
  const colors = [C.active, C.warn, C.done];
  const step = useLoop(comps.length + 1, 900);
  const compOf = (v: string) => comps.findIndex((e) => e.some(([a, b]) => a === v || b === v));

  return (
    <Svg caption={step === 0 ? "Граф распался на острова" : `Найдена компонента №${step} из ${comps.length}`}>
      {comps.flatMap((edges, ci) =>
        edges.map(([u, v], i) => (
          <Edge key={`${ci}-${i}`} a={pos[u]} b={pos[v]} color={ci < step ? colors[ci] : C.edge} width={ci < step ? 3 : 2} />
        ))
      )}
      {Object.entries(pos).map(([k, [x, y]]) => {
        const ci = compOf(k);
        return <Node key={k} x={x} y={y} r={12} label={k} fill={ci < step ? colors[ci] : C.idle} />;
      })}
    </Svg>
  );
};

/** Что такое граф: вершины, рёбра, направление и вес. */
export const GraphBasicsDemo: React.FC = () => {
  const step = useLoop(3, 1300);
  const pos: Record<string, [number, number]> = { A: [50, 40], B: [150, 32], C: [110, 100], D: [220, 88] };
  const edges: [string, string, number][] = [["A", "B", 4], ["A", "C", 2], ["B", "D", 7], ["C", "D", 3]];
  return (
    <Svg
      caption={
        step === 0
          ? "Вершины — объекты (города, слова, состояния)"
          : step === 1
            ? "Рёбра — связи между ними"
            : "Вес ребра — цена перехода"
      }
    >
      {edges.map(([u, v, w], i) => {
        const a = pos[u];
        const b = pos[v];
        return (
          <g key={i}>
            <Edge a={a} b={b} color={step >= 1 ? C.active : C.edge} width={step >= 1 ? 2.5 : 2} />
            {step >= 2 && (
              <text
                x={(a[0] + b[0]) / 2}
                y={(a[1] + b[1]) / 2 - 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight="700"
                fill={C.warn}
              >
                {w}
              </text>
            )}
          </g>
        );
      })}
      {Object.entries(pos).map(([k, [x, y]]) => (
        <Node key={k} x={x} y={y} label={k} fill={C.idle} stroke={step === 0 ? "#a5b4fc" : undefined} />
      ))}
    </Svg>
  );
};

/** Сжатие координат: разрежённые числа → плотные индексы 0..n-1. */
export const CoordCompressDemo: React.FC = () => {
  const raw = [1000, 5, 74000, 5, 300];
  const sorted = [5, 300, 1000, 74000];
  const step = useLoop(3, 1200);
  const boxW = 46;
  const startX = (260 - raw.length * (boxW + 4)) / 2;

  return (
    <Svg
      caption={
        step === 0
          ? "Исходные координаты — огромные и с дырами"
          : step === 1
            ? "Сортируем уникальные значения"
            : "Каждое число заменяем его номером → плотный массив"
      }
    >
      {raw.map((v, i) => (
        <g key={i}>
          <rect x={startX + i * (boxW + 4)} y={20} width={boxW} height={26} rx={5} fill={C.idle} stroke={C.idleStroke} />
          <text x={startX + i * (boxW + 4) + boxW / 2} y={37} textAnchor="middle" fontSize={10} fontWeight="700" fill="#fff">
            {v}
          </text>
        </g>
      ))}

      {step >= 1 &&
        sorted.map((v, i) => (
          <g key={v}>
            <rect x={30 + i * 52} y={62} width={46} height={22} rx={5} fill={C.active} />
            <text x={53 + i * 52} y={77} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#fff">
              {v}
            </text>
          </g>
        ))}

      {step >= 2 &&
        raw.map((v, i) => (
          <g key={`c${i}`}>
            <rect x={startX + i * (boxW + 4)} y={98} width={boxW} height={24} rx={5} fill={C.done} />
            <text x={startX + i * (boxW + 4) + boxW / 2} y={114} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">
              {sorted.indexOf(v)}
            </text>
          </g>
        ))}
    </Svg>
  );
};

/* --------------------- Splay: три случая поворота --------------------- */

type Pt = [number, number];

const SplayFrames: React.FC<{
  frames: { pos: Record<string, Pt>; edges: [string, string][] }[];
  captions: string[];
  ms?: number;
}> = ({ frames, captions, ms = 1500 }) => {
  const step = useLoop(frames.length, ms);
  const f = frames[step];
  const color = (id: string) =>
    id === "x" ? "#6366f1" : id === "p" ? "#0ea5e9" : id === "g" ? "#f59e0b" : C.idle;

  return (
    <Svg caption={captions[step]}>
      {f.edges.map(([a, b], i) => (
        <line
          key={i}
          x1={f.pos[a][0]}
          y1={f.pos[a][1]}
          x2={f.pos[b][0]}
          y2={f.pos[b][1]}
          stroke={C.edge}
          strokeWidth={1.8}
          style={{ transition: MOVE }}
        />
      ))}
      {Object.entries(f.pos).map(([id, [x, y]]) => (
        <g key={id} style={{ transform: `translate(${x}px, ${y}px)`, transition: MOVE }}>
          <circle r={13} fill={color(id)} stroke={C.idleStroke} strokeWidth={1.5} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700" fill="#fff">
            {id}
          </text>
        </g>
      ))}
    </Svg>
  );
};

/** Zig — один поворот, когда родитель уже корень. */
export const ZigDemo: React.FC = () => (
  <SplayFrames
    captions={["p — корень, x под ним", "Один поворот: x всплыл в корень"]}
    frames={[
      { pos: { p: [130, 32], x: [78, 92] }, edges: [["p", "x"]] },
      { pos: { x: [130, 32], p: [182, 92] }, edges: [["x", "p"]] },
    ]}
  />
);

/** Zig-Zig — x и p с одной стороны, крутим сначала верхнюю пару. */
export const ZigZigDemo: React.FC = () => (
  <SplayFrames
    captions={["Линия g → p → x («бамбук»)", "Поворот ВЕРХНЕЙ пары (g, p)", "Поворот (p, x): x в корне"]}
    frames={[
      { pos: { g: [176, 24], p: [126, 70], x: [76, 112] }, edges: [["g", "p"], ["p", "x"]] },
      { pos: { p: [130, 26], x: [78, 78], g: [186, 78] }, edges: [["p", "x"], ["p", "g"]] },
      { pos: { x: [102, 24], p: [152, 70], g: [202, 112] }, edges: [["x", "p"], ["p", "g"]] },
    ]}
  />
);

/** Zig-Zag — x и p с разных сторон, крутим сначала нижнюю пару. */
export const ZigZagDemo: React.FC = () => (
  <SplayFrames
    captions={["Зигзаг: g влево, x вправо", "Поворот НИЖНЕЙ пары (p, x)", "Поворот (g, x): p и g — дети x"]}
    frames={[
      { pos: { g: [176, 24], p: [110, 70], x: [152, 112] }, edges: [["g", "p"], ["p", "x"]] },
      { pos: { g: [176, 24], x: [110, 70], p: [64, 112] }, edges: [["g", "x"], ["x", "p"]] },
      { pos: { x: [130, 30], p: [80, 100], g: [180, 100] }, edges: [["x", "p"], ["x", "g"]] },
    ]}
  />
);
