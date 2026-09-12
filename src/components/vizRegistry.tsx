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
import SplayWalkViz from "./SplayWalkViz";
import { StackViz } from "./StackViz";
import { StringAlgorithmsViz } from "./StringAlgorithmsViz";
import { TopologicalSortViz } from "./TopologicalSortViz";
import { WaterfallAnimationWidget } from "./WaterfallAnimationWidget";
import ChapterImage from "./ChapterImage";
import { Simulator } from "./Simulator";
import { PrefixSumViz } from "./visualizers/PrefixSumViz";
import { SparseTableViz } from "./visualizers/SparseTableViz";
import { TreapBuildViz } from "./TreapBuildViz";

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
  treap: {
    title: "Treap: плоскость → дерево → Split/Merge/Erase",
    hint: "7 вкладок: Собрать (сортировка + соединение + автопроверка), Split, Merge, Erase, миф 2k/2k+1, поиск ≠ сортировка, Игра 🖱️ — собери дерево мышкой, судья-инварианты объясняет каждый запрещённый ход.",
    Component: TreapBuildViz,
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
    title: "Splay на большом дереве, пошагово",
    hint: "Кликни узел — он поднимется в корень по одному повороту: прицел ребра, поворот, переехавшие поддеревья. Zig-Zig — верхнее ребро первым, Zig-Zag — нижним.",
    Component: SplayWalkViz,
  },
  "splay-rotations": {
    title: "Zig / Zig-Zig / Zig-Zag на большом дереве",
    hint: "Те же случаи, что в конспекте, но на настоящем дереве: каждый одиночный поворот — отдельный шаг.",
    Component: SplayWalkViz,
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
