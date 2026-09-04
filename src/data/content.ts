import { Chapter } from "../types";
import { graphChapters } from "./graphContent";
import { additionalTickets } from "./additionalTickets";
import { tickets14to20 } from "./tickets/ticket14_20";
import { tickets21to24 } from "./tickets/ticket21_24";
import { tickets6to13 } from "./tickets/ticket6_13";
import { chapters as newChapters } from "./content_temp";

// We want to combine all of them, but overwrite 7, 11, 13 with the new forms.
const merged = [
  ...graphChapters,
  ...additionalTickets,
  ...tickets6to13,
  ...tickets14to20,
  ...tickets21to24
].filter(c => c && c.id);

// Remove old 7, 11, 12, 13: graph-planar-colors, graph-bridges, graph-articulation, graph-euler, and old 17 pathfinding-accel
const toRemove = ["graph-planar-colors", "graph-bridges", "graph-articulation", "graph-euler", "pathfinding-accel"];

const dedup = new Map<string, Chapter>();
merged.forEach(c => {
  if (!toRemove.includes(c.id)) {
    // We prefer the newer versions (like tickets14_20 vs additionalTickets vs graphContent)
    dedup.set(c.id, c);
  }
});

// Add the new ones
if (newChapters) {
  newChapters.forEach(c => dedup.set(c.id, c));
}

const finalChapters = Array.from(dedup.values());

finalChapters.sort((a, b) => {
  const numA = parseInt(a.title.match(/(\d+)/)?.[0] || "999");
  const numB = parseInt(b.title.match(/(\d+)/)?.[0] || "999");
  return numA - numB;
});

export const chapters: Chapter[] = finalChapters;

export const activeVizIds = [
  "euler-path-vs-cycle","bridges-code","planarity-euler-formula",
  "graph-dfs-bfs","stack-dfs","queue-bfs","heap-beam-search",
  "intro","dijkstra","bellman-ford","floyd","aho-corasick",
  "mst-kruskal","mst-prima","mst-boruvka","string-kmp",
  "string-z-func","segment-trees","sparse-table","dynamic-programming", "johnson-algo", "graph-articulation"
];
