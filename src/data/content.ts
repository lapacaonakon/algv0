import { Chapter } from "../types";
import { graphChapters } from "./graphContent";
import { additionalTickets } from "./additionalTickets";
import { tickets1to5 } from "./tickets/ticket1_5";
import { tickets14to20 } from "./tickets/ticket14_20";
import { tickets21to24 } from "./tickets/ticket21_24";
import { tickets6to13 } from "./tickets/ticket6_13";
import { chapters as extraChapters } from "./content_temp";

/**
 * Канонический порядок тем (билеты 1–24) и «правильные названия»:
 * одна страница может раскрывать одну тему или несколько близких,
 * поэтому названия выверяются по единому списку ниже.
 */
const CANON: Record<string, { num: number; title: string }> = {
  "segment-trees": { num: 1, title: "1. Дерево отрезков с операциями на отрезках" },
  "sparse-table": { num: 2, title: "2. Двумерная разреженная матрица (Sparse Table)" },
  treap: { num: 3, title: "3. Декартово дерево (Treap)" },
  "splay-tree": { num: 4, title: "4. Splay-дерево" },
  "prefix-sums-2d": { num: 5, title: "5. Двумерная матрица префиксных сумм" },
  "graph-dfs-bfs": { num: 6, title: "6. Графы. Представление графов, DFS, BFS" },
  "planarity-euler-formula": { num: 7, title: "7. Графы. Планарные. Покраска" },
  "graph-components": { num: 8, title: "8. Графы. Компоненты связности" },
  "top-sort": { num: 9, title: "9. Графы. Топологическая сортировка" },
  "scc-kosaraju": { num: 10, title: "10. Графы. Компоненты сильной связности" },
  "bridges-code": { num: 11, title: "11. Графы. Мосты" },
  "graph-articulation": { num: 12, title: "12. Графы. Точки сочленения" },
  "euler-path-vs-cycle": { num: 13, title: "13. Графы. Эйлеров цикл (и эйлеров путь)" },
  dijkstra: { num: 14, title: "14. Графы. Поиск кратчайшего пути. Дейкстра" },
  "bellman-ford": { num: 15, title: "15. Графы. Поиск кратчайшего пути. Форд-Беллман" },
  floyd: { num: 16, title: "16. Графы. Поиск кратчайшего пути. Флойд" },
  "johnson-algo": { num: 17, title: "17. Графы. Поиск кратчайшего пути. Ускорения (алгоритм Джонсона)" },
  "mst-kruskal": { num: 18, title: "18. Графы. Остовное дерево. Краскал" },
  "mst-prima": { num: 19, title: "19. Графы. Остовное дерево. Прима" },
  "mst-boruvka": { num: 20, title: "20. Графы. Остовное дерево. Борувка" },
  "string-kmp": { num: 21, title: "21. Алгоритм Кнута-Морриса-Пратта (префикс-функция)" },
  "string-z-func": { num: 22, title: "22. Z-функция" },
  "aho-corasick": { num: 23, title: "23. Алгоритм Ахо-Корасик" },
  "complexity-classes": { num: 24, title: "24. Классы сложности, сведение задач" },
};

const merged = [
  ...graphChapters,
  // билет 1 (segment-trees) есть только здесь; остальные темы 1–5 ниже свежее
  ...tickets1to5,
  ...additionalTickets,
  ...tickets6to13,
  ...tickets14to20,
  ...tickets21to24,
  ...extraChapters,
].filter((c) => c && c.id);

// Старые версии страниц, у которых есть свежая замена с другим id:
//   graph-planar-colors → planarity-euler-formula, graph-bridges → bridges-code,
//   graph-euler → euler-path-vs-cycle, pathfinding-accel → johnson-algo.
const stale = new Set([
  "graph-planar-colors",
  "graph-bridges",
  "graph-euler",
  "pathfinding-accel",
]);

// Дубликаты: берём последнюю (самую свежую) версию страницы; заглушки выкидываем.
const dedup = new Map<string, Chapter>();
merged.forEach((c) => {
  if (c.id === "alg-map") return; // страница-заглушка без содержания
  if (stale.has(c.id)) return;
  dedup.set(c.id, c);
});

// Нормализуем названия по каноническому списку тем, а разделы оглавления —
// по учебным блокам: блоки идут строго в порядке чтения, внутри блока — по
// номерам билетов. Близкие темы (1–5, 14–17, 18–20, 21–23) стоят рядом.
const BLOCKS: [number, number, string][] = [
  [1, 5, "Билеты 1–5 · Структуры и матрицы"],
  [6, 13, "Билеты 6–13 · Графы: обходы и связность"],
  [14, 17, "Билеты 14–17 · Кратчайшие пути"],
  [18, 20, "Билеты 18–20 · Остовные деревья"],
  [21, 23, "Билеты 21–23 · Строки"],
  [24, 24, "Билет 24 · Теория сложности"],
];
const blockOf = (num: number): string => BLOCKS.find(([lo, hi]) => num >= lo && num <= hi)?.[2] ?? "Билеты 1–24";

const withCanon = Array.from(dedup.values()).map((c) => {
  const canon = CANON[c.id];
  if (canon) return { ...c, title: canon.title, category: blockOf(canon.num) };
  return { ...c, category: "Введение" }; // страницы вне списка билетов — в начало
});

// Сначала вводная страница, затем билеты 1–24 по порядку.
const numbered = withCanon.filter((c) => CANON[c.id]);
numbered.sort((a, b) => CANON[a.id].num - CANON[b.id].num);
const extras = withCanon
  .filter((c) => !CANON[c.id])
  .sort((a, b) => a.title.localeCompare(b.title, "ru"));

export const chapters: Chapter[] = [...extras, ...numbered];

/**
 * «Читать рядом»: связанные билеты, которые логично открыть следом
 * (блок рисуется внизу страницы). Ссылки кликабельны и ведут на страницу.
 */
export const RELATED: Record<string, string[]> = {
  "segment-trees": ["sparse-table", "prefix-sums-2d"],
  "sparse-table": ["prefix-sums-2d", "segment-trees"],
  "prefix-sums-2d": ["sparse-table", "segment-trees"],
  treap: ["splay-tree", "segment-trees"],
  "splay-tree": ["treap", "segment-trees"],
  "graph-dfs-bfs": ["graph-components", "top-sort"],
  "planarity-euler-formula": ["euler-path-vs-cycle", "graph-dfs-bfs"],
  "graph-components": ["graph-dfs-bfs", "scc-kosaraju"],
  "top-sort": ["scc-kosaraju", "graph-dfs-bfs"],
  "scc-kosaraju": ["top-sort", "graph-components"],
  "bridges-code": ["graph-articulation", "graph-dfs-bfs"],
  "graph-articulation": ["bridges-code", "graph-components"],
  "euler-path-vs-cycle": ["planarity-euler-formula", "graph-dfs-bfs"],
  dijkstra: ["bellman-ford", "floyd"],
  "bellman-ford": ["dijkstra", "johnson-algo"],
  floyd: ["dijkstra", "johnson-algo"],
  "johnson-algo": ["bellman-ford", "dijkstra"],
  "mst-kruskal": ["mst-prima", "mst-boruvka"],
  "mst-prima": ["mst-kruskal", "mst-boruvka"],
  "mst-boruvka": ["mst-kruskal", "mst-prima"],
  "string-kmp": ["string-z-func", "aho-corasick"],
  "string-z-func": ["string-kmp", "aho-corasick"],
  "aho-corasick": ["string-kmp", "string-z-func"],
  "complexity-classes": [],
};
