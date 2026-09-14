import React, { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useVizRuntime, vizArray, vizString } from '../data/vizStepBus';

interface Customer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bubbleText: string;
  animState: 'in' | 'idle' | 'eating' | 'out';
}

const PRESETS = [
  { name: 'Студент Вася', emoji: '🧑‍🎓', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/40', bubbleText: 'Умираю от голода после матана!' },
  { name: 'Кодер Семён',   emoji: '👨‍💻', color: 'from-violet-500/20 to-violet-600/20 border-violet-500/40', bubbleText: 'Напишу ИИ за порцию борща!' },
  { name: 'Кот Борис',    emoji: '🐱', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/40', bubbleText: 'Мяу! Мне без сметаны, плиз.' },
  { name: 'Бабушка Люба',  emoji: '👵', color: 'from-rose-500/20 to-rose-600/20 border-rose-500/40', bubbleText: 'Внучок, налей погорячее!' },
  { name: 'Инопланетянин', emoji: '👽', color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40', bubbleText: 'Земной суп — топливо для нашего НЛО!' },
  { name: 'Бизнесмен',    emoji: '💼', color: 'from-slate-500/20 to-slate-600/20 border-slate-500/40', bubbleText: 'Инвестирую в суповые стартапы.' },
];

let counter = 3;

export const QueueViz: React.FC = () => {
  const [queue, setQueue] = useState<Customer[]>([
    { id: 'q1', name: 'Студент Вася', emoji: '🧑‍🎓', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/40', bubbleText: 'Умираю от голода после матана!', animState: 'idle' },
    { id: 'q2', name: 'Кодер Семён',   emoji: '👨‍💻', color: 'from-violet-500/20 to-violet-600/20 border-violet-500/40', bubbleText: 'Напишу ИИ за порцию борща!', animState: 'idle' },
    { id: 'q3', name: 'Кот Борис',    emoji: '🐱', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/40', bubbleText: 'Мяу! Мне без сметаны, плиз.', animState: 'idle' },
  ]);

  const runtime = useVizRuntime();
  const liveQ = vizArray(runtime?.variables?.q);
  const liveV = vizString(runtime?.variables?.v);
  const displayQueue: Customer[] = liveQ
    ? liveQ.map((value, index) => ({
        id: `python-${index}`,
        name: String(value),
        emoji: "🔢",
        color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/50",
        bubbleText: `q[${index}] из Python`,
        animState: "idle",
      }))
    : queue;

  const [servedHistory, setServedHistory] = useState<string[]>([]);
  const [isServing, setIsServing]         = useState(false);
  const [shakeEmpty, setShake]            = useState(false);
  const [log, setLog]                     = useState<string[]>(['🍲 Повар ждет гостей! Нажми ENQUEUE, чтобы позвать голодных.']);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

  // ENQUEUE: Встать в конец очереди (хвост / Tail)
  const enqueue = useCallback(() => {
    if (isServing) return;
    if (queue.length >= 6) {
      addLog('⚠ Хвост очереди уже на улице, повару тяжело справляться!');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const preset = PRESETS[counter % PRESETS.length];
    counter++;

    const newGuest: Customer = {
      id: Date.now().toString(),
      ...preset,
      animState: 'in',
    };

    setQueue(prev => [...prev, newGuest]);
    addLog(`➡ ENQUEUE: ${newGuest.name} ${newGuest.emoji} встал в конец очереди (Tail).`);

    setTimeout(() => {
      setQueue(prev => prev.map(c => c.id === newGuest.id ? { ...c, animState: 'idle' } : c));
    }, 450);
  }, [queue, isServing]);

  // DEQUEUE: Выдать суп первому (голова / Head, FIFO)
  const dequeue = useCallback(() => {
    if (isServing) return;
    if (queue.length === 0) {
      setShake(true);
      addLog('⚠ DEQUEUE: В очереди никого нет! Повар скучает.');
      setTimeout(() => setShake(false), 400);
      return;
    }

    setIsServing(true);
    const headGuest = queue[0];

    addLog(`🍲 DEQUEUE: Повар наливает суп первому — ${headGuest.name} ${headGuest.emoji} (Принцип FIFO!)`);

    // Step 1: Head guest gets eating animation
    setQueue(prev => prev.map((c, idx) => idx === 0 ? { ...c, animState: 'eating', bubbleText: 'О боже, как вкусно! 🥣😋' } : c));
    
    setTimeout(() => {
      // Step 2: Guest leaves with happy face, queue shifts
      setQueue(prev => prev.map((c, idx) => idx === 0 ? { ...c, animState: 'out' } : c));

      setServedHistory(prev => [`${headGuest.emoji} ${headGuest.name} поел`, ...prev].slice(0, 5));

      setTimeout(() => {
        setQueue(prev => prev.slice(1));
        setIsServing(false);
        addLog(`✨ ${headGuest.name} поел и ушел сытым. Очередь сдвинулась вперед.`);
      }, 400);
    }, 900);
  }, [queue, isServing]);

  const reset = () => {
    counter = 3;
    setQueue([
      { id: 'r1', name: 'Студент Вася', emoji: '🧑‍🎓', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/40', bubbleText: 'Умираю от голода после матана!', animState: 'in' },
      { id: 'r2', name: 'Кодер Семён',   emoji: '👨‍💻', color: 'from-violet-500/20 to-violet-600/20 border-violet-500/40', bubbleText: 'Напишу ИИ за порцию борща!', animState: 'in' },
      { id: 'r3', name: 'Кот Борис',    emoji: '🐱', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/40', bubbleText: 'Мяу! Мне без сметаны, плиз.', animState: 'in' },
    ]);
    setServedHistory([]);
    setIsServing(false);
    setLog(['🔄 Столовая сброшена. Снова голодная толпа!']);
    setTimeout(() => {
      setQueue(prev => prev.map(c => ({ ...c, animState: 'idle' })));
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* МНЕМОНИКА / ПРАВИЛО */}
      <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="text-3xl">🍜</div>
        <div>
          <h3 className="font-black text-indigo-400 text-sm uppercase tracking-wider">Мнемоника: Очередь за супом (FIFO)</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            В очереди за супом всё честно. Кто первый встал в очередь, тот первым получает тарелку и сытым уходит (FIFO). 
            Новые гости встают строго <b>в конец</b> очереди (ENQUEUE), а обслуживают всегда только <b>первого</b> (DEQUEUE). 
            Здесь нет обхода и блата — только строгий порядок обработки!
          </p>
        </div>
      </div>

      {/* УПРАВЛЕНИЕ */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={enqueue}
          disabled={isServing}
          className="flex-1 min-w-[150px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>➕ Встать в очередь (ENQUEUE)</span>
        </button>

        <button
          onClick={dequeue}
          disabled={isServing || queue.length === 0}
          className="flex-1 min-w-[150px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🍲 Налить суп первому (DEQUEUE)</span>
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
        
        {/* ЛЕВАЯ КОЛОНКА: ОЧЕРЕДЬ ЗА СУПОМ */}
        <div className={`md:col-span-9 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative min-h-[300px] overflow-hidden ${shakeEmpty ? 'anim-shake' : ''}`}>
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Очередь голодных гостей (Буфер FIFO / BFS)
            {liveQ && <span className="ml-2 text-emerald-400">q из Python{liveV ? ` · v=${liveV}` : ""}</span>}
          </div>

          <div className="flex-1 flex flex-col justify-end pb-4 pt-12">
            <div className="flex items-end justify-between gap-4">
              
              {/* ПОВАРИХА И КОТЕЛ С СУПОМ */}
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div className="relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col gap-1 pointer-events-none">
                    <div className="w-1.5 h-6 bg-slate-400/20 rounded-full anim-steam"></div>
                    <div className="w-2 h-4 bg-slate-400/30 rounded-full anim-steam delay-75"></div>
                  </div>
                  <span className="text-5xl block animate-bounce">🍲</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl block">👨‍🍳</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                    ПОВАР
                  </span>
                </div>
              </div>

              {/* РАЗДЕЛИТЕЛЬНАЯ СТРЕЛКА */}
              <div className="flex flex-col items-center justify-center text-slate-700 py-6">
                <span className="text-2xl animate-pulse">◀</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">Раздача</span>
              </div>

              {/* СПИСОК ОЧЕРЕДИ */}
              <div className="flex-1 flex items-end gap-3 overflow-x-auto pb-1 justify-start">
                {displayQueue.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-600">
                    <span className="text-4xl mb-1">😴</span>
                    <p className="text-xs font-bold font-mono uppercase">Очередь пуста</p>
                    <p className="text-[10px]">Все сыты и счастливы!</p>
                  </div>
                ) : (
                  displayQueue.map((customer, idx) => {
                    const isHead = idx === 0;
                    const isTail = idx === displayQueue.length - 1;
                    return (
                      <div
                        key={customer.id}
                        className={`
                          flex flex-col items-center gap-2 flex-shrink-0 relative transition-all duration-300
                          ${customer.animState === 'in' ? 'anim-walk-in' : ''}
                          ${customer.animState === 'eating' ? 'scale-110 z-20' : ''}
                          ${customer.animState === 'out' ? 'anim-eat-go' : ''}
                        `}
                      >
                        {/* Облачко мыслей */}
                        <div className={`
                          absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-950 border text-[9px] px-2.5 py-1.5 rounded-xl shadow-lg w-28 text-center text-slate-200 leading-tight z-30 transition-opacity duration-300 pointer-events-none
                          ${isHead ? 'opacity-100 border-amber-500' : 'opacity-0 group-hover:opacity-100 border-slate-800'}
                        `}>
                          <div className="font-bold text-amber-400 mb-0.5">{customer.name}:</div>
                          {customer.bubbleText}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-inherit rotate-45"></div>
                        </div>

                        {/* Персонаж */}
                        <div className={`
                          w-14 h-14 rounded-2xl border-2 bg-gradient-to-b flex flex-col items-center justify-center shadow-md select-none relative
                          ${customer.color}
                          ${isHead ? 'ring-4 ring-amber-500/50 border-amber-400 scale-105' : 'opacity-85'}
                        `}>
                          <span className="text-3xl">{customer.emoji}</span>
                          
                          {/* Индексы HEAD/TAIL */}
                          {(isHead || isTail) && (
                            <span className={`
                              absolute -bottom-2 text-[8px] px-1.5 py-0.25 rounded font-mono font-black uppercase
                              ${isHead ? 'bg-amber-500 text-slate-950' : 'bg-indigo-500 text-slate-950'}
                            `}>
                              {isHead && isTail ? 'h+t' : isHead ? 'head' : 'tail'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* Пол кухни */}
          <div className="w-full h-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-inner" />
        </div>

        {/* ПРАВАЯ КОЛОНКА: СЫТЫЕ И ДОВОЛЬНЫЕ */}
        <div className="md:col-span-3 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Сытые гости (Архив FIFO)
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1 text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/80 text-[9px] font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>СЫТЫ ✨</span>
          </div>

          <div className="flex-1 flex flex-col justify-end items-center pb-4 pt-12 gap-2">
            {servedHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600">
                <span className="text-5xl mb-2">🥣</span>
                <p className="text-xs font-bold font-mono uppercase">Все голодны</p>
                <p className="text-[10px] mt-1">Здесь будут те, кто вкусно поел после DEQUEUE</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full items-center">
                {servedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full py-1.5 px-3 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900 flex items-center gap-2 text-[11px] text-emerald-300 font-mono shadow-sm"
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Пол */}
          <div className="w-full h-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-inner" />
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
            {idx === 0 ? <span className="text-indigo-500">▶</span> : <span className="text-slate-700">•</span>}
            <span>{entry}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
