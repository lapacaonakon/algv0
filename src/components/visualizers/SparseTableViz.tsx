import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useVizSync } from "../../hooks/useVizSync";
import { useVizControl } from "../../hooks/useVizControl";
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Lock,
  ChevronDown,
} from "lucide-react";

// Data for 1D Array
const arr1D = [2, 3, 5, 62, 3, 21, 1, 4];
const N = arr1D.length;
const LOG = 4;

const st1D: number[][] = Array.from({ length: N }, () => Array(LOG).fill(0));
for (let i = 0; i < N; i++) st1D[i][0] = arr1D[i];
for (let j = 1; j < LOG; j++) {
  for (let i = 0; i + (1 << j) <= N; i++) {
    st1D[i][j] = Math.min(st1D[i][j - 1], st1D[i + (1 << (j - 1))][j - 1]);
  }
}

// Data for 2D Matrix (Sparse Table 2D)
const val2D = [
  [45, 12, 88, 34, 11, 76, 23, 90],
  [67, 19, 44, 55, 33, 21, 65, 87],
  [14, 51, 99, 13, 22, 64, 43, 76],
  [89, 32, 54, 71, 15, 88, 29, 60],
  [25, 41, 16, 92,  9, 17, 56, 31],
  [59, 18, 77, 24, 61, 82, 35, 12],
  [73,  8, 38, 85, 47, 95, 19, 58],
  [39, 81, 62, 28, 51, 42, 85, 14]
];

const ST2D: number[][][][] = Array.from({length: 8}, () => 
  Array.from({length: 8}, () => 
    Array.from({length: 4}, () => 
      Array(4).fill(0)
    )
  )
);

for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    ST2D[r][c][0][0] = val2D[r][c];
  }
}

for (let kx = 0; kx <= 3; kx++) {
  for (let ky = 0; ky <= 3; ky++) {
    if (kx === 0 && ky === 0) continue;
    for (let r = 0; r + (1 << kx) <= 8; r++) {
      for (let c = 0; c + (1 << ky) <= 8; c++) {
         if (kx > 0) {
            ST2D[r][c][kx][ky] = Math.min(
               ST2D[r][c][kx-1][ky],
               ST2D[r + (1 << (kx-1))][c][kx-1][ky]
            );
         } else {
            ST2D[r][c][kx][ky] = Math.min(
               ST2D[r][c][kx][ky-1],
               ST2D[r][c + (1 << (ky-1))][kx][ky-1]
            );
         }
      }
    }
  }
}

