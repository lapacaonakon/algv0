export interface Chapter {
  id: string;
  title: string;
  type: "html";
  content: string;
}

export const chapters: Chapter[] = [
  {
    id: "euler-path-vs-cycle",
    title: "Эйлер: Путь ≠ Цикл (ты путаешь!)",
    type: "html",
    content: `<section id="euler-path-vs-cycle" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 1</span>
        <h2 class="text-3xl font-bold text-white">Не будь идиотом: Путь vs Цикл</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">1.1 Определения</h3>
            
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
                    🚶 Путь: Нормальная прогулка
                </div>
                <p class="text-slate-300 text-sm mb-4">
                    Ты вышел из дома <strong>(нечётная)</strong>, прошёлся по всем улицам города (по каждой ровно раз, это же Эйлер), и усталый пришёл в бар <strong>(вторая нечётная)</strong>. 
                    Домой вернуться не смог, потому что ноги не идут. Вот и путь. Начало не равно концу.
                </p>
            </div>
            
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-rose-905 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md bg-slate-950">
                    🤮 Цикл: Гамильтонов синдром (болезнь)
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
                    Доказано, что любой полиномиальный алгоритм для TSP решит NP=... 
                    В общем, не парься. Просто запомни ассоциацию: Гамильтон = больничка.
                </p>
            </div>
        </details>
    </div>
</section>`,
  },
  {
    id: "bridges-code",
    title: "Мосты в графах: код + визуализация",
    type: "html",
    content: `<section id="bridges-code" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 2</span>
        <h2 class="text-3xl font-bold text-white">Мосты: Алгоритм + Код</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">2.1 Алгоритм Тарьяна</h3>
            
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
                <p class="text-xs text-slate-400">Запусти визуализатор в симуляторе — там каждая строка кода подсвечивается по шагам!</p>
            </div>
        </details>
    </div>
</section>`,
  },
  {
    id: "planarity-euler-formula",
    title: "Планарность: K5, K3,3 и формула Эйлера",
    type: "html",
    content: `<section id="planarity-euler-formula" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 3</span>
        <h2 class="text-3xl font-bold text-white">Планарность и формула Эйлера</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">3.1 Формула Эйлера</h3>
            
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
                    Теорема Куратовского: K5 — эталон непланарности. 
                    Если внутри графа спрятан K5 — забудь о плоской раскладке. 
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
    </div>
</section>`,
  },
  {
    id: "graph-articulation",
    title: "12. Графы. Точки сочленения",
    type: "html",
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
