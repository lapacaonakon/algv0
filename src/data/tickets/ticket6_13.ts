import { Chapter } from "../types";

export const tickets6to13: Chapter[] = [
  {
    id: "graph-dfs-bfs",
    title: "6. Графы. Представление, DFS, BFS",
    type: "html",
    description: "Представление графов и базовые обходы",
    category: "Графы. База",
    content: `
<section id="graph-dfs-bfs" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 6</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Графы. Представление, DFS, BFS</h2>
    </div>
    <div class="space-y-8">
        {/* База представлений */}
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-slate-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-slate-300 mb-4">Матрица vs Списки смежности</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-slate-500/30">
                <p class="text-lg text-slate-300 italic mb-2">Сложность хранения и обхода:</p>
                <p class="text-xl font-mono text-white">Матрица: O(V^2) памяти. Обход за O(V^2).<br>Списки смежности: O(V + E). Обход за O(V + E).</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗺️ Аналогия: Матрица = Таблица
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Матрица — таблица всех жителей Земли против всех. 99.9% таблицы пусто! Выглядит глупо, но проверка "знает ли Вася Петю" мгновенна.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        📱 Аналогия: Списки = Контакты
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Списки — записная книжка в телефоне. У каждого записано только те, кого он знает. Оптимально для почти всех задач.</p>
                </div>
            </div>
        </div>

        {/* DFS vs BFS */}
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Два короля обходов: DFS и BFS</h3>
            
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <!-- Аналогия DFS -->
                <div class="bg-slate-800 p-6 rounded-lg border border-indigo-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-indigo-900 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-indigo-500 shadow-md">
                        🕵️‍♂️ DFS (Поиск в глубину) = Жадный лабиринт
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        <b>Что делает:</b> Жадный алгоритм. Он прёт вперёд (вглубь) до упора. Берёт первую попавшуюся связанную непосещённую вершину (например, минимальную по номеру или по алфавиту) и идёт туда. Как только тупик — делает шаг назад по своим следам (рекурсивно) и пробует другой путь.
                    </p>
                    <ul class="text-xs text-indigo-300 list-disc list-inside space-y-1">
                        <li><b>Где используется:</b></li>
                        <li>Топологическая сортировка (Билет 10)</li>
                        <li>Поиск мостов и точек сочленения (Билет 11, 12)</li>
                        <li>Сильно связные компоненты Косарайю (Билет 10)</li>
                        <li>Поиск циклов и просто проверка связности.</li>
                    </ul>
                </div>
                
                <!-- Аналогия BFS -->
                <div class="bg-slate-900 p-6 rounded-lg border border-emerald-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-emerald-900 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌊 BFS (Поиск в ширину) = Волна
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        <b>Что делает:</b> Концентрические круги (слои). За один «ход» посещает ВСЕХ соседей. Потом всех соседей соседей. Работает через Очередь (FIFO). Продвигается медленно и ровно во все стороны, как круги по воде или лесной пожар.
                    </p>
                    <ul class="text-xs text-emerald-300 list-disc list-inside space-y-1">
                        <li><b>Где используется:</b></li>
                        <li>Кратчайший путь в Невзвешенном графе (лабиринт)</li>
                        <li>Алгоритм Ахо-Корасик (сборка автоматов)</li>
                        <li>Алгоритм Форда-Фалкерсона / Диница (Сложная теория)</li>
                        <li>Двунаправленный поиск для ускорения Дейкстры.</li>
                    </ul>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код обходов C++ (Основа)
                </summary>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs font-mono text-slate-300">
                    <pre class="bg-slate-950 p-3 rounded overflow-x-auto border border-indigo-900/50">
// DFS (Рекурсия)
vector&lt;bool&gt; vis;
vector&lt;vector&lt;int&gt;&gt; adj;

void dfs(int v) {
    vis[v] = true;
    for (int u : adj[v]) {
        if (!vis[u]) dfs(u);
    }
}</pre>
                    <pre class="bg-slate-950 p-3 rounded overflow-x-auto border border-emerald-900/50">
// BFS (Очередь)
queue&lt;int&gt; q;
q.push(start_node);
vis[start_node] = true;

while(!q.empty()) {
    int v = q.front(); q.pop();
    for (int u : adj[v]) {
        if (!vis[u]) {
            vis[u] = true;
            q.push(u);
        }
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-planar-colors",
    title: "7. Графы. Планарные. Покраска",
    type: "html",
    description: "Формула Эйлера и теорема о 4 красках.",
    category: "Графы. Теория",
    content: `
<section id="graph-planar-colors" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 7</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Графы. Планарные. Покраска</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Формула Эйлера</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">V - E + F = 2 (Вершины - Рёбра + Грани = 2).<br>Теорема о 4 красках: любой планарный граф можно раскрасить 4 цветами.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗺️ Аналогия 1: Карта мира
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Планарный граф — это обычная политическая карта мира на глобусе. Страны — грани. Границы не пересекаются в одной точке по-дурацки, они лежат на плоскости. И раскрасить такую карту, чтобы две соседние страны не сливались цветами, Всегда можно всего ТРЕМЯ-ЧЕТЫРЬМЯ банками краски!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-components",
    title: "8. Графы. Компоненты связности",
    type: "html",
    description: "Нахождение кусков графа",
    category: "Графы. База",
    content: `
<section id="graph-components" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 8</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Компоненты связности</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Поиск кусков графа</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Запускаем DFS/BFS от каждой непосещенной вершины. Цикл внешних запусков дает количество компонент.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏝️ Аналогия 1: Острова
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Ты десантируешься на любой кусок земли. Красишь его краской. Затем смотришь на карту — остались ли серые (неисследованные) зоны? Если да — прыгаешь туда и красишь второй остров. Сколько раз пришлось прыгать через океан — столько и компонент.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "top-sort",
    title: "9. Графы. Топологическая сортировка",
    type: "html",
    description: "Разложение задач по порядку выполнения",
    category: "Графы",
    content: `
<section id="top-sort" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 9</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Топологическая сортировка</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Квест-цепочка</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">DFS с сохранением вершин в стек В МОМЕНТ ВЫХОДА (post-order). Вывод: стек задом-наперед.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎓 Аналогия 1: Учеба в вузе
                    </div>
                    <p class="text-slate-300 text-sm mb-4">У тебя есть предметы. "Матан 2" нельзя взять, если не сдал "Матан 1". Топологическая сортировка — это расписание, которое гарантрует, что ты не встретишь предмет, пререквизиты которого ты еще не прошел.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ограничения: Циклы
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Не работает на грахах с циклами. "Чтобы устроиться на работу нужен опыт. Чтобы получить опыт, нужна работа". Алгоритм выявит цикл и скажет, что отсортировать невозможно.</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Душный мод: Код на C++ (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4" onClick="event.stopPropagation()">
                    <p class="text-indigo-400 font-bold">Обход в глубину с разворотом списка:</p>
                    <div class="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                        <pre class="text-xs font-mono text-emerald-400 whitespace-pre">
vector&lt;int&gt; adj[MAXN];
bool visited[MAXN];
vector&lt;int&gt; ans;

void dfs(int v) {
    visited[v] = true;
    for (int to : adj[v]) {
        if (!visited[to]) {
            dfs(to);
        }
    }
    ans.push_back(v); // Добавляем в момент ВЫХОДА (post-order)
}

void topological_sort(int n) {
    for (int i = 0; i &lt; n; ++i) {
        if (!visited[i]) dfs(i);
    }
    reverse(ans.begin(), ans.end()); // Разворачиваем стек
}</pre>
                    </div>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "scc-kosaraju",
    title: "10. Графы. Компоненты сильной связности (SCC)",
    type: "html",
    description: "Разбиение орграфа на макро-вершины. Алгоритм Косарайю.",
    category: "Графы. Продвинутые",
    content: `
<section id="scc-kosaraju" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 10</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Компоненты сильной связности (SCC)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">10.1 Максимальный клуб взаимопомощи</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое определение:</p>
                <div class="text-left font-mono text-sm text-slate-300 space-y-3 max-w-xl mx-auto">
                    <p><strong class="text-white">Компонента сильной связности (SCC)</strong> — это <b>максимальное</b> подмножество вершин <i>ориентированного</i> графа, в котором существует путь из любой вершины в любую другую.</p>
                </div>
            </div>

            <p class="text-slate-300 text-sm mb-4">
                <strong>«Это просто цикл?» — Нет!</strong> SCC — это <em>максимальная</em> группа, где каждый может дойти до каждого.
            </p>
            <ul class="list-disc list-inside text-sm text-slate-300 space-y-2 mb-6">
                <li>Если у тебя есть цикл <code>А ➔ Б ➔ В ➔ А</code>, это одна SCC.</li>
                <li>Если ты добавишь вершину <strong>Г</strong> и стрелки <code>В ➔ Г</code> и <code>Г ➔ А</code>, то теперь <strong>все четыре вершины — одна большая SCC</strong>.</li>
                <li>Правило: <b>Если два цикла имеют хоть одну общую вершину — они сливаются в одну огромную SCC!</b></li>
            </ul>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏙️ Аналогия: Интриги в офисе
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        Сильная связность — это "клуб сплетников". Если Алиса расскажет секрет Бобу, Боб — Виктору, а Виктор — Алисе, то они в одной SCC. Добавить курьера Гошу, который слышит от Виктора, а сливает Алисе — и Гоша тоже в клубе. Из клуба инфа может уйти наружу (к директору), но обратно в клуб уже не вернется (иначе директор стал бы частью клуба).
                    </p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔗 Связь с Билетом 12
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        <b>SCC (Билет 10)</b> склеивает <em>орграфы</em> в большие "монолитные комки", превращая весь граф в DAG (пользу).</br><br>
                        <b>Точки сочленения (Билет 12)</b>, наоборот, живут в <em>неориентированных графах</em> и показывают <strong>хрупкость</strong> монолита. Вырвешь точку сочленения — и "комната" распадется на разрозненные куски (разрыв связности).
                    </p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Душный мод: Код Алгоритм Косарайю (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4 cursor-default" onClick="event.stopPropagation()">
                    <p class="text-emerald-400 font-bold">Два прохода DFS:</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Запускаем DFS на исходном графе. По выходу из вершины (post-order) добавляем её в список <code>order</code>.</li>
                        <li>Разворачиваем этот список (Topological Sort).</li>
                        <li>Переворачиваем все ребра в графе (Транспонированный граф).</li>
                        <li>Идем по <code>order</code>: если вершина не посещена, запускаем от неё DFS. Все, до кого дойдем — это одна SCC!</li>
                    </ol>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-bridges",
    title: "11. Графы. Мосты",
    type: "html",
    description: "Рёбра, удаление которых расхреначивает граф.",
    category: "Графы. Продвинутые",
    content: `
<section id="graph-bridges" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 11</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Мосты в графах</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Критические связи</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Используем tin и fup (время входа и минимальное достижимое). Ребро (u,v) мост, если fup[v] > tin[u].</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌉 Аналогия 1: Единственный мост
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь два острова с единственным мостом между ними. Если террористы взорвут этот мост, экономикой обоих кусков придет хана, связи нет. Алгоритм ищет именно такие "Слабые звенья" в сети!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-articulation",
    title: "12. Графы. Точки сочленения",
    type: "html",
    description: "Вершины, удаление которых убивает связь.",
    category: "Графы. Продвинутые",
    content: `
<section id="graph-articulation" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 12</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Точки сочленения (Хрупкость)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">12.1 Бутылочное горлышко графа</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило (через DFS Тарьяна):</p>
                <div class="text-left font-mono text-sm text-slate-300 space-y-3 max-w-xl mx-auto">
                    <p><strong class="text-white">Точка сочленения (Cut Vertex)</strong> — вершина неориентированного графа, удаление которой увеличивает число компонент связности.</p>
                    <div class="p-3 bg-slate-950 rounded border border-rose-500/30 text-center">
                        <span class="text-rose-400 font-bold">УСЛОВИЕ (не для корня DFS):</span>
                        <p class="text-xl font-bold text-white mt-1">low[to] >= tin[v]</p>
                        <p class="text-xs text-slate-400 mt-1">(Из сына "to" нельзя подняться СТРОГО выше "v")</p>
                    </div>
                </div>
            </div>
            
            <p class="text-slate-300 text-sm">
                <strong>Важно:</strong> Это работает только в неориентированных грахах! Если мосты рвут связи между островами, то мосты крепятся к точкам сочленения. То есть, <strong>все точки вокруг мостов — это точки сочленения</strong> (кроме случаев, когда берег - это тупик со степенью 1).
            </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                    🚦 Аналогия: Главный перекресток
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Представь город, где два района соединены только одной площадью (перекрестком). Если на этой площади случится авария и её перекроют (удалят вершину) — районы будут полностью отрезаны друг от друга. Эта площадь — точка сочленения. Это про <strong>хрупкость</strong> системы.
                </p>
            </div>
            
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-emerald-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-emerald-900 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                    🔌 Телеком: Центральный свитч
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    У тебя несколько компьютеров в одном кабинете подключены к свитчу А, а в другом — к свитчу Б. И эти свитчи соединены кабелем (мостом). Сами свитчи — это точки сочленения. Сгорел свитч А — весь кабинет номер один выпал из сети, граф распался!
                </p>
            </div>
        </div>

        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                🔍 Душный мод: Код и корень DFS (Скрыто)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4 cursor-default" onClick="event.stopPropagation()">
                <p class="text-blue-400 font-bold">Особый случай: Корень дерева DFS.</p>
                <p>
                    Для стартовой вершины обхода правило <code class="text-rose-400">low[to] >= tin[v]</code> выполняется ВСЕГДА (потому что выше неё прыгать некуда). Поэтому для неё отдельное правило: корень является точкой сочленения тогда и только тогда, когда у него <strong>больше 1 независимого ребенка</strong> в дереве DFS.
                </p>
                <div class="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre class="text-xs font-mono text-emerald-400 whitespace-pre">
void dfs(int v, int p = -1) {
    visited[v] = true;
    tin[v] = low[v] = timer++;
    int children = 0;
    
    for (int to : adj[v]) {
        if (to == p) continue;
        if (visited[to]) {
            low[v] = min(low[v], tin[to]);
        } else {
            dfs(to, v);
            low[v] = min(low[v], low[to]);
            if (low[to] >= tin[v] && p != -1)
                IS_CUTPOINT(v);
            ++children;
        }
    }
    if (p == -1 && children > 1)
        IS_CUTPOINT(v);
}</pre>
                </div>
            </div>
        </details>

        <div class="bg-indigo-950/60 p-6 rounded-xl border-l-4 border-indigo-500 mt-6">
            <h4 class="text-lg font-bold text-indigo-400 mb-2">🧠 Взаимосвязь с Компонентами сильной связности (SCC) из Билета 10</h4>
            <p class="text-slate-300 text-sm mb-4">
                Это глубокий дуальный мост между ориентированными и неориентированными графами:
            </p>
            <ul class="list-disc list-inside text-sm text-slate-300 space-y-2">
                <li><strong class="text-rose-400">Точки сочленения (Билет 12)</strong> определены на <strong>неориентированных графах</strong> и показывают физическую уязвимость связей — вынь одну вершину, и весь континент распадется на изолированные осколки.</li>
                <li><strong class="text-emerald-400">SCC (Билет 10)</strong> склеивают <strong>ориентированные циклы</strong> в единые независимые "конгломераты".</li>
                <li><strong>Как точка сочленения рушит SCC? (Конденсация графа)</strong> Если любой орграф максимально сжать по алгоритму Косарайю, свернув каждую SCC в одну супер-вершину, мы получим ациклический граф (DAG). Если мы снимем направление с его ребер (сделаем неориентированным), то любая <strong class="text-indigo-400">точка сочленения</strong> в этом полученном скелете — это и есть критическая SCC! Если удалить эту супер-вершину, то рухнет глобальный маршрут между другими клубами сильной связности. Одно слабое звено изолирует целые касты SCC навсегда.</li>
            </ul>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-euler",
    title: "13. Графы. Эйлеров цикл",
    type: "html",
    description: "Пройти по всем ребрам ровно 1 раз.",
    category: "Графы",
    content: `
<section id="graph-euler" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 13</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Эйлеров цикл</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Кругосветка без повторений</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Строгое правило / Формула (Неорграф):</p>
                <p class="text-xl font-mono text-white">Связный, все вершины четной степени. Цикл: 0 нечетных. Путь: ровно 2 нечетных.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎨 Аналогия 1: Рисование не отрывая руки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Классическая детская задача "нарисуй домик, не отрывая карандаш". Если в вершине сходится нечетное число линий, значит, из неё можно или только выйти, или только войти так, чтобы застрять навечно. Для цикла везде должно быть четное число (зашел-вышел).</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
];
