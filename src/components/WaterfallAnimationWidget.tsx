import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Play, GitBranch } from 'lucide-react';

// Структура заранее подготовленного красивого бора для анимации водопада
// Словарь: ["HE", "SHE", "HIS", "HERS"]
interface WNode {
  id: number;
  label: string; // путь от корня
  char: string;
  x: number; // Координаты для SVG водопада
  y: number;
  depth: number;
  fail: number;
  term_link: number;
  is_terminal: boolean;
  words: string[];
}

const WATERFALL_NODES: { [key: number]: WNode } = {
  0: { id: 0, label: 'ROOT', char: '∅', x: 400, y: 60, depth: 0, fail: 0, term_link: 0, is_terminal: false, words: [] },
  // Ветка H -> E -> R -> S
  1: { id: 1, label: 'H', char: 'H', x: 280, y: 160, depth: 1, fail: 0, term_link: 0, is_terminal: false, words: [] },
  2: { id: 2, label: 'HE', char: 'E', x: 200, y: 260, depth: 2, fail: 0, term_link: 0, is_terminal: true, words: ['HE'] },
  3: { id: 3, label: 'HER', char: 'R', x: 150, y: 360, depth: 3, fail: 0, term_link: 0, is_terminal: false, words: [] },
  4: { id: 4, label: 'HERS', char: 'S', x: 100, y: 460, depth: 4, fail: 7, term_link: 0, is_terminal: true, words: ['HERS'] },
  // Ветка H -> I -> S
  5: { id: 5, label: 'HI', char: 'I', x: 350, y: 260, depth: 2, fail: 0, term_link: 0, is_terminal: false, words: [] },
  6: { id: 6, label: 'HIS', char: 'S', x: 320, y: 360, depth: 3, fail: 7, term_link: 0, is_terminal: true, words: ['HIS'] },
  // Ветка S -> H -> E
  7: { id: 7, label: 'S', char: 'S', x: 550, y: 160, depth: 1, fail: 0, term_link: 0, is_terminal: false, words: [] },
  8: { id: 8, label: 'SH', char: 'H', x: 580, y: 260, depth: 2, fail: 1, term_link: 0, is_terminal: false, words: [] },
  9: { id: 9, label: 'SHE', char: 'E', x: 610, y: 360, depth: 3, fail: 2, term_link: 2, is_terminal: true, words: ['SHE'] }, // term_link = 2 (HE)
};

// Нормальные переходы бора
const TRIE_TRANSITIONS: { [key: number]: { [char: string]: number } } = {
  0: { H: 1, S: 7 },
  1: { E: 2, I: 5 },
  2: { R: 3 },
  3: { S: 4 },
  4: {},
  5: { S: 6 },
  6: {},
  7: { H: 8 },
  8: { E: 9 },
  9: {},
};