export const SparseTableViz: React.FC = () => {
  const [tab, setTab] = useState<"1d" | "2d_build" | "2d_query">("1d");

  return (
    <div className="w-full bg-slate-950 p-3 sm:p-4 md:p-6 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      <div className="flex gap-2 sm:gap-4 mb-5 border-b border-slate-800 pb-4 overflow-x-auto whitespace-nowrap no-scrollbar">
        <button
          onClick={() => setTab("1d")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shrink-0 transition-colors ${tab === "1d" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
        >
          1. Сворачивание 1D
        </button>
        <button
          onClick={() => setTab("2d_build")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shrink-0 transition-colors ${tab === "2d_build" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
        >
          2. Сворачивание 2D (Построение)
        </button>
        <button
          onClick={() => setTab("2d_query")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shrink-0 transition-colors ${tab === "2d_query" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
        >
          3. Запрос 2D (Формула)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "1d" ? (
          <Viz1D key="1d" />
        ) : tab === "2d_build" ? (
          <Viz2DBuild key="2d_build" />
        ) : (
          <Viz2DQuery key="2d_query" />
        )}
      </AnimatePresence>
    </div>
  );
};

const Viz1D: React.FC = () => {
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);

  // Total steps: we animate computing each element for j=1, j=2, j=3.
  const computeSteps: { i: number; j: number }[] = [];
  for (let j = 1; j < LOG; j++) {
    for (let i = 0; i + (1 << j) <= N; i++) {
      computeSteps.push({ i, j });
    }
  }

  const maxStep = computeSteps.length;
  const covered = hover ? { from: hover.i, to: hover.i + (1 << hover.j) - 1 } : null;
  const cur = step > 0 && step <= maxStep ? computeSteps[step - 1] : null;
  // подсветка в визуализации = строка в компиляторе; отдельный объект Vars+Code
  useVizSync("sparse-table", { n: N, m: LOG, i: cur?.i ?? 0, j: cur?.j ?? 0, k: cur?.j ?? 0, a: cur ? st1D[cur.i][cur.j] : st1D[0][0] });
  useVizControl("sparse-table", {
    onStep: () => setStep((s) => Math.min(s + 1, maxStep)),
    onReset: () => setStep(0),
    onPrev: () => setStep((s) => Math.max(0, s - 1)),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-indigo-400 mb-1">
            Построение Sparse Table (Min)
          </h3>
          <p className="text-sm text-slate-400">
            Формула: ST[i][j] = min(ST[i][j-1], ST[i + 2^(j-1)][j-1])
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            disabled={step === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setStep(Math.min(maxStep, step + 1))}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            disabled={step === maxStep}
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Исходный массив</div>
        <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1">
          {arr1D.map((v, idx) => {
            const inCover = !!covered && idx >= covered.from && idx <= covered.to;
            return (
              <div key={idx} className="flex flex-col items-center shrink-0">
                <div
                  className={`flex items-center justify-center rounded-md font-mono font-bold transition-all duration-150 w-[clamp(26px,8vw,44px)] h-[clamp(26px,8vw,44px)] text-[clamp(10px,2.8vw,14px)] ${
                    inCover ? "bg-indigo-500 text-white ring-2 ring-indigo-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {v}
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5 font-mono">{idx}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs min-h-[36px]">
          {hover && covered ? (
            <p className="text-slate-300">
              <b className="text-sky-400">
                ST[{hover.i}][{hover.j}] = {st1D[hover.i][hover.j]}
              </b>{" "}
              — это минимум на отрезке{" "}
              <span className="font-mono text-sky-300">
                [{covered.from}, {covered.to}]
              </span>{" "}
              длины 2^{hover.j} = {1 << hover.j}:{" "}
              <span className="font-mono text-slate-400">
                min({arr1D.slice(covered.from, covered.to + 1).join(", ")})
              </span>
            </p>
          ) : (
            <p className="text-slate-500">
              Наведите курсор (или тапните) на любое число в таблице ниже — подсветится отрезок, за который оно отвечает.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-800">
          <div className="grid grid-cols-[auto_repeat(4,minmax(50px,1fr))] gap-x-2 gap-y-2 sm:gap-x-4 items-start">
            {/* Headers */}
            <div className="text-slate-500 font-mono text-sm self-end pb-2">
              i \ j
            </div>
            <div className="text-center font-bold text-indigo-300 border-b border-indigo-900/50 pb-2 text-[10px] sm:text-xs whitespace-nowrap">
              2^0 (L=1)
            </div>
            <div className="text-center font-bold text-indigo-300 border-b border-indigo-900/50 pb-2 text-[10px] sm:text-xs whitespace-nowrap">
              2^1 (L=2)
            </div>
            <div className="text-center font-bold text-indigo-300 border-b border-indigo-900/50 pb-2 text-[10px] sm:text-xs whitespace-nowrap">
              2^2 (L=4)
            </div>
            <div className="text-center font-bold text-indigo-300 border-b border-indigo-900/50 pb-2 text-[10px] sm:text-xs whitespace-nowrap">
              2^3 (L=8)
            </div>

            {/* Matrix */}
            {Array.from({ length: N }).map((_, i) => (
              <React.Fragment key={i}>
                <div className="text-slate-500 font-mono text-sm self-center justify-self-center py-2">
                  {i}
                </div>
                {Array.from({ length: LOG }).map((_, j) => {
                  const isValid = i + (1 << j) <= N;
                  const isVisible =
                    isValid &&
                    (j === 0 ||
                      computeSteps.findIndex((s) => s.i === i && s.j === j) <
                        step);

                  // Active computing state
                  let isActive = false;
                  let isSrc1 = false;
                  let isSrc2 = false;

                  if (step > 0 && step <= maxStep) {
                    const currentStep = computeSteps[step - 1];
                    if (currentStep.i === i && currentStep.j === j)
                      isActive = true;
                    if (currentStep.j === j + 1 && currentStep.i === i)
                      isSrc1 = true;
                    if (
                      currentStep.j === j + 1 &&
                      currentStep.i === i - (1 << (currentStep.j - 1))
                    )
                      isSrc2 = true; // wait, no. Src2 for ST[i][j] is ST[i + 2^(j-1)][j-1].
                    // Let's re-eval exact source:
                    // We are asking if THIS cell [i][j] is a source for current computation
                    if (currentStep.j - 1 === j) {
                      if (currentStep.i === i) isSrc1 = true;
                      if (currentStep.i + (1 << (currentStep.j - 1)) === i)
                        isSrc2 = true;
                    }
                  }

                  return (
                    <div key={j} className="relative flex justify-center">
                      {!isValid ? (
                        <div className="w-[clamp(30px,9vw,48px)] h-[clamp(30px,9vw,48px)]" />
                      ) : (
                        <motion.div
                          onMouseEnter={() => isVisible && setHover({ i, j })}
                          onMouseLeave={() => setHover(null)}
                          onClick={() => isVisible && setHover(hover && hover.i === i && hover.j === j ? null : { i, j })}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isVisible ? 1 : 0,
                            scale: isVisible ? 1 : 0.8,
                          }}
                          className={`w-[clamp(30px,9vw,48px)] h-[clamp(30px,9vw,48px)] flex items-center justify-center rounded-lg text-[clamp(11px,3vw,17px)] font-bold transition-colors cursor-pointer ${
                            hover && hover.i === i && hover.j === j
                              ? "bg-sky-500 text-white ring-4 ring-sky-400/50 z-10"
                              : isActive
                              ? "bg-indigo-500 text-white ring-4 ring-indigo-400 ring-opacity-50 z-10"
                              : isSrc1
                                ? "bg-emerald-500 text-white ring-2 ring-emerald-400 z-10"
                                : isSrc2
                                  ? "bg-amber-500 text-white ring-2 ring-amber-400 z-10"
                                  : isVisible
                                    ? "bg-slate-800 text-slate-300"
                                    : "bg-transparent text-transparent"
                          }`}
                        >
                          {st1D[i][j]}
                        </motion.div>
                      )}

                      {/* Arrows visualization */}
                      {(isSrc1 || isSrc2) && (
                        <motion.svg
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute pointer-events-none z-20"
                          style={{
                            width: 100,
                            height: isSrc2 ? 40 + (1 << j) * 40 : 40,
                            right: -50,
                            top: 24,
                            overflow: "visible",
                          }}
                        >
                          <path
                            d={`M 0 0 C 30 0, 30 ${isSrc1 ? 0 : -(1 << j) * 48}, 60 ${isSrc1 ? 0 : -(1 << j) * 48}`}
                            fill="none"
                            stroke={isSrc1 ? "#10b981" : "#f59e0b"}
                            strokeWidth="3"
                          />
                        </motion.svg>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Formula helper text */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl min-h-[80px] flex items-center text-center justify-center">
        {step > 0 && step <= maxStep ? (
          (() => {
            const c = computeSteps[step - 1];
            const half = 1 << (c.j - 1);
            return (
              <p className="text-lg text-slate-300">
                <span className="text-white font-bold">
                  ST[{c.i}][{c.j}]
                </span>{" "}
                = min(
                <span className="text-emerald-400 font-bold">
                  ST[{c.i}][{c.j - 1}]
                </span>
                ,
                <span className="text-amber-400 font-bold">
                  ST[{c.i + half}][{c.j - 1}]
                </span>
                ) &rarr; min(
                <span className="text-emerald-400">{st1D[c.i][c.j - 1]}</span>,{" "}
                <span className="text-amber-400">
                  {st1D[c.i + half][c.j - 1]}
                </span>
                ) ={" "}
                <span className="text-indigo-400 font-bold">
                  {st1D[c.i][c.j]}
                </span>
              </p>
            );
          })()
        ) : (
          <p className="text-slate-500 italic">
            Нажмите далее, чтобы увидеть, как блоки сворачиваются
          </p>
        )}
      </div>
    </div>
  );
};

const Viz2DBuild: React.FC = () => {
  const [k, setK] = useState(1);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const [locked, setLocked] = useState<{ r: number; c: number } | null>(null);

  const L = 1 << k;
  const activeCell = locked || hover;
  const ac = activeCell ?? { r: 0, c: 0 };
  useVizSync("sparse-table", {
    i: ac.r,
    j: ac.c,
    k,
    n: 8,
    m: 8,
    a: ST2D[ac.r][ac.c][Math.max(0, k - 1)][Math.max(0, k - 1)],
    b: ST2D[ac.r][Math.min(7, ac.c + (1 << Math.max(0, k - 1)))][Math.max(0, k - 1)][Math.max(0, k - 1)],
  });
  useVizControl("sparse-table", {
    onStep: () => setK((v) => Math.min(3, v + 1)),
    onReset: () => setK(0),
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0 bg-slate-900 p-3 sm:p-6 rounded-xl border border-slate-800 flex flex-col items-center max-w-full">
        <h3 className="text-xl font-bold text-indigo-400 mb-2">Промежуточные матрицы</h3>
        <p className="text-sm text-slate-400 mb-6 text-center max-w-[400px]">
          Для наглядности показываем только <b className="text-indigo-300">квадратные блоки</b>.
          <br/>
          <span className="text-rose-300 animate-pulse mt-2 inline-block">Кликните на ячейку текущего шага, чтобы зафиксировать цвета матриц!</span>
        </p>
        
        <div className="flex bg-slate-950 p-1 rounded-lg mb-8 border border-slate-800 flex-wrap justify-center overflow-x-auto w-full">
          {[0, 1, 2, 3].map(step => (
            <button
              key={step}
              onClick={() => { setK(step); setHover(null); setLocked(null); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${k === step ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {step === 0 ? "Оригинал (1x1)" : `Шаг ${step} (${1<<step}x${1<<step})`}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-h-[70vh] sm:h-[600px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {[...Array(k + 1)].map((_, i) => k - i).map((step, idx) => {
             const stepL = 1 << step;
             const stepSize = 8 - stepL + 1;
             const isCurr = step === k;

             return (
               <React.Fragment key={step}>
                 {idx > 0 && <div className="text-slate-600 my-2"><ChevronDown size={24} strokeWidth={2} /></div>}
                 <div className={`flex flex-col items-center transition-all ${isCurr ? '' : 'scale-95 opacity-90'}`}>
                   <h4 className={`font-bold mb-3 flex flex-col items-center text-center ${isCurr ? 'text-indigo-300' : 'text-slate-400'}`}>
                     <span>Матрица блоков {stepL}x{stepL}</span>
                     <span className={`text-[10px] font-mono font-normal mt-1 border px-1.5 py-0.5 rounded ${isCurr ? 'bg-indigo-900/40 border-indigo-800/40 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>ST[][][{step}][{step}]</span>
                   </h4>
                   <div className="max-w-full overflow-x-auto">
                     <div className={`grid gap-[2px] p-2 rounded-lg border shadow-inner w-max mx-auto ${isCurr ? 'bg-[#0a0f1e] border-indigo-900/40 shadow-[0_0_25px_rgba(99,102,241,0.05)] relative' : 'bg-slate-950 border-slate-800 relative'}`} style={{ gridTemplateColumns: `repeat(${stepSize}, max-content)`}}>
                     {Array.from({length: stepSize * stepSize}).map((_, idx) => {
                        const r = Math.floor(idx / stepSize);
                        const c = idx % stepSize;
                        
                        let highlightClass = isCurr ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border-slate-700/50 cursor-pointer' : 'bg-slate-800/50 text-slate-600 border-transparent';
                        let zIndex = 'z-0';

                        const isActive = !!activeCell && (r >= activeCell.r && r < activeCell.r + L) && (c >= activeCell.c && c < activeCell.c + L) && ((r - activeCell.r) % (1 << step) === 0) && ((c - activeCell.c) % (1 << step) === 0);

                        if (isActive) {
                          if (isCurr) {
                            highlightClass = `bg-indigo-500 text-white font-bold scale-[1.12] shadow-xl border-indigo-300 transition-all ${locked && locked.r === r && locked.c === c ? 'ring-[3px] ring-white ring-offset-2 ring-offset-[#0a0f1e]' : ''}`;
                            zIndex = 'z-10';
                          } else {
                            const prevL = 1 << (k - 1);
                            const isTop = r < activeCell.r + prevL;
                            const isLeft = c < activeCell.c + prevL;
                            
                            if (isTop && isLeft) {
                               highlightClass = 'bg-rose-500/90 text-white font-bold border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] md:scale-[1.08]';
                            } else if (isTop && !isLeft) {
                               highlightClass = 'bg-blue-500/90 text-white font-bold border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] md:scale-[1.08]';
                            } else if (!isTop && isLeft) {
                               highlightClass = 'bg-emerald-500/90 text-white font-bold border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] md:scale-[1.08]';
                            } else {
                               highlightClass = 'bg-amber-500/90 text-white font-bold border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] md:scale-[1.08]';
                            }
                            zIndex = 'z-10';
                          }
                        }

                        return (
                          <div 
                            key={idx}
                            onMouseEnter={() => { if(isCurr && !locked) setHover({r, c}); }}
                            onMouseLeave={() => { if(isCurr && !locked) setHover(null); }}
                            onClick={() => {
                               if(isCurr) {
                                   if(locked && locked.r === r && locked.c === c) setLocked(null);
                                   else setLocked({r, c});
                               }
                            }}
                            className={`flex items-center justify-center font-mono rounded border shrink-0 ${highlightClass} ${zIndex} ${isCurr ? 'w-[clamp(24px,6.5vw,38px)] h-[clamp(24px,6.5vw,38px)] text-[clamp(9px,2.4vw,13px)]' : 'w-[clamp(20px,5.2vw,30px)] h-[clamp(20px,5.2vw,30px)] text-[clamp(8px,2vw,11px)]'}`}
                          >
                            {ST2D[r][c][step][step]}
                          </div>
                        );
                     })}
                     </div>
                   </div>
                 </div>
               </React.Fragment>
             )
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 h-full flex flex-col">
          <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">Код построения и формула</h3>
          {k === 0 ? (
             <div className="text-slate-400 text-sm leading-relaxed font-sans mt-4">
               <p className="mb-4">При <span className="font-mono text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">k = 0</span> квадраты имеют размер <span className="font-bold text-white">1×1</span>.</p>
               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 shadow-inner">
                 <span className="text-slate-500">// Базовый случай: квадрат размера 1x1 это сама ячейка</span><br/>
                 <span className="text-indigo-400">ST</span>[r][c][0][0] = matrix[r][c];
               </div>
               <p className="mt-6 italic text-indigo-400 flex items-center gap-2">
                 <Play size={14} className="fill-indigo-400" /> Выберите шаг 1, чтобы увидеть как собираются квадраты бóльшего размера.
               </p>
             </div>
          ) : (
             <div className="flex flex-col gap-4 animate-in fade-in duration-300">
               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 font-mono text-[12px] sm:text-[13px] md:text-sm text-slate-300 shadow-inner overflow-x-auto">
                 <span className="text-slate-500">// Текущая длина = 2^k, предыдущая = 2^(k-1)</span><br/>
                 <span className="text-purple-400">int</span> pL = <span className="text-amber-300">1</span> &lt;&lt; (k - <span className="text-amber-300">1</span>);<br/><br/>
                 <span className="text-slate-500">// Квадрат (2^k x 2^k) состоит из 4-х квадратов (2^(k-1) x 2^(k-1))</span><br/>
                 <span className="text-indigo-400">ST</span>[r][c][k][k] = <span className="text-sky-400">min</span>({'{'}<br/>
                 &nbsp;&nbsp;<span className="text-rose-400">ST</span>[r][c][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],           <span className="text-slate-500">// Левый Верх</span><br/>
                 &nbsp;&nbsp;<span className="text-blue-400">ST</span>[r][<span className="text-white">c + pL</span>][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],      <span className="text-slate-500">// Правый Верх</span><br/>
                 &nbsp;&nbsp;<span className="text-emerald-400">ST</span>[<span className="text-white">r + pL</span>][c][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],      <span className="text-slate-500">// Левый Низ</span><br/>
                 &nbsp;&nbsp;<span className="text-amber-500">ST</span>[<span className="text-white">r + pL</span>][<span className="text-white">c + pL</span>][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>]   <span className="text-slate-500">// Правый Низ</span><br/>
                 {'}'});
               </div>
               
               {activeCell ? (
                 <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/40 font-mono text-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)] mt-2 transition-all">
                    <p className="text-slate-300 mb-3 text-xs uppercase tracking-wider flex items-center justify-between">
                       <span>Пример для ячейки:</span>
                       {locked && <span className="text-rose-400 flex items-center gap-1 font-sans font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20"><Lock size={12}/> Зафиксировано</span>}
                    </p>
                    <p className="text-indigo-300 border-b border-slate-800 pb-3 flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-white bg-indigo-600/80 px-2 py-0.5 rounded text-xs">ST[{activeCell.r}][{activeCell.c}][{k}][{k}]</span> 
                      <span className="text-slate-400">= min(</span>
                    </p>
                    
                    <div className="space-y-2 pt-3 pl-2 text-[11px] sm:text-xs">
                        {(() => {
                           const prevL = 1 << (k - 1);
                           return (
                             <>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-rose-300"><div className="w-2 h-2 rounded-sm bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div> ST[{activeCell.r}][{activeCell.c}] (ЛВ)</span>
                                  <span className="text-rose-400 font-bold bg-rose-950/40 px-2 rounded border border-rose-900/50">{ST2D[activeCell.r][activeCell.c][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-blue-300"><div className="w-2 h-2 rounded-sm bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> ST[{activeCell.r}][{activeCell.c + prevL}] (ПВ)</span>
                                  <span className="text-blue-400 font-bold bg-blue-950/40 px-2 rounded border border-blue-900/50">{ST2D[activeCell.r][activeCell.c + prevL][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-emerald-300"><div className="w-2 h-2 rounded-sm bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> ST[{activeCell.r + prevL}][{activeCell.c}] (ЛН)</span>
                                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 rounded border border-emerald-900/50">{ST2D[activeCell.r + prevL][activeCell.c][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-amber-300"><div className="w-2 h-2 rounded-sm bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div> ST[{activeCell.r + prevL}][{activeCell.c + prevL}] (ПН)</span>
                                  <span className="text-amber-400 font-bold bg-amber-950/40 px-2 rounded border border-amber-900/50">{ST2D[activeCell.r + prevL][activeCell.c + prevL][k-1][k-1]}</span>
                               </div>
                             </>
                           )
                        })()}
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-slate-800 text-center text-slate-400 text-sm">
                       ) = <span className="text-white font-bold text-base bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">{ST2D[activeCell.r][activeCell.c][k][k]}</span>
                    </div>
                    <p className="mt-4 text-[12px] font-sans text-indigo-200/70 border-t border-slate-800 pt-3 text-center">👇 Прокрутите список матриц (слева) вниз, чтобы увидеть, из каких под-блоков собираются эти минимумы.</p>
                 </div>
               ) : (
                 <div className="bg-slate-950/40 border-2 border-slate-800 border-dashed p-8 text-center text-slate-500 text-sm rounded-xl mt-2 flex items-center justify-center animate-pulse min-h-[150px]">
                    👈 Наведите курсор на матрицу {L}x{L}, чтобы увидеть индексы в коде.
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Viz2DQuery: React.FC = () => {
    const [r1, setR1] = useState(1);
    const [c1, setC1] = useState(1);
    const [r2, setR2] = useState(5);
    const [c2, setC2] = useState(6);

    const H = r2 - r1 + 1;
    const W = c2 - c1 + 1;
    const kx = Math.floor(Math.log2(H));
    const ky = Math.floor(Math.log2(W));
    const Lx = 1 << kx;
    const Ly = 1 << ky;

    const matRows = 8 - Lx + 1;
    const matCols = 8 - Ly + 1;

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 min-w-0 bg-slate-900 p-3 sm:p-6 rounded-xl border border-slate-800 flex flex-col xl:max-w-md h-full">
               <h3 className="text-xl font-bold text-rose-400 mb-2">Запрос на прямоугольнике</h3>
               <p className="text-slate-400 text-[13px] mb-4 border-b border-slate-800 pb-4">Изменяйте координаты поиска (r1, c1 - левый верх, r2, c2 - правый низ).</p>
               
               <div className="flex flex-col items-center justify-center flex-1">
                  <div className="grid grid-cols-[repeat(8,max-content)] gap-[2px] bg-[#0a0f1e] p-2 rounded-xl border border-slate-800 relative shadow-inner w-max max-w-full">
                     {Array.from({length: 64}).map((_, idx) => {
                         const r = Math.floor(idx / 8);
                         const c = idx % 8;
                         const isInQuery = r >= r1 && r <= r2 && c >= c1 && c <= c2;

                         return (
                            <div key={idx} className={`w-[clamp(24px,7vw,40px)] h-[clamp(24px,7vw,40px)] shrink-0 flex items-center justify-center rounded text-[clamp(9px,2.4vw,12px)] font-mono transition-all duration-300 ${isInQuery ? 'bg-rose-900/40 text-rose-200 border-rose-500/50 border scale-105 z-10' : 'bg-slate-800/60 text-slate-500'}`}>
                               {val2D[r][c]}
                            </div>
                         )
                     })}
                     
                      <div 
                        className="absolute border-[3px] border-rose-400 pointer-events-none rounded transition-all duration-300 z-20 shadow-[0_0_15px_rgba(244,63,94,0.3)] border-dashed"
                        style={{
                          top: `${(r1 / 8) * 100}%`,
                          left: `${(c1 / 8) * 100}%`,
                          marginTop: '8px',
                          marginLeft: '8px',
                          height: 'calc(' + (H/8*100) + '% - 16px)',
                          width: 'calc(' + (W/8*100) + '% - 16px)',
                        }}
                     />

                     {/* Показываем 4 угла в самой матрице значений для понятности */}
                     <div className="absolute pointer-events-none z-30 transition-all duration-300 bg-rose-500/30 border-2 border-rose-400 shadow-[0_0_10px_#f43f5e]" style={{ top: `calc(${(r1 / 8) * 100}% + 8px)`, left: `calc(${(c1 / 8) * 100}% + 8px)`, width: `calc(${(Ly / 8) * 100}% - 16px)`, height: `calc(${(Lx / 8) * 100}% - 16px)` }} />
                     <div className="absolute pointer-events-none z-30 transition-all duration-300 bg-blue-500/30 border-2 border-blue-400 shadow-[0_0_10px_#3b82f6]" style={{ top: `calc(${(r1 / 8) * 100}% + 8px)`, left: `calc(${((c2 - Ly + 1) / 8) * 100}% + 8px)`, width: `calc(${(Ly / 8) * 100}% - 16px)`, height: `calc(${(Lx / 8) * 100}% - 16px)` }} />
                     <div className="absolute pointer-events-none z-30 transition-all duration-300 bg-emerald-500/30 border-2 border-emerald-400 shadow-[0_0_10px_#10b981]" style={{ top: `calc(${((r2 - Lx + 1) / 8) * 100}% + 8px)`, left: `calc(${(c1 / 8) * 100}% + 8px)`, width: `calc(${(Ly / 8) * 100}% - 16px)`, height: `calc(${(Lx / 8) * 100}% - 16px)` }} />
                     <div className="absolute pointer-events-none z-30 transition-all duration-300 bg-amber-500/30 border-2 border-amber-400 shadow-[0_0_10px_#f59e0b]" style={{ top: `calc(${((r2 - Lx + 1) / 8) * 100}% + 8px)`, left: `calc(${((c2 - Ly + 1) / 8) * 100}% + 8px)`, width: `calc(${(Ly / 8) * 100}% - 16px)`, height: `calc(${(Lx / 8) * 100}% - 16px)` }} />
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl w-full flex flex-col gap-3 text-sm font-mono text-slate-300 mt-6 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                       <label className="flex items-center justify-between gap-4 w-full">
                           <span className="text-slate-400">ЛВ (r1, c1):</span>
                           <div className="flex gap-2">
                             <input type="number" min={0} max={r2} value={r1} onChange={e => setR1(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                             <input type="number" min={0} max={c2} value={c1} onChange={e => setC1(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                           </div>
                       </label>
                       <label className="flex items-center justify-between gap-4 w-full">
                           <span className="text-slate-400">ПН (r2, c2):</span>
                           <div className="flex gap-2">
                             <input type="number" min={r1} max={7} value={r2} onChange={e => setR2(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                             <input type="number" min={c1} max={7} value={c2} onChange={e => setC2(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                           </div>
                       </label>
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col h-full">
               <h3 className="text-xl font-bold text-emerald-400 mb-2">Объяснение формулы (O(1))</h3>
               <p className="text-sm font-sans text-slate-300 mb-2">
                  Мы знаем, что максимальная степень двойки, помещающаяся в высоту {H} — это <span className="font-mono bg-slate-800 px-1 rounded text-white">{Lx}</span>. Аналогично для ширины {W} — это <span className="font-mono bg-slate-800 px-1 rounded text-white">{Ly}</span>.
               </p>
               <p className="text-sm font-sans text-slate-400 mb-6 border-b border-slate-800 pb-4">
                  Чтобы покрыть весь прямоугольник, мы берем <span className="text-emerald-300">4 готовых блока</span> размера <span className="font-mono bg-[#0a0f1e] px-1 rounded border border-slate-700">{Lx}×{Ly}</span> и "прижимаем" их к 4-м углам исходного запроса. (Цветные прямоугольники слева).
               </p>

               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 lg:p-5 font-mono text-[12px] sm:text-[13px] md:text-sm text-slate-300 shadow-inner overflow-x-auto w-full mb-6 relative">
                 <div className="absolute right-3 top-3 text-emerald-500/20 font-bold text-4xl hidden sm:block">O(1)</div>
                 <span className="text-slate-500">// 1. Покрывающие степени двойки</span><br/>
                 <span className="text-purple-400">int</span> kx = <span className="text-sky-400">log2</span>(r2 - r1 + <span className="text-amber-300">1</span>); <span className="text-slate-500">// {kx}</span><br/>
                 <span className="text-purple-400">int</span> ky = <span className="text-sky-400">log2</span>(c2 - c1 + <span className="text-amber-300">1</span>); <span className="text-slate-500">// {ky}</span><br/>
                 <span className="text-purple-400">int</span> Lx = <span className="text-amber-300">1</span> &lt;&lt; kx; <span className="text-slate-500">// Выс: {Lx}</span><br/>
                 <span className="text-purple-400">int</span> Ly = <span className="text-amber-300">1</span> &lt;&lt; ky; <span className="text-slate-500">// Шир: {Ly}</span><br/><br/>

                 <span className="text-slate-500">// 2. Прижимаем блоки размера {Lx}x{Ly} к углам</span><br/>
                 <span className="text-indigo-400">int</span> ans = <span className="text-sky-400">min</span>({'{'}<br/>
                 &nbsp;&nbsp;<span className="text-slate-400 text-[11px] uppercase tracking-wider">// Левый Верх (координаты совпадают с ЛВ запроса)</span><br/>
                 &nbsp;&nbsp;<span className="text-rose-400 font-bold">ST</span>[<span className="text-white bg-rose-900/30 px-1 rounded">r1</span>][<span className="text-white bg-rose-900/30 px-1 rounded">c1</span>][kx][ky],<br/>
                 
                 &nbsp;&nbsp;<span className="text-slate-400 text-[11px] uppercase tracking-wider">// Правый Верх (сдвигаем левый край влево, чтобы правый край уперся в c2)</span><br/>
                 &nbsp;&nbsp;<span className="text-blue-400 font-bold">ST</span>[<span className="text-white bg-blue-900/30 px-1 rounded">r1</span>][<span className="text-white bg-blue-900/30 px-1 rounded">c2 - Ly + 1</span>][kx][ky],<br/>
                 
                 &nbsp;&nbsp;<span className="text-slate-400 text-[11px] uppercase tracking-wider">// Левый Низ (сдвигаем верхний край вверх, чтобы нижний край уперся в r2)</span><br/>
                 &nbsp;&nbsp;<span className="text-emerald-400 font-bold">ST</span>[<span className="text-white bg-emerald-900/30 px-1 rounded">r2 - Lx + 1</span>][<span className="text-white bg-emerald-900/30 px-1 rounded">c1</span>][kx][ky],<br/>
                 
                 &nbsp;&nbsp;<span className="text-slate-400 text-[11px] uppercase tracking-wider">// Правый Низ (сдвигаем и вверх от r2, и влево от c2)</span><br/>
                 &nbsp;&nbsp;<span className="text-amber-500 font-bold">ST</span>[<span className="text-white bg-amber-900/30 px-1 rounded">r2 - Lx + 1</span>][<span className="text-white bg-amber-900/30 px-1 rounded">c2 - Ly + 1</span>][kx][ky]<br/>
                 {'}'});
               </div>
               
               <div className="w-full flex justify-center mb-6 overflow-x-auto max-w-full custom-scrollbar pb-2">
                 <div className="flex flex-col items-center">
                  <h4 className="text-slate-400 font-bold mb-3 text-sm flex flex-col items-center text-center">
                     Откуда берутся эти 4 числа: матрица <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs mt-1 border border-slate-700 shadow-sm">ST[][][{kx}][{ky}]</span>
                  </h4>
                  <div className="grid gap-[2px] p-2.5 rounded-xl bg-[#0a0f1e] border border-slate-800 shadow-inner" style={{ gridTemplateColumns: `repeat(${matCols}, 1fr)`}}>
                      {Array.from({length: matRows * matCols}).map((_, idx) => {
                          const r = Math.floor(idx / matCols);
                          const c = idx % matCols;
                          let isTL = r === r1 && c === c1;
                          let isTR = r === r1 && c === c2 - Ly + 1;
                          let isBL = r === r2 - Lx + 1 && c === c1;
                          let isBR = r === r2 - Lx + 1 && c === c2 - Ly + 1;

                          let color = "bg-slate-800 text-slate-500 font-mono scale-100 z-0";
                          let txt = ST2D[r][c][kx][ky].toString();

                          let badge = null;
                          if (isTL) { color = "bg-rose-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#f43f5e] z-10 border-rose-300 border-2"; badge = "TL"; }
                          else if (isTR) { color = "bg-blue-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#3b82f6] z-10 border-blue-300 border-2"; badge = "TR"; }
                          else if (isBL) { color = "bg-emerald-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#10b981] z-10 border-emerald-300 border-2"; badge = "BL"; }
                          else if (isBR) { color = "bg-amber-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#f59e0b] z-10 border-amber-300 border-2"; badge = "BR"; }

                          return (
                             <div key={idx} className={`w-9 h-9 flex items-center justify-center text-[11px] xl:text-[13px] rounded transition-all duration-300 relative shrink-0 ${color}`}>
                                {txt}
                                {badge && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 border border-slate-700 text-white px-1 font-bold rounded-sm shadow-md whitespace-nowrap z-20">{badge}</div>}
                             </div>
                          )
                      })}
                  </div>
                 </div>
               </div>
               
               <div className="mt-auto bg-slate-950 font-mono p-5 rounded-xl border border-indigo-900/60 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <div className="text-center font-bold text-white text-[13px] sm:text-base overflow-x-auto custom-scrollbar whitespace-nowrap bg-[#0a0f1e] py-3 px-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-normal">min(</span>&nbsp;
                       <span className="text-rose-400">{ST2D[r1][c1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-blue-400 ml-1">{ST2D[r1][c2 - Ly + 1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-emerald-400 ml-1">{ST2D[r2 - Lx + 1][c1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-amber-400 ml-1">{ST2D[r2 - Lx + 1][c2 - Ly + 1][kx][ky]}</span>
                    &nbsp;<span className="text-slate-400 font-normal">)</span> 
                    <span className="ml-3 text-emerald-400">= {Math.min(ST2D[r1][c1][kx][ky], ST2D[r1][c2 - Ly + 1][kx][ky], ST2D[r2 - Lx + 1][c1][kx][ky], ST2D[r2 - Lx + 1][c2 - Ly + 1][kx][ky])}</span>
                  </div>
               </div>

            </div>
        </div>
    )
}
