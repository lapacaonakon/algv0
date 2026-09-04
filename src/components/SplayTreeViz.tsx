import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface SplayNode {
  key: number;
  left: SplayNode | null;
  right: SplayNode | null;
  x?: number;
  y?: number;
}

// Simple BST insertion to build initial tree
const insertBST = (root: SplayNode | null, key: number): SplayNode => {
  if (!root) return { key, left: null, right: null };
  if (key < root.key) {
    root.left = insertBST(root.left, key);
  } else if (key > root.key) {
    root.right = insertBST(root.right, key);
  }
  return root;
};

// Right Rotation (Zig / Right Rotate)
const rightRotate = (x: SplayNode): SplayNode => {
  const y = x.left;
  if (!y) return x;
  x.left = y.right;
  y.right = x;
  return y;
};

// Left Rotation (Zag / Left Rotate)
const leftRotate = (x: SplayNode): SplayNode => {
  const y = x.right;
  if (!y) return x;
  x.right = y.left;
  y.left = x;
  return y;
};

// Clone tree helper
const cloneTree = (node: SplayNode | null): SplayNode | null => {
  if (!node) return null;
  return {
    key: node.key,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    x: node.x,
    y: node.y,
  };
};

export const SplayTreeViz: React.FC = () => {
  // Let's create an elegant initial unbalanced or semi-balanced tree
  // Values: 10, 20, 30, 40, 50, 60
  const createInitialTree = (): SplayNode => {
    let r: SplayNode | null = null;
    const initialKeys = [40, 20, 50, 10, 30, 60];
    initialKeys.forEach((key) => {
      r = insertBST(r, key);
    });
    return r!;
  };

  const [tree, setTree] = useState<SplayNode>(createInitialTree());
  const [inputValue, setInputValue] = useState<string>("");
  const [log, setLog] = useState<string[]>([
    "Дерево инициализировано. Попробуйте кликнуть на узел или вести значение для поиска/вставки.",
  ]);
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);

  // Splay operation that tracks steps!
  const splayStepByStep = (
    root: SplayNode | null,
    key: number,
  ): { newRoot: SplayNode | null; steps: string[] } => {
    const steps: string[] = [];
    if (!root) return { newRoot: null, steps: ["Дерево пустое."] };

    // We implement the classic top-down or bottom-up splay.
    // For visualization logs, we do a bottom-up explanation mapping.
    let path: { node: SplayNode; dir: "left" | "right" | null }[] = [];
    let current: SplayNode | null = root;

    // Find the element or the element where search fails
    let lastNode: SplayNode = root;
    while (current) {
      lastNode = current;
      if (key === current.key) {
        path.push({ node: current, dir: null });
        break;
      } else if (key < current.key) {
        path.push({ node: current, dir: "left" });
        current = current.left;
      } else {
        path.push({ node: current, dir: "right" });
        current = current.right;
      }
    }

    const targetKey = current ? key : lastNode.key;
    const isFound = !!current;

    if (!isFound) {
      steps.push(`Поиск ${key}: элемент отсутствует в дереве!`);
      steps.push(
        `Поиск споткнулся на узеле [${lastNode.key}]. Именно его мы обязаны поднять в корень (Splay(${lastNode.key})).`,
      );
    } else {
      steps.push(
        `Поиск ${key}: элемент найден! Запускаем подъем Splay(${key}) в корень.`,
      );
    }

    // Now let's implement standard Splay logic recursively
    const splayAction = (
      node: SplayNode | null,
      k: number,
    ): SplayNode | null => {
      if (!node || node.key === k) return node;

      if (k < node.key) {
        if (!node.left) return node;

        if (k < node.left.key) {
          // Zig-Zig (Left-Left)
          node.left.left = splayAction(node.left.left, k);
          node = rightRotate(node);
          steps.push(
            `Вращение Zig-Zig (Правый поворот родителя для убирания кривизны [${node.key}])`,
          );
        } else if (k > node.left.key) {
          // Zig-Zag (Left-Right)
          node.left.right = splayAction(node.left.right, k);
          if (node.left.right) {
            node.left = leftRotate(node.left);
            steps.push(`Компонент Zig-Zag: левый поворот для левого сына`);
          }
        }

        if (!node.left) return node;
        steps.push(
          `Финальный поворот Zig (Правое вращение корня поддерева для вершины [${k}])`,
        );
        return rightRotate(node);
      } else {
        if (!node.right) return node;

        if (k < node.right.key) {
          // Zag-Zig (Right-Left)
          node.right.left = splayAction(node.right.left, k);
          if (node.right.left) {
            node.right = rightRotate(node.right);
            steps.push(`Компонент Zig-Zag: правый поворот для правого сына`);
          }
        } else if (k > node.right.key) {
          // Zag-Zag (Right-Right)
          node.right.right = splayAction(node.right.right, k);
          node = leftRotate(node);
          steps.push(
            `Вращение Zag-Zag (Левый поворот родителя для убирания кривизны [${node.key}])`,
          );
        }

        if (!node.right) return node;
        steps.push(
          `Финальный поворот Zag (Левое вращение корня поддерева для вершины [${k}])`,
        );
        return leftRotate(node);
      }
    };

    const finalRoot = splayAction(cloneTree(root), targetKey);
    return { newRoot: finalRoot, steps };
  };

  const handleSplay = (key: number) => {
    setHighlightedNode(key);
    const { newRoot, steps } = splayStepByStep(tree, key);
    if (newRoot) {
      setTree(newRoot);
    }
    setLog(steps);
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    // Standard BST insert, then splay!
    let newTree = cloneTree(tree);
    newTree = insertBST(newTree, val);
    const { newRoot, steps } = splayStepByStep(newTree, val);
    if (newRoot) {
      setTree(newRoot);
    }
    setLog([`Вставили вершину [${val}].`, ...steps]);
    setInputValue("");
    setHighlightedNode(val);
  };

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    handleSplay(val);
    setInputValue("");
  };

  const resetTree = () => {
    setTree(createInitialTree());
    setHighlightedNode(null);
    setLog(["Дерево возвращено в исходное состояние."]);
  };

  // Assign coordinate positions using a simple recursive depth/offset logic
  const computeCoordinates = (
    node: SplayNode | null,
    x: number,
    y: number,
    levelWidth: number,
  ): void => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) {
      computeCoordinates(node.left, x - levelWidth, y + 65, levelWidth * 0.5);
    }
    if (node.right) {
      computeCoordinates(node.right, x + levelWidth, y + 65, levelWidth * 0.5);
    }
  };

  const drawTree = cloneTree(tree);
  computeCoordinates(drawTree, 300, 40, 140);

  // Render lines and nodes
  const renderLines = (node: SplayNode | null): React.ReactNode[] => {
    if (!node) return [];
    let lines: React.ReactNode[] = [];
    if (node.left && node.left.x && node.left.y) {
      lines.push(
        <line
          key={`l-${node.key}-${node.left.key}`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="#475569"
          strokeWidth="2"
        />,
      );
      lines = lines.concat(renderLines(node.left));
    }
    if (node.right && node.right.x && node.right.y) {
      lines.push(
        <line
          key={`l-${node.key}-${node.right.key}`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="#475569"
          strokeWidth="2"
        />,
      );
      lines = lines.concat(renderLines(node.right));
    }
    return lines;
  };

  const renderNodes = (node: SplayNode | null): React.ReactNode[] => {
    if (!node) return [];
    let circles: React.ReactNode[] = [];
    const isHighlighted = highlightedNode === node.key;

    circles.push(
      <g
        key={`n-${node.key}`}
        className="cursor-pointer group"
        onClick={() => handleSplay(node.key)}
        title={`Кликните, чтобы выполнить Splay(${node.key})`}
      >
        <circle
          cx={node.x}
          cy={node.y}
          r="18"
          fill={isHighlighted ? "#4f46e5" : "#1e293b"}
          stroke={isHighlighted ? "#818cf8" : "#64748b"}
          strokeWidth={isHighlighted ? "3" : "2"}
          className="transition-all duration-300 group-hover:fill-slate-800"
        />
        <text
          x={node.x}
          y={node.y}
          dy=".3em"
          textAnchor="middle"
          fill="white"
          fontSize="12px"
          fontWeight="bold"
          className="select-none pointer-events-none"
        >
          {node.key}
        </text>
      </g>,
    );
    circles = circles.concat(renderNodes(node.left));
    circles = circles.concat(renderNodes(node.right));
    return circles;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-indigo-500 overflow-hidden shadow-xl my-8">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-indigo-600/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Интерактивное Splay-дерево
        </h3>
        <p className="text-xs text-slate-400">
          Кликайте на вершины дерева, чтобы «вытащить» их в корень методом
          Splay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Playfield */}
        <div className="lg:col-span-7 bg-[#0f172a] p-4 relative h-96 min-h-[350px] flex items-center justify-center">
          <svg
            className="w-full h-full max-w-[600px] max-h-[350px]"
            viewBox="0 0 600 320"
          >
            {renderLines(drawTree)}
            {renderNodes(drawTree)}
          </svg>

          {/* Quick interactive controls */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-between items-center pointer-events-auto">
            <form onSubmit={handleFind} className="flex gap-2">
              <input
                type="number"
                placeholder="Поиск..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24 bg-slate-950 text-white rounded border border-slate-700 px-3 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                onClick={handleFind}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold px-3 py-1 rounded text-xs text-white"
              >
                Поиск / Splay
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const val = parseInt(inputValue);
                  if (!isNaN(val)) {
                    let newTree = cloneTree(tree);
                    newTree = insertBST(newTree, val);
                    const { newRoot, steps } = splayStepByStep(newTree, val);
                    if (newRoot) setTree(newRoot);
                    setLog([`Вставили [${val}].`, ...steps]);
                    setInputValue("");
                    setHighlightedNode(val);
                  }
                }}
                className="bg-indigo-950 hover:bg-slate-800 border border-indigo-700/60 font-bold px-3 py-1 rounded text-xs text-indigo-300"
              >
                Вставить
              </button>
            </form>

            <button
              onClick={resetTree}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Сбросить
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="lg:col-span-5 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col h-[380px] lg:h-auto overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ход вращения (Splay-логи)
          </h4>
          <div className="flex-1 space-y-2 mb-4 overflow-y-auto pr-2">
            {log.map((step, idx) => (
              <div
                key={idx}
                className={`text-xs p-2.5 rounded transition-all ${
                  idx === log.length - 1
                    ? "border-l-2 border-indigo-500 bg-indigo-950/20 text-indigo-200 font-medium"
                    : "text-slate-400 bg-slate-900/50"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 space-y-1">
            <p>
              💡 <span className="font-semibold text-slate-400">Zig:</span> узел
              у самого корня. Делаем 1 вращение.
            </p>
            <p>
              💡 <span className="font-semibold text-slate-400">Zig-Zig:</span>{" "}
              оба левые или оба правые. Вращаем деда, потом отца.
            </p>
            <p>
              💡 <span className="font-semibold text-slate-400">Zig-Zag:</span>{" "}
              колено. Вращаем узел в разные стороны.
            </p>
          </div>
        </div>
      </div>

      {/* Answers Section inside the visualizer widget */}
      <div className="bg-slate-950/80 p-5 border-t border-slate-800">
        <h4 className="text-indigo-400 font-bold text-sm mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Разбор экзаменационных вопросов (Без нытья):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-300 mb-2">
                1. Отсутствующий элемент
              </p>
              <p className="text-slate-400 leading-relaxed">
                Допустим, мы ищем{" "}
                <code className="text-indigo-400 font-semibold">[25]</code>, а
                его нет. Алгоритм спустится к листу, на котором поиск завершится
                неудачей (например,{" "}
                <code className="text-indigo-400">[20]</code> или{" "}
                <code className="text-indigo-400">[30]</code>). Конечный Splay
                поднимет в корень{" "}
                <strong className="text-white">
                  последний успешно просмотренный узел
                </strong>
                , на котором он споткнулся! Это оставляет ближайшего соседа
                сверху.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-indigo-400/80 italic">
              Поиск настраивает локальный кэш под реалии.
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-300 mb-2">
                2. Эффект качелей (Swing)
              </p>
              <p className="text-slate-400 leading-relaxed">
                Если агент запрашивает по очереди{" "}
                <code className="text-rose-400">[10]</code> и{" "}
                <code className="text-rose-400">[60]</code> (противоположные
                углы), дерево будет превращаться в палку то в одну, то в другую
                сторону. Первая операция Splay(60) стоит{" "}
                <strong className="text-white">O(n)</strong> и уводит 10 на
                глубину n. Вторая Splay(10) заставляет пройти путь n обратно.
                Постоянный свинг убивает производительность до чистой линейной
                сложности <strong className="text-white">O(n)</strong>.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-rose-400/80 italic">
              Кэшировать свингующие пары на концах — фатально.
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 flex flex-col justify-between">
            <div>
              <p className="font-bold text-slate-300 mb-2">
                3. Амортизация O(log n)
              </p>
              <p className="text-slate-400 leading-relaxed">
                Парадокс: один запрос за{" "}
                <code className="text-emerald-400">O(n)</code> (по палке) делает
                всю структуру вдвое более плоской за счет "сворачивания" предков
                при двойных вращениях (
                <code className="text-emerald-400 font-semibold">Zig-Zig</code>
                ). Дорогая операция инвестирует в дешевизну последующих $m$
                операций. Поэтому амортизированное время составляет честные{" "}
                <strong className="text-white">O(log n)</strong>!
              </p>
            </div>
            <div className="mt-3 text-[10px] text-emerald-400/80 italic">
              Каждое "растяжение" компенсируется "складыванием".
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
