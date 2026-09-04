import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  emoji: string;
  symptom: string;
  priority: number; // 1 to 99 (Severity)
  animState: 'in' | 'idle' | 'winner' | 'out';
}

// Max-heap helpers for Patients
function siftUp(arr: Patient[]): Patient[] {
  const a = arr.map(x => ({ ...x }));
  let idx = a.length - 1;
  while (idx > 0) {
    const parent = Math.floor((idx - 1) / 2);
    if (a[parent].priority < a[idx].priority) {
      [a[parent], a[idx]] = [a[idx], a[parent]];
      idx = parent;
    } else break;
  }
  return a;
}

function siftDown(arr: Patient[]): Patient[] {
  const a = arr.map(x => ({ ...x }));
  const n = a.length;
  let idx = 0;
  while (true) {
    let largest = idx;
    const l = 2 * idx + 1;
    const r = 2 * idx + 2;
    if (l < n && a[l].priority > a[largest].priority) largest = l;
    if (r < n && a[r].priority > a[largest].priority) largest = r;
    if (largest !== idx) {
      [a[largest], a[idx]] = [a[idx], a[largest]];
      idx = largest;
    } else break;
  }
  return a;
}

function heapInsert(arr: Patient[], item: Patient): Patient[] {
  return siftUp([...arr, { ...item }]);
}

// Position in tree layout
function nodePos(index: number): { x: number; y: number } {
  const level = Math.floor(Math.log2(index + 1));
  const posInLevel = index - (Math.pow(2, level) - 1);
  const count = Math.pow(2, level);
  const x = ((posInLevel + 0.5) / count) * 100;
  const y = 10 + level * 24;
  return { x, y };
}

// Priority presets for realistic ER scenarios
const PATIENT_PRESETS = [
  { name: 'Иван (Инфаркт)', symptom: '💔 Болит сердце', emoji: '👴', priority: 99 },
  { name: 'Маша (Перелом)', symptom: '🦴 Открытый перелом', emoji: '👩', priority: 75 },
  { name: 'Кот Барсик (Укус)', symptom: '🐱 Укусил шмель', emoji: '🐈', priority: 40 },
  { name: 'Семён (Температура)', symptom: '🌡️ Жар 39.5', emoji: '👨', priority: 65 },
  { name: 'Оля (Порез)', symptom: '🩹 Глубокий порез', emoji: '👧', priority: 30 },
  { name: 'Пётр (Кашель)', symptom: '🤧 Простуда', emoji: '🧔', priority: 15 },
];

const INITIAL_PATIENTS: Patient[] = (() => {
  let arr: Patient[] = [];
  const start = [
    { name: 'Иван (Инфаркт)', symptom: '💔 Болит сердце', emoji: '👴', priority: 95 },
    { name: 'Маша (Перелом)', symptom: '🦴 Открытый перелом', emoji: '👩', priority: 72 },
    { name: 'Семён (Температура)', symptom: '🌡️ Жар 39.5', emoji: '👨', priority: 88 },
    { name: 'Кот Барсик (Укус)', symptom: '🐱 Укусил шмель', emoji: '🐈', priority: 45 },
    { name: 'Оля (Порез)', symptom: '🩹 Глубокий порез', emoji: '👧', priority: 61 },
    { name: 'Пётр (Кашель)', symptom: '🤧 Простуда', emoji: '🧔', priority: 30 },
  ];
  start.forEach((p, i) => {
    arr = heapInsert(arr, { id: `init${i}`, ...p, animState: 'idle' });
  });
  return arr;
})();

let uid = 300;

