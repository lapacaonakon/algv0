import { Chapter } from "./content";

export const graphChapters: Chapter[] = [
  {
    id: "intro",
    title: "Обзор: Кратчайшие пути и Графы",
    type: "html",
    category: "Графы",
    content: `<section id="intro-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Введение</span>
        <h2 class="text-3xl font-bold text-white">Обзор: Кратчайшие пути</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Для чего это нужно?</h3>
            <p class="text-slate-300 text-sm mb-4">Представь, что города — это вершины, а дороги между ними — ребра с весом (стоимостью проезда). Алгоритмы поиска кратчайшего пути показывают, как добраться из точки А в точку Б максимально дешево или быстро.</p>
            <div class="mt-8 mb-4">
               <div id="slot-mnemonic-cards"></div>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "dijkstra",
    title: "Билет 14. Дейкстра",
    type: "html",
    category: "Графы",
    content: `<section id="dijkstra-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 14</span>
        <h2 class="text-3xl font-bold text-white">Дейкстра (Dijkstra)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Суть алгоритма</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула (Релаксация):</p>
                <p class="text-xl font-mono text-white">if d[v] > d[u] + w(u,v) then d[v] = d[u] + w(u,v)</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌤️ Аналогия 1: Позитивное планирование
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Дейкстра — это оптимист. Он верит, что все дороги имеют положительную стоимость (нельзя поехать и заработать). Он всегда выбирает ближайший доступный город и фиксирует кратчайший путь до него.</p>
                    <div id="slot-chapter-image-dijkstra" class="mt-4"></div>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ограничения
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если в графе есть ребра с отрицательным весом (например, тебе доплачивают за прохождение улицы), Дейкстра сломается, так как он жадный и не умеет пересматривать уже "зафиксированные" вершины.</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Алгоритм использует приоритетную очередь (Heap) из Билета 0 для выбора минимального элемента. Сложность: O((V+E) log V). Гарантирует корректность только для неотрицательных весов.</p>
                </div>
            </details>
            
            <div id="slot-dijkstra-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "bellman-ford",
    title: "Билет 15. Форд-Беллман",
    type: "html",
    category: "Графы",
    content: `<section id="bellman-ford-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 15</span>
        <h2 class="text-3xl font-bold text-white">Форд-Беллман (Bellman-Ford)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Жизнь с отрицательными весами</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Повторять релаксацию ВСЕХ рёбер ровно (V-1) раз.</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🕵️‍♂️ Аналогия 1: Параноик
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Форд-Беллман — это параноик. Он не верит, что нашел кратчайший путь, и перепроверяет ВСЕ возможные дороги V-1 раз подряд. Зато он может работать с отрицательными весами!</p>
                    <div id="slot-chapter-image-bellman" class="mt-4"></div>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔄 Отрицательный цикл
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если запустить проверку в V-й раз (на один раз больше положенного), и путь вдруг станет ЕЩЕ короче — значит мы попали во временную петлю (отрицательный цикл). Алгоритм умеет сообщать об этом!</p>
                </div>
            </div>

            <div id="slot-bellman-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "floyd",
    title: "Билет 16. Флойд-Уоршелл",
    type: "html",
    category: "Графы",
    content: `<section id="floyd-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Билет 16</span>
        <h2 class="text-3xl font-bold text-white">Флойд-Уоршелл (Floyd-Warshall)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Все ко всем</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Строгое правило / Динамика:</p>
                <p class="text-xl font-mono text-white">d[i][j] = min(d[i][j], d[i][k] + d[k][j])</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌐 Аналогия 1: Автомагистрали
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что мы строим сетку цен аэропортов. Флойд проверяет: "А будет ли дешевле долететь из Москвы в Париж, если мы сделаем пересадку (k) в Стамбуле?" И так для всех возможных пересадок.</p>
                    <div id="slot-chapter-image-floyd" class="mt-4"></div>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🕰️ Время работы
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Так как он перебирает все пары (i,j) и все возможные узлы пересадки (k), у него три вложенных цикла. Сложность O(V^3). Если городов больше 500 — компьютеру станет очень больно.</p>
                </div>
            </div>

            <div id="slot-floyd-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "aho-corasick",
    title: "Билет 23. Алгоритм Ахо-Корасик",
    type: "html",
    category: "Строки",
    content: `<section id="aho-corasick" class="mb-12 scroll-mt-10">
  <div class="flex items-center mb-6 flex-wrap gap-3">
    <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 23</span>
    <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Ахо-Корасик</h2>
  </div>

  <div class="space-y-8">
    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
      <h3 class="text-xl font-bold text-blue-400 mb-4">Множественный поиск (Aho-Corasick)</h3>
      
      <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
        <p class="text-sm text-blue-300 italic mb-2">Основная формула:</p>
        <p class="text-lg font-mono text-white">Бор (Trie) + Суффиксные ссылки + Терминальные ссылки = Конечный автомат</p>
      </div>
      <p class="text-slate-300 text-sm">Позволяет найти <b>сразу множество</b> слов из словаря в большом тексте за время <code class="font-mono text-amber-300 bg-black/30 px-1 rounded">O(N + (длины слов) + (число вхождений))</code>, совершив всего один проход по тексту.</p>
    </div>

    <!-- Аналогии -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
        <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
          🕷️ Аналогия 1: Паутина (Бор)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы сплели паутину (Бор) из нужных нам слов. Когда текст летит через паутину, мы двигаемся по веткам. Если нужного продолжения буквы нет — мы не начинаем всё с начала! Мы падаем по <b>суффиксной ссылке</b> ("нити страховки") в самый длинный из известных суффиксов. Это позволяет не перечитывать уже прочитанные символы!</p>
      </div>
      
      <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
        <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
          📦 Аналогия 2: Матёшка (Терминальные)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы ищем слова "he" и "she". Если мы прочитали "she", мы <i>одновременно</i> нашли и "he", потому что оно спрятано внутри как матрёшка! Чтобы не проверять это каждый раз вручную, мы заранее проводим <b>терминальные ссылки</b> (term_link) — прямые мосты от длинных найденных слов ко всем более коротким "вложенным" найденным словам.</p>
      </div>
    </div>

    <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
      <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b group-open:border-slate-700/50">
        🔍 Внутренняя структура автомата и код BFS (Скрыто)
      </summary>
      <div class="p-5 text-sm text-slate-300 space-y-4">
        <p>Каждая вершина имеет таблицу переходов <code>go</code>, суффиксную ссылку <code>link</code> (переход при ошибке) и терминальную ссылку <code>term_link</code> (ближайшая меньшая найденная строка-суффикс).</p>
        <div class="bg-black/50 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre text-blue-300">
struct Node {
    map&lt;char, int&gt; go;      // Предвычисленные переходы автомата по всем буквам
    int link = 0;           // Суффиксная ссылка: куда идти, если путь обрывается
    int term_link = 0;      // Терминальная ссылка: матрёшка
    bool is_terminal = false;
    vector&lt;string&gt; words;
};

// Расчет ссылок идет через BFS (level-order traversal), 
// так как для вычисления link вершины v на глубине d, 
// её предки на глубине d-1 уже должны иметь вычисленные link!
void buildLinks() {
    queue&lt;int&gt; q;
    // Корни и их дети
    for (auto const& [ch, child] : nodes[0].trie) {
        nodes[child].link = 0;
        q.push(child);
    }
    
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (auto const& [ch, child] : nodes[v].trie) {
            // Суффиксная ссылка ребёнка — это переход по 'ch' из суффиксной ссылки родителя
            nodes[child].link = nodes[nodes[v].link].go[ch];
            
            // Если суффиксная ссылка сама является словом, она и есть terminal_link
            // Иначе наследуем terminal_link
            if (nodes[nodes[child].link].is_terminal) {
                nodes[child].term_link = nodes[child].link;
            } else {
                nodes[child].term_link = nodes[nodes[child].link].term_link;
            }
            
            q.push(child);
        }
    }
}
        </div>
      </div>
    </details>
  </div>
</section>`
  },
  {
    id: "alg-map",
    title: "Алгоритмы на карте",
    type: "html",
    category: "Графы",
    content: `<section id="alg-map-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Применение</span>
        <h2 class="text-3xl font-bold text-white">Алгоритмы на карте и сжатие координат</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Работа с геоданными</h3>
            <p class="text-slate-300 text-sm mb-4">Когда мы работаем с картой мира (GPS), обычные сетки матриц не подходят. Координаты могут быть большими дробными числами (долгота и широта). Мы применяем Сжатие Координат, чтобы привести все точки к плотному массиву от 0 до N, и уже по ним строим графы.</p>
        </div>
    </div>
</section>`
  }
];
