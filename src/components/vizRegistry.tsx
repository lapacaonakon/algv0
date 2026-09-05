import React from "react";

import { ArticulationPointsViz } from "./ArticulationPointsViz";
import BellmanFordViz from "./BellmanFordViz";
import BfsViz from "./BfsViz";
import { DPVisualizer } from "./DPVisualizer";
import { DfsBridgesSimulator } from "./DfsBridgesSimulator";
import DijkstraViz from "./DijkstraViz";
import { EulerSimulator } from "./EulerSimulator";
import FloydViz from "./FloydViz";
import { GraphTraversalViz } from "./GraphTraversalViz";
import { HeapViz } from "./HeapViz";
import { JohnsonViz } from "./JohnsonViz";
import { KosarajuViz } from "./KosarajuViz";
import { KruskalSimulator } from "./KruskalSimulator";
import MnemonicCards from "./MnemonicCards";
import { PlanarityDemo } from "./PlanarityDemo";
import { QueueViz } from "./QueueViz";
import { SalmonAutomatonWidget } from "./SalmonAutomatonWidget";
import { SegmentTreeVisualizer } from "./SegmentTreeVisualizer";
import { SplayTreeViz } from "./SplayTreeViz";
import { SplayRotationsViz } from "./SplayRotationsViz";
import { SplayRotationSandbox } from "./SplayRotationSandbox";
import { StackViz } from "./StackViz";
import { StringAlgorithmsViz } from "./StringAlgorithmsViz";
import { TopologicalSortViz } from "./TopologicalSortViz";
import { WaterfallAnimationWidget } from "./WaterfallAnimationWidget";
import ChapterImage from "./ChapterImage";
import { Simulator } from "./Simulator";
import { PrefixSumViz } from "./visualizers/PrefixSumViz";
import { SparseTableViz } from "./visualizers/SparseTableViz";

/** Разбор поворота и песочница всегда идут парой: посмотрел — сразу повтори сам. */
/**
 * Анимация и песочница идут друг под другом, а не в две колонки: в узкой
 * колонке дерево сжималось до нечитаемого размера, а понятность здесь важнее
 * компактности. Между ними — подпись, объясняющая переход от «смотрю» к «делаю».
 */
const SplayRotationsPair: React.FC = () => (
  <div className="space-y-4">
    <SplayRotationsViz />
    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
      <span aria-hidden="true">👇</span>
      <span>
        Разобрался — проверь себя: ниже то же самое дерево, но крутить его нужно самому. Подсказок не будет, пока
        не решишь.
      </span>
    </p>
    <SplayRotationSandbox />
  </div>
);

export interface VizEntry {
  /** Заголовок панели/модалки. */
  title: string;
  /** Короткое пояснение, что здесь можно потыкать. */
  hint?: string;
  Component: React.FC;
}

/**
 * Единый реестр интерактивных демонстраций.
 * Используется и для панели под главой, и для всплывающих подсказок,
 * и для модального окна «Открыть симулятор».
 */
