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
import { ColoringViz } from "./ColoringViz";
import { ComponentsViz } from "./ComponentsViz";
import { ComplexityClassesViz } from "./ComplexityClassesViz";
import { QueueViz } from "./QueueViz";
import { SalmonAutomatonWidget } from "./SalmonAutomatonWidget";
import { SegmentTreeVisualizer } from "./SegmentTreeVisualizer";
import SplayPlayground from "./SplayPlayground";
import { StackViz } from "./StackViz";
import { StringAlgorithmsViz } from "./StringAlgorithmsViz";
import { TopologicalSortViz } from "./TopologicalSortViz";
import { WaterfallAnimationWidget } from "./WaterfallAnimationWidget";
import ChapterImage from "./ChapterImage";
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
    title: "Splay: механика → большое дерево → собери сам",
    hint: "Три вкладки: покадровая механика поворотов в своём темпе, те же случаи на большом дереве (каждый одиночный поворот — кадры), и песочница «подними узел сам» с проверкой порядка.",
    Component: SplayPlayground,
  },
  "splay-rotations": {
    title: "Splay: механика → большое дерево → собери сам",
    hint: "Три вкладки: покадровая механика поворотов в своём темпе, те же случаи на большом дереве (каждый одиночный поворот — кадры), и песочница «подними узел сам» с проверкой порядка.",
    Component: SplayPlayground,
  },
  "graph-dfs-bfs": { title: "DFS и BFS на графе", Component: GraphTraversalViz },
  "top-sort": { title: "Топологическая сортировка", Component: TopologicalSortViz },
  "scc-kosaraju": { title: "Компоненты сильной связности (Косарайю)", Component: KosarajuViz },
  "graph-components": {
    title: "Компоненты связности: BFS-разметка",
    hint: "Каждый запуск обхода красит один «остров»; число запусков = число компонент. Компилятор читает v, comp[], q, count.",
    Component: ComponentsViz,
  },
  "graph-articulation": { title: "Точки сочленения", Component: ArticulationPointsViz },
  "bridges-code": { title: "Мосты: DFS + tin/low", Component: DfsBridgesSimulator },
  "euler-path-vs-cycle": { title: "Эйлеров путь и цикл", Component: EulerSimulator },
  "planarity-euler-formula": {
    title: "Планарность: K5/K3,3 + раскраска",
    hint: "Слева — непланарные графы с подсветкой пересечений; ниже — жадная раскраска: кликни цвет и вершину, конфликты видны сразу.",
    Component: () => (
      <div className="space-y-10">
        <PlanarityDemo />
        <ColoringViz />
      </div>
    ),
  },
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
  "mst-kruskal": { title: "Краскал и DSU", hint: "Сортируем рёбра по весу и жадно берём те, что не создают цикл (DSU/раскраска кланов).", Component: () => <KruskalSimulator defaultAlgo="kruskal" /> },
  "mst-prima": { title: "Прим (плесень растёт от старта)", hint: "Дерево растёт от стартовой вершины: из кучи каждый раз достаём самое дешёвое ребро наружу.", Component: () => <KruskalSimulator defaultAlgo="prim" /> },
  "mst-boruvka": { title: "Борувка (коллективизация)", hint: "Каждая компонента параллельно выбирает своё самое дешёвое исходящее ребро — за фазу компонент становится вдвое меньше.", Component: () => <KruskalSimulator defaultAlgo="boruvka" /> },
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
  "complexity-classes": {
    title: "Классы сложности: матрёшка P ⊆ NP ⊆ PSPACE",
    hint: "Кликни класс или задачу; стрелки ≤p показывают сведения. Компилятор читает cls, task, reductions.",
    Component: ComplexityClassesViz,
  },
  intro: { title: "Мнемокарточки", Component: MnemonicCards },
};

export const getViz = (id?: string): VizEntry | undefined => (id ? VIZ_REGISTRY[id] : undefined);
