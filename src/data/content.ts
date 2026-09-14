import { Chapter } from "../types";
import { graphChapters } from "./graphContent";
import { additionalTickets } from "./additionalTickets";
import { tickets14to20 } from "./tickets/ticket14_20";
import { tickets21to24 } from "./tickets/ticket21_24";
import { tickets6to13 } from "./tickets/ticket6_13";
import { ticket1Segtree } from "./tickets/ticket1_segtree";
import { tickets18to20Mst } from "./tickets/ticket18_20_mst";
import { chapters as newChapters } from "./content_temp";

/**
 * Содержание пособия = билеты 1–24 из списка тем.
 *
 * Порядок массивов важен: при одинаковом id побеждает более поздняя (свежая)
 * версия главы. `newChapters` (content_temp) перетирает всё — это самые
 * поздние переписанные страницы (Эйлер, Мосты, Планарность, Точки сочленения).
 *
 * Страниц в содержании меньше, чем тем: одна страница может закрывать
 * несколько билетов сразу (18–20 «Остовное дерево: Краскал, Прима, Борувка» —
 * три алгоритма на одном графе с тремя вкладками в визуализации).
 */
const merged = [
  ...graphChapters,
  ...additionalTickets,
  ...tickets6to13,
  ...tickets14to20,
  ...tickets21to24,
  ...ticket1Segtree,
  ...tickets18to20Mst,
].filter((c) => c && c.id);

/**
 * Устаревшие/заменённые главы:
 *  - graph-planar-colors, graph-bridges, graph-euler,
 *    pathfinding-accel — короткие версии, заменены развёрнутыми страницами
 *    (graph-articulation НЕ удаляется: его короткая версия просто перетирается
 *    развёрнутой из content_temp — так работает dedup по id);
 *  - mst-kruskal, mst-prima, mst-boruvka — объединены в одну страницу `mst`;
 *  - intro, alg-map — заглушки без визуализации (полезное из «Алгоритмы на
 *    карте» переехало в билет 17 «Ускорения»: сжатие координат, ALT, CH).
 */
const toRemove = [
  "graph-planar-colors",
  "graph-bridges",
  "graph-euler",
  "pathfinding-accel",
  "mst-kruskal",
  "mst-prima",
  "mst-boruvka",
  "alg-map",
];

const dedup = new Map<string, Chapter>();
merged.forEach((c) => {
  if (!toRemove.includes(c.id)) {
    dedup.set(c.id, c);
  }
});

// Самые свежие версии страниц перетирают старые.
if (newChapters) {
  newChapters.forEach((c) => {
    if (!toRemove.includes(c.id)) dedup.set(c.id, c);
  });
}

const finalChapters = Array.from(dedup.values());

finalChapters.sort((a, b) => {
  // Главы без номера билета (введение) стоят ДО билетов, а не после всех.
  const numOf = (t: string) => {
    const m = t.match(/(\d+)/);
    return m ? parseInt(m[0], 10) : -1;
  };
  return numOf(a.title) - numOf(b.title);
});

export const chapters: Chapter[] = finalChapters;

/**
 * Билеты, закрытые каждой страницей (для шапки, экспорта и PDF-оглавления).
 * Страница `mst`, например, закрывает сразу 18, 19 и 20.
 */
export const chapterTopics: Record<string, number[]> = {
  "segment-trees": [1],
  "sparse-table": [2],
  treap: [3],
  "splay-tree": [4],
  "prefix-sums-2d": [5],
  "graph-dfs-bfs": [6],
  "planarity-euler-formula": [7],
  "graph-components": [8],
  "top-sort": [9],
  "scc-kosaraju": [10],
  "bridges-code": [11],
  "graph-articulation": [12],
  "euler-path-vs-cycle": [13],
  dijkstra: [14],
  "bellman-ford": [15],
  floyd: [16],
  "johnson-algo": [17],
  mst: [18, 19, 20],
  "string-kmp": [21],
  "string-z-func": [22],
  "aho-corasick": [23],
  "complexity-classes": [24],
};

/**
 * Разделы содержания: связанные темы стоят рядом.
 *
 * Номера билетов при этом не меняются — порядок страниц по-прежнему 1…24.
 * Раньше сайдбар группировал страницы по полю `category` в порядке первой
 * встречи, из-за чего графы расползались по семи группам: 6 и 8 рядом, 7
 * отдельно, 9 и 13 отдельно, 10–11 отдельно, а 12 «Точки сочленения» вообще
 * уезжали в «Прочие темы» — подальше от 11 «Мосты», с которыми их читают парой.
 * Теперь раздел один на семью тем, порядок разделов фиксирован.
 */
export const SECTIONS: { id: string; title: string; from: number; to: number }[] = [
  { id: "intro", title: "Введение", from: 0, to: 0 },
  { id: "arrays", title: "Массивы и деревья", from: 1, to: 5 },
  { id: "graphs", title: "Графы: обходы и структура", from: 6, to: 13 },
  { id: "paths", title: "Графы: пути и остов", from: 14, to: 20 },
  { id: "strings", title: "Строки", from: 21, to: 23 },
  { id: "theory", title: "Сложность и сведения", from: 24, to: 24 },
];

/** Раздел страницы — по её первому билету (у `mst` их три: 18, 19, 20). */
export function sectionOf(chapterId: string) {
  const tickets = chapterTopics[chapterId] ?? [];
  // Глав без билетов (введение) относим к первому разделу — оно открывает пособие.
  if (!tickets.length) return SECTIONS[0];
  const first = Math.min(...tickets);
  return SECTIONS.find((sec) => first >= sec.from && first <= sec.to) ?? SECTIONS[SECTIONS.length - 1];
}

export const activeVizIds = [
  "euler-path-vs-cycle","bridges-code","planarity-euler-formula",
  "graph-dfs-bfs","stack-dfs","queue-bfs","heap-beam-search",
  "dijkstra","bellman-ford","floyd","aho-corasick",
  "mst","string-kmp","string-z-func","segment-trees","sparse-table",
  "dynamic-programming","johnson-algo","graph-articulation","graph-components",
  "complexity-classes","treap","splay-tree","prefix-sums-2d",
];
