import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    id: "euler-path-vs-cycle",
    title: "13. Графы. Эйлеров цикл",
    type: "html",
    description: "Эйлеров путь и эйлеров цикл: признаки существования по чётности степеней и алгоритм построения за O(V + E).",
    category: "Графы",
    content: `<section id="euler-path-vs-cycle" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 13</span>
        <h2 class="text-3xl font-bold text-white">Эйлеров цикл и эйлеров путь</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">13.1 Определения</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило:</p>
                <div class="text-left font-mono text-sm text-slate-300 space-y-3 max-w-lg mx-auto">
                    <p><strong class="text-white">Эйлеров путь</strong> — проходит все <span class="text-yellow-400">РЁБРА</span> ровно один раз. Вершины повторять можно.</p>
                    <p><strong class="text-white">Эйлеров цикл</strong> — то же самое + замкнутый (начало = конец).</p>
                    <div class="p-3 bg-slate-950 rounded border border-blue-500/30">
                        <p class="text-sm text-blue-300">Признак существования:</p>
                        <p><strong class="text-white">Путь:</strong> ровно 2 вершины с нечётной степенью (начало и конец).</p>
                        <p><strong class="text-white">Цикл:</strong> <span class="text-green-400">ВСЕ</span> вершины чётные.</p>
                    </div>
                </div>
            </div>

            <p class="text-slate-300 text-sm">
                <strong>Билет 13 (Различие пути и цикла):</strong> 
                <br>• <span class="text-green-400 font-semibold">Цикл:</span> Вышел из дома и вернулся домой. Все степени чётные (вошёл-вышел-вошёл-вышел).
                <br>• <span class="text-yellow-400 font-semibold">Путь:</span> Вышел из общаги в пивбар. Ровно 2 нечётные вершины (старт и финиш).
            </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-green-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-green-500 shadow-md">
                    🚶 Аналогия 1: Путь — из дома в бар, домой не вернуться
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Ты вышел из дома <strong>(нечётная)</strong>, прошёлся по всем улицам города (по каждой ровно раз, это же Эйлер), и усталый пришёл в бар <strong>(вторая нечётная)</strong>. 
                    Домой вернуться не смог, потому что ноги не идут. Вот и путь. Начало не равно концу.
                </p>
            </div>
            
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-rose-905 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md bg-slate-950">
                    🤮 Ловушка: цикл — это вернулся домой. Гамильтонов синдром
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    <strong>Гамильтон — это болезнь.</strong> Синдром Гамильтона: ты одержимо хочешь посетить <strong>каждую вершину</strong> ровно раз и вернуться домой. 
                    Ты обходишь все бары (вершины) ровно по разу. Какие улицы при этом топтать — плевать. 
                    Главное — зайти и выйти, не заходя дважды. Это NP-полная хрень. 
                    Никто не знает, как решать быстро. Если скажешь, что придумал алгоритм — ты либо Цукерберг, либо врешь.
                    <br><span class="text-xs text-rose-400 block mt-2 font-mono">Запомни: Гамильтон = Госпитализация (тебя упекут за NP-полноту).</span>
                </p>
            </div>
        </div>

        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                🔍 Душный режим: Формальное доказательство (Скрыто)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4 cursor-default" onClick="event.stopPropagation()">
                <p class="text-blue-400">Теорема Эйлера:</p>
                <p>
                    Связный граф содержит эйлеров цикл ⇔ степень каждой вершины чётная.
                    <br>Эйлеров путь (не цикл) ⇔ ровно 2 вершины нечётной степени (это старт и конец).
                </p>
                <p class="text-rose-400">Почему Гамильтон — NP-полный:</p>
                <p>
                    Задача коммивояжёра (TSP) — это взвешенная версия гамильтонова пути. 
                    Доказано: полиномиальный алгоритм для гамильтонова цикла (а значит и для TSP) означал бы P = NP. 
                    В общем, не парься. Просто запомни ассоциацию: Гамильтон = больничка.
                </p>
            </div>
        </details>
    </div>
</section>`,
  },
  {
    id: "bridges-code",
    title: "11. Графы. Мосты",
    type: "html",
    description: "Мосты через DFS Тарьяна: tin/low, условие low[u] > tin[v], код и визуализация.",
    category: "Графы. Продвинутые",
    content: `<section id="bridges-code" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 11</span>
        <h2 class="text-3xl font-bold text-white">Мосты: алгоритм Тарьяна + код</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">11.1 Алгоритм Тарьяна</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Ключевые массивы:</p>
                <div class="text-left font-mono text-sm text-slate-300 space-y-3 max-w-xl mx-auto">
                    <p><strong class="text-white">tin[v]</strong> — время захода DFS в вершину v.</p>
                    <p><strong class="text-white">low[v]</strong> — минимальный tin, достижимый из поддерева v (через обратные рёбра).</p>
                    <div class="p-3 bg-slate-950 rounded border border-rose-500/30 text-center">
                        <span class="text-rose-400 font-bold">УСЛОВИЕ МОСТА:</span>
                        <p class="text-xl font-bold text-white mt-1">low[u] > tin[v]</p>
                        <p class="text-xs text-slate-400 mt-1">(v — родитель, u — сын в DFS-дереве)</p>
                    </div>
                </div>
            </div>
            
            <p class="text-slate-300 text-sm">
                Если из сына u и всех его потомков <strong>нельзя</strong> попасть в предка v (кроме ребра (v,u)) — это мост.
                Единственная ниточка. Порвётся — граф распадётся.
            </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                    🌉 Мост: Единственная веревка
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Представь, что ты альпинист. Ты спускаешься в пещеру (вершина v) к напарнику (вершина u). 
                    Из пещеры u нет других выходов — только та самая дыра, через которую ты спустился. 
                    Если верёвка (ребро v-u) оборвётся — напарник навсегда замурован. Это и есть мост. 
                    Если бы из пещеры u был чёрный ход наверх (обратное ребро) — напарник бы выбрался. И тогда это не мост.
                </p>
            </div>
            
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                    🩸 Аналогия: Кровеносный сосуд
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Граф — это кровеносная система. Ребро — сосуд. Если перерезать один сосуд, но кровь может пойти по другому пути (коллатерали) — это не мост, живём. 
                    Если же перерезать единственную артерию, ведущую к органу, и альтернатив нет — орган отмирает. Вот это мост. 
                    Алгоритм DFS ищет такие «критические артерии».
                </p>
            </div>
        </div>

        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                🔍 Полный код на C++ (Скрыто)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4 cursor-default" onClick="event.stopPropagation()">
                <p>Классическая реализация — <code class="text-emerald-400">O(V + E)</code>. Каждая вершина и ребро — константное число проходов.</p>
                
                <div class="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre class="text-xs font-mono text-emerald-400 whitespace-pre">
#include &lt;vector&gt;
#include &lt;algorithm&gt;

using namespace std;

int n;                      // число вершин
vector&lt;vector&lt;int&gt;&gt; adj;  // список смежности
vector&lt;bool&gt; visited;
vector&lt;int&gt; tin, low;
int timer;

void dfs(int v, int p = -1) {
    visited[v] = true;
    tin[v] = low[v] = timer++;        // устанавливаем время входа
    
    for (int to : adj[v]) {
        if (to == p) continue;        // не идём назад к родителю
        
        if (visited[to]) {
            // обратное ребро: обновляем low
            low[v] = min(low[v], tin[to]);
        } else {
            // ребро дерева DFS
            dfs(to, v);                // рекурсивный вызов
            low[v] = min(low[v], low[to]);
            
            if (low[to] > tin[v]) {
                // ЭТО МОСТ!
                // bridge_list.push_back({v, to});
            }
        }
    }
}

void find_bridges() {
    timer = 0;
    visited.assign(n, false);
    tin.assign(n, -1);
    low.assign(n, -1);
    
    for (int i = 0; i &lt; n; ++i) {
        if (!visited[i]) dfs(i);
    }
}</pre>
                </div>
                <p class="text-xs text-slate-400">Визуализатор под текстом: DFS идёт по графу, tin/low пишутся в таблицу, а мост подсвечивается в момент проверки low[u] &gt; tin[v]. Кнопка «Код ↔ визуализация» откроет Python-панель, где этот же обход можно выполнить самому — шаги кода двинут демонстрацию.</p>
            </div>
        </details>
    </div>
</section>`,
  },
  {
    id: "planarity-euler-formula",
    title: "7. Графы. Планарные. Покраска",
    type: "html",
    description: "Планарные графы: формула Эйлера, K5 и K3,3, теорема Куратовского — и раскраска вершин: хроматическое число, жадный алгоритм, 4 краски.",
    category: "Графы. Теория",
    content: `<section id="planarity-euler-formula" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 7</span>
        <h2 class="text-3xl font-bold text-white">Планарные графы и раскраска</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">7.1 Формула Эйлера</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Формула Эйлера:</p>
                <p class="text-3xl font-mono text-white my-3">V - E + F = 2</p>
                <div class="text-sm text-slate-400 space-y-1">
                    <p><span class="text-blue-400 font-bold">V</span> — вершины</p>
                    <p><span class="text-emerald-400 font-bold">E</span> — рёбра</p>
                    <p><span class="text-rose-400 font-bold">F</span> — грани (включая внешнюю)</p>
                </div>
            </div>
            
            <p class="text-slate-300 text-sm">
                <strong>Следствие:</strong> Для планарного графа с V ≥ 3: <code class="text-emerald-400 font-bold font-mono">E ≤ 3V - 6</code>. 
                Если ребер больше — граф гарантированно непланарен. Ребра будут пересекаться.
            </p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-green-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-green-500 shadow-md">
                    🤡 K5: Полный граф на 5 вершинах
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    У K5: <code class="text-white">V=5, E=10</code>. Проверяем <code class="text-white">E ≤ 3V-6</code>: <code class="text-white">10 &gt; 9</code> — БАХ, непланарен! 
                    Все 5 вершин соединены со всеми. На плоскости это звезда с пересечениями. 
                    Теорема Куратовского: K5 и K3,3 — два эталона непланарности. 
                    Если внутри графа спрятано <b>подразделение</b> K5 или K3,3 (то есть эти графы с вершинами, «размноженными» на рёбрах) — плоской раскладки не будет. 
                </p>
            </div>
            
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                    🏘️ K3,3: 3 дома и 3 колодца
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Три дома хотят соединиться с тремя колодцами (каждый дом — с каждым колодцем). 
                    Нарисовать без пересечений невозможно. Это <strong>K3,3</strong>. 
                    У него <code class="text-white">V=6, E=9</code>. Формула <code class="text-white">E ≤ 3V-6</code> даёт <code class="text-white">9 ≤ 12</code> — проходит, но он всё равно непланарен! 
                    Почему? Потому что у двудольного графа минимальный цикл — 4, а не 3. 
                    Отсюда более строгое ограничение: <code class="text-white font-mono text-rose-400">E ≤ 2V - 4</code>. 
                    <code class="text-white">9 &gt; 8</code> — попался!
                </p>
            </div>
        </div>

        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                🔍 Доказательство непланарности K5 (Скрыто)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4 cursor-default" onClick="event.stopPropagation()">
                <p class="text-blue-400">Доказательство через формулу Эйлера:</p>
                <p>
                    Пусть K5 планарен. V = 5, E = 10.
                    <br>F = E - V + 2 = 10 - 5 + 2 = 7 граней.
                    <br>Каждая грань ограничена минимум 3 ребрами (простых циклов длины 1-2 нет).
                    <br>Сумма длин граней = 2E = 20.
                    <br>Отсюда: 2E ≥ 3F ⇒ 20 ≥ 21 — <span class="text-rose-400">ПРОТИВОРЕЧИЕ!</span>
                    <br>Значит, K5 не может быть планарным. Теорема доказана.
                </p>
            </div>
        </details>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-fuchsia-500 scroll-mt-10 mt-8">
            <h3 class="text-xl font-bold text-fuchsia-400 mb-4">7.2 Покраска: раскраска вершин и хроматическое число</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-fuchsia-500/30">
                <p class="text-lg text-fuchsia-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Раскраска вершин — цвет каждой вершине так, чтобы у смежных цвета различались. χ(G) — минимум цветов. Жадная раскраска даёт χ ≤ Δ + 1, где Δ — максимальная степень.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Планарность и покраска связаны напрямую: <b>раскраска карты</b> (чтобы соседние страны отличались цветом) — это раскраска вершин <b>двойственного</b> графа, а двойственный к планарному тоже планарен. Отсюда знаменитая <b>теорема о четырёх красках</b> (Аппель и Хакен, 1976): любой планарный граф красится в 4 цвета. Это было первое крупное доказательство, где решающий перебор сделал компьютер.</p>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎨 Аналогия 1: Расписание экзаменов
                    </div>
                    <p class="text-slate-300 text-sm">Вершины — предметы, ребро — «эти два предмета выбрали одни и те же студенты». Цвет — слот времени. Раскрасить граф = составить расписание без конфликтов, а χ(G) = минимальное число слотов. Жадный алгоритм — это «берём предметы в каком-то порядке и ставим каждый в самый ранний свободный слот».</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-fuchsia-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-fuchsia-900 text-fuchsia-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-fuchsia-500 shadow-md">
                        📻 Аналогия 2: Частоты вышек
                    </div>
                    <p class="text-slate-300 text-sm">Сотовые вышки, которые «слышат» друг друга, нельзя сажать на одну частоту. Частота = цвет, интерференция = ребро. Диапазон частот дорогой, поэтому нужно ровно χ цветов — ни больше. Та же модель у распределения регистров в компиляторе: «живые» одновременно переменные не могут лежать в одном регистре.</p>
                </div>
            </div>

            <div class="overflow-x-auto my-6">
                <table class="w-full text-xs text-left border-collapse min-w-[620px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Факт</th>
                            <th class="py-2 pr-3 font-bold">Формулировка</th>
                            <th class="py-2 font-bold">Почему важно</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Жадная оценка</td><td class="py-2 pr-3 font-mono">χ ≤ Δ + 1</td><td class="py-2">у вершины не больше Δ соседей, значит один цвет из Δ + 1 всегда свободен</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Теорема Брукса</td><td class="py-2 pr-3 font-mono">χ ≤ Δ</td><td class="py-2">кроме полных K_n (χ = Δ + 1) и нечётных циклов (χ = 3 при Δ = 2)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Двудольность</td><td class="py-2 pr-3 font-mono">χ = 2 ⇔ нет нечётных циклов</td><td class="py-2">проверяется одним BFS/DFS-покрасом за O(V + E) — единственная «лёгкая» раскраска</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Планарные графы</td><td class="py-2 pr-3 font-mono">χ ≤ 4 (и это достижимо: K4)</td><td class="py-2">5 красок доказывается руками через цепи Кемпа, 4 — только перебором</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Раскраска рёбер</td><td class="py-2 pr-3 font-mono">Δ ≤ χ' ≤ Δ + 1 (Визинг)</td><td class="py-2">для двудольных χ' = Δ (Кёниг)</td></tr>
                        <tr class="align-top"><td class="py-2 pr-3 font-bold text-fuchsia-300">Сложность</td><td class="py-2 pr-3 font-mono">χ ≤ 2 — P; χ ≤ 3 — NP-полно</td><td class="py-2">даже для планарных графов «χ ≤ 3» остаётся NP-полным (билет 24)</td></tr>
                    </tbody>
                </table>
            </div>

            <p class="text-slate-300 text-sm mb-4"><b>Почему из планарности следует 6 (и даже 5) красок без компьютера.</b> Из E ≤ 3V − 6 и суммы степеней 2E = Σ deg(v) следует, что в любом планарном графе найдётся вершина степени <b>не больше 5</b> (иначе 2E ≥ 6V, то есть E ≥ 3V — противоречие). Убираем её, красим остальное по индукции, возвращаем: у неё максимум 5 соседей, значит шестой цвет точно свободен. Чтобы спуститься до пяти, нужен фокус с <b>цепями Кемпа</b>: если соседи заняли все 5 цветов, смотрим на две вершины с цветами 1 и 3 и проверяем, связаны ли они путём из чередующихся 1–3; если нет — перекрашиваем компоненту и освобождаем цвет.</p>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>Раскраска вершин, рёбер и граней</b> — три разные задачи. Грани планарного графа красятся в 4 цвета (это dual к вершинам), рёбра — в Δ или Δ + 1.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>χ ≤ Δ + 1 не значит χ = Δ + 1</b>: для дерева Δ может быть большим, а χ всегда 2 (дерево двудольно).</p>
                <p class="text-slate-400 text-sm mb-1">· <b>«Планарный — значит 5-списочный»</b>: списочная раскраска планарных графов тоже решается 5 цветами, но 4 цветами — уже не всегда (списочный вариант теоремы о 4 красках неверен; верна теорема о 5 списочных).</p>
                <p class="text-slate-400 text-sm">· <b>E ≤ 3V − 6 не доказывает планарность</b> — это только необходимое условие. K3,3 его проходит, но непланарен. Достаточный критерий — теорема Куратовского: граф планарен ⇔ в нём нет подграфа, который является подразделением K5 или K3,3. Эквивалентная формулировка Вагнера — через миноры: нет K5 и K3,3 как миноров.</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> жадная раскраска <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V + E)</code> при готовом порядке и <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V²)</code> «в лоб» проверкой цветов соседей; проверка двудольности <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V + E)</code>; точное χ — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">NP-трудно</code>.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: жадная раскраска и проверка двудольности (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"># Жадная раскраска: не больше Δ + 1 цвета
color = [-1] * n                 # -1 = ещё не покрашена
for v in order:                  # порядок влияет на число цветов!
    used = set()
    for to in graph[v]:
        if color[to] != -1:
            used.add(color[to])  # цвета уже покрашенных соседей
    c = 0
    while c in used:             # минимальный свободный
        c += 1
    color[v] = c
chi = max(color) + 1             # χ, который выдал жадный алгоритм

# Проверка двудольности = раскраска в 2 цвета (BFS)
from collections import deque
col = [-1] * n
bipartite = True
for start in range(n):
    if col[start] != -1:
        continue
    col[start] = 0
    dq = deque([start])
    while dq:
        v = dq.popleft()
        for to in graph[v]:
            if col[to] == -1:
                col[to] = col[v] ^ 1     # второй цвет
                dq.append(to)
            elif col[to] == col[v]:      # одноцветные соседи → нечётный цикл
                bipartite = False</pre>
                    <p class="text-slate-400 text-xs">Порядок важен: жадная раскраска в порядке убывания степеней (largest-first) на практике даёт заметно меньше цветов, чем случайный порядок.</p>
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
    category: "Графы. Продвинутые",
    content: `<section id="graph-articulation" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 12</span>
        <h2 class="text-3xl font-bold text-white">Точки сочленения (Хрупкость)</h2>
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
                <strong>Важно:</strong> Это работает только в неориентированных графах! Если мосты рвут связи между островами, то мосты крепятся к точкам сочленения. То есть, <strong>все точки вокруг мостов — это точки сочленения</strong> (кроме случаев, когда берег - это тупик со степенью 1).
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
];