export const HeapViz: React.FC = () => {
  const [heap, setHeap]                 = useState<Patient[]>(INITIAL_PATIENTS);
  const [customName, setCustomName]     = useState('');
  const [customPriority, setCustomPriority] = useState(50);
  const [log, setLog]                   = useState<string[]>(['🚑 Скорая помощь везёт пациентов! Нажми INSERT или EXTRACT.']);
  const [shakeEmpty, setShake]          = useState(false);
  const [busy, setBusy]                 = useState(false);
  const [healingPatient, setHealing]    = useState<Patient | null>(null);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

  // --- INSERT: Новый пациент поступает в приемный покой ---
  const insertPatient = useCallback((name: string, priority: number) => {
    if (busy || heap.length >= 15) {
      addLog('⚠ Все палаты переполнены! Дождитесь выписки.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setBusy(true);

    const preset = PATIENT_PRESETS[Math.floor(Math.random() * PATIENT_PRESETS.length)];
    const finalName = name || preset.name.split(' ')[0];
    const finalEmoji = preset.emoji;
    const finalSymptom = preset.symptom;

    const newPatient: Patient = {
      id: `p${uid++}`,
      name: finalName,
      emoji: finalEmoji,
      symptom: finalSymptom,
      priority,
      animState: 'in',
    };

    const nextHeap = heapInsert(heap, newPatient).map(x => ({ ...x, animState: 'idle' as const }));
    // Mark specifically this new patient as 'in' in the final tree
    const target = nextHeap.find(x => x.priority === priority && heap.every(h => h.id !== x.id));
    const marked = nextHeap.map(x => x.id === (target?.id ?? newPatient.id) ? { ...x, animState: 'in' as const } : x);

    setHeap(marked);
    addLog(`🚑 Поступил пациент: ${finalName} с тяжестью ${priority}% (${finalSymptom}). Размещаем в кучу.`);

    setTimeout(() => {
      setHeap(nextHeap);
      setBusy(false);
    }, 500);
  }, [busy, heap]);

  const handleRandomInsert = () => {
    const preset = PATIENT_PRESETS[Math.floor(Math.random() * PATIENT_PRESETS.length)];
    const randomShift = Math.floor(Math.random() * 10) - 5; // slight variance
    const prio = Math.max(10, Math.min(99, preset.priority + randomShift));
    insertPatient(preset.name, prio);
  };

  const handleCustomInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    insertPatient(customName, customPriority);
    setCustomName('');
  };

  // --- EXTRACT MAX: Направить самого тяжелого в реанимацию ---
  const extractMax = useCallback(() => {
    if (busy || heap.length === 0) {
      setShake(true);
      addLog('⚠ Нет пациентов для экстренной госпитализации!');
      setTimeout(() => setShake(false), 400);
      return;
    }
    setBusy(true);
    const topPatient = heap[0];
    setHealing(topPatient);

    addLog(`🚨 СРОЧНО! Забираем самого тяжелого: ${topPatient.name} (Тяжесть: ${topPatient.priority}%).`);

    // Step 1: Root lights up as winner
    setHeap(prev => prev.map((x, i) => i === 0 ? { ...x, animState: 'winner' } : x));

    setTimeout(() => {
      // Step 2: Root exits the tree, tree reorganizes
      setHeap(prev => prev.map((x, i) => i === 0 ? { ...x, animState: 'out' } : x));

      setTimeout(() => {
        // Run binary heap extraction
        setHeap(prev => {
          if (prev.length === 0) return [];
          const a = prev.map(x => ({ ...x }));
          a[0] = { ...a[a.length - 1] };
          a.pop();
          return siftDown(a).map(x => ({ ...x, animState: 'idle' }));
        });

        // Patient gets healed in the bed
        setTimeout(() => {
          setHealing(prev => prev ? { ...prev, animState: 'out', priority: 0 } : null);
          addLog(`✨ Успех! Пациент ${topPatient.name} прооперирован, его состояние стабилизировано.`);
          setTimeout(() => {
            setHealing(null);
            setBusy(false);
          }, 600);
        }, 800);

      }, 350);
    }, 650);
  }, [busy, heap]);

  const reset = () => {
    setHeap(INITIAL_PATIENTS.map(x => ({ ...x, animState: 'in' })));
    setLog(['🔄 База данных скорой помощи перезагружена.']);
    setHealing(null);
    setTimeout(() => setHeap(INITIAL_PATIENTS.map(x => ({ ...x, animState: 'idle' }))), 500);
  };

  // --- Render binary tree lines ---
  const edges = heap.flatMap((_, idx) => {
    const res: React.ReactElement[] = [];
    const p = nodePos(idx);
    const l = 2 * idx + 1;
    const r = 2 * idx + 2;
    if (l < heap.length) {
      const lp = nodePos(l);
      res.push(
        <line key={`el${idx}`}
          x1={`${p.x}%`} y1={`${p.y + 4}%`}
          x2={`${lp.x}%`} y2={`${lp.y - 4}%`}
          stroke="#475569" strokeWidth="2"
        />
      );
    }
    if (r < heap.length) {
      const rp = nodePos(r);
      res.push(
        <line key={`er${idx}`}
          x1={`${p.x}%`} y1={`${p.y + 4}%`}
          x2={`${rp.x}%`} y2={`${rp.y - 4}%`}
          stroke="#475569" strokeWidth="2"
        />
      );
    }
    return res;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* МНЕМОНИКА / ПРАВИЛО */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="text-3xl">🏥</div>
        <div>
          <h3 className="font-black text-emerald-400 text-sm uppercase tracking-wider">Мнемоника: Приемный покой реанимации (Heap / Priority Queue)</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            В реанимации не важно, кто пришел раньше, а кто позже. На операционный стол первым отправляется тот, у кого <b>самое тяжелое состояние</b> (максимальный приоритет). 
            Куча (Heap) автоматически перестраивает пациентов так, чтобы самый критический (например, инфаркт 💔 с приоритетом 99) всегда оказывался на самом верху дерева (в корне).
          </p>
        </div>
      </div>

      {/* УПРАВЛЕНИЕ */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        
        {/* Добавить случайного */}
        <button
          onClick={handleRandomInsert}
          disabled={busy || heap.length >= 15}
          className="flex-1 min-w-[150px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🚑 Привезти по Скорой (INSERT)</span>
        </button>

        {/* Добавить кастомного */}
        <form onSubmit={handleCustomInsert} className="flex items-center gap-2 flex-1 min-w-[300px]">
          <input
            type="text"
            required
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Имя пациента"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
          />
          <div className="flex flex-col items-center min-w-[90px]">
            <span className="text-[9px] font-mono text-emerald-400 font-bold">Тяжесть: {customPriority}%</span>
            <input
              type="range"
              min="10"
              max="99"
              value={customPriority}
              onChange={e => setCustomPriority(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !customName.trim() || heap.length >= 15}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Везти
          </button>
        </form>

        {/* Забрать самого тяжелого */}
        <button
          onClick={extractMax}
          disabled={busy || heap.length === 0}
          className="flex-1 min-w-[170px] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base py-3.5 rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🛌 В реанимацию (EXTRACT MAX)</span>
        </button>

        <button
          onClick={reset}
          className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all active:scale-95 cursor-pointer border border-slate-700"
        >
          Сброс
        </button>
      </div>

      {/* ИНТЕРАКТИВНОЕ ОТДЕЛЕНИЕ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ЛЕВАЯ КОЛОНКА: ДЕРЕВО ПАЦИЕНТОВ */}
        <div className={`lg:col-span-8 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative min-h-[380px] overflow-hidden ${shakeEmpty ? 'anim-shake' : ''}`}>
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Сортировка по тяжести (Двоичная куча / Max-Heap)
          </div>

          <div className="relative w-full h-full min-h-[300px] mt-8">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges}
            </svg>

            {heap.map((patient, idx) => {
              const pos = nodePos(idx);
              const isRoot = idx === 0;
              return (
                <div
                  key={patient.id}
                  className={`
                    absolute flex flex-col items-center justify-center rounded-2xl border-2 shadow-xl select-none group cursor-help
                    -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                    ${patient.animState === 'in' ? 'anim-patient-in' : ''}
                    ${patient.animState === 'winner' ? 'anim-winner-glow ring-4 ring-emerald-400' : ''}
                    ${patient.animState === 'out' ? 'anim-heal-exit' : ''}
                    ${isRoot ? 'bg-rose-950/80 border-rose-500/80 scale-110 z-20' : 'bg-slate-950/90 border-slate-800'}
                  `}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: isRoot ? 60 : 52,
                    height: isRoot ? 60 : 52,
                  }}
                >
                  <span className="text-2xl leading-none">{patient.emoji}</span>
                  <span className="text-[10px] font-mono font-black text-white mt-0.5">
                    {patient.priority}%
                  </span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
                    <div className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-1.5 rounded-lg w-32 text-center text-slate-300 shadow-xl">
                      <div className="font-bold text-white">{patient.name}</div>
                      <div className="text-emerald-400">{patient.symptom}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full h-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-inner" />
        </div>

        {/* ПРАВАЯ КОЛОНКА: ОПЕРАЦИОННЫЙ СТОЛ */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 flex flex-col justify-between relative">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Операционная койка 🛌
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-12">
            {healingPatient ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <span className="text-6xl block anim-heartbeat">🛌</span>
                  <span className="absolute -top-4 -right-4 text-4xl anim-crown-bounce">✨</span>
                  <span className="absolute -bottom-2 -left-2 text-3xl">🩺</span>
                </div>
                <div>
                  <h4 className="text-white font-black text-lg flex items-center gap-1.5 justify-center">
                    <span>Пациент: {healingPatient.name}</span>
                  </h4>
                  <p className="text-emerald-400 text-xs font-bold mt-1">
                    Состояние: Стабилизация ({healingPatient.priority}%)
                  </p>
                  <div className="flex justify-center gap-1 mt-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-600">
                <span className="text-5xl mb-2 block">🩺</span>
                <p className="text-xs font-bold font-mono uppercase">Койка свободна</p>
                <p className="text-[10px] mt-1">Ждём самого тяжелого пациента (EXTRACT MAX)</p>
              </div>
            )}
          </div>

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
            {idx === 0 ? <span className="text-emerald-500">▶</span> : <span className="text-slate-700">•</span>}
            <span>{entry}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
