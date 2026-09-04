import React, { useState } from 'react';
import { Layers, AlignLeft, Award, Plus, ArrowRight, ArrowDown, RotateCcw } from 'lucide-react';

interface Plate {
  id: string;
  name: string;
  icon: string;
}

interface Person {
  id: string;
  name: string;
  icon: string;
}

interface Hypothesis {
  id: string;
  text: string;
  probability: number;
}

export const Simulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'queue' | 'heap'>('stack');

  // Stack state
  const [stack, setStack] = useState<Plate[]>([
    { id: '1', name: 'Тарелка из-под пасты', icon: '🍝' },
    { id: '2', name: 'Тарелка из-под пиццы', icon: '🍕' },
    { id: '3', name: 'Блюдце от торта', icon: '🍰' },
  ]);
  const [popMessage, setPopMessage] = useState<string | null>(null);

  // Queue state
  const [queue, setQueue] = useState<Person[]>([
    { id: '1', name: 'Студент Вася', icon: '🧑‍🎓' },
    { id: '2', name: 'Голодный кодер', icon: '👨‍💻' },
    { id: '3', name: 'Кот Борис', icon: '🐱' },
  ]);
  const [dequeueMessage, setDequeueMessage] = useState<string | null>(null);

  // Heap state
  const [heap, setHeap] = useState<Hypothesis[]>([
    { id: '1', text: 'Кандидат: "Привет, я искусственный интеллект"', probability: 0.95 },
    { id: '2', text: 'Кандидат: "Привет, я испек вкусный торт"', probability: 0.42 },
    { id: '3', text: 'Кандидат: "Привет, я испанский инквизитор"', probability: 0.78 },
  ]);
  const [newCustomText, setNewCustomText] = useState('');
  const [newCustomProb, setNewCustomProb] = useState(0.85);
  const [heapMessage, setHeapMessage] = useState<string | null>(null);

  // Stack handlers
  const addPlate = () => {
    const presets = [
      { name: 'Сковорода от омлета', icon: '🍳' },
      { name: 'Кастрюля от супа', icon: '🍲' },
      { name: 'Чашка от кофе', icon: '☕' },
      { name: 'Миска с остатками салата', icon: '🥗' },
      { name: 'Тарелка от тако', icon: '🌮' },
    ];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    const newPlate = {
      id: Date.now().toString(),
      name: randomPreset.name,
      icon: randomPreset.icon
    };
    setStack(prev => [...prev, newPlate]);
    setPopMessage(`➕ Положили поверх стопки: ${newPlate.icon} ${newPlate.name}`);
  };

  const popPlate = () => {
    if (stack.length === 0) {
      setPopMessage("⚠️ Стопка пуста! Все тарелки вымыты.");
      return;
    }
    const topPlate = stack[stack.length - 1];
    setStack(prev => prev.slice(0, prev.length - 1));
    setPopMessage(`✨ Вымыта верхняя тарелка (LIFO): ${topPlate.icon} ${topPlate.name}`);
  };

  const resetStack = () => {
    setStack([
      { id: '1', name: 'Тарелка из-под пасты', icon: '🍝' },
      { id: '2', name: 'Тарелка из-под пиццы', icon: '🍕' },
      { id: '3', name: 'Блюдце от торта', icon: '🍰' },
    ]);
    setPopMessage("🔄 Стопка тарелок восстановлена.");
  };

  // Queue handlers
  const addPerson = () => {
    const presets = [
      { name: 'Любитель борща', icon: '🥣' },
      { name: 'Курьер доставки', icon: '🚴' },
      { name: 'Усталый админ', icon: '🧙' },
      { name: 'Турист с рюкзаком', icon: '🎒' },
    ];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    const newPerson = {
      id: Date.now().toString(),
      name: randomPreset.name,
      icon: randomPreset.icon
    };
    setQueue(prev => [...prev, newPerson]);
    setDequeueMessage(`➕ Встал в конец очереди: ${newPerson.icon} ${newPerson.name}`);
  };

  const servePerson = () => {
    if (queue.length === 0) {
      setDequeueMessage("⚠️ Очередь пуста! Суп ждет новых посетителей.");
      return;
    }
    const firstPerson = queue[0];
    setQueue(prev => prev.slice(1));
    setDequeueMessage(`🍲 Выдан суп первому в очереди (FIFO): ${firstPerson.icon} ${firstPerson.name}`);
  };

  const resetQueue = () => {
    setQueue([
      { id: '1', name: 'Студент Вася', icon: '🧑‍🎓' },
      { id: '2', name: 'Голодный кодер', icon: '👨‍💻' },
      { id: '3', name: 'Кот Борис', icon: '🐱' },
    ]);
    setDequeueMessage("🔄 Очередь восстановлена.");
  };

  // Heap handlers
  const addHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomText.trim()) return;
    const item: Hypothesis = {
      id: Date.now().toString(),
      text: `Кандидат: "${newCustomText}"`,
      probability: Number(newCustomProb)
    };
    setHeap(prev => [...prev, item]);
    setNewCustomText('');
    setHeapMessage(`➕ Добавлена гипотеза с вероятностью ${(item.probability * 100).toFixed(0)}%`);
  };

  const popHeap = () => {
    if (heap.length === 0) {
      setHeapMessage("⚠️ Куча пуста! Нет кандидатов для Beam Search.");
      return;
    }
    // Find highest probability
    let maxIdx = 0;
    for (let i = 1; i < heap.length; i++) {
      if (heap[i].probability > heap[maxIdx].probability) {
        maxIdx = i;
      }
    }
    const best = heap[maxIdx];
    setHeap(prev => prev.filter((_, idx) => idx !== maxIdx));
    setHeapMessage(`🚀 Выбран самый "тяжелый" кандидат: "${best.text}" (${(best.probability * 100).toFixed(0)}%)`);
  };

  const resetHeap = () => {
    setHeap([
      { id: '1', text: 'Кандидат: "Привет, я искусственный интеллект"', probability: 0.95 },
      { id: '2', text: 'Кандидат: "Привет, я испек вкусный торт"', probability: 0.42 },
      { id: '3', text: 'Кандидат: "Привет, я испанский инквизитор"', probability: 0.78 },
    ]);
    setHeapMessage("🔄 Гипотезы восстановлены.");
  };

  // Sorted heap for display (Max-Heap property view)
  const sortedHeap = [...heap].sort((a, b) => b.probability - a.probability);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl mb-20 backdrop-blur-sm">
      <div className="border-b border-slate-800 pb-6 mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-3">
          <span>🔬 Интерактивный симулятор структур данных</span>
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Проверь работу принципов LIFO, FIFO и Приоритетов на живых бытовых аналогиях из обучающего пособия!
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveTab('stack')}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            activeTab === 'stack'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className={`w-5 h-5 ${activeTab === 'stack' ? 'text-blue-400' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="font-bold text-sm text-white">Стек (Stack)</div>
              <div className="text-xs opacity-80">LIFO • Стопка тарелок</div>
            </div>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30 font-mono">
            DFS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            activeTab === 'queue'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlignLeft className={`w-5 h-5 ${activeTab === 'queue' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="font-bold text-sm text-white">Очередь (Queue)</div>
              <div className="text-xs opacity-80">FIFO • Очередь за супом</div>
            </div>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 font-mono">
            BFS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('heap')}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            activeTab === 'heap'
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Award className={`w-5 h-5 ${activeTab === 'heap' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div className="text-left">
              <div className="font-bold text-sm text-white">Куча (Heap)</div>
              <div className="text-xs opacity-80">Приоритеты • Beam Search</div>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-mono">
            Beam Search
          </span>
        </button>
      </div>

      {/* STACK TAB */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍽️ Симуляция стопки тарелок</span>
                <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">LIFO</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Новые тарелки ставятся наверх. Мыть можно только ту, что сверху.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={addPlate}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Поставить тарелку
              </button>
              <button
                onClick={popPlate}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-blue-300 border border-blue-500/40 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                ✨ Помыть верхнюю
              </button>
              <button
                onClick={resetStack}
                title="Сбросить"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {popMessage && (
            <div className="bg-blue-950/60 border border-blue-500/40 text-blue-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              {popMessage}
            </div>
          )}

          {/* Visualization */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
            {stack.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-5xl mb-3">🍽️✨</div>
                <p className="text-base font-bold">Стопка чиста!</p>
                <p className="text-xs mt-1">Добавьте грязные тарелки, чтобы протестировать LIFO.</p>
              </div>
            ) : (
              <div className="w-full max-w-sm flex flex-col items-center gap-2.5 pt-8 relative">
                <div className="absolute top-0 text-xs font-mono text-blue-400 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>ВЕРШИНА СТЕКА (TOP)</span>
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                </div>
                
                {/* Reversed map so top of stack is visually at the top */}
                {stack.slice().reverse().map((plate, index) => {
                  const isTop = index === 0;
                  return (
                    <div
                      key={plate.id}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isTop
                          ? 'bg-gradient-to-r from-blue-900/60 to-slate-800 border-blue-500 shadow-lg shadow-blue-500/20 translate-y-0 scale-102'
                          : 'bg-slate-900/90 border-slate-800/80 text-slate-400 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{plate.icon}</span>
                        <span className={`font-bold text-sm ${isTop ? 'text-white' : 'text-slate-300'}`}>
                          {plate.name}
                        </span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        isTop ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isTop ? 'Готово к помывке' : `Глубина: ${index}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-4 w-full text-center">
              ПОЛОЖИЛ ПОСЛЕДНЕЙ → ПОМЫЛ ПЕРВОЙ (LIFO) • ИСПОЛЬЗУЕТСЯ В DFS
            </div>
          </div>
        </div>
      )}

      {/* QUEUE TAB */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🍜 Симуляция очереди за супом</span>
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">FIFO</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Кто первым пришел, тот первым получил суп. Встать можно только в конец.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={addPerson}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Встать в очередь
              </button>
              <button
                onClick={servePerson}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-indigo-300 border border-indigo-500/40 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                🍲 Налить суп первому
              </button>
              <button
                onClick={resetQueue}
                title="Сбросить"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {dequeueMessage && (
            <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              {dequeueMessage}
            </div>
          )}

          {/* Visualization */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px] overflow-x-auto">
            {queue.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-5xl mb-3">🍲✨</div>
                <p className="text-base font-bold">Очередь пуста!</p>
                <p className="text-xs mt-1">Добавьте голодных посетителей, чтобы протестировать FIFO.</p>
              </div>
            ) : (
              <div className="w-full flex items-center gap-4 py-6 px-2 min-w-max">
                <div className="flex flex-col items-center gap-2 bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-2xl text-indigo-300">
                  <span className="text-3xl">🍲</span>
                  <span className="text-xs font-bold font-mono uppercase">Раздача супа</span>
                </div>
                
                <div className="text-indigo-500 flex items-center">
                  <ArrowRight className="w-6 h-6 animate-pulse" />
                </div>

                {queue.map((person, index) => {
                  const isFirst = index === 0;
                  return (
                    <div
                      key={person.id}
                      className={`flex flex-col items-center p-5 rounded-2xl border min-w-[150px] transition-all ${
                        isFirst
                          ? 'bg-gradient-to-b from-indigo-900/60 to-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105 relative'
                          : 'bg-slate-900/90 border-slate-800/80 text-slate-400 opacity-85'
                      }`}
                    >
                      {isFirst && (
                        <span className="absolute -top-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                          Первый (Head)
                        </span>
                      )}
                      <span className="text-4xl mb-2">{person.icon}</span>
                      <span className={`font-bold text-sm text-center mb-1 ${isFirst ? 'text-white' : 'text-slate-300'}`}>
                        {person.name}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isFirst ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isFirst ? 'Получает суп' : `В очереди: #${index + 1}`}
                      </span>
                    </div>
                  );
                })}

                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-2xl text-slate-600 min-w-[120px] h-[120px]">
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-mono uppercase">Конец (Tail)</span>
                </div>
              </div>
            )}
            <div className="mt-6 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-4 w-full text-center">
              ПЕРВЫМ ПРИШЕЛ → ПЕРВЫМ ПОЛУЧИЛ (FIFO) • ИСПОЛЬЗУЕТСЯ В BFS (ИДЕМ СЛОЯМИ)
            </div>
          </div>
        </div>
      )}

      {/* HEAP TAB */}
      {activeTab === 'heap' && (
        <div className="space-y-6">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏆 Приоритетная очередь / Куча</span>
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">Max-Heap</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Здесь не важно, кто пришел первым. Важно, у кого выше вероятность (кто «тяжелее»).
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={popHeap}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-colors cursor-pointer"
              >
                🚀 Взять кандидата с макс. вероятностью
              </button>
              <button
                onClick={resetHeap}
                title="Сбросить"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={addHypothesis} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Текст гипотезы (для Beam Search)</label>
              <input
                type="text"
                value={newCustomText}
                onChange={e => setNewCustomText(e.target.value)}
                placeholder='например: "Привет, я лучший студент"'
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                Вероятность: <span className="text-emerald-400 font-mono">{(newCustomProb * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={newCustomProb}
                onChange={e => setNewCustomProb(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer py-2"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={!newCustomText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer h-10"
              >
                <Plus className="w-4 h-4" /> Добавить в кучу
              </button>
            </div>
          </form>

          {heapMessage && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {heapMessage}
            </div>
          )}

          {/* Visualization */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
            {sortedHeap.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-base font-bold">Куча пуста!</p>
                <p className="text-xs mt-1">Добавьте гипотезы с вероятностями выше.</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2 pb-1 border-b border-slate-800">
                  <span>КАНДИДАТ / ГИПОТЕЗА</span>
                  <span>ВЕРОЯТНОСТЬ (ПРИОРИТЕТ)</span>
                </div>
                
                {sortedHeap.map((item, index) => {
                  const isTop = index === 0;
                  const percent = (item.probability * 100).toFixed(0);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isTop
                          ? 'bg-gradient-to-r from-emerald-900/50 via-slate-900 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${
                          isTop ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className={`font-bold text-sm ${isTop ? 'text-white' : 'text-slate-300'}`}>
                            {item.text}
                          </div>
                          {isTop && (
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded inline-block mt-1">
                              Вершина Кучи (Root) • Будет выбран первым
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Custom progress bar */}
                        <div className="hidden sm:block w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isTop ? 'bg-emerald-500' : 'bg-emerald-600/60'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className={`font-mono font-bold text-sm min-w-[50px] text-right ${
                          isTop ? 'text-emerald-400 text-base' : 'text-emerald-500/80'
                        }`}>
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 text-xs text-slate-500 font-mono border-t border-slate-800/80 pt-4 w-full text-center">
              НЕ ВАЖНО, КТО ПРИШЕЛ ПЕРВЫМ • ВАЖЕН САМЫЙ «ТЯЖЕЛЫЙ» • ИСПОЛЬЗУЕТСЯ В BEAM SEARCH
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
