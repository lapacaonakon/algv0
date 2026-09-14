// Самотест связки «шаблон → init-скелет»: extractInit обязан сохранять
// демо-переменные, которые потребляют визуализации (регресс бага segment-trees).
import { PAGE_SYNC, buildInitTemplate } from "../../src/data/vizSync";

let n = 0;
function ok(cond: boolean, label: string) {
  console.log(`${cond ? "OK" : "FAIL"} ${label}`);
  if (!cond) process.exitCode = 1;
  n++;
}

const init = (id: string, demoId?: string) => buildInitTemplate(id, "т", demoId);

// 1. segment-trees: v/l/r/m/ul/ur/add живут ДО def build → обязаны попасть в init
const seg = init("segment-trees");
for (const v of ["v, l, r", "m =", "ul, ur, add", "tree = [0]", "lazy = [0]"]) {
  ok(seg.includes(v), `segment-trees init содержит «${v}»`);
}
ok(!seg.includes("def build"), "segment-trees init не содержит def build");

// 2. splay: числовой key + кадр i
const sp = init("splay-tree");
ok(sp.includes("key = 32") && sp.includes("keys = [50"), "splay-tree init содержит key=32 и keys");

// 3. КМП/Z: pattern/text/s попадают в init
const kmp = init("string-kmp");
ok(kmp.includes('pattern = "aba"') && kmp.includes('s = pattern + "#" + text'), "string-kmp init содержит pattern/text/s");

// 4. Форду-Беллману — рёбра реального графа (S→A = 4, есть D→A = −2), без break-заглушки
const bf = PAGE_SYNC["bellman-ford"].code ?? "";
ok(bf.includes('("S", "A", 4)') && bf.includes('("D", "A", -2)'), "bellman-ford: рёбра совпадают с визой");
ok(!bf.includes('("S", "A", 5)'), "bellman-ford: заглушка (S,A,5) удалена");
ok(!/break/.test(bf), "bellman-ford: без break");

// 5. Джонсон: h(B) = −2, ребро −2, w′ = 0
const jh = PAGE_SYNC["johnson-algo"].code ?? "";
ok(jh.includes('"B": -2') && jh.includes("w_new = w + h[u] - h[v]"), "johnson: h и формула w′");

// 6. Краскал/Прим/Борувка: 9 вершин и вес 51
for (const id of ["mst-kruskal", "mst-boruvka"]) {
  const c = PAGE_SYNC[id].code ?? "";
  ok(/ABCDEFGHI/.test(c), `${id}: 9 вершин A..I`);
}
ok((PAGE_SYNC["mst-prima"].code ?? "").match(/"I":/g)?.length === 1, "mst-prima: вершина I в смежности");
ok((PAGE_SYNC["mst-kruskal"].code ?? "").includes('(13, "F", "I")'), "mst-kruskal: ребро F-I=13");

// 7. prefix-sums-2d#2d: пометка 1-индексных клеток
const p2 = PAGE_SYNC["prefix-sums-2d#2d"].code ?? "";
ok(p2.includes("клетки 1-индексные"), "prefix#2d: комментарий про 1-индексацию");

// 8. графы top-sort/scc/graph-dfs-bfs/graph-components совпадают с демо виз
ok((PAGE_SYNC["top-sort"].code ?? "").includes("0: [1, 2]"), "top-sort: граф демо 0→1,0→2");
ok((PAGE_SYNC["scc-kosaraju"].code ?? "").includes("2: [0, 3]") && (PAGE_SYNC["scc-kosaraju"].code ?? "").includes("4: [3]"), "scc: граф демо");
ok((PAGE_SYNC["graph-dfs-bfs"].code ?? "").includes('adj = {"A": ["B", "C"]'), "dfs-bfs: граф демо A..G");
ok((PAGE_SYNC["graph-components"].code ?? "").includes('"J"'), "components: 10 вершин A..J");

// 9. каждый шаблон непуст и у каждого id есть variables
for (const [id, sync] of Object.entries(PAGE_SYNC)) {
  if (sync.code) {
    ok(sync.code.trim().length > 0, `${id}: код непуст`);
    ok(sync.variables.length > 0, `${id}: variables описаны`);
  }
}

console.log(`\nBUNDLE SELFTEST: ${n} проверок, ${process.exitCode ? "ЕСТЬ ПРОВАЛЫ" : "все OK"}`);