export const VIZ_REGISTRY: Record<string, VizEntry> = {
  "stack-dfs": {
    title: "Стек и обход в глубину",
    hint: "Кладите и снимайте тарелки — это ровно то, что делает рекурсия DFS.",
    Component: StackViz,
  },
  "queue-bfs": {
    title: "Очередь и обход в ширину",
    hint: "Очередь слева, живой BFS по графу справа.",
    Component: () => (
      <div className="space-y-10">
        <QueueViz />
        <BfsViz />
      </div>
    ),
  },
  "heap-beam-search": {
    title: "Куча (priority queue)",
    hint: "Добавляйте гипотезы — куча сама держит лучшую наверху.",
    Component: HeapViz,
  },
  "segment-trees": {
    title: "Дерево отрезков",
    hint: "Запросы и обновления на отрезке за O(log n).",
    Component: SegmentTreeVisualizer,
  },
  "sparse-table": {
    title: "Разреженная таблица (1D и 2D)",
    hint: "Наведите курсор на любую ячейку — подсветится отрезок, за который она отвечает.",
    Component: SparseTableViz,
  },
  "prefix-sums-2d": {
    title: "Префиксные суммы (1D и 2D)",
    hint: "Наведите на число — увидите, из чего оно сложилось.",
    Component: PrefixSumViz,
  },
  "dynamic-programming": {
    title: "Динамическое программирование",
    hint: "Таблица подзадач заполняется на глазах.",
    Component: DPVisualizer,
  },
  "splay-tree": {
    title: "Splay-дерево",
    hint: "Покадровый разбор трёх поворотов, песочница на них же и живое дерево целиком.",
    Component: () => (
      <div className="space-y-10">
        <SplayRotationsPair />
        <SplayTreeViz />
      </div>
    ),
  },
  "splay-rotations": {
    title: "Splay: Zig, Zig-Zig и Zig-Zag по шагам",
    hint: "Сверху — покадровый разбор поворота, снизу — песочница, где то же самое делаешь сам.",
    Component: () => <SplayRotationsPair />,
  },
  "graph-dfs-bfs": { title: "DFS и BFS на графе", Component: GraphTraversalViz },
  "top-sort": { title: "Топологическая сортировка", Component: TopologicalSortViz },
  "scc-kosaraju": { title: "Компоненты сильной связности (Косарайю)", Component: KosarajuViz },
  "graph-articulation": { title: "Точки сочленения", Component: ArticulationPointsViz },
  "bridges-code": { title: "Мосты: DFS + tin/low", Component: DfsBridgesSimulator },
  "euler-path-vs-cycle": { title: "Эйлеров путь и цикл", Component: EulerSimulator },
  "planarity-euler-formula": { title: "Планарность: K5 и K3,3", Component: PlanarityDemo },
  dijkstra: {
    title: "Дейкстра",
    hint: "Жадно забираем ближайшую вершину и релаксируем её рёбра.",
    Component: () => (
      <>
        <ChapterImage vizType="dijkstra" />
        <DijkstraViz />
      </>
    ),
  },
  "bellman-ford": {
    title: "Форд—Беллман",
    Component: () => (
      <>
        <ChapterImage vizType="bellman-ford" />
        <BellmanFordViz />
      </>
    ),
  },
  floyd: {
    title: "Флойд—Уоршелл",
    Component: () => (
      <>
        <ChapterImage vizType="floyd" />
        <FloydViz />
      </>
    ),
  },
  "johnson-algo": { title: "Алгоритм Джонсона", Component: JohnsonViz },
  "mst-kruskal": { title: "Краскал и DSU", Component: KruskalSimulator },
  "mst-prima": { title: "Прим", Component: KruskalSimulator },
  "mst-boruvka": { title: "Борувка", Component: KruskalSimulator },
  "string-kmp": { title: "Префикс-функция (КМП)", Component: () => <StringAlgorithmsViz defaultMode="kmp" /> },
  "string-z-func": { title: "Z-функция", Component: () => <StringAlgorithmsViz defaultMode="z" /> },
  "aho-corasick": {
    title: "Ахо—Корасик",
    hint: "Бор, суффиксные ссылки и BFS-обход по уровням.",
    Component: () => (
      <div className="space-y-10">
        <WaterfallAnimationWidget />
        <SalmonAutomatonWidget />
      </div>
    ),
  },
  intro: { title: "Мнемокарточки", Component: MnemonicCards },
  "everyday-basics": {
    title: "Бытовой тренажёр: стек, очередь, куча",
    hint: "Тарелки, очередь в столовой и мешок гипотез — три базовые структуры на житейских примерах.",
    Component: Simulator,
  },
};

export const getViz = (id?: string): VizEntry | undefined => (id ? VIZ_REGISTRY[id] : undefined);
