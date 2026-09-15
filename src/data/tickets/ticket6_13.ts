import { Chapter } from "../../types";

export const tickets6to13: Chapter[] = [
  {
    id: "graph-dfs-bfs",
    title: "6. Графы. Представление графов, DFS, BFS",
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
                <p class="text-xl font-mono text-white">Матрица: O(V²) памяти. Обход за O(V²).<br>Списки смежности: O(V + E). Обход за O(V + E).</p>
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
                        🕵️‍♂️ DFS (Поиск в глубину) = Обход с возвратом (Backtracking)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        <b>Что делает:</b> Поиск в глубину с возвратом (backtracking). Идёт вглубь по неисследованным рёбрам до упора. Когда попадает в тупик — делает шаг назад по стеку вызовов и пробует следующую ветку.
                    </p>
                    <ul class="text-xs text-indigo-300 list-disc list-inside space-y-1">
                        <li><b>Где используется:</b></li>
                        <li>Топологическая сортировка (Билет 9)</li>
                        <li>Поиск мостов и точек сочленения (Билеты 11, 12)</li>
                        <li>Компоненты сильной связности Косарайю (Билет 10)</li>
                        <li>Детектирование циклов (через 3 цвета) и проверка связности.</li>
                    </ul>
                </div>
                
                <!-- Аналогия BFS -->
                <div class="bg-slate-900 p-6 rounded-lg border border-emerald-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-emerald-900 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌊 BFS (Поиск в ширину) = Волна
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        <b>Что делает:</b> Распространение волнами по слоям расстояния. За один шаг открывает всех соседей, затем соседей соседей. Работает через Очередь (FIFO). Гарантирует кратчайший путь по числу рёбер.
                    </p>
                    <ul class="text-xs text-emerald-300 list-disc list-inside space-y-1">
                        <li><b>Где используется:</b></li>
                        <li>Кратчайший путь в Невзвешенном графе (лабиринт, граф ходов)</li>
                        <li>Проверка двудольности графа (2-раскрашиваемость)</li>
                        <li>Алгоритм Ахо-Корасик (построение суффиксных ссылок в боре)</li>
                        <li>Двунаправленный BFS для ускорения поиска в невзвешенных графах (для взвешенных используется двунаправленная Дейкстра).</li>
                    </ul>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код обходов C++ (Основа)
                </summary>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs font-mono text-slate-300">
                    <pre class="bg-slate-950 p-3 rounded overflow-x-auto border border-indigo-900/50">
// DFS (Рекурсия с возвратом)
vector&lt;bool&gt; vis;
vector&lt;vector&lt;int&gt;&gt; adj;

void dfs(int v) {
    vis[v] = true;
    for (int u : adj[v]) {
        if (!vis[u]) dfs(u);
    }
}</pre>
                    <pre class="bg-slate-950 p-3 rounded overflow-x-auto border border-emerald-900/50">
// BFS (Очередь FIFO)
queue&lt;int&gt; q;
q.push(start_node);
vis[start_node] = true;

while (!q.empty()) {
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
    description: "Планарные графы: формула Эйлера, K5 и K3,3, оценки рёбер, раскраска вершин и Теорема о 4 красках.",
    category: "Графы. Теория",
    content: `
<section id="graph-planar-colors" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 7</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Графы. Планарные. Покраска</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">7.1 Планарность и формула Эйлера</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Формула Эйлера (для связного плоского графа, c = 1):</p>
                <p class="text-2xl font-mono text-white">V − E + F = 2</p>
                <p class="text-xs text-slate-400 mt-1">(Если c компонент связности: V − E + F = 1 + c. V — вершины, E — рёбра, F — грани, включая внешнюю)</p>
            </div>

            <div class="space-y-4 text-slate-300 text-sm">
                <p><b>Главные неравенства на число рёбер:</b></p>
                <ul class="list-disc list-inside space-y-2 ml-2">
                    <li><b>Для простого планарного графа (при V ≥ 3):</b> <span class="font-mono text-emerald-300">E ≤ 3V − 6</span>.<br>
                    <i>Доказательство:</i> Каждая грань ограничена хотя бы 3 рёбрами, поэтому <span class="font-mono">2E ≥ 3F ⇒ F ≤ 2E/3</span>. Подставляя в формулу Эйлера: <span class="font-mono">V − E + 2E/3 ≥ 2 ⇒ E ≤ 3V − 6</span>.
                    </li>
                    <li><b>Для простого двудольного планарного графа (при V ≥ 3):</b> <span class="font-mono text-emerald-300">E ≤ 2V − 4</span>.<br>
                    <i>Доказательство:</i> В двудольном графе нет нечётных циклов, значит каждая грань ограничена хотя бы 4 рёбрами: <span class="font-mono">2E ≥ 4F ⇒ F ≤ E/2</span>. Из Эйлера: <span class="font-mono">V − E + E/2 ≥ 2 ⇒ E ≤ 2V − 4</span>.
                    </li>
                </ul>

                <div class="bg-slate-950 p-4 rounded-lg border border-slate-800 my-4">
                    <p class="text-amber-300 font-bold text-sm mb-2">🚨 Анализ двух критериев непланарности на экзамене:</p>
                    <p class="text-slate-300 text-xs leading-relaxed">
                      1. <b>K₅ (полный граф на 5 вершинах):</b> V = 5, E = 10. Проверяем <span class="font-mono">E ≤ 3V − 6</span>: <span class="font-mono">10 ≤ 3(5) − 6 = 9</span> — <b>НЕВЕРНО!</b> Следовательно K₅ непланарен.<br>
                      2. <b>K₃,₃ (полный двудольный 3×3):</b> V = 6, E = 9. Проверяем <span class="font-mono">E ≤ 3V − 6</span>: <span class="font-mono">9 ≤ 12</span> — формально проходит! НО K₃,₃ — <i>двудольный</i>, поэтому проверяем <span class="font-mono">E ≤ 2V − 4</span>: <span class="font-mono">9 ≤ 2(6) − 4 = 8</span> — <b>НЕВЕРНО!</b> Следовательно K₃,₃ непланарен.
                    </p>
                </div>

                <p><b>Теорема Куратовского (1930) / Вагнера:</b> Граф является планарным тогда и только тогда, когда он не содержит подграфа, являющегося <b>подразделением (subdivision) K₅ или K₃,₃</b> (или эквивалентно: не содержит K₅ или K₃,₃ в качестве минора).</p>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">7.2 Раскраска вершин (Graph Coloring)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-purple-500/30">
                <p class="text-lg text-purple-300 italic mb-2">Хроматическое число χ(G):</p>
                <p class="text-xl font-mono text-white">минимальное число цветов для раскраски вершин без одноцветных ребер</p>
            </div>

            <div class="space-y-3 text-slate-300 text-sm">
                <p><b>Сложность задачи раскраски:</b></p>
                <ul class="list-disc list-inside space-y-2 ml-2">
                    <li><b>k = 2 (2-раскрашиваемость):</b> граф является двудольным ⇔ <span class="font-mono text-emerald-300">χ(G) ≤ 2</span> ⇔ граф не содержит нечётных циклов. (Пустой граф без рёбер имеет <span class="font-mono">χ(G) = 1</span>; если есть хотя бы одно ребро — <span class="font-mono">χ(G) = 2</span>). Задача решается за <b>O(V + E)</b> с помощью BFS/DFS.</li>
                    <li><b>k ≥ 3 (k-colorability):</b> задача является <b>NP-полной</b> (decision-задача: можно ли раскрасить в k цветов).</li>
                </ul>

                <p class="mt-3"><b>Теоремы о раскраске:</b></p>
                <ul class="list-disc list-inside space-y-2 ml-2">
                    <li><b>Жадная раскраска:</b> дает верхнюю оценку <span class="font-mono text-emerald-300">χ(G) ≤ Δ + 1</span>, где Δ — максимальная степень вершины.</li>
                    <li><b>Теорема Брукса:</b> <span class="font-mono text-emerald-300">χ(G) ≤ Δ</span> для всех связных графов, кроме полных графов Kₙ и нечётных циклов C₂ₖ₊₁.</li>
                    <li><b>Теорема о 4 красках:</b> Любой планарный граф можно раскрасить максимум <b>4 красками</b> (<span class="font-mono text-emerald-300">χ(G) ≤ 4</span>).</li>
                </ul>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-components",
    title: "8. Графы. Компоненты связности",
    type: "html",
    description:
      "Компоненты связности: обходами DFS/BFS за O(V + E) и через DSU, число компонент, связность орграфов, flood fill на изображениях.",
    category: "Графы. База",
    content: `
<section id="graph-components" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 8</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Компоненты связности</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">8.1 Поиск кусков графа</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Компонента связности — максимальный по включению подграф, в котором между любой парой вершин есть путь. Внешний цикл «для каждой непосещённой вершины запустить DFS/BFS и покрасить всё достигнутое в новый цвет» даёт и разметку, и количество компонент.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Два рабочих способа. <b>Обходами:</b> один проход по вершинам, из каждой ещё не посещённой запускаем DFS или BFS и присваиваем всем достигнутым вершинам номер компоненты <span class="font-mono text-emerald-300">comp[v] = c</span>. Счётчик c увеличивается ровно тогда, когда понадобился новый запуск, — поэтому в конце c = числу компонент. Время <b>O(V + E)</b>, память O(V). <b>Через DSU</b> (систему непересекающихся множеств): начинаем с V одиночных множеств, на каждое ребро делаем union(u, v), в конце число различных корней = число компонент. Это нужно, когда рёбра <b>добавляются на лету</b> и после каждого добавления спрашивают «сколько компонент сейчас?».</p>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏝️ Аналогия 1: Острова
                    </div>
                    <p class="text-slate-300 text-sm">Ты десантируешься на любой кусок земли и красишь его краской. Смотришь на карту: остались серые (неисследованные) зоны? Прыгаешь туда и красишь второй остров. Сколько раз пришлось прыгать через океан — столько и компонент. Краска — это comp[v], прыжок через океан — увеличение счётчика c.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-emerald-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-emerald-900 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        👥 Аналогия 2: Группы друзей (DSU)
                    </div>
                    <p class="text-slate-300 text-sm">Каждый человек сначала сам по себе. Приходит новость «А и Б дружат» — склеиваем их компании в одну (union). Кто представитель компании? Любой, кого выбрали «старшим» (find со сжатием пути). Через минуту все разбиты на компании, и вопрос «в одной ли компании А и В?» — это find(А) == find(В). Так же работает Краскал (билет 18): ребро берут, только если концы в разных компонентах.</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mt-6 mb-3">8.2 Ориентированные графы: три разных вопроса</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Что спрашиваем</th>
                            <th class="py-2 pr-3 font-bold">Определение</th>
                            <th class="py-2 pr-3 font-bold">Как считать</th>
                            <th class="py-2 font-bold">Сложность</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">Слабая связность</td><td class="py-2 pr-3">забыли про стрелки — граф связен</td><td class="py-2 pr-3">DFS/BFS/DSU по базовому неориентированному графу</td><td class="py-2 font-mono">O(V + E)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">Сильная связность (SCC)</td><td class="py-2 pr-3">из любой вершины достижима любая</td><td class="py-2 pr-3">Косарайю или Тарьян (билет 10)</td><td class="py-2 font-mono">O(V + E)</td></tr>
                        <tr class="align-top"><td class="py-2 pr-3 font-bold text-emerald-300">Достижимость из одной</td><td class="py-2 pr-3">до кого дойдёт старт</td><td class="py-2 pr-3">один DFS/BFS из s (стрелки не забываем!)</td><td class="py-2 font-mono">O(V + E)</td></tr>
                    </tbody>
                </table>
            </div>
            <p class="text-slate-400 text-xs mt-3">Классическая ошибка: запустить BFS по орграфу «как по неориентированному» и назвать результат SCC. Обход из s даёт только вершины, достижимые <b>из</b> s; для SCC нужна достижимость в обе стороны.</p>
        </div>
    </div>
</section>`,
  },
  {
    id: "top-sort",
    title: "9. Графы. Топологическая сортировка",
    type: "html",
    description: "Топологическая сортировка ДАГ и детекция циклов через 3 цвета.",
    category: "Графы",
    content: `
<section id="top-sort" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 9</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Топологическая сортировка</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Упорядочивание ДАГ</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">DFS с сохранением вершин в стек В МОМЕНТ ВЫХОДА (post-order). Вывод: стек задом-наперед.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎓 Аналогия 1: Учеба в вузе
                    </div>
                    <p class="text-slate-300 text-sm mb-4">У тебя есть предметы. "Матан 2" нельзя взять, если не сдал "Матан 1". Топологическая сортировка — это расписание, которое гарантирует, что ты не встретишь предмет, пререквизиты которого ты еще не прошел.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ограничения: Циклы
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Не работает на графах с циклами. "Чтобы устроиться на работу нужен опыт. Чтобы получить опыт, нужна работа". Алгоритм выявит цикл и скажет, что отсортировать невозможно.</p>
                </div>
            </div>

            <div class="bg-rose-950/40 p-4 rounded-lg border border-rose-500/50 my-6">
                <p class="text-rose-300 font-bold text-sm mb-1">🚨 ОПАСНОСТЬ НА ЭКЗАМЕНЕ: Простой bool visited НЕ ЛОВИТ циклы!</p>
                <p class="text-slate-300 text-xs leading-relaxed">
                  Обычный массив <span class="font-mono text-amber-300">bool visited[N]</span> отличает лишь «был ли в вершине вообще». Если в графе есть ориентированный цикл, код с bool visited молча выдаст некорректный ответ, не заметив проблему!<br>
                  <b>Правильно:</b> используем раскраску в 3 цвета:
                  <br>• <span class="font-mono text-slate-400">0 (белый)</span> — еще не посещали;
                  <br>• <span class="font-mono text-amber-300">1 (серый)</span> — зашли, вершина прямо сейчас лежит в стеке рекурсии DFS;
                  <br>• <span class="font-mono text-emerald-300">2 (чёрный)</span> — полностью обработали и вышли.
                  <br>Если во время обхода из серы вершины мы встречаем рёбрышко в <b>серую</b> вершину (color == 1) — это обратное ребро и <b>гарантированный цикл</b>!
                </p>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Корректный код C++ с детекцией цикла (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-emerald-400 whitespace-pre">
vector&lt;int&gt; adj[MAXN];
int color[MAXN]; // 0=белый, 1=серый (в стеке), 2=чёрный
vector&lt;int&gt; ans;
bool has_cycle = false;

void dfs(int v) {
    color[v] = 1; // Зашли — вершина серая
    for (int to : adj[v]) {
        if (color[to] == 0) {
            dfs(to);
            if (has_cycle) return;
        } else if (color[to] == 1) {
            // Переход в серую вершину = НАЙДЕН ЦИКЛ!
            has_cycle = true;
            return;
        }
    }
    color[v] = 2; // Вышли — вершина чёрная
    ans.push_back(v); // Сохраняем в момент ВЫХОДА (post-order)
}

bool topological_sort(int n) {
    fill(color, color + n + 1, 0);
    has_cycle = false;
    ans.clear();
    for (int i = 1; i &lt;= n; ++i) {
        if (color[i] == 0) dfs(i);
    }
    if (has_cycle) return false; // Граф содержит цикл!
    reverse(ans.begin(), ans.end()); // Разворачиваем post-order
    return true;
}</pre>
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

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: Алгоритм Косарайю (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p class="text-emerald-400 font-bold">Два прохода DFS:</p>
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Запускаем DFS на исходном графе. По выходу из вершины (post-order) добавляем её в список <code>order</code>.</li>
                        <li>Разворачиваем этот список (получаем порядок убывания времени выхода — reverse postorder). <i>Замечание:</i> Это <b>не</b> топологическая сортировка самого графа (поскольку граф содержит циклы!), но этот порядок является топосортом для DAG конденсации.</li>
                        <li>Переворачиваем все ребра в графе (Транспонированный граф Gᵀ).</li>
                        <li>Идем по <code>order</code>: если вершина не посещена в Gᵀ, запускаем от неё DFS. Все вершины, достигнутые за этот запуск — образуют очередную SCC!</li>
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
    description: "Рёбра, удаление которых увеличивает число компонент связности.",
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
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Условие Тарьяна:</p>
                <p class="text-xl font-mono text-white">Ребро (u, v) — мост ⇔ low[v] &gt; tin[u]</p>
                <p class="text-xs text-slate-400 mt-1">(Из поддерева v нельзя подняться в u или выше по обратным рёбрам)</p>
            </div>

            <div class="bg-slate-950 p-4 rounded-lg border border-slate-800 my-4">
                <p class="text-amber-300 font-bold text-sm mb-1">🚨 Мультиграфы с параллельными рёбрами:</p>
                <p class="text-slate-300 text-xs leading-relaxed">
                  Проверка <span class="font-mono text-rose-400">if (to == p) continue;</span> правильна только для простых графов! В мультиграфе между u и p может быть 2 параллельных ребра. Игнорируя все переходы в p, код посчитает эти рёбра мостами, хотя они образуют цикл длиной 2.<br>
                  <b>Решение:</b> передавать в DFS не вершину-родителя <span class="font-mono">p</span>, а <span class="font-mono text-emerald-300">p_edge_id</span> (индекс ребра, по которому пришли) и пропускать ТОЛЬКО это единственное ребро.
                </p>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код поиска мостов C++ (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-emerald-400 whitespace-pre">
// Для мультиграфа с edge_id:
vector&lt;pair&lt;int, int&gt;&gt; adj[MAXN]; // {to, edge_id}
int tin[MAXN], low[MAXN], timer;

void dfs_bridges(int v, int p_edge_id = -1) {
    tin[v] = low[v] = ++timer;
    for (auto [to, edge_id] : adj[v]) {
        if (edge_id == p_edge_id) continue; // Пропускаем только РОВНО то ребро, по которому пришли!
        if (tin[to]) {
            low[v] = min(low[v], tin[to]); // Обратное ребро
        } else {
            dfs_bridges(to, edge_id);
            low[v] = min(low[v], low[to]);
            if (low[to] &gt; tin[v]) {
                // Ребро (v, to) с номером edge_id является МОСТОМ!
            }
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
    id: "graph-articulation",
    title: "12. Графы. Точки сочленения",
    type: "html",
    description: "Вершины, удаление которых увеличивает число компонент связности.",
    category: "Графы. Продвинутые",
    content: `
<section id="graph-articulation" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 12</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Точки сочленения</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">12.1 Бутылочное горлышко графа</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Условие Тарьяна (в неориентированном графе):</p>
                <div class="text-left font-mono text-sm text-slate-300 space-y-3 max-w-xl mx-auto">
                    <p><strong class="text-white">Точка сочленения (Cut Vertex)</strong> — вершина неориентированного графа, удаление которой увеличивает число компонент связности.</p>
                    <div class="p-3 bg-slate-950 rounded border border-rose-500/30 text-center">
                        <span class="text-rose-400 font-bold">Для вершины v (не являющейся корнем DFS):</span>
                        <p class="text-xl font-bold text-white mt-1">low[to] ≥ tin[v]</p>
                        <p class="text-xs text-slate-400 mt-1">(Из сына to нельзя подняться СТРОГО выше v)</p>
                    </div>
                </div>
            </div>
            
            <p class="text-slate-300 text-sm">
                <b>Особый случай:</b> Корень дерева DFS является точкой сочленения тогда и только тогда, когда у него <b>больше 1 независимого ребёнка</b> в дереве DFS.
            </p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код поиска точек сочленения (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-emerald-400 whitespace-pre">
void dfs_cutpoints(int v, int p = -1) {
    tin[v] = low[v] = ++timer;
    int children = 0;
    for (int to : adj[v]) {
        if (to == p) continue;
        if (tin[to]) {
            low[v] = min(low[v], tin[to]);
        } else {
            dfs_cutpoints(to, v);
            low[v] = min(low[v], low[to]);
            if (low[to] &gt;= tin[v] && p != -1) {
                is_cutpoint[v] = true;
            }
            ++children;
        }
    }
    if (p == -1 && children &gt; 1) {
        is_cutpoint[v] = true;
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-euler",
    title: "13. Графы. Эйлеров путь и цикл",
    type: "html",
    description: "Условия существования и построение Эйлерова пути/цикла в неориентированных и ориентированных графах.",
    category: "Графы",
    content: `
<section id="graph-euler" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 13</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Эйлеров путь и цикл</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">13.1 Критерии существования (ОБЯЗАТЕЛЬНО со связностью!)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Главное базовое условие:</p>
                <p class="text-base sm:text-lg font-mono text-white">Все вершины со степенями &gt; 0 должны лежать в ОДНОЙ компоненте связности!</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 text-sm">
                <!-- Неориентированные графы -->
                <div class="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <p class="text-indigo-300 font-bold text-base mb-2">Неориентированный граф</p>
                    <ul class="list-disc list-inside space-y-2">
                        <li><b>Эйлеров цикл:</b> связен (для deg &gt; 0) и степеням <b>всех</b> вершин ЧЁТНЫЕ (<span class="font-mono text-emerald-300">deg[v] % 2 == 0</span>).</li>
                        <li><b>Эйлеров путь:</b> связен (для deg &gt; 0) и ровно <b>0 или 2 вершины</b> имеют НЕЧЁТНУЮ степень. (Если ровно 2 — путь начинается в одной нечётной и заканчивается в другой).</li>
                    </ul>
                </div>

                <!-- Ориентированные графы -->
                <div class="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <p class="text-indigo-300 font-bold text-base mb-2">Ориентированный граф</p>
                    <ul class="list-disc list-inside space-y-2">
                        <li><b>Эйлеров цикл:</b> слабосвязен (для in+out &gt; 0) и для <b>всех</b> вершин <span class="font-mono text-emerald-300">in[v] == out[v]</span>.</li>
                        <li><b>Эйлеров путь:</b> слабосвязен и ровно у одной вершины <span class="font-mono text-emerald-300">out[s] − in[s] = 1</span> (старт), у одной <span class="font-mono text-emerald-300">in[f] − out[f] = 1</span> (финиш), а для остальных <span class="font-mono text-emerald-300">in[v] == out[v]</span>.</li>
                    </ul>
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">13.2 Алгоритм построения (Hierholzer)</h3>
            <p class="text-slate-300 text-sm mb-3">Используем рекурсивный DFS с удалением пройденных рёбер. Вход в вершину → удаляем ребро → рекурсивный переход. При возврате (на выходе) добавляем вершину в стек. В конце стек содержит Эйлеров путь/цикл. Время работы: <span class="font-mono text-emerald-300">O(V + E)</span>.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код построения Эйлерова цикла C++ (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-emerald-400 whitespace-pre">
vector&lt;unordered_multiset&lt;int&gt;&gt; adj;
vector&lt;int&gt; path;

void find_euler(int v) {
    while (!adj[v].empty()) {
        int u = *adj[v].begin();
        adj[v].erase(adj[v].find(u));
        adj[u].erase(adj[u].find(v)); // Убираем ребро из обоих списков!
        find_euler(u);
    }
    path.push_back(v); // Добавляем в путь на выходе!
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
];
