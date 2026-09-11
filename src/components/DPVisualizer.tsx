import { useState, useEffect } from 'react';
import { useVizStepSync } from '../data/vizStepBus';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Code, Eye, RefreshCw } from 'lucide-react';

interface DPStep {
  id: number;
  n: number;
  action: 'call' | 'memo_hit' | 'base_case' | 'calc' | 'done';
  desc: string;
  codeLine: number;
  memoState: { [key: number]: number };
}

const DP_CODE_LINES = [
  /* 1 */ "function fibMemo(n, memo = {}) {",
  /* 2 */ "    if (n in memo) return memo[n];",
  /* 3 */ "    if (n <= 2) return 1;",
  /* 4 */ "    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);",
  /* 5 */ "    return memo[n];",
  /* 6 */ "}"
];

export function DPVisualizer() {
  const [targetN, setTargetN] = useState<number>(5);
  const [steps, setSteps] = useState<DPStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  useVizStepSync(currentStepIndex, setCurrentStepIndex, steps.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed] = useState<number>(800);
  const [activeTab, setActiveTab] = useState<'table' | 'code'>('table');

  useEffect(() => {
    const generatedSteps: DPStep[] = [];
    let stepId = 0;
    const memoMap: { [key: number]: number } = {};

    function simulateFib(n: number): number {
      generatedSteps.push({
        id: stepId++,
        n,
        action: 'call',
        desc: `Вызов fibMemo(${n}). Проверяем наличие в кэше memo.`,
        codeLine: 2,
        memoState: { ...memoMap }
      });

      if (n in memoMap) {
        generatedSteps.push({
          id: stepId++,
          n,
          action: 'memo_hit',
          desc: `⚡ Кэш-хит! fibMemo(${n}) уже посчитано: ${memoMap[n]}. Возвращаем мгновенно O(1).`,
          codeLine: 2,
          memoState: { ...memoMap }
        });
        return memoMap[n];
      }

      if (n <= 2) {
        generatedSteps.push({
          id: stepId++,
          n,
          action: 'base_case',
          desc: `Базовый случай: n <= 2 (n=${n}). Возвращаем 1.`,
          codeLine: 3,
          memoState: { ...memoMap }
        });
        return 1;
      }

      generatedSteps.push({
        id: stepId++,
        n,
        action: 'call',
        desc: `Вычисляем рекурсивно: fibMemo(${n - 1}) + fibMemo(${n - 2}).`,
        codeLine: 4,
        memoState: { ...memoMap }
      });

      const res1 = simulateFib(n - 1);
      const res2 = simulateFib(n - 2);
      memoMap[n] = res1 + res2;

      generatedSteps.push({
        id: stepId++,
        n,
        action: 'calc',
        desc: `Сохраняем в кэш: memo[${n}] = ${res1} + ${res2} = ${memoMap[n]}.`,
        codeLine: 5,
        memoState: { ...memoMap }
      });

      return memoMap[n];
    }

    const finalRes = simulateFib(targetN);

    generatedSteps.push({
      id: stepId++,
      n: targetN,
      action: 'done',
      desc: `🎉 Расчет завершен! fibMemo(${targetN}) = ${finalRes}. Благодаря кэшу мы избежали экспоненциального дерева вызовов.`,
      codeLine: 6,
      memoState: { ...memoMap }
    });

    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [targetN]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, speed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps, speed]);

  const currentStep = steps[currentStepIndex] || null;
  const memoState = currentStep?.memoState || {};

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-8 my-12 shadow-2xl overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Интерактивный стенд Мемоизации</h3>
          </div>
          <p className="text-sm text-slate-400">
            Смотри, как таблица DP кэширует результаты и отсекает огромные ветви дерева вызовов.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
            <span>N:</span>
            <select
              value={targetN}
              onChange={(e) => setTargetN(Number(e.target.value))}
              disabled={isPlaying}
              className="bg-transparent text-white font-bold outline-none cursor-pointer disabled:opacity-50"
            >
              <option value={4}>N = 4</option>
              <option value={5}>N = 5</option>
              <option value={6}>N = 6</option>
              <option value={7}>N = 7</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => { setIsPlaying(false); setCurrentStepIndex(0); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Сбросить"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setIsPlaying(false); setCurrentStepIndex(prev => Math.max(0, prev - 1)); }}
              disabled={currentStepIndex === 0}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30"
              title="Шаг назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-bold text-sm transition-all shadow-md ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Пауза' : 'Пуск'}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1)); }}
              disabled={currentStepIndex === steps.length - 1}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors disabled:opacity-30"
              title="Шаг вперед"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* DP Table View */}
      <div className="mb-8 bg-slate-950 p-4 md:p-6 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Таблица кэша memo (DP Table)</h4>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center">
          {Array.from({ length: targetN }, (_, i) => i + 1).map((num) => {
            const isCached = num in memoState || num <= 2;
            const val = num <= 2 ? 1 : memoState[num];
            const isCurrent = currentStep?.n === num;

            return (
              <div 
                key={num} 
                className={`flex flex-col items-center p-3 md:p-4 rounded-xl border-2 w-16 md:w-20 transition-all duration-200 ${
                  isCurrent 
                    ? 'bg-emerald-950 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 -translate-y-1' 
                    : isCached 
                    ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-600'
                }`}
              >
                <span className="text-xs text-slate-400 font-mono">memo[{num}]</span>
                <span className={`text-xl md:text-2xl font-extrabold font-mono mt-1 ${isCached ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {isCached ? val : '∅'}
                </span>
                {num <= 2 && <span className="text-[9px] text-slate-500 mt-1 uppercase">База</span>}
              </div>
            );
          })}
        </div>

        {currentStep && (
          <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentStep.desc}</span>
            </div>
            <div className="text-xs font-mono bg-slate-900 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-800">
              Текущий N: <strong className="text-emerald-400">{currentStep.n}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'table' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          Степ-бай-степ состояние
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-colors ${
            activeTab === 'code' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Code className="w-4 h-4" />
          Интерактивный код
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[320px] flex flex-col justify-center">
        {activeTab === 'table' && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h5 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="text-emerald-400">🔍</span> Дерево рекурсии и срез вызовов
            </h5>
            <p className="text-sm text-slate-400">
              В классической рекурсии для N={targetN} потребовалось бы множество повторных расчетов. Здесь же, как только мы встречаем уже вычисленное значение в таблице, мы моментально берем его за O(1).
            </p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Всего шагов симуляции: {steps.length}</span>
              <span className="text-emerald-400 font-bold">Оптимизация: O(2^N) ➔ O(N)</span>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-400">fib_memo.js</span>
              <span className="text-xs text-emerald-400 font-medium">Строка {currentStep?.codeLine} активна</span>
            </div>
            <pre className="p-6 font-mono text-sm space-y-1 overflow-x-auto">
              {DP_CODE_LINES.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = currentStep?.codeLine === lineNum;
                return (
                  <div 
                    key={lineNum} 
                    className={`flex items-center px-4 py-1.5 rounded transition-colors ${
                      isActive 
                        ? 'bg-emerald-600/20 border-l-4 border-emerald-500 text-emerald-200 font-bold' 
                        : 'text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <span className="w-8 text-xs text-slate-600 select-none">{lineNum}</span>
                    <span>{line}</span>
                  </div>
                );
              })}
            </pre>
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex items-center gap-3 text-sm text-slate-300">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">ℹ️</span>
              <span>{currentStep?.desc}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Прогресс выполнения</span>
          <span>Шаг {currentStepIndex + 1} из {steps.length}</span>
        </div>
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
