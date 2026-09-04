import React, { useMemo, useState } from "react";

/**
 * Префиксные суммы: 1D и 2D.
 *
 * Главная фишка — наведение на число:
 *  • в 1D наводим на P[i] — подсвечивается кусок массива, из которого эта сумма набежала;
 *  • в 1D наводим на a[i] — видно, в какие префиксы он входит;
 *  • в 2D наводим на ячейку — подсвечивается прямоугольник от начала координат,
 *    а при выбранном запросе показывается формула включений-исключений A − B − C + D.
 */

const A1 = [3, 1, 4, 1, 5, 9, 2, 6];

const A2 = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 1, 2, 3],
  [4, 5, 6, 7],
];

const cellBase =
  "flex items-center justify-center rounded-md font-mono font-bold transition-colors duration-150 select-none " +
  "w-[clamp(30px,9vw,46px)] h-[clamp(30px,9vw,46px)] text-[clamp(10px,3vw,14px)]";

export const PrefixSumViz: React.FC = () => {
  const [mode, setMode] = useState<"1d" | "2d">("1d");
  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-xl">
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {(
          [
            ["1d", "1. Одномерные суммы"],
            ["2d", "2. Двумерные суммы"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              mode === key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "1d" ? <Prefix1D /> : <Prefix2D />}
    </div>
  );
};

/* ------------------------------- 1D ------------------------------- */
const Prefix1D: React.FC = () => {
  const pref = useMemo(
    () => A1.reduce<number[]>((acc, v) => [...acc, acc[acc.length - 1] + v], [0]),
    []
  );

  /** Что сейчас под курсором: префикс P[i] или элемент a[i]. */
  const [hover, setHover] = useState<{ kind: "pref" | "a"; i: number } | null>(null);
  const [range, setRange] = useState<{ l: number; r: number }>({ l: 2, r: 5 });

  const covered =
    hover?.kind === "pref"
      ? { from: 0, to: hover.i - 1 }
      : hover?.kind === "a"
        ? { from: hover.i, to: hover.i }
        : null;

  const sum = pref[range.r + 1] - pref[range.l];

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* индексы */}
          <div className="flex gap-1.5 mb-1 pl-[52px]">
            {A1.map((_, i) => (
              <div key={i} className={`${cellBase} !h-5 text-slate-500 !text-[10px]`}>
                {i}
              </div>
            ))}
          </div>

          {/* массив a */}
          <div className="flex gap-1.5 items-center mb-3">
            <div className="w-[46px] shrink-0 text-right pr-2 text-xs font-mono text-slate-400">a</div>
            {A1.map((v, i) => {
              const inCover = covered && i >= covered.from && i <= covered.to;
              const inRange = i >= range.l && i <= range.r;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover({ kind: "a", i })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRange((r) => (i < r.l ? { l: i, r: r.r } : { l: r.l, r: i }))}
                  className={`${cellBase} cursor-pointer ${
                    inCover
                      ? "bg-indigo-500 text-white ring-2 ring-indigo-300"
                      : inRange
                        ? "bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-600"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title={`a[${i}] = ${v}`}
                >
                  {v}
                </div>
              );
            })}
          </div>

          {/* массив P */}
          <div className="flex gap-1.5 items-center">
            <div className="w-[46px] shrink-0 text-right pr-2 text-xs font-mono text-slate-400">P</div>
            {pref.map((v, i) => {
              const active = hover?.kind === "pref" && hover.i === i;
              const isL = i === range.l;
              const isR = i === range.r + 1;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover({ kind: "pref", i })}
                  onMouseLeave={() => setHover(null)}
                  className={`${cellBase} cursor-help ${
                    active
                      ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                      : isR
                        ? "bg-emerald-700 text-white"
                        : isL
                          ? "bg-rose-700 text-white"
                          : "bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800"
                  }`}
                  title={`P[${i}] = сумма a[0..${i - 1}]`}
                >
                  {v}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Пояснение под курсором */}
      <div className="min-h-[62px] bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm">
        {hover?.kind === "pref" ? (
          hover.i === 0 ? (
            <p className="text-slate-300">
              <b className="text-emerald-400">P[0] = 0</b> — «пустой» префикс. Он нужен, чтобы формула работала и для
              отрезка, начинающегося с нуля.
            </p>
          ) : (
            <p className="text-slate-300">
              <b className="text-emerald-400">
                P[{hover.i}] = {pref[hover.i]}
              </b>{" "}
              — это сумма всего, что набежало от начала:{" "}
              <span className="font-mono text-indigo-300">
                a[0..{hover.i - 1}] = {A1.slice(0, hover.i).join(" + ")}
              </span>
            </p>
          )
        ) : hover?.kind === "a" ? (
          <p className="text-slate-300">
            <b className="text-indigo-400">
              a[{hover.i}] = {A1[hover.i]}
            </b>{" "}
            входит во все префиксы, начиная с{" "}
            <span className="font-mono text-emerald-300">P[{hover.i + 1}]</span>. Кликните по элементу, чтобы
            подвинуть границу запроса.
          </p>
        ) : (
          <p className="text-slate-500">
            Наведите курсор на любое число: у <b className="text-emerald-400">P</b> покажется, из чего оно сложилось,
            у <b className="text-indigo-400">a</b> — куда оно входит.
          </p>
        )}
      </div>

      {/* Запрос */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-3 sm:p-4">
        <div className="text-xs text-slate-400 mb-2">
          Запрос суммы на отрезке (кликайте по массиву <span className="font-mono">a</span>, чтобы двигать границы):
        </div>
        <p className="font-mono text-sm sm:text-base text-white break-words">
          sum(a[{range.l}..{range.r}]) = P[{range.r + 1}] − P[{range.l}] ={" "}
          <span className="text-emerald-400">{pref[range.r + 1]}</span> −{" "}
          <span className="text-rose-400">{pref[range.l]}</span> ={" "}
          <span className="text-indigo-300 font-bold">{sum}</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Один вычитание вместо цикла: запрос за O(1) после препроцессинга за O(n).
        </p>
      </div>
    </div>
  );
};

/* ------------------------------- 2D ------------------------------- */
const Prefix2D: React.FC = () => {
  const n = A2.length;
  const m = A2[0].length;

  const P = useMemo(() => {
    const p = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        p[i][j] = A2[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1];
      }
    }
    return p;
  }, [n, m]);

  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);
  const [rect, setRect] = useState({ r1: 1, c1: 1, r2: 2, c2: 2 });

  const D = P[rect.r1][rect.c1];
  const B = P[rect.r1][rect.c2 + 1];
  const Cc = P[rect.r2 + 1][rect.c1];
  const Aa = P[rect.r2 + 1][rect.c2 + 1];
  const total = Aa - B - Cc + D;

  const cornerOf = (i: number, j: number) => {
    if (i === rect.r2 + 1 && j === rect.c2 + 1) return "A";
    if (i === rect.r1 && j === rect.c2 + 1) return "B";
    if (i === rect.r2 + 1 && j === rect.c1) return "C";
    if (i === rect.r1 && j === rect.c1) return "D";
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Исходная матрица */}
        <div className="overflow-x-auto">
          <div className="text-xs text-slate-400 mb-2">Исходная матрица (кликайте, чтобы задать прямоугольник)</div>
          <div className="inline-block">
            {A2.map((row, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                {row.map((v, j) => {
                  const inRect = i >= rect.r1 && i <= rect.r2 && j >= rect.c1 && j <= rect.c2;
                  return (
                    <div
                      key={j}
                      onClick={() =>
                        setRect((r) =>
                          i < r.r1 || j < r.c1 ? { r1: i, c1: j, r2: r.r2, c2: r.c2 } : { ...r, r2: i, c2: j }
                        )
                      }
                      className={`${cellBase} cursor-pointer ${
                        inRect ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Матрица префиксных сумм */}
        <div className="overflow-x-auto">
          <div className="text-xs text-slate-400 mb-2">Префиксные суммы P (наведите на число)</div>
          <div className="inline-block">
            {P.map((row, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                {row.map((v, j) => {
                  const corner = cornerOf(i, j);
                  const isHover = hover?.i === i && hover?.j === j;
                  const cornerColor =
                    corner === "A"
                      ? "bg-emerald-600 text-white"
                      : corner === "D"
                        ? "bg-sky-600 text-white"
                        : corner
                          ? "bg-rose-600 text-white"
                          : "bg-slate-900 border border-slate-700 text-slate-300";
                  return (
                    <div
                      key={j}
                      onMouseEnter={() => setHover({ i, j })}
                      onMouseLeave={() => setHover(null)}
                      className={`${cellBase} cursor-help relative ${
                        isHover ? "bg-amber-500 text-white ring-2 ring-amber-300" : cornerColor
                      }`}
                    >
                      {v}
                      {corner && !isHover && (
                        <span className="absolute -top-1 -right-1 text-[9px] bg-slate-950 border border-slate-600 rounded px-1 leading-tight">
                          {corner}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[54px] bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm">
        {hover ? (
          <p className="text-slate-300">
            <b className="text-amber-400">
              P[{hover.i}][{hover.j}] = {P[hover.i][hover.j]}
            </b>{" "}
            — сумма всего прямоугольника от левого верхнего угла до клетки ({hover.i - 1}, {hover.j - 1}) включительно.
          </p>
        ) : (
          <p className="text-slate-500">Наведите курсор на число в матрице P, чтобы увидеть, какой прямоугольник оно покрывает.</p>
        )}
      </div>

      <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-3 sm:p-4">
        <p className="font-mono text-sm sm:text-base text-white break-words">
          сумма = <span className="text-emerald-400">A</span> − <span className="text-rose-400">B</span> −{" "}
          <span className="text-rose-400">C</span> + <span className="text-sky-400">D</span> = {Aa} − {B} − {Cc} + {D} ={" "}
          <span className="text-indigo-300 font-bold">{total}</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Вычли два «хвоста» и вернули дважды вычтенный угол — это и есть включения-исключения.
        </p>
      </div>
    </div>
  );
};
