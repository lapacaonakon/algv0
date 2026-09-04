import React from "react";
import { C, Edge, Node, Svg, useLoop } from "./demoKit";

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
