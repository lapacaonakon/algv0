import { Chapter } from '../../types';

/**
 * Билеты 18 · 19 · 20 — одна страница на три алгоритма построения
 * минимального остовного дерева (MST). Так же, как в самой визуализации
 * KruskalSimulator, три алгоритма живут на одном графе из 9 вершин и
 * переключаются вкладками «Краскал / Прима / Борувка».
 *
 * Синхронизация с компилятором: PAGE_SYNC["mst"] + подрежимы
 * "mst#kruskal", "mst#prim", "mst#boruvka" (вкладка сообщает о себе
 * через emitVizDemo, код в панели следует за ней).
 */
export const tickets18to20Mst: Chapter[] = [
  {
    id: "mst",
    title: "18–20. Графы. Остовное дерево: Краскал, Прима, Борувка",
    type: "html",
    description:
      "Три способа построить минимальное остовное дерево: сортировка рёбер + DSU, растущее облако с кучей и параллельные слияния компонент.",
    category: "Графы. Остовные",
    content: `
<section id="mst" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билеты 18 · 19 · 20</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Остовное дерево: Краскал, Прима, Борувка</h2>
    </div>

    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Что вообще строим</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Остовное дерево — подграф, в котором все V вершин, ровно V − 1 ребро, нет циклов и он связен. MST — такое остовное дерево, у которого сумма весов рёбер минимальна.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Все три алгоритма — <b>жадные</b>, и все три опираются на одну теорему. <b>Свойство разреза (cut property):</b> разрежем вершины на две части как угодно; самое лёгкое ребро, пересекающее разрез, входит в некоторое MST. Алгоритмы отличаются только тем, <b>какой разрез</b> они выбирают на каждом шаге: Краскал — «одна вершина против всех», Прим — «выросшее дерево против остального графа», Борувка — «каждая компонента против всех сразу».</p>

            <div class="bg-slate-800 p-5 rounded-lg border border-amber-500/40 my-6">
                <h4 class="text-amber-400 font-bold text-base mb-2">💡 Ассоциация: остоВ vs остРов</h4>
                <p class="text-slate-200 text-sm font-semibold mb-2">ОСТРОВ = ОСТОВ + Р.</p>
                <p class="text-slate-300 text-sm mb-3"><b>«Р» — это лишнее Ребро.</b> Выкидываешь лишние рёбра из графа — из «острова» выпадает буква Р — остаётся <b>остов</b>.</p>
                <p class="text-slate-300 text-sm">Остов — это ещё и <b>скелет</b> (остов корабля, остов здания). Минимальный остов = скелет графа: минимум костей, чтобы всё держалось и не разваливалось. Добавишь кость — получишь цикл.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Второй инструмент — <b>свойство цикла (cycle property):</b> самое тяжёлое ребро в цикле никогда не входит в MST. Именно его использует Краскал, когда отбрасывает ребро, замыкающее цикл: раз ребро самое тяжёлое в образовавшемся цикле (рёбра-то мы берём по возрастанию), оно лишнее.</p>

            <div class="overflow-x-auto my-6">
                <table class="w-full text-xs text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Алгоритм</th>
                            <th class="py-2 pr-3 font-bold">Идея одним предложением</th>
                            <th class="py-2 pr-3 font-bold">Главная структура</th>
                            <th class="py-2 pr-3 font-bold">Сложность</th>
                            <th class="py-2 font-bold">Когда брать</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold text-indigo-300">18 · Краскал</td>
                            <td class="py-2 pr-3">Рёбра по возрастанию веса; берём, если не замыкает цикл</td>
                            <td class="py-2 pr-3 font-mono">сортировка + DSU</td>
                            <td class="py-2 pr-3 font-mono text-emerald-300">O(E log E)</td>
                            <td class="py-2">рёбра даны списком, граф разреженный, нужен простой код</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold text-emerald-300">19 · Прим</td>
                            <td class="py-2 pr-3">Растём одним связным куском: самое лёгкое ребро наружу</td>
                            <td class="py-2 pr-3 font-mono">куча (priority queue)</td>
                            <td class="py-2 pr-3 font-mono text-emerald-300">O(E log V), с кучей Фибоначчи O(E + V log V), без кучи O(V²)</td>
                            <td class="py-2">плотный граф, граф задан списками смежности, нужен один «куст»</td>
                        </tr>
                        <tr class="align-top">
                            <td class="py-2 pr-3 font-bold text-rose-300">20 · Борувка</td>
                            <td class="py-2 pr-3">Все компоненты одновременно тянут своё cheapest-ребро наружу</td>
                            <td class="py-2 pr-3 font-mono">DSU + проход по рёбрам</td>
                            <td class="py-2 pr-3 font-mono text-emerald-300">O(E log V)</td>
                            <td class="py-2">параллельные/GPU-реализации, граф-матрица, много компонент</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-indigo-500 shadow-md">
                        🛠️ Аналогия к билету 18 · Краскал: прокладка кабеля
                    </div>
                    <p class="text-slate-300 text-sm">Связать все города интернетом. Краскал говорит: «строим с самых дешёвых дорог страны». По всей карте растут независимые кусочки сети (лес), DSU следит, кто уже с кем связан, — и в конце куски сливаются в единое дерево. Порядок рёбер важен, порядок вершин — нет.</p>
                </div>

                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ☣️ Аналогия к билету 19 · Прим: заражение вирусом
                    </div>
                    <p class="text-slate-300 text-sm">Прим ведёт себя как ползучая грибница: стартуем из одного города, и «щупальце» всегда захватывает ближайший непосещённый город. Сеть всё время одна связная — никакого леса. Разрез здесь ровно один: «внутри дерева» против «снаружи».</p>
                </div>

                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🤝 Аналогия к билету 20 · Борувка: племена
                    </div>
                    <p class="text-slate-300 text-sm">Сначала каждый город — отдельное племя. В первый день каждое племя шлёт гонца к ближайшему чужому племени: к вечеру компонент вдвое меньше. На второй день уже царства шлют гонцов к ближайшему чужому царству. За <b>log₂ V</b> дней образуется единая федерация — поэтому O(E log V), а по рёбрам мы ходим «все сразу».</p>
                </div>
            </div>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-6">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>MST и кратчайшие пути — разные задачи.</b> Дейкстра (билет 14) минимизирует расстояние от одной вершины до каждой; MST минимизирует суммарный вес дерева. Дерево Прима похоже на дерево Дейкстры, но ключ в куче другой: у Прима — вес ребра к дереву, у Дейкстры — расстояние от старта. На графе с одним «длинным» ребром ответы расходятся.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>«MST единственно»</b> — единственно только при попарно различных весах. При равных весах деревьев может быть несколько, но их <i>суммарный вес</i> всегда один.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Краскал без DSU</b> превращается в O(E·V): проверка «не замыкает ли цикл» обходом вместо почти-константного find/union.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Рёбер в ответе V − 1</b>, а не V. Если в конце их меньше — граф был несвязный, и Краскал построил минимальный остовный <i>лес</i>.</p>
                <p class="text-slate-400 text-sm">· <b>Борувка: два племени могут выбрать друг друга одновременно</b> — ребро добавится один раз, DSU спасает от дубля (find(u) == find(v) → пропускаем).</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> Краскал <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E log E)</code> (сортировка доминирует, DSU почти бесплатный); Прим с двоичной кучей <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E log V)</code>, на плотном графе проще взять версию без кучи <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V²)</code>; Борувка <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E log V)</code> — log V фаз по проходу всех рёбер. Память у всех <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V + E)</code>.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код 18: Краскал + DSU (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">vector&lt;pair&lt;int, pair&lt;int,int&gt;&gt;&gt; edges;   // (вес, (u, v))
vector&lt;int&gt; p, rnk;

int find(int v) { return p[v] == v ? v : p[v] = find(p[v]); }  // сжатие пути
bool unite(int a, int b) {                                     // union by rank
    a = find(a); b = find(b);
    if (a == b) return false;              // уже в одной компоненте → цикл
    if (rnk[a] &lt; rnk[b]) swap(a, b);
    p[b] = a;
    if (rnk[a] == rnk[b]) rnk[a]++;
    return true;
}

sort(edges.begin(), edges.end());          // O(E log E)
long long cost = 0; int taken = 0;
for (auto [w, uv] : edges) {
    if (unite(uv.first, uv.second)) {      // не замыкает цикл → берём
        cost += w;
        if (++taken == n - 1) break;       // V − 1 ребро — дерево готово
    }
}</pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код 19: Прим с кучей (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">import heapq

INF = float("inf")
key = [INF] * n          # минимальный вес ребра, ведущего в вершину из дерева
used = [False] * n
key[0] = 0
heap = [(0, 0)]          # (вес ребра, вершина)  ← вот тут отличие от Дейкстры
total = 0

while heap:
    w, v = heapq.heappop(heap)
    if used[v]:
        continue         # устаревшая запись в куче
    used[v] = True
    total += w
    for to, weight in graph[v]:
        if not used[to] and weight &lt; key[to]:
            key[to] = weight
            heapq.heappush(heap, (weight, to))
print(total)</pre>
                    <p class="text-slate-400 text-xs">Сравните с Дейкстрой: там <span class="font-mono">dist[to] = dist[v] + weight</span> (накапливаем путь от старта), здесь <span class="font-mono">key[to] = weight</span> (только вес последнего ребра). Одна строка — другая задача.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код 20: Борувка (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">parent = list(range(n))
def find(v):
    while parent[v] != v:
        parent[v] = parent[parent[v]]
        v = parent[v]
    return v

comps = n
total = 0
while comps &gt; 1:
    best = {}                              # компонента → её cheapest ребро
    for w, u, v in edges:
        cu, cv = find(u), find(v)
        if cu == cv:
            continue                       # уже внутри одной компоненты
        if cu not in best or w &lt; best[cu][0]:
            best[cu] = (w, u, v)
        if cv not in best or w &lt; best[cv][0]:
            best[cv] = (w, u, v)
    if not best:
        break                              # граф несвязный
    for w, u, v in best.values():
        if find(u) == find(v):
            continue                       # дубль: два племени выбрали друг друга
        parent[find(u)] = find(v)
        comps -= 1
        total += w
print(total)</pre>
                    <p class="text-slate-400 text-xs">За фазу компонент становится минимум вдвое меньше (каждое слияние убирает хотя бы одну), значит фаз не больше log₂ V.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🎓 Вопросы, которые любят задавать (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>· Почему жадность здесь работает? — cut property: самое лёгкое ребро разреза безопасно добавлять; доказательство обменом ребра в предполагаемом MST.</p>
                    <p>· Чем Прим отличается от Дейкстры? — ключом в куче (вес ребра против расстояния от старта) и целью (дерево минимального веса против дерева кратчайших путей).</p>
                    <p>· Какой алгоритм лучше на плотном графе (E ≈ V²)? — Прим без кучи, O(V²): сортировка E рёбер у Краскала дороже.</p>
                    <p>· Зачем нужна Борувка, если есть Краскал? — она естественно параллельная: cheapest-рёбра для всех компонент ищутся независимо, поэтому её любят на GPU и в распределённых системах.</p>
                    <p>· Что если граф несвязный? — все три построят минимальный остовный <b>лес</b>; рёбер будет V − (число компонент).</p>
                    <p>· Как найти второе по величине остовное дерево? — для каждого ребра не из MST добавляем его и убираем максимальное ребро на образовавшемся цикле (LCA + максимум на пути).</p>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
];