export const WaterfallAnimationWidget: React.FC = () => {
  // Переключатель режимов: 'training' (Полный BFS обход) или 'search' (поиск в тексте)
  const [activeMode, setActiveMode] = useState<'training' | 'search'>('training');

  // === СОСТОЯНИЯ РЕЖИМА ПОИСКА (SEARCH) ===
  const [textToScan, setTextToScan] = useState<string>('USHERS');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentNode, setCurrentNode] = useState<number>(0);
  const [isSearchDone, setIsSearchDone] = useState<boolean>(false);
  const [searchLog, setSearchLog] = useState<string>(
    'Режим поиска: Введите текст и жмите «Следующий шаг», чтобы увидеть, как лосось плывет по водопаду.'
  );
  const [jumpPath, setJumpPath] = useState<{ from: number; to: number; type: 'normal' | 'fail' } | null>(null);
  const [foundMatches, setFoundMatches] = useState<{ index: number; word: string }[]>([]);
  const [activeSearchCodeLine, setActiveSearchCodeLine] = useState<number>(1);

  // === СОСТОЯНИЯ РЕЖИМА ОБУЧЕНИЯ (TRAINING) ===
  // Шаги обучения от 0 до 8 (по числу вершин в боре, исключая корень)
  const [trainStep, setTrainStep] = useState<number>(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setTextToScan(clean);
    resetSearchSimulation();
  };

  const resetSearchSimulation = () => {
    setCurrentIndex(0);
    setCurrentNode(0);
    setIsSearchDone(false);
    setSearchLog('Симуляция сброшена. Лосось вернулся на вершину водопада (Корень).');
    setJumpPath(null);
    setFoundMatches([]);
    setActiveSearchCodeLine(1);
  };

  const stepSearchSimulation = () => {
    if (currentIndex >= textToScan.length) {
      setIsSearchDone(true);
      setSearchLog('Мы проплыли весь текст! Лосось доволен и наелся найденными словами. 🍣');
      setActiveSearchCodeLine(4);
      return;
    }

    const char = textToScan[currentIndex];
    let curr = currentNode;
    let logMsg = `[Символ '${char}'] `;

    let jumpType: 'normal' | 'fail' | null = null;
    void jumpType;
    let originalCurr = curr;

    if (TRIE_TRANSITIONS[curr][char] !== undefined) {
      const nextNode = TRIE_TRANSITIONS[curr][char];
      logMsg += `У русла #${curr} (${WATERFALL_NODES[curr].label}) есть чистый поток по '${char}'. Плывем вниз к #${nextNode} (${WATERFALL_NODES[nextNode].label}). `;
      setJumpPath({ from: curr, to: nextNode, type: 'normal' });
      curr = nextNode;
      setActiveSearchCodeLine(3);
    } else {
      setActiveSearchCodeLine(2);
      let jumps = 0;
      while (curr !== 0 && TRIE_TRANSITIONS[curr][char] === undefined) {
        curr = WATERFALL_NODES[curr].fail;
        jumps++;
      }
      const nextNode = TRIE_TRANSITIONS[curr][char] ?? 0;
      if (originalCurr === 0) {
        logMsg += `В корне нет перехода по '${char}'. Лосось остается в корне и ждет следующую букву. `;
        setJumpPath(null);
      } else {
        logMsg += `Поток по '${char}' у вершины #${originalCurr} (${WATERFALL_NODES[originalCurr].label}) заблокирован! Лосось совершает прыжок по fail-ссылке в #${curr} (${WATERFALL_NODES[curr].label}) и переходит в #${nextNode} (${WATERFALL_NODES[nextNode].label}). `;
        setJumpPath({ from: originalCurr, to: nextNode, type: 'fail' });
      }
      curr = nextNode;
    }

    const currentMatches: { index: number; word: string }[] = [];
    const matchedWordsForLog: string[] = [];
    
    let temp = curr;
    while (temp !== 0) {
        if (WATERFALL_NODES[temp].is_terminal) {
            WATERFALL_NODES[temp].words.forEach((word) => {
                currentMatches.push({ index: currentIndex, word });
                matchedWordsForLog.push(word);
            });
        }
        temp = WATERFALL_NODES[temp].term_link;
    }

    if (matchedWordsForLog.length > 0) {
      logMsg += `🎉 БИНГО! Найдено слово: ${matchedWordsForLog.join(', ')}! `;
      setActiveSearchCodeLine(4);
    }

    setCurrentNode(curr);
    setCurrentIndex(currentIndex + 1);
    setSearchLog(logMsg);
    if (currentMatches.length > 0) {
      setFoundMatches((prev) => [...prev, ...currentMatches]);
    }
  };

  // ПОЛНАЯ ПОШАГОВАЯ ИНФОРМАЦИЯ О ПОСТРОЕНИИ ДЕРЕВА (BFS В ПОЛНОМ ОБЪЕМЕ)
  const TRAINING_STEPS_INFO = [
    {
      targetNodeId: 0,
      title: 'Шаг 0 (Depth 0): Вершина #0 (ROOT)',
      desc: 'Начало алгоритма BFS. Корень (ROOT) не обрабатывается через обычный цикл подъема fail, так как он не имеет родителя. Его дочерние вершины сразу инициализируются с fail = ROOT и добавляются в очередь.',
      codeLine: 1,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: '∅',
      checkingBranchesFrom: null,
    },
    {
      targetNodeId: 1,
      title: 'Шаг 1 (Depth 1): Вершина #1 (H)',
      desc: 'Мы обрабатываем первую вершину из очереди — #1 (H) на Depth 1. Поскольку ее родитель — корень (ROOT), суффикса меньшей длины просто не существует. fail[H] автоматически направляется в ROOT (0).',
      codeLine: 5,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'H',
      checkingBranchesFrom: null,
    },
    {
      targetNodeId: 7,
      title: 'Шаг 2 (Depth 1): Вершина #7 (S)',
      desc: 'Обрабатываем дочернюю вершину #7 (S) на Depth 1. Аналогично, прямой потомок корня автоматически получает fail[S] = ROOT (0).',
      codeLine: 5,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'S',
      checkingBranchesFrom: null,
    },
    {
      targetNodeId: 2,
      title: 'Шаг 3 (Depth 2): Вершина #2 (HE)',
      desc: 'Переходим на Depth 2 к вершине #2 (HE). Родитель #1 (H), символ char = "E". Смотрим на fail родителя: fail[H] = ROOT (0). Рыба-разведчик плывет в ROOT и ищет ветку по "E". В корне есть ветки "H" и "S" (обе != "E"). Ветки нет, fail[HE] = ROOT.',
      codeLine: 3,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'E',
      checkingBranchesFrom: 0,
    },
    {
      targetNodeId: 5,
      title: 'Шаг 4 (Depth 2): Вершина #5 (HI)',
      desc: 'Обрабатываем #5 (HI) на Depth 2. Родитель #1 (H), char = "I". fail[H] = ROOT. Рыба плывет в ROOT и ищет ветку по "I". Ветки "H" и "S" не подходят. Ветки нет, fail[HI] = ROOT.',
      codeLine: 3,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'I',
      checkingBranchesFrom: 0,
    },
    {
      targetNodeId: 8,
      title: 'Шаг 5 (Depth 2): Вершина #8 (SH) — КАК СТРОИТСЯ SH → H!',
      desc: '🔥 ВАЖНЫЙ ВОПРОС! Обрабатываем #8 (SH) на Depth 2. Родитель #7 (S), символ char = "H". Берем fail[S], который ведет в ROOT (0). Рыба плывет в ROOT и ищет ветку "H". У корня ЕСТЬ ветка "H" → #1 (H)! Условие if выполнилось: fail[SH] = #1 (H). Так мы связали суффикс "H"!',
      codeLine: 4,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'H',
      checkingBranchesFrom: 0,
    },
    {
      targetNodeId: 3,
      title: 'Шаг 6 (Depth 3): Вершина #3 (HER)',
      desc: 'Переходим на Depth 3 к #3 (HER). Родитель #2 (HE), char = "R". fail[HE] = ROOT. Рыба в ROOT ищет ветку "R". Ветки "H" и "S" не подходят. fail[HER] = ROOT.',
      codeLine: 3,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'R',
      checkingBranchesFrom: 0,
    },
    {
      targetNodeId: 6,
      title: 'Шаг 7 (Depth 3): Вершина #6 (HIS)',
      desc: 'Обрабатываем #6 (HIS) на Depth 3. Родитель #5 (HI), char = "S". fail[HI] = ROOT. Рыба в ROOT ищет ветку "S". Ветка "H" мимо, но ветка "S" → #7 (S) совпадает! fail[HIS] = #7 (S).',
      codeLine: 4,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'S',
      checkingBranchesFrom: 0,
    },
    {
      targetNodeId: 9,
      title: 'Шаг 8 (Depth 3): Вершина #9 (SHE) — КАК СТРОИТСЯ SHE → HE!',
      desc: '🔥 МАГИЯ АХО-КОРАСИК! Обрабатываем #9 (SHE) на Depth 3. Родитель #8 (SH), char = "E". Вспоминаем Шаг 5: fail[SH] = #1 (H). Рыба плывет в #1 (H) и ищет ветку "E". У вершины #1 (H) есть ветки "I" → HI (❌) и "E" → HE (✅)! fail[SHE] = #2 (HE).',
      codeLine: 4,
      scoutPos: 1,
      inspectedParentFail: 1,
      checkTargetChar: 'E',
      checkingBranchesFrom: 1,
    },
    {
      targetNodeId: 4,
      title: 'Шаг 9 (Depth 4): Вершина #4 (HERS)',
      desc: 'Финальная вершина #4 (HERS) на Depth 4. Родитель #3 (HER), char = "S". fail[HER] = ROOT. Рыба в ROOT ищет ветку "S". Находит #7 (S). fail[HERS] = #7 (S). Автомат полностью построен!',
      codeLine: 4,
      scoutPos: 0,
      inspectedParentFail: 0,
      checkTargetChar: 'S',
      checkingBranchesFrom: 0,
    },
  ];

  const currentTrainInfo = TRAINING_STEPS_INFO[trainStep];
  const activeFishPosNode = activeMode === 'training' ? WATERFALL_NODES[currentTrainInfo.scoutPos] : WATERFALL_NODES[currentNode];
  const targetTrainingNode = WATERFALL_NODES[currentTrainInfo.targetNodeId];

  return (
    <div className="bg-slate-800/95 rounded-2xl p-6 border border-slate-700 shadow-2xl my-10 font-sans">
      {/* Шапка и переключатель режимов */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🌊</span>
          <div>
            <h4 className="text-2xl font-bold text-white flex items-center gap-2">
              Анимация водопада: Полное обучение автомата и Поиск
            </h4>
            <p className="text-sm text-slate-400">
              Визуализация пошагового построения всех fail-ссылок (BFS) и симуляция поиска
            </p>
          </div>
        </div>

        {/* Переключатель режимов */}
        <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-700 flex space-x-2">
          <button
            onClick={() => setActiveMode('training')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'training'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Режим 1: Полное обучение (BFS от корня)</span>
          </button>
          <button
            onClick={() => setActiveMode('search')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'search'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Режим 2: Поиск в тексте</span>
          </button>
        </div>
      </div>

      {/* ПАНЕЛЬ УПРАВЛЕНИЯ В ЗАВИСИМОСТИ ОТ РЕЖИМА */}
      {activeMode === 'training' ? (
        /* ПАНЕЛЬ РЕЖИМА ОБУЧЕНИЯ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-[fadeIn_0.3s_ease-in-out]">
          {/* Управление шагами обучения */}
          <div className="bg-slate-900/90 p-5 rounded-xl border border-indigo-500/40 flex flex-col justify-between shadow-xl">
            <div>
              <h5 className="text-indigo-300 font-bold mb-2 text-sm flex items-center gap-1.5">
                <span>🎓</span> Полный обход в ширину (BFS Queue)
              </h5>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Показаны все шаги очереди BFS (начиная с Шага 0 — Корня). Обратите внимание на <strong>Шаг 5 (SH → H)</strong> и <strong>Шаг 8 (SHE → HE)</strong>, где наглядно виден подъем к fail родителя!
              </p>
              <div className="space-y-1.5 mb-6 overflow-hidden pr-2">
                {TRAINING_STEPS_INFO.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTrainStep(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      idx === trainStep
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="line-clamp-1">{step.title}</span>
                    {idx === trainStep && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0"></span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTrainStep((prev) => Math.max(0, prev - 1))}
                disabled={trainStep === 0}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-bold transition-all"
              >
                Назад
              </button>
              <button
                onClick={() => setTrainStep((prev) => Math.min(TRAINING_STEPS_INFO.length - 1, prev + 1))}
                disabled={trainStep === TRAINING_STEPS_INFO.length - 1}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/50"
              >
                {trainStep === TRAINING_STEPS_INFO.length - 1 ? 'Автомат готов ✓' : 'Следующий шаг →'}
              </button>
            </div>
          </div>

          {/* Блок с кодом построения fail-ссылки и описанием */}
          <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-xl border border-slate-700/80 flex flex-col justify-between shadow-xl">
            <div>
              <h5 className="text-white font-bold mb-3 text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span> Код BFS построения fail-ссылок
                </span>
                <span className="text-xs bg-indigo-950 border border-indigo-700 text-indigo-300 px-2.5 py-1 rounded-lg font-mono">
                  Вершина: #{targetTrainingNode.id} ({targetTrainingNode.label}) | Ищем ветку: '{currentTrainInfo.checkTargetChar}'
                </span>
              </h5>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 mb-4">
                <div className={`p-1.5 rounded flex items-center justify-between ${currentTrainInfo.codeLine === 1 ? 'bg-indigo-950 border-l-4 border-indigo-500 text-indigo-300 font-bold' : 'text-slate-500'}`}>
                  <span>1. let u = trie[r][char]; // Текущая вершина #{targetTrainingNode.id} ({targetTrainingNode.label})</span>
                  {currentTrainInfo.codeLine === 1 && <span className="text-[10px] bg-indigo-800 text-indigo-200 px-1.5 py-0.5 rounded">Мы тут</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${currentTrainInfo.codeLine === 2 ? 'bg-indigo-950 border-l-4 border-indigo-400 text-indigo-200 font-bold' : 'text-slate-500'}`}>
                  <span>2. let v = fail[r]; // Подъем к fail родителя: #{currentTrainInfo.inspectedParentFail} ({WATERFALL_NODES[currentTrainInfo.inspectedParentFail].label})</span>
                  {currentTrainInfo.codeLine === 2 && <span className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.5 rounded">Прыжок к родителю</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${currentTrainInfo.codeLine === 3 ? 'bg-amber-950 border-l-4 border-amber-500 text-amber-300 font-bold animate-pulse' : 'text-slate-500'}`}>
                  <span>3. while (v !== root && trie[v][char] === undefined) v = fail[v];</span>
                  {currentTrainInfo.codeLine === 3 && <span className="text-[10px] bg-amber-700 text-white px-1.5 py-0.5 rounded">Ветки нет, возврат в корень</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${currentTrainInfo.codeLine === 4 ? 'bg-emerald-950 border-l-4 border-emerald-500 text-emerald-300 font-bold animate-pulse' : 'text-slate-500'}`}>
                  <span>4. if (trie[v][char] !== undefined) fail[u] = trie[v][char]; // Нашли ветку '{currentTrainInfo.checkTargetChar}'!</span>
                  {currentTrainInfo.codeLine === 4 && <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">Сработал IF!</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${currentTrainInfo.codeLine === 5 ? 'bg-blue-950 border-l-4 border-blue-500 text-blue-300 font-bold' : 'text-slate-500'}`}>
                  <span>5. else fail[u] = root; // Веток по '{currentTrainInfo.checkTargetChar}' нет, fail направлен в ROOT</span>
                  {currentTrainInfo.codeLine === 5 && <span className="text-[10px] bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded">fail = root</span>}
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-slate-200 font-bold mb-2 text-xs flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" /> Подробное объяснение шага:
              </h5>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-sm text-slate-100 leading-relaxed font-medium shadow-inner min-h-[72px] flex items-center">
                {currentTrainInfo.desc}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ПАНЕЛЬ РЕЖИМА ПОИСКА */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-[fadeIn_0.3s_ease-in-out]">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <h5 className="text-white font-bold mb-2 text-sm flex items-center gap-1.5">
                <span>✍️</span> Текст для сканирования
              </h5>
              <p className="text-xs text-slate-400 mb-4">
                Введи текст, чтобы лосось просканировал его на слова из словаря: <strong>HE, SHE, HIS, HERS</strong>.
              </p>
              <input
                type="text"
                value={textToScan}
                onChange={handleTextChange}
                maxLength={15}
                placeholder="ВВЕДИТЕ ТЕКСТ..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono mb-4 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-1 items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 w-full mb-1">Текущая позиция лосося в тексте:</span>
                {textToScan.split('').map((char, idx) => (
                  <span
                    key={idx}
                    className={`w-7 h-8 flex items-center justify-center font-mono font-bold text-sm rounded transition-all ${
                      idx === currentIndex
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-110'
                        : idx < currentIndex
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {char}
                  </span>
                ))}
                {currentIndex >= textToScan.length && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse ml-2">
                    ГОТОВО ✓
                  </span>
                )}
              </div>

              <button
                onClick={stepSearchSimulation}
                disabled={isSearchDone || textToScan.length === 0}
                className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isSearchDone || textToScan.length === 0
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40 active:scale-[0.98]'
                }`}
              >
                <span>{currentIndex === 0 ? 'Начать плавание (Шаг 1)' : 'Следующая буква / Шаг'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <h5 className="text-white font-bold mb-3 text-sm flex items-center gap-1.5">
                <span>⚡</span> Текущее действие в коде автомата (Поиск)
              </h5>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-1 mb-4">
                <div className={`p-1.5 rounded flex items-center justify-between ${activeSearchCodeLine === 1 ? 'bg-blue-950/80 border-l-4 border-blue-500 text-blue-300 font-bold' : 'text-slate-500'}`}>
                  <span>1. curr = state; char = text[i];</span>
                  {activeSearchCodeLine === 1 && <span className="text-[10px] uppercase bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded">Инициализация</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${activeSearchCodeLine === 2 ? 'bg-rose-950/80 border-l-4 border-rose-500 text-rose-300 font-bold animate-pulse' : 'text-slate-400'}`}>
                  <span>2. while (curr != root && !trie[curr].has(char)) curr = fail[curr];</span>
                  {activeSearchCodeLine === 2 && <span className="text-[10px] uppercase bg-rose-800 text-rose-200 px-1.5 py-0.5 rounded">Прыжок по fail!</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${activeSearchCodeLine === 3 ? 'bg-blue-900/40 border-l-4 border-blue-400 text-blue-200 font-bold' : 'text-slate-400'}`}>
                  <span>3. curr = trie[curr].get(char) ?? root;</span>
                  {activeSearchCodeLine === 3 && <span className="text-[10px] uppercase bg-blue-700 text-white px-1.5 py-0.5 rounded">Плывем по течению</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between ${activeSearchCodeLine === 4 ? 'bg-emerald-950/80 border-l-4 border-emerald-500 text-emerald-300 font-bold' : 'text-slate-400'}`}>
                  <span>4. if (is_terminal[curr]) reportMatch(curr.words);</span>
                  {activeSearchCodeLine === 4 && <span className="text-[10px] uppercase bg-emerald-700 text-white px-1.5 py-0.5 rounded">Совпадение!</span>}
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-slate-300 font-bold mb-2 text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" /> Мысли лосося в процессе плавания:
              </h5>
              <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 text-sm text-slate-200 font-medium min-h-[60px] flex items-center">
                {searchLog}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG Анимация водопада */}
      <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 p-6 rounded-xl border border-blue-500/30 relative overflow-hidden shadow-2xl">
        {/* Водопадные фоновые эффекты */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-indigo-900 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-around opacity-5 pointer-events-none">
          <div className="w-8 bg-blue-400 h-full animate-[pulse_2s_infinite]"></div>
          <div className="w-12 bg-blue-300 h-full animate-[pulse_3s_infinite]"></div>
          <div className="w-6 bg-blue-500 h-full animate-[pulse_2.5s_infinite]"></div>
        </div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <h5 className="text-white font-bold text-base flex items-center gap-2">
            <span>🌲</span> Ветвящийся синий водопад (Бор автомата)
          </h5>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1 text-blue-400 font-bold">
              <span className="w-3 h-0.5 bg-blue-500 inline-block"></span> Прямой поток (Trie)
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="w-3 h-0.5 border-t border-dashed border-rose-500 inline-block"></span> fail-ссылка (Водопадный прыжок)
            </span>
          </div>
        </div>

        {/* Само SVG дерево водопада */}
        <div className="w-full overflow-x-auto custom-scrollbar flex justify-center">
          <svg viewBox="0 0 800 520" className="w-full max-w-[800px] min-w-[650px] h-[480px]">
            
            {/* Горизонтальные линии и подписи уровней глубины (Depth) */}
            {[
              { depth: 0, y: 60, label: 'Depth 0 (Корень)' },
              { depth: 1, y: 160, label: 'Depth 1 (H, S)' },
              { depth: 2, y: 260, label: 'Depth 2 (HE, HI, SH)' },
              { depth: 3, y: 360, label: 'Depth 3 (HER, HIS, SHE)' },
              { depth: 4, y: 460, label: 'Depth 4 (HERS)' },
            ].map((level) => (
              <g key={`depth-line-${level.depth}`}>
                <line
                  x1="20"
                  y1={level.y}
                  x2="780"
                  y2={level.y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.4"
                />
                <rect x="25" y={level.y - 12} width="145" height="24" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" opacity="0.8" />
                <text x="32" y={level.y + 4} fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  {level.label}
                </text>
              </g>
            ))}

            {/* Рендер прямых переходов (потоков воды) */}
            {Object.entries(TRIE_TRANSITIONS).map(([fromIdStr, children]) => {
              const fromNode = WATERFALL_NODES[Number(fromIdStr)];
              return Object.entries(children).map(([char, toId]) => {
                const toNode = WATERFALL_NODES[toId];
                
                // Подсветка в режиме поиска
                let isHighlighted = activeMode === 'search' && jumpPath?.from === fromNode.id && jumpPath?.to === toNode.id && jumpPath?.type === 'normal';
                
                // Подсветка в режиме обучения (когда исследуем ветки из inspectedParentFail)
                let isTrainingExamined = activeMode === 'training' && currentTrainInfo.checkingBranchesFrom === fromNode.id; 
                let isMatchBranch = isTrainingExamined && char === currentTrainInfo.checkTargetChar;

                return (
                  <g key={`edge-${fromNode.id}-${toNode.id}`}>
                    {/* Линия течения воды */}
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isHighlighted ? '#3b82f6' : isTrainingExamined ? (isMatchBranch ? '#10b981' : '#f43f5e') : '#1e3a8a'}
                      strokeWidth={isHighlighted || isTrainingExamined ? '6' : '3'}
                      className={isHighlighted || isTrainingExamined ? 'animate-[pulse_1s_infinite]' : ''}
                    />
                    {/* Символ перехода */}
                    <circle cx={(fromNode.x + toNode.x) / 2} cy={(fromNode.y + toNode.y) / 2} r="14" fill="#0f172a" stroke={isTrainingExamined ? (isMatchBranch ? '#10b981' : '#f43f5e') : '#3b82f6'} strokeWidth="2" />
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 4}
                      fill={isTrainingExamined ? (isMatchBranch ? '#10b981' : '#f43f5e') : '#60a5fa'}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {char}
                    </text>

                    {/* ВИЗУАЛЬНЫЕ МЕТКИ ПРОВЕРКИ IF В РЕЖИМЕ ОБУЧЕНИЯ */}
                    {isTrainingExamined && (
                      <g transform={`translate(${(fromNode.x + toNode.x) / 2 + (toNode.x < fromNode.x ? -35 : 35)}, ${(fromNode.y + toNode.y) / 2})`}>
                        <rect x="-15" y="-12" width="30" height="24" rx="4" fill="#0f172a" stroke={isMatchBranch ? '#10b981' : '#f43f5e'} strokeWidth="2" />
                        <text x="0" y="5" fontSize="14" textAnchor="middle">
                          {isMatchBranch ? '✅' : '❌'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              });
            })}

            {/* Рендер fail-ссылок (пунктирные водопадные пути) */}
            {Object.values(WATERFALL_NODES).map((node) => {
              if (node.id === 0) return null;
              const targetNode = WATERFALL_NODES[node.fail];
              
              // В режиме обучения показываем fail-ссылку только если шаг обучения уже дошел до этой вершины
              // Найдем индекс шага, на котором обрабатывается эта вершина
              const stepIdxForNode = TRAINING_STEPS_INFO.findIndex(s => s.targetNodeId === node.id);
              if (activeMode === 'training' && trainStep < stepIdxForNode) return null;

              let isHighlighted = activeMode === 'search' && jumpPath?.from === node.id && jumpPath?.to === targetNode.id && jumpPath?.type === 'fail';
              let isJustEstablished = activeMode === 'training' && trainStep === stepIdxForNode; // Подсвечиваем только что созданную fail-ссылку

              // Вычисляем изогнутую кривую для красоты прыжка
              const dx = targetNode.x - node.x;
              const dy = targetNode.y - node.y;
              const cx = node.x + dx / 2 + (node.id % 2 === 0 ? 40 : -40);
              const cy = node.y + dy / 2 - 30;

              return (
                <g key={`fail-${node.id}`}>
                  <path
                    d={`M ${node.x} ${node.y} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y}`}
                    fill="none"
                    stroke={isHighlighted ? '#f43f5e' : isJustEstablished ? '#10b981' : '#9f1239'}
                    strokeWidth={isHighlighted || isJustEstablished ? '4' : '1.5'}
                    strokeDasharray="6,6"
                    className={isHighlighted || isJustEstablished ? 'animate-[dash_1s_linear_infinite]' : ''}
                    opacity={isHighlighted || isJustEstablished ? '1' : '0.4'}
                  />
                  {isJustEstablished && (
                    <text x={cx} y={cy - 10} fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle" className="animate-bounce">
                      fail[{node.label}] = {targetNode.label} 🎉
                    </text>
                  )}
                </g>
              );
            })}

            {/* Рендер вершин (бассейнов водопада) */}
            {Object.values(WATERFALL_NODES).map((node) => {
              const isCurrent = activeFishPosNode.id === node.id;
              const isTargetChild = activeMode === 'training' && targetTrainingNode.id === node.id;
              const hasWords = node.words.length > 0;

              return (
                <g key={`node-${node.id}`} className="cursor-pointer" onClick={() => activeMode === 'search' && setCurrentNode(node.id)}>
                  {/* Внешнее свечение для активной вершины */}
                  {isCurrent && (
                    <circle cx={node.x} cy={node.y} r="32" fill="#3b82f6" opacity="0.3" className="animate-ping" />
                  )}
                  {isTargetChild && (
                    <circle cx={node.x} cy={node.y} r="30" fill="#10b981" opacity="0.4" className="animate-pulse" />
                  )}

                  {/* Основной круг вершины */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCurrent || isTargetChild ? '24' : '20'}
                    fill={isCurrent ? '#2563eb' : isTargetChild ? '#047857' : hasWords ? '#065f46' : '#1e293b'}
                    stroke={isCurrent ? '#ffffff' : isTargetChild ? '#34d399' : hasWords ? '#34d399' : '#64748b'}
                    strokeWidth={isCurrent || isTargetChild ? '4' : '2'}
                    className="transition-all duration-300"
                  />

                  {/* Текст внутри вершины */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    fill={isCurrent || isTargetChild ? '#ffffff' : hasWords ? '#a7f3d0' : '#e2e8f0'}
                    fontSize={isCurrent || isTargetChild ? '14' : '12'}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>

                  {/* Метка искомой вершины в режиме обучения */}
                  {isTargetChild && (
                    <g transform={`translate(${node.x}, ${node.y + 35})`}>
                      <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#047857" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="2" fontSize="10" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                        ИЩЕМ FAIL
                      </text>
                    </g>
                  )}

                  {/* Индикатор словарных слов */}
                  {hasWords && (
                    <g transform={`translate(${node.x + 16}, ${node.y - 16})`}>
                      <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="3" fontSize="10" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                        ★
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ОДИН ПЛАВНЫЙ АНИМИРОВАННЫЙ ЭХО-ЛОСОСЬ */}
            <g>
              {/* Круг-подложка под рыбу */}
              <circle
                cx={activeFishPosNode.x + 15}
                cy={activeFishPosNode.y - 25}
                r="18"
                fill={activeMode === 'training' ? '#8b5cf6' : '#f43f5e'}
                stroke="#ffffff"
                strokeWidth="2"
                style={{ transition: 'cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className="shadow-lg"
              />
              {/* Сама рыба */}
              <text
                x={activeFishPosNode.x + 15}
                y={activeFishPosNode.y - 19}
                fontSize="18"
                textAnchor="middle"
                style={{ transition: 'x 0.8s cubic-bezier(0.4, 0, 0.2, 1), y 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className="animate-float select-none"
              >
                {activeMode === 'training' ? '🕵️‍♂️🐟' : '🐟'}
              </text>
            </g>

          </svg>
        </div>
      </div>

      {/* Список найденных совпадений (только в режиме поиска) */}
      {activeMode === 'search' && (
        <div className="mt-6 bg-slate-900/50 p-5 rounded-xl border border-slate-700/60">
          <h5 className="text-white font-bold mb-3 text-sm flex items-center gap-1.5">
            <span>🏆</span> Улов лосося (Найденные слова в тексте)
          </h5>
          {foundMatches.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              Пока ничего не поймали. Запустите шаги симуляции, чтобы лосось начал собирать слова!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {foundMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-950 border border-emerald-700 text-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow animate-[scaleUp_0.3s_ease-in-out]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{match.word}</span>
                  <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                    Индекс {match.index}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
