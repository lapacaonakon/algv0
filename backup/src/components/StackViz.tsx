import React, { useState, useCallback } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface Plate {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isDirty: boolean;
  animState: 'in' | 'idle' | 'washing' | 'clean';
}

const PLATE_PRESETS = [
  { name: 'Тарелка из-под спагетти', emoji: '🍝', color: 'from-amber-100 to-amber-200 border-amber-300' },
  { name: 'Тарелка из-под пиццы', emoji: '🍕', color: 'from-orange-100 to-orange-200 border-orange-300' },
  { name: 'Блюдце от торта', emoji: '🍰', color: 'from-pink-100 to-pink-200 border-pink-300' },
  { name: 'Тарелка от тако', emoji: '🌮', color: 'from-yellow-100 to-yellow-200 border-yellow-300' },
  { name: 'Тарелка из-под суши', emoji: '🍣', color: 'from-red-500/20 to-red-600/20 border-red-300' },
  { name: 'Сковорода от глазуньи', emoji: '🍳', color: 'from-slate-300 to-slate-400 border-slate-500' },
];

let counter = 0;

export const StackViz: React.FC = () => {
  const [dirtyStack, setDirtyStack] = useState<Plate[]>([
    { id: 'p1', name: 'Тарелка из-под спагетти', emoji: '🍝', color: 'from-amber-100 to-amber-200 border-amber-300', isDirty: true, animState: 'idle' },
    { id: 'p2', name: 'Тарелка из-под пиццы',   emoji: '🍕', color: 'from-orange-100 to-orange-200 border-orange-300', isDirty: true, animState: 'idle' },
    { id: 'p3', name: 'Блюдце от торта',       emoji: '🍰', color: 'from-pink-100 to-pink-200 border-pink-300',       isDirty: true, animState: 'idle' },
  ]);

  const [cleanRack, setCleanRack] = useState<Plate[]>([]);
  const [isWashing, setIsWashing] = useState(false);
  const [showSoap, setShowSoap]   = useState(false);
  const [shakeEmpty, setShake]    = useState(false);
  const [log, setLog]             = useState<string[]>(['🍽️ Добавь грязную тарелку или помой верхнюю!']);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

  // PUSH: Положить грязную тарелку сверху стопки
  const pushPlate = useCallback(() => {
    if (isWashing) return;
    if (dirtyStack.length >= 7) {
      addLog('⚠ Стопка слишком высокая, тарелки могут разбиться!');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const preset = PLATE_PRESETS[counter % PLATE_PRESETS.length];
    counter++;

    const newPlate: Plate = {
      id: Date.now().toString(),
      ...preset,
      isDirty: true,
      animState: 'in',
    };

    setDirtyStack(prev => [...prev, newPlate]);
    addLog(`➕ PUSH: Положили ${newPlate.emoji} сверху стопки. Она теперь самая верхняя!`);

    setTimeout(() => {
      setDirtyStack(prev => prev.map(p => p.id === newPlate.id ? { ...p, animState: 'idle' } : p));
    }, 500);
  }, [dirtyStack, isWashing]);

  // POP: Помыть верхнюю тарелку (LIFO)
  const popPlate = useCallback(() => {
    if (isWashing) return;
    if (dirtyStack.length === 0) {
      setShake(true);
      addLog('⚠ POP: Нечего мыть! Все тарелки чистые.');
      setTimeout(() => setShake(false), 400);
      return;
    }

    setIsWashing(true);
    const topPlate = dirtyStack[dirtyStack.length - 1];

    addLog(`🧼 POP: Начинаем мыть верхнюю тарелку с ${topPlate.emoji} (Принцип LIFO!)`);

    // Step 1: Start washing animation (sponge and soap bubbles appear)
    setDirtyStack(prev => prev.map(p => p.id === topPlate.id ? { ...p, animState: 'washing' } : p));
    setShowSoap(true);

    setTimeout(() => {
      // Step 2: Wash complete. Plate becomes clean and flies to clean rack
      const cleanPlate: Plate = {
        ...topPlate,
        isDirty: false,
        animState: 'clean',
      };

      setCleanRack(prev => [cleanPlate, ...prev].slice(0, 6)); // Keep last 6 clean plates
      setDirtyStack(prev => prev.slice(0, prev.length - 1));
      setShowSoap(false);
      setIsWashing(false);
      addLog(`✨ Готово! Чистая тарелка ${topPlate.emoji} отправлена на сушилку.`);
    }, 850);
  }, [dirtyStack, isWashing]);

  const reset = () => {
    counter = 0;
    setDirtyStack([
      { id: 'r1', name: 'Тарелка из-под спагетти', emoji: '🍝', color: 'from-amber-100 to-amber-200 border-amber-300', isDirty: true, animState: 'in' },
      { id: 'r2', name: 'Тарелка из-под пиццы',   emoji: '🍕', color: 'from-orange-100 to-orange-200 border-orange-300', isDirty: true, animState: 'in' },
      { id: 'r3', name: 'Блюдце от торта',       emoji: '🍰', color: 'from-pink-100 to-pink-200 border-pink-300',       isDirty: true, animState: 'in' },
    ]);
    setCleanRack([]);
    setIsWashing(false);
    setShowSoap(false);
    setLog(['🔄 Стол сброшен. Посуда снова грязная!']);
  };

  const topIndex = dirtyStack.length - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* МНЕМОНИКА / ПРАВИЛО */}
      <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="text-3xl">🍽️</div>
        <div>
          <h3 className="font-black text-blue-400 text-sm uppercase tracking-wider">Мнемоника: Стопка грязных тарелок (LIFO)</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Ты складываешь грязные тарелки друг на друга. Свежую грязную тарелку ты кладёшь <b>наверх</b> (PUSH). 
            А когда приходит время мыть, ты берёшь именно <b>верхнюю</b> тарелку (POP) — ту, что положили самой последней. 
            Попытаешься вытащить нижнюю — всё рухнет!
          </p>
        </div>
      </div>

      {/* УПРАВЛЕНИЕ */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={pushPlate}
          disabled={isWashing}
          className="flex-1 min-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>➕ Положить грязную (PUSH)</span>
        </button>

        <button
          onClick={popPlate}
          disabled={isWashing || dirtyStack.length === 0}
          className="flex-1 min-w-[150px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🧼 Помыть верхнюю (POP)</span>
        </button>

        <button
          onClick={reset}
          className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all active:scale-95 cursor-pointer border border-slate-700"
        >
          Сброс
        </button>
      </div>

      {/* ИНТЕРАКТИВНАЯ КУХНЯ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* ЛЕВАЯ КОЛОНКА: СТОПКА ГРЯЗНЫХ ТАРЕЛОК */}
        <div className="md:col-span-7 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative min-h-[380px]">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Грязная стопка (Стек вызовов / LIFO)
          </div>

          {/* Визуализация раковины */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800/80 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            <span>РАКОВИНА 🚰</span>
          </div>

          {/* Мыльные пузыри при мытье */}
          {showSoap && (
            <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
              <div className="absolute w-6 h-6 rounded-full bg-blue-400/30 border border-blue-300/50 anim-bubble-1 left-[40%] bottom-[30%]"></div>
              <div className="absolute w-4 h-4 rounded-full bg-blue-400/30 border border-blue-300/50 anim-bubble-2 left-[55%] bottom-[20%]"></div>
              <div className="absolute w-5 h-5 rounded-full bg-blue-400/30 border border-blue-300/50 anim-bubble-3 left-[48%] bottom-[40%]"></div>
              <div className="absolute text-4xl anim-crown-bounce z-30">🧽🫧</div>
            </div>
          )}

          {dirtyStack.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <span className="text-6xl mb-3 animate-pulse">✨🧼</span>
              <p className="text-white font-black text-lg">Вся посуда вымыта!</p>
              <p className="text-slate-500 text-xs mt-1">Стек пуст. Нажми PUSH, чтобы добавить грязных тарелок.</p>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col justify-end items-center pb-4 pt-10 gap-2 ${shakeEmpty ? 'anim-shake' : ''}`}>
              
              {/* Указатель TOP */}
              <div
                className="absolute right-8 flex items-center gap-2 transition-all duration-300"
                style={{ bottom: `${24 + topIndex * 44}px` }}
              >
                <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>ВЕРШИНА (TOP)</span>
                </span>
                <span className="text-blue-400 animate-pulse font-bold text-lg">◄</span>
              </div>

              {/* Тарелки (отрисовываем в обратном порядке, чтобы новые ложились СВЕРХУ) */}
              {dirtyStack.slice().reverse().map((plate, revIdx) => {
                const idx = dirtyStack.length - 1 - revIdx;
                const isTop = idx === topIndex;
                return (
                  <div
                    key={plate.id}
                    className={`
                      w-full max-w-[280px] h-10 rounded-full border-2 bg-gradient-to-b flex items-center justify-center gap-2 font-black shadow-md select-none transition-all duration-300
                      ${plate.color}
                      ${plate.animState === 'in' ? 'anim-plate-in' : ''}
                      ${plate.animState === 'washing' ? 'anim-plate-wash' : ''}
                      ${isTop ? 'ring-4 ring-blue-500/50 scale-105 border-blue-400' : 'opacity-85 scale-95'}
                    `}
                  >
                    <span className="text-lg">{plate.emoji}</span>
                    <span className="text-slate-800 text-xs truncate max-w-[160px]">{plate.name}</span>
                    {isTop && (
                      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-mono font-normal">
                        LIFO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Столешница раковины */}
          <div className="w-full h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-inner" />
        </div>

        {/* ПРАВАЯ КОЛОНКА: СУШИЛКА ДЛЯ ЧИСТЫХ ТАРЕЛОК */}
        <div className="md:col-span-5 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Сушилка для чистой посуды
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1 text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/80 text-[9px] font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>ЧИСТО ✨</span>
          </div>

          <div className="flex-1 flex flex-col justify-end items-center pb-4 pt-12 gap-2">
            {cleanRack.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600">
                <span className="text-5xl mb-2">🍽️</span>
                <p className="text-xs font-bold font-mono uppercase">Сушилка пуста</p>
                <p className="text-[10px] mt-1">Здесь будет чистая посуда после POP</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full max-w-[200px] items-center">
                {cleanRack.map(plate => (
                  <div
                    key={plate.id}
                    className="w-full h-8 rounded-full border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900 flex items-center justify-center gap-2 opacity-90 scale-95 shadow-sm hover:scale-100 transition-transform cursor-default"
                  >
                    <span className="text-sm">✨ {plate.emoji}</span>
                    <span className="text-[10px] text-emerald-300 font-mono">clean</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Столешница сушилки */}
          <div className="w-full h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-inner" />
        </div>
      </div>

      {/* ЛОГ ДЕЙСТВИЙ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1.5">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Ход выполнения (Трассировка):</div>
        {log.map((entry, idx) => (
          <div
            key={idx}
            className={`text-xs font-mono flex items-center gap-2 ${idx === 0 ? 'text-white font-bold' : 'text-slate-500'}`}
          >
            {idx === 0 ? <span className="text-blue-500">▶</span> : <span className="text-slate-700">•</span>}
            <span>{entry}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
