import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, Volume2, Info } from 'lucide-react';

interface TrieNode {
  id: number;
  char: string;
  parent: number;
  children: { [key: string]: number };
  fail: number;
  term_link: number;
  is_terminal: boolean;
  words: string[];
  depth: number;
  x?: number;
  y?: number;
}

export const SalmonAutomatonWidget: React.FC = () => {
  const [words, setWords] = useState<string[]>(['CAR', 'CAT', 'CART', 'ART']);
  const [newWord, setNewWord] = useState('');
  const [nodes, setNodes] = useState<{ [key: number]: TrieNode }>({});
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [bfsQueue, setBfsQueue] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [speechText, setSpeechText] = useState<string>(
    'Привет! Я Эхо-Лосось Сеня! Введи слова в словарь или нажми «Построить автомат», и я покажу, как сплести сеть суффиксных ссылок! Буль-буль!'
  );
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  // Регулярное моргание рыбы
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Эффект разговора при смене текста
  useEffect(() => {
    setIsTalking(true);
    const timer = setTimeout(() => setIsTalking(false), 2000);
    return () => clearTimeout(timer);
  }, [speechText]);

  // Построение начального бора (Trie) без fail-ссылок
  const buildInitialTrie = (wordList: string[]) => {
    const newNodes: { [key: number]: TrieNode } = {
      0: { id: 0, char: 'ROOT', parent: 0, children: {}, fail: 0, term_link: 0, is_terminal: false, words: [], depth: 0 }
    };
    let count = 0;

    wordList.forEach((word) => {
      let curr = 0;
      for (let i = 0; i < word.length; i++) {
        const c = word[i].toUpperCase();
        if (newNodes[curr].children[c] === undefined) {
          count++;
          newNodes[curr].children[c] = count;
          newNodes[count] = {
            id: count,
            char: c,
            parent: curr,
            children: {},
            fail: 0,
            term_link: 0,
            is_terminal: false,
            words: [],
            depth: newNodes[curr].depth + 1
          };
        }
        curr = newNodes[curr].children[c];
      }
      if (!newNodes[curr].words.includes(word)) {
        newNodes[curr].words.push(word);
        newNodes[curr].is_terminal = true;
      }
    });

    let currentX = 0;
    const paddingX = 70;
    const paddingY = 80;
    
    const layoutDFS = (u: number, depth: number) => {
      const childKeys = Object.values(newNodes[u].children);
      newNodes[u].y = 40 + depth * paddingY;
      
      if (childKeys.length === 0) {
        newNodes[u].x = 40 + currentX * paddingX;
        currentX++;
      } else {
        let leftX = -1;
        let rightX = -1;
        childKeys.forEach(v => {
           layoutDFS(v, depth + 1);
           if (leftX === -1) leftX = newNodes[v].x!;
           rightX = newNodes[v].x!;
        });
        newNodes[u].x = leftX === -1 ? 40 + currentX * paddingX : (leftX + rightX) / 2;
        if (leftX === -1) currentX++;
      }
    };
    
    layoutDFS(0, 0);

    setNodes(newNodes);
    setSimulationStep(0);
    setBfsQueue([]);
    setCurrentNode(null);
    setSpeechText(
      `Отлично! Я построил базовое префиксное дерево (Бор) из ${wordList.length} слов. В нем ${count + 1} вершин. Теперь давай запустим BFS, чтобы расставить fail-ссылки!`
    );
  };

  useEffect(() => {
    buildInitialTrie(words);
  }, []);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = newWord.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanWord) return;
    if (words.includes(cleanWord)) {
      setSpeechText(`Слово «${cleanWord}» уже есть в словаре! Давай что-то новенькое.`);
      return;
    }
    const updated = [...words, cleanWord];
    setWords(updated);
    setNewWord('');
    buildInitialTrie(updated);
  };

  const removeWord = (wordToRemove: string) => {
    if (words.length <= 1) {
      setSpeechText('Оставь хотя бы одно слово, иначе мне негде будет плавать!');
      return;
    }
    const updated = words.filter((w) => w !== wordToRemove);
    setWords(updated);
    buildInitialTrie(updated);
  };

  // Запуск BFS
  const startBFS = () => {
    const rootChildren = Object.values(nodes[0].children);
    const queue = [...rootChildren];
    const updatedNodes = { ...nodes };
    rootChildren.forEach((childId) => {
      updatedNodes[childId].fail = 0;
    });

    setNodes(updatedNodes);
    setBfsQueue(queue);
    setSimulationStep(1);
    setCurrentNode(null);
    setSpeechText(
      'Начинаем обход в ширину (BFS)! Все вершины на глубине 1 (прямые дети корня) получают fail-ссылку прямо в корень (0), потому что короче суффикса просто нет. Жми «Следующий шаг»!'
    );
  };

  // Один шаг BFS
  const stepBFS = () => {
    if (bfsQueue.length === 0) {
      setSimulationStep(2);
      setCurrentNode(null);
      setSpeechText(
        'Ура! Очередь пуста! Мы успешно построили полный автомат Ахо-Корасик. Теперь каждая вершина знает, куда прыгать при неудаче. Можешь полюбоваться таблицей переходов!'
      );
      return;
    }

    const r = bfsQueue[0];
    const newQueue = bfsQueue.slice(1);
    const updatedNodes = { ...nodes };
    const rNode = updatedNodes[r];
    const childrenIds = Object.values(rNode.children);

    let logs = `Рассматриваем вершину #${r} (${rNode.char}). `;

    for (const [char, u] of Object.entries(rNode.children)) {
      newQueue.push(u);
      let v = rNode.fail;
      while (v !== 0 && updatedNodes[v].children[char] === undefined) {
        v = updatedNodes[v].fail;
      }
      const failTarget = updatedNodes[v].children[char] ?? 0;
      updatedNodes[u].fail = failTarget;

      // Рассчитываем терминальную ссылку (term_link)
      if (updatedNodes[failTarget].is_terminal) {
        updatedNodes[u].term_link = failTarget;
      } else {
        updatedNodes[u].term_link = updatedNodes[failTarget].term_link;
      }

      logs += `Для #${u} ('${char}') fail = #${failTarget}. `;
    }

    if (childrenIds.length === 0) {
      logs += 'У этой вершины нет детей, просто переходим дальше.';
    }

    setNodes(updatedNodes);
    setBfsQueue(newQueue);
    setCurrentNode(r);
    setSpeechText(logs);
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 shadow-2xl my-10">
      {/* Шапка виджета */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🐟</span>
          <div>
            <h4 className="text-2xl font-bold text-white flex items-center gap-2">
              Интерактивный конструктор: Говорящий Эхо-Лосось
            </h4>
            <p className="text-sm text-slate-400">
              Построение дерева и расчет суффиксных ссылок в реальном времени
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => buildInitialTrie(words)}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            title="Сбросить автомат"
          >
            <RotateCcw className="w-4 h-4" /> Сбросить
          </button>
        </div>
      </div>

      {/* Верхняя панель: Говорящий лосось и диалоговое окно */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-900/60 p-6 rounded-xl border border-slate-700/60 items-center">
        {/* Аватар Лосося (Сеня) с анимацией моргания и разговора */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-40 h-40 relative flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-full border border-blue-500/30 shadow-inner">
            {/* SVG Лосося */}
            <svg
              viewBox="0 0 200 200"
              className={`w-36 h-36 transition-transform duration-300 ${
                isTalking ? 'scale-105 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'scale-100'
              }`}
            >
              {/* Тело лосося */}
              <ellipse cx="100" cy="100" rx="70" ry="45" fill="#f43f5e" />
              <path d="M 40 85 Q 100 55 160 85 Q 100 115 40 85" fill="#fb7185" opacity="0.3" />

              {/* Хвост */}
              <path
                d="M 35 100 L 5 70 L 15 100 L 5 130 Z"
                fill="#be123c"
                className="origin-[35px_100px] animate-[pulse_2s_infinite]"
              />

              {/* Плавники */}
              <path d="M 90 55 L 70 30 L 110 55 Z" fill="#e11d48" />
              <path d="M 90 145 L 70 170 L 110 145 Z" fill="#e11d48" />
              <path
                d="M 120 115 L 100 135 L 130 130 Z"
                fill="#f87171"
                className="origin-[120px_115px] animate-[ping_3s_infinite]"
              />

              {/* Глаз (с морганием) */}
              <circle cx="145" cy="85" r="12" fill="#ffffff" />
              {isBlinking ? (
                <line x1="133" y1="85" x2="157" y2="85" stroke="#0f172a" strokeWidth="4" />
              ) : (
                <>
                  <circle cx="148" cy="85" r="6" fill="#0f172a" />
                  <circle cx="151" cy="82" r="2" fill="#ffffff" />
                </>
              )}

              {/* Рот (анимация разговора) */}
              {isTalking ? (
                <path d="M 165 105 Q 155 120 165 125 Q 175 115 165 105" fill="#881337" />
              ) : (
                <path d="M 165 110 Q 155 115 168 118" stroke="#881337" strokeWidth="3" fill="none" />
              )}

              {/* Улыбка / жабры */}
              <path d="M 130 80 Q 125 100 130 120" stroke="#be123c" strokeWidth="3" fill="none" />
              <path d="M 120 85 Q 115 100 120 115" stroke="#be123c" strokeWidth="2" fill="none" />
            </svg>

            {/* Декоративные пузыри */}
            <div className="absolute -top-1 right-4 text-xl animate-bounce">🫧</div>
            <div className="absolute top-8 right-1 text-sm animate-pulse">🫧</div>
          </div>
          <span className="mt-3 bg-rose-600/30 border border-rose-500 text-rose-300 px-3 py-1 rounded-full text-xs font-bold shadow">
            Эхо-Лосось Сеня 🍣
          </span>
        </div>

        {/* Пузырь с текстом (Баббл) */}
        <div className="md:col-span-2 bg-slate-800 border-2 border-blue-500/50 rounded-2xl p-6 relative shadow-xl flex flex-col justify-between min-h-[140px]">
          {/* Треугольник баббла */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-slate-800 border-b-[12px] border-b-transparent hidden md:block"></div>
          
          <div className="flex items-center space-x-2 text-blue-400 mb-2 font-bold text-sm">
            <Volume2 className={`w-4 h-4 ${isTalking ? 'animate-pulse text-rose-400' : ''}`} />
            <span>Прямое вещание из аквариума:</span>
          </div>
          
          <p className="text-slate-200 text-base leading-relaxed font-medium flex-1 flex items-center">
            {speechText}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap gap-2 items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Статус: {simulationStep === 0 ? 'Бор готов. Запустите BFS' : simulationStep === 1 ? 'Идет расчет ссылок...' : 'Автомат построен!'}
            </div>

            <div className="flex gap-2">
              {simulationStep === 0 && (
                <button
                  onClick={startBFS}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 shadow-lg shadow-emerald-900/40 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4" /> Запустить BFS
                </button>
              )}
              {simulationStep === 1 && (
                <button
                  onClick={stepBFS}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 shadow-lg shadow-blue-900/40 transition-transform active:scale-95"
                >
                  <span>Шаг BFS</span>
                  <span className="bg-blue-800 px-1.5 py-0.5 rounded text-xs">{bfsQueue.length}</span>
                </button>
              )}
              {simulationStep === 2 && (
                <button
                  onClick={() => buildInitialTrie(words)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1 transition-transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Перезапустить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Automaton Tree */}
      <div className="mb-8 bg-slate-900 border border-slate-700/60 rounded-xl overflow-x-auto p-4 custom-scrollbar">
        <h5 className="text-white font-bold mb-3 flex items-center gap-1.5 text-sm">
          <span>🌲</span> Дерево и Суффиксные (fail) ссылки
        </h5>
        
        {(() => {
          let maxX = 0;
          let maxY = 0;
          Object.values(nodes).forEach(n => {
            if (n.x && n.x > maxX) maxX = n.x;
            if (n.y && n.y > maxY) maxY = n.y;
          });
          const svgWidth = Math.max(maxX + 80, 400);
          const svgHeight = Math.max(maxY + 60, 200);

          return (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ minWidth: '100%', height: svgHeight }}>
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
                </marker>
                <marker id="fail-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {Object.values(nodes).map(node => {
                if (node.id === 0) return null;
                const parent = nodes[node.parent];
                if (!parent.x || !parent.y || !node.x || !node.y) return null;

                const isCurrent = currentNode === node.id || bfsQueue.includes(node.id);
                
                return (
                  <g key={`edge-${node.id}`}>
                    <line
                      x1={parent.x}
                      y1={parent.y + 16}
                      x2={node.x}
                      y2={node.y - 16}
                      stroke={isCurrent ? '#60a5fa' : '#475569'}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <text
                      x={(parent.x + node.x) / 2 - 10}
                      y={(parent.y + node.y) / 2}
                      fill="#94a3b8"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {node.char}
                    </text>
                  </g>
                );
              })}

              {/* Draw Fail Links */}
              {simulationStep > 0 && Object.values(nodes).map(node => {
                if (node.id === 0 || node.fail === 0) return null; // Don't clutter with simple root fails unless animated? Actually we can draw all! But maybe wait, we can just draw them if they are non-zero, or if it's explicitly computed.
                // Wait, all nodes get fail link. Let's just draw fail links for nodes that have fail !== 0 or if we specifically are in step >= 1 and computed it
                // To avoid too many lines, let's draw non-zero fail links
                const target = nodes[node.fail];
                if (!target || !node.x || !node.y || !target.x || !target.y) return null;

                // Simple bezier curve for fail link
                const isCurrent = currentNode === node.id;
                
                return (
                  <path
                    key={`fail-${node.id}`}
                    d={`M ${node.x} ${node.y - 10} Q ${(node.x + target.x) / 2} ${Math.min(node.y, target.y) - 40} ${target.x} ${target.y - 16}`}
                    fill="none"
                    stroke={isCurrent ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)'}
                    strokeWidth={isCurrent ? 2 : 1.5}
                    strokeDasharray="4 4"
                    markerEnd="url(#fail-arrow)"
                  />
                );
              })}

              {/* Draw Nodes */}
              {Object.values(nodes).map(node => {
                if (!node.x || !node.y) return null;
                const isRoot = node.id === 0;
                const isCurrent = currentNode === node.id;
                const isInQueue = bfsQueue.includes(node.id);

                let fill = '#1e293b';
                let stroke = '#475569';
                
                if (isCurrent) {
                  fill = '#2563eb';
                  stroke = '#60a5fa';
                } else if (isInQueue) {
                  fill = '#b45309';
                  stroke = '#fbbf24';
                } else if (node.is_terminal) {
                  fill = '#059669';
                  stroke = '#34d399';
                }

                return (
                  <g key={`node-${node.id}`}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="white"
                      fontSize={isRoot ? "10" : "12"}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isRoot ? 'R' : node.char}
                    </text>
                    {!isRoot && (
                      <text
                        x={node.x + 12}
                        y={node.y - 12}
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {node.id}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          );
        })()}
      </div>

      {/* Управление словарем */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
          <div>
            <h5 className="text-white font-bold mb-3 flex items-center gap-1.5 text-sm">
              <span>📖</span> Словарь (Паттерны)
            </h5>
            <div className="flex flex-wrap gap-2 mb-4">
              {words.map((w) => (
                <span
                  key={w}
                  className="bg-slate-800 border border-slate-600 text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 group"
                >
                  {w}
                  <button
                    onClick={() => removeWord(w)}
                    className="text-slate-500 hover:text-rose-400 font-bold px-1 transition-colors"
                    title="Удалить"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddWord} className="flex gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="НОВОЕ СЛОВО..."
              maxLength={8}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono flex-1 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </form>
        </div>

        {/* Таблица Вершин и суффиксных ссылок */}
        <div className="lg:col-span-2 bg-slate-900/50 p-5 rounded-xl border border-slate-700/60 overflow-x-auto">
          <h5 className="text-white font-bold mb-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <span>🕸️</span> Таблица переходов и fail-ссылок
            </span>
            <span className="text-xs text-slate-400 font-normal">
              Всего вершин: {Object.keys(nodes).length}
            </span>
          </h5>

          <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 sticky top-0 bg-slate-900">
                  <th className="py-2 px-3">ID Вершины</th>
                  <th className="py-2 px-3">Символ</th>
                  <th className="py-2 px-3">Родитель</th>
                  <th className="py-2 px-3">fail-ссылка</th>
                  <th className="py-2 px-3">term_link</th>
                  <th className="py-2 px-3">Дети</th>
                  <th className="py-2 px-3">Слова (dict)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {Object.values(nodes).map((node) => {
                  const isCurrent = currentNode === node.id;
                  const isInQueue = bfsQueue.includes(node.id);

                  return (
                    <tr
                      key={node.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-blue-900/40 font-bold text-white'
                          : isInQueue
                          ? 'bg-slate-800/80'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            node.id === 0
                              ? 'bg-purple-500'
                              : isCurrent
                              ? 'bg-blue-400 animate-ping'
                              : isInQueue
                              ? 'bg-amber-400'
                              : 'bg-slate-600'
                          }`}
                        ></span>
                        <span>#{node.id}</span>
                        {node.id === 0 && <span className="text-[10px] text-purple-400">(Корень)</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold">
                          {node.char}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {node.id === 0 ? '-' : `#${node.parent}`}
                      </td>
                      <td className="py-2.5 px-3">
                        {node.id === 0 ? (
                          <span className="text-slate-500">-</span>
                        ) : (
                          <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded font-bold">
                            #{node.fail}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {node.id === 0 || node.term_link === 0 ? (
                          <span className="text-slate-500">-</span>
                        ) : (
                          <span className="bg-rose-950 border border-rose-800 text-rose-300 px-2 py-0.5 rounded font-bold hover:bg-rose-900 transition-colors cursor-help" title={`Скрытое слово в вершине #${node.term_link}`}>
                            #{node.term_link}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {Object.keys(node.children).length === 0
                          ? '∅'
                          : Object.entries(node.children)
                              .map(([c, id]) => `${c}→#${id}`)
                              .join(', ')}
                      </td>
                      <td className="py-2.5 px-3">
                        {node.words.length === 0 ? (
                          <span className="text-slate-600">-</span>
                        ) : (
                          <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-bold">
                            {node.words.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
