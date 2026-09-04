

const t1 = [
  {
    id: "dijkstra",
    title: "14. Графы. Поиск кратчайшего пути. Дейкстра",
    type: "html",
    category: "Графы. Пути",
    content: `
<section id="dijkstra-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 14</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Дейкстра (Dijkstra)</h2>
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
                </div>
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ограничения
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если в графе есть ребра с отрицательным весом Дейкстра сломается, так как он жадный и не умеет пересматривать уже "зафиксированные" вершины.</p>
                </div>
            </div>
            <div id="slot-dijkstra-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "bellman-ford",
    title: "15. Графы. Поиск кратчайшего пути. Форд-Беллман",
    type: "html",
    category: "Графы. Пути",
    content: `
<section id="bellman-ford-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 15</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Форд-Беллман</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Жизнь с отрицательными весами</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Повторять релаксацию ВСЕХ рёбер ровно (V-1) раз.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🕵️‍♂️ Аналогия 1: Параноик
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Форд-Беллман — это параноик. Он не верит, что нашел кратчайший путь, и перепроверяет ВСЕ возможные дороги V-1 раз подряд. Зато он может работать с отрицательными весами!</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔄 Отрицательный цикл
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если запустить проверку в V-й раз, и путь вдруг станет ЕЩЕ короче — значит мы попали во временную петлю.</p>
                </div>
            </div>
            <div id="slot-bellman-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "floyd",
    title: "16. Графы. Поиск кратчайшего пути. Флойд",
    type: "html",
    category: "Графы. Пути",
    content: `
<section id="floyd-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 16</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Флойд-Уоршелл</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Все ко всем</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Строгое правило / Динамика:</p>
                <p class="text-xl font-mono text-white">d[i][j] = min(d[i][j], d[i][k] + d[k][j])</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌐 Аналогия 1: Автомагистрали
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что мы строим сетку цен аэропортов. Флойд проверяет: "А будет ли дешевле долететь из Москвы в Париж, если мы сделаем пересадку (k) в Стамбуле?" И так для всех возможных пересадок.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🕰️ Время работы
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сложность O(V^3). Если городов больше 500 — компьютеру станет очень больно.</p>
                </div>
            </div>
            <div id="slot-floyd-viz" class="mt-8"></div>
        </div>
    </div>
</section>`
  },
  {
    id: "pathfinding-accel",
    title: "17. Графы. Ускорения поиска",
    type: "html",
    category: "Графы. Пути",
    content: `
<section id="pathfinding-accel" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 17</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Ускорения (Двунаправленный BFS)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Встречный поиск</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Встречаемся на середине. Сложность O(2 * B^(d/2)) вместо O(B^d), где B-ветвление, d-длина.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🔦 Аналогия: Копаем туннель под Ла-Маншем
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если копать туннель только из Англии во Францию, ты выкопаешь огромный круг лишней земли. Но если начать копать одновременно из Англии и из Франции навстречу друг другу, вы встретитесь посередине, проделав в 2 РАЗА меньше работы (геометрически: площади двух маленьких кругов меньше площади одного огромного).</p>
                </div>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "mst-kruskal",
    title: "18. Графы. Остовное дерево. Краскал",
    type: "html",
    category: "Графы. Остовные",
    content: `
<section id="mst-kruskal" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 18</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Краскал (Kruskal)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Сортировка + DSU</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">1. Сортируем все рёбра по весу.<br>2. Берём минимальное. Если оно не замыкает цикл (проверяем через DSU) - берем в ответ.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛠️ Аналогия: Прокладка интернет-кабеля (От дешевого к дорогому)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Мы хотим связать все города интернетом. Краскал говорит: "Давайте тупо строить с самых дешевых дорог в стране". Он строит кучу независимых кусочков по всей стране, пока в конце концов они все не сольются в единую сеть.</p>
                </div>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "mst-prima",
    title: "19. Графы. Остовное дерево. Прима",
    type: "html",
    category: "Графы. Остовные",
    content: `
<section id="mst-prima" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 19</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Прима (Prim)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Растущее облако</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Поддерживаем множество посещенных. На каждом шаге "откусываем" самое легкое ребро, которое торчит из посещенных в непосещенные.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ☣️ Аналогия: Заражение вирусом
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если Краскал скачет по всей карте, то Прима ведет себя как ползучая грибница (или вирус). Мы стартуем из одного города, и "щупальце" всегда захватывает ближайший, самый дешевый соседний несвязанный город. Сеть растет только из одного связного куска.</p>
                </div>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "mst-boruvka",
    title: "20. Графы. Остовное дерево. Борувка",
    type: "html",
    category: "Графы. Остовные",
    content: `
<section id="mst-boruvka" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 20</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Борувка (Boruvka)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Параллельное слияние</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Каждая компонента связности одновременно находит самое дешевое ребро наружу и сливается с соседом.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🤝 Аналогия: Племена
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сначала все города - отдельные племена. В 1-й день племя шлет гонца к самому близкому племени для объединения. К вечеру племена объединились в царства (стало в 2 раза меньше компонент). На 2-й день уже царства шлют гонцов к ближайшему чужому царству. За логарифм дней образуется Федерация интернета!</p>
                </div>
            </div>
        </div>
    </div>
</section>`
  }
];
;

const t2 = [
  {
    id: "string-kmp",
    title: "21. Алгоритм Кнута-Морриса-Пратта (KMP)",
    type: "html",
    category: "Строки",
    content: `
<section id="string-kmp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 21</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Кнута-Морриса-Пратта</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Поиск подстроки (Префикс-функция)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Префикс-функция π[i] — это длина наибольшего собственного префикса подстроки s[0..i], который одновременно является её суффиксом.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🪃 Аналогия 1: Бумеранг (Префикс = Суффикс)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты читаешь длинное слово "АБРАКАДАБРА". В самом конце ты опять видишь "АБРА". Если ты ошибешься при поиске на слове "АБРАКАДАБРА-X", тебе не нужно возвращаться в самое начало! Ты знаешь, что концовка "АБРА" совпадает с началом "АБРА". Ты просто перепрыгиваешь назад так, чтобы начало наложилось на конец, экономя время перепроверок!</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
vector&lt;int&gt; pi(s.length());
for (int i = 1; i &lt; s.length(); i++) {
    int j = pi[i-1];
    while (j > 0 && s[i] != s[j]) j = pi[j-1];
    if (s[i] == s[j]) j++;
    pi[i] = j;
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "string-z-func",
    title: "22. Z-функция",
    type: "html",
    category: "Строки",
    content: `
<section id="string-z-func" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 22</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Z-функция</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Блок совпадения префикса</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Z[i] — это длина наибольшего общего префикса (LCP) строки S и её суффикса, начинающегося с i.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📦 Аналогия 1: Копипаста
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты выделил начало текста (префикс). Z-функция для каждой позиции в тексте кричит: "Эй! Начиная с этой буквы идет ровно такой же кусок текста как в самом начале длины Z". Алгоритм поддерживает "окно" [L, R] самой дальней найденной копипасты, чтобы не сравнивать буквы заново.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int l = 0, r = 0;
for (int i = 1; i < n; i++) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "aho-corasick",
    title: "23. Алгоритм Ахо-Корасик",
    type: "html",
    category: "Строки",
    content: `
<section id="aho-corasick" class="mb-12 scroll-mt-10">
  <div class="flex items-center mb-6 flex-wrap gap-3">
    <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 23</span>
    <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Ахо-Корасик</h2>
  </div>

  <div class="space-y-8">
    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
      <h3 class="text-xl font-bold text-blue-400 mb-4">Множественный поиск</h3>
      
      <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
        <p class="text-sm text-blue-300 italic mb-2">Основная формула:</p>
        <p class="text-lg font-mono text-white">Бор (Trie) + Суффиксные ссылки + Терминальные ссылки = Конечный автомат</p>
      </div>
      <p class="text-slate-300 text-sm">Позволяет найти <b>сразу множество</b> слов из словаря в большом тексте за время O(N) совершив всего один проход.</p>
    </div>

    <!-- Аналогии -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
        <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
          🕷️ Аналогия 1: Паутина (Бор)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы сплели паутину (Бор) из нужных нам слов. Если нужного продолжения буквы нет — мы падаем по <b>суффиксной ссылке</b> ("нити страховки") в самый длинный из известных суффиксов.</p>
      </div>
      
      <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
        <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
          📦 Аналогия 2: Матёшка (Терминальные)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы ищем слова "he" и "she". Если мы прочитали "she", мы <i>одновременно</i> нашли и "he", потому что оно спрятано внутри как матрёшка! Для этого нужны терминальные ссылки.</p>
      </div>
    </div>
    
    <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
        <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
            🔍 Код (Скрыто)
        </summary>
        <div class="p-5 text-sm text-slate-300 space-y-4">
            <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int get_link(int v) {
    if (t[v].link == -1) {
        if (v == 0 || t[v].p == 0) t[v].link = 0;
        else t[v].link = go(get_link(t[v].p), t[v].pch);
    }
    return t[v].link;
}

int go(int v, char c) {
    if (t[v].go[c] == -1) {
        if (t[v].next[c] != -1) t[v].go[c] = t[v].next[c];
        else t[v].go[c] = v == 0 ? 0 : go(get_link(v), c);
    }
    return t[v].go[c];
}</pre>
        </div>
    </details>
  </div>
</section>`
  },
  {
    id: "complexity-classes",
    title: "24. Классы сложности, сведение задач",
    type: "html",
    category: "Теория сложности",
    content: `
<section id="complexity-classes" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 24</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Классы сложности (P, NP, NP-hard)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Границы невозможного</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-purple-500/30">
                <p class="text-lg text-purple-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P: Можно решить быстро (полином).<br>NP: Можно БЫСТРО ПРОВЕРИТЬ готовый ответ.<br>Сведение (Reduction) A->B: Если я умею решать B, я могу конвертнуть решение в A без потери времени.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🧩 Аналогия 1: Судоку (P vs NP)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Класс <b>P</b> — это когда алгоритм сам берет и быстро решает пустую доску (например сортировка чисел). Класс <b>NP</b> — это когда алгоритм не знает как собирать большое судоку, но если ты дашь ему заполненную сетку (ответ), он БЫСТРО (за класс P) проверит, что там нет ошибок по правилам.</p>
                </div>
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-purple-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-purple-500 shadow-md">
                        🔄 Аналогия 2: Машина-переводчик (Сведение)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сведение A к B — это когда ты не умеешь говорить по-китайски (A), но у тебя есть отличный переводчик на английский (Сведение) и друг, болтающий по-английски (решение B). Если любая NP-задача сводится к задаче B, то B — это <b>NP-Полная</b> (сосредоточение всего зла)!</p>
                </div>
            </div>
        </div>
    </div>
</section>`
  }
];
;

let add = [
  {
    id: "sparse-table",
    title: "2. Двумерная разреженная матрица (Sparse Table)",
    type: "html",
    description: "Разреженная таблица для идемпотентных запросов RMQ.",
    category: "Продвинутые структуры",
    content: `
<section id="sparse-table" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 2</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная разреженная таблица</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">RMQ за O(1)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">ST[i][j] = min(ST[i][j-1], ST[i + 2^(j-1)][j-1]). Ответ берется как пересечение двух отрезков: min(ST[L][k], ST[R - 2^k + 1][k]).</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📏 Аналогия 1: Школьные линейки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Для идемпотентных операций (когда x O x = x, например, минимум). Тебе дают отрезок длины 7. Ты берешь две заготовленные заранее линейки длины 4 (степень двойки) и накладываешь их так, чтобы они покрыли весь отрезок длины 7 (перекрывая друг друга посередине). Минимум из этих двух линеек и будет минимумом на всём отрезке! Не нужно ничего складывать, просто пересекаем куски.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧱 Аналогия 2: Ступени
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Предварительно мы считаем ответы для всех отрезков длин 1, 2, 4, 8... И когда нужно покрыть отрезок, мы берем две самые большие ступени, которые в него влезают.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int kx = log2(R2 - R1 + 1);
int ky = log2(C2 - C1 + 1);
int ans1 = min(st[R1][C1][kx][ky], st[R1][C2 - (1 << ky) + 1][kx][ky]);
int ans2 = min(st[R2 - (1 << kx) + 1][C1][kx][ky], st[R2 - (1 << kx) + 1][C2 - (1 << ky) + 1][kx][ky]);
int minimum = min(ans1, ans2);</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "treap",
    title: "3. Декартово дерево (Treap)",
    type: "html",
    description: "Дерево поиска по ключу и Куча по приоритету.",
    category: "Продвинутые структуры",
    content: `
<section id="treap" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 3</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Декартово дерево (Treap)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Tree + Heap = Treap</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Бинарное дерево поиска по ключу (X) и бинарная куча по приоритету (Y). Два базовых метода: Split и Merge.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗡️ Аналогия 1: Удар катаной (Split)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Split — это удар самурайского меча, который разрезает дерево на две части ровно по значению X. Все, кто меньше X улетают влево, остальные — вправо. Разрез идет сверху вниз, спускаясь по веткам.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧲 Аналогия 2: Слияние капель (Merge)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Merge — это склеивание двух деревьев (где все элементы левого строго меньше правого). Мы просто смотрим на корни: у кого Y (приоритет) больше, тот и становится общим корнем, а второй прилипает к нему сбоку как потомок.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
pair&lt;Node*, Node*&gt; split(Node* t, int x) {
    if (!t) return {nullptr, nullptr};
    if (t->val &lt;= x) {
        auto [L, R] = split(t->right, x);
        t->right = L;
        return {t, R};
    } else {
        auto [L, R] = split(t->left, x);
        t->left = R;
        return {L, t};
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "splay-tree",
    title: "4. Splay-дерево",
    type: "html",
    description: "Дерево поиска, которое самобалансируется при запросах.",
    category: "Продвинутые структуры",
    content: `
<section id="splay-tree" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 4</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Splay-дерево</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Всплытие наверх</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Операция Splay(v) поднимает узел v в самый корень дерева с помощью серий вращений (Zig, Zig-Zig, Zig-Zag), гарантируя амортизированное время O(log n).</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛗 Аналогия 1: VIP-лифт
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Каждый раз, когда ты обращаешься к элементу базы данных, он поднимается и становится корнем дерева (VIP-статус). Если ты часто запрашиваешь одни и те же узлы, они скапливаются на самом верху, и для их поиска почти не требуется времени!</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔄 Аналогия 2: Балансировка через боль
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Вместо поддержания строгих правил как в AVL-дереве, Splay-дерево может временами становиться кривым как бамбук. Но как только по нему проходят поиском, операция всплытия сама разглаживает структуру дерева.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
// Zig, Zag
function rotate(x) {
    let p = x.parent;
    if (p.left === x) { // Right rotate
        p.left = x.right;
        x.right = p;
    } else { // Left rotate
        p.right = x.left;
        x.left = p;
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "prefix-sums-2d",
    title: "5. Двумерная матрица префиксных сумм",
    type: "html",
    description: "Сжатие суммы подматрицы за O(1)",
    category: "Алгоритмы матрицы",
    content: `
<section id="prefix-sums-2d" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 5</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная матрица префиксных сумм</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Формула включений-исключений</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P[i][j] = P[i-1][j] + P[i][j-1] - P[i-1][j-1] + M[i][j]<br>Сумма Rectangle(x1...x2, y1...y2) = P[x2][y2] - P[x1-1][y2] - P[x2][y1-1] + P[x1-1][y1-1]</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ✂️ Аналогия 1: Вырезание прямоугольников
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь большой лист картона (площадь от (0,0) до (x2, y2)). Чтобы вырезать из него маленький целевой прямоугольник в центре, тебе нужно отрезать кусок слева и кусок сверху. Но когда ты отрезаешь их, левый верхний угол отрезается дважды! Поэтому его площадь нужно прибавить обратно.</p>
                </div>
            </div>
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
                    <p class="text-slate-300 text-sm mb-4">Не работает на графах с циклами. "Чтобы устроиться на работу нужен опыт. Чтобы получить опыт, нужна работа". Алгоритм выявит цикл и скажет, что отсортировать невозможно.</p>
                </div>
            </div>
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
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Компоненты сильной связности</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Алгоритм Косарайю</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">1. Top-sort исходного графа.<br>2. Инвертируем все ребра.<br>3. Запускаем DFS по инвертированному в порядке top-sort.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏙️ Аналогия 1: Улицы с односторонним
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сильная связность — это города, внутри которых можно ездить по кругу между В ЛЮБЫХ направлениях по односторонним улицам. Как будто мы сжали целые районы, внутри которых можно заблудиться, в одну супер-точку на карте.</p>
                </div>
            </div>
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
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 12</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Точки сочленения</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Узкие горлышки сети</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Вершина u — точка сочленения, если fup[v] >= tin[u] (для корня дерева DFS: если детей > 1).</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛑 Аналогия 1: Центральный роутер
                    </div>
                    <p class="text-slate-300 text-sm mb-4">То же самое что и мост, но на уровне городов или роутеров. Выключите из розетки правильный роутер - и два сегмента офиса больше не смогут переписываться. "Точка слабости" системы.</p>
                </div>
            </div>
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
  {
    id: "pathfinding-accel",
    title: "17. Графы. Ускорения поиска",
    type: "html",
    description: "",
    category: "Графы. Пути",
    content: `
<section id="pathfinding-accel" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 17</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Ускорения (Двунаправленный BFS)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Встречный поиск</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Встречаемся на середине. Сложность O(2 * B^(d/2)) вместо O(B^d), где B-ветвление, d-длина.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🔦 Аналогия: Копаем туннель под Ла-Маншем
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если копать туннель только из Англии во Францию, ты выкопаешь огромный круг лишней земли. Но если начать копать одновременно из Англии и из Франции навстречу друг другу, вы встретитесь посередине, проделав в 2 РАЗА меньше работы (геометрически: площади двух маленьких кругов меньше площади одного огромного).</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-kruskal",
    title: "18. Графы. Остовное дерево. Краскал",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-kruskal" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 18</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Краскал (Kruskal)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Сортировка + DSU</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">1. Сортируем все рёбра по весу.<br>2. Берём минимальное. Если оно не замыкает цикл (проверяем через DSU) - берем в ответ.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛠️ Аналогия: Прокладка интернет-кабеля (От дешевого к дорогому)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Мы хотим связать все города интернетом. Краскал говорит: "Давайте тупо строить с самых дешевых дорог в стране". Он строит кучу независимых кусочков по всей стране, пока в конце концов они все не сольются в единую сеть.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-prima",
    title: "19. Графы. Остовное дерево. Прима",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-prima" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 19</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Прима (Prim)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Растущее облако</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Поддерживаем множество посещенных. На каждом шаге "откусываем" самое легкое ребро, которое торчит из посещенных в непосещенные.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ☣️ Аналогия: Заражение вирусом
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если Краскал скачет по всей карте, то Прима ведет себя как ползучая грибница (или вирус). Мы стартуем из одного города, и "щупальце" всегда захватывает ближайший, самый дешевый соседний несвязанный город. Сеть растет только из одного связного куска.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-boruvka",
    title: "20. Графы. Остовное дерево. Борувка",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-boruvka" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 20</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Борувка (Boruvka)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Параллельное слияние</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Каждая компонента связности одновременно находит самое дешевое ребро наружу и сливается с соседом.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🤝 Аналогия: Племена
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сначала все города - отдельные племена. В 1-й день племя шлет гонца к самому близкому племени для объединения. К вечеру племена объединились в царства (стало в 2 раза меньше компонент). На 2-й день уже царства шлют гонцов к ближайшему чужому царству. За логарифм дней образуется Федерация интернета!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "string-kmp",
    title: "21. Алгоритм Кнута-Морриса-Пратта (KMP)",
    type: "html",
    description: "",
    category: "Строки",
    content: `
<section id="string-kmp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 21</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Кнута-Морриса-Пратта</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Поиск подстроки (Префикс-функция)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Префикс-функция π[i] — это длина наибольшего собственного префикса подстроки s[0..i], который одновременно является её суффиксом.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🪃 Аналогия 1: Бумеранг (Префикс = Суффикс)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты читаешь длинное слово "АБРАКАДАБРА". В самом конце ты опять видишь "АБРА". Если ты ошибешься при поиске на слове "АБРАКАДАБРА-X", тебе не нужно возвращаться в самое начало! Ты знаешь, что концовка "АБРА" совпадает с началом "АБРА". Ты просто перепрыгиваешь назад так, чтобы начало наложилось на конец, экономя время перепроверок!</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
vector&lt;int&gt; pi(s.length());
for (int i = 1; i &lt; s.length(); i++) {
    int j = pi[i-1];
    while (j > 0 && s[i] != s[j]) j = pi[j-1];
    if (s[i] == s[j]) j++;
    pi[i] = j;
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "string-z-func",
    title: "22. Z-функция",
    type: "html",
    description: "",
    category: "Строки",
    content: `
<section id="string-z-func" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 22</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Z-функция</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Блок совпадения префикса</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Z[i] — это длина наибольшего общего префикса (LCP) строки S и её суффикса, начинающегося с i.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📦 Аналогия 1: Копипаста
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты выделил начало текста (префикс). Z-функция для каждой позиции в тексте кричит: "Эй! Начиная с этой буквы идет ровно такой же кусок текста как в самом начале длины Z". Алгоритм поддерживает "окно" [L, R] самой дальней найденной копипасты, чтобы не сравнивать буквы заново.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int l = 0, r = 0;
for (int i = 1; i < n; i++) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "complexity-classes",
    title: "24. Классы сложности, сведение задач",
    type: "html",
    description: "",
    category: "Теория сложности",
    content: `
<section id="complexity-classes" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 24</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Классы сложности (P, NP, NP-hard)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Границы невозможного</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-purple-500/30">
                <p class="text-lg text-purple-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P: Можно решить быстро (полином).<br>NP: Можно БЫСТРО ПРОВЕРИТЬ готовый ответ.<br>Сведение (Reduction) A->B: Если я умею решать B, я могу конвертнуть решение в A без потери времени.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🧩 Аналогия 1: Судоку (P vs NP)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Класс <b>P</b> — это когда алгоритм сам берет и быстро решает пустую доску (например сортировка чисел). Класс <b>NP</b> — это когда алгоритм не знает как собирать большое судоку, но если ты дашь ему заполненную сетку (ответ), он БЫСТРО (за класс P) проверит, что там нет ошибок по правилам.</p>
                </div>
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-purple-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-purple-500 shadow-md">
                        🔄 Аналогия 2: Машина-переводчик (Сведение)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сведение A к B — это когда ты не умеешь говорить по-китайски (A), но у тебя есть отличный переводчик на английский (Сведение) и друг, болтающий по-английски (решение B). Если любая NP-задача сводится к задаче B, то B — это <b>NP-Полная</b> (сосредоточение всего зла)!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
];
;

let gC = [
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
;
const fs = require('fs');
const newContent = "export interface Chapter {\n  id: string;\n  title: string;\n  type: \"html\";\n  content: string;\n}\n\nexport const chapters: Chapter[] = [\n  {\n    id: \"euler-path-vs-cycle\",\n    title: \"Эйлер: Путь ≠ Цикл (ты путаешь!)\",\n    type: \"html\",\n    content: `<section id=\"euler-path-vs-cycle\" class=\"mb-20 scroll-mt-10\">\n    <div class=\"flex items-center mb-6\">\n        <span class=\"bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4\">Глава 1</span>\n        <h2 class=\"text-3xl font-bold text-white\">Не будь идиотом: Путь vs Цикл</h2>\n    </div>\n    \n    <div class=\"space-y-8\">\n        <div class=\"bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10\">\n            <h3 class=\"text-xl font-bold text-blue-400 mb-4\">1.1 Определения</h3>\n            \n            <div class=\"bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30\">\n                <p class=\"text-lg text-blue-300 italic mb-2\">Строгое правило:</p>\n                <div class=\"text-left font-mono text-sm text-slate-300 space-y-3 max-w-lg mx-auto\">\n                    <p><strong class=\"text-white\">Эйлеров путь</strong> — проходит все <span class=\"text-yellow-400\">РЁБРА</span> ровно один раз. Вершины повторять можно.</p>\n                    <p><strong class=\"text-white\">Эйлеров цикл</strong> — то же самое + замкнутый (начало = конец).</p>\n                    <div class=\"p-3 bg-slate-950 rounded border border-blue-500/30\">\n                        <p class=\"text-sm text-blue-300\">Признак существования:</p>\n                        <p><strong class=\"text-white\">Путь:</strong> ровно 2 вершины с нечётной степенью (начало и конец).</p>\n                        <p><strong class=\"text-white\">Цикл:</strong> <span class=\"text-green-400\">ВСЕ</span> вершины чётные.</p>\n                    </div>\n                </div>\n            </div>\n\n            <p class=\"text-slate-300 text-sm\">\n                <strong>Билет 13 (Различие пути и цикла):</strong> \n                <br>• <span class=\"text-green-400 font-semibold\">Цикл:</span> Вышел из дома и вернулся домой. Все степени чётные (вошёл-вышел-вошёл-вышел).\n                <br>• <span class=\"text-yellow-400 font-semibold\">Путь:</span> Вышел из общаги в пивбар. Ровно 2 нечётные вершины (старт и финиш).\n            </p>\n        </div>\n\n        <div class=\"grid grid-cols-1 xl:grid-cols-2 gap-6\">\n            <div class=\"bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-slate-700 text-green-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-green-500 shadow-md\">\n                    🚶 Путь: Нормальная прогулка\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    Ты вышел из дома <strong>(нечётная)</strong>, прошёлся по всем улицам города (по каждой ровно раз, это же Эйлер), и усталый пришёл в бар <strong>(вторая нечётная)</strong>. \n                    Домой вернуться не смог, потому что ноги не идут. Вот и путь. Начало не равно концу.\n                </p>\n            </div>\n            \n            <div class=\"bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-rose-905 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md bg-slate-950\">\n                    🤮 Цикл: Гамильтонов синдром (болезнь)\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    <strong>Гамильтон — это болезнь.</strong> Синдром Гамильтона: ты одержимо хочешь посетить <strong>каждую вершину</strong> ровно раз и вернуться домой. \n                    Ты обходишь все бары (вершины) ровно по разу. Какие улицы при этом топтать — плевать. \n                    Главное — зайти и выйти, не заходя дважды. Это NP-полная хрень. \n                    Никто не знает, как решать быстро. Если скажешь, что придумал алгоритм — ты либо Цукерберг, либо врешь.\n                    <br><span class=\"text-xs text-rose-400 block mt-2 font-mono\">Запомни: Гамильтон = Госпитализация (тебя упекут за NP-полноту).</span>\n                </p>\n            </div>\n        </div>\n\n        <details class=\"bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6\">\n            <summary class=\"p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50\">\n                🔍 Душный режим: Формальное доказательство (Скрыто)\n            </summary>\n            <div class=\"p-5 text-sm text-slate-300 space-y-4 cursor-default\" onClick=\"event.stopPropagation()\">\n                <p class=\"text-blue-400\">Теорема Эйлера:</p>\n                <p>\n                    Связный граф содержит эйлеров цикл ⇔ степень каждой вершины чётная.\n                    <br>Эйлеров путь (не цикл) ⇔ ровно 2 вершины нечётной степени (это старт и конец).\n                </p>\n                <p class=\"text-rose-400\">Почему Гамильтон — NP-полный:</p>\n                <p>\n                    Задача коммивояжёра (TSP) — это взвешенная версия гамильтонова пути. \n                    Доказано, что любой полиномиальный алгоритм для TSP решит NP=... \n                    В общем, не парься. Просто запомни ассоциацию: Гамильтон = больничка.\n                </p>\n            </div>\n        </details>\n    </div>\n</section>`,\n  },\n  {\n    id: \"bridges-code\",\n    title: \"Мосты в графах: код + визуализация\",\n    type: \"html\",\n    content: `<section id=\"bridges-code\" class=\"mb-20 scroll-mt-10\">\n    <div class=\"flex items-center mb-6\">\n        <span class=\"bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4\">Глава 2</span>\n        <h2 class=\"text-3xl font-bold text-white\">Мосты: Алгоритм + Код</h2>\n    </div>\n    \n    <div class=\"space-y-8\">\n        <div class=\"bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10\">\n            <h3 class=\"text-xl font-bold text-emerald-400 mb-4\">2.1 Алгоритм Тарьяна</h3>\n            \n            <div class=\"bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30\">\n                <p class=\"text-lg text-emerald-300 italic mb-2\">Ключевые массивы:</p>\n                <div class=\"text-left font-mono text-sm text-slate-300 space-y-3 max-w-xl mx-auto\">\n                    <p><strong class=\"text-white\">tin[v]</strong> — время захода DFS в вершину v.</p>\n                    <p><strong class=\"text-white\">low[v]</strong> — минимальный tin, достижимый из поддерева v (через обратные рёбра).</p>\n                    <div class=\"p-3 bg-slate-950 rounded border border-rose-500/30 text-center\">\n                        <span class=\"text-rose-400 font-bold\">УСЛОВИЕ МОСТА:</span>\n                        <p class=\"text-xl font-bold text-white mt-1\">low[u] > tin[v]</p>\n                        <p class=\"text-xs text-slate-400 mt-1\">(v — родитель, u — сын в DFS-дереве)</p>\n                    </div>\n                </div>\n            </div>\n            \n            <p class=\"text-slate-300 text-sm\">\n                Если из сына u и всех его потомков <strong>нельзя</strong> попасть в предка v (кроме ребра (v,u)) — это мост.\n                Единственная ниточка. Порвётся — граф распадётся.\n            </p>\n        </div>\n\n        <div class=\"grid grid-cols-1 xl:grid-cols-2 gap-6\">\n            <div class=\"bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md\">\n                    🌉 Мост: Единственная веревка\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    Представь, что ты альпинист. Ты спускаешься в пещеру (вершина v) к напарнику (вершина u). \n                    Из пещеры u нет других выходов — только та самая дыра, через которую ты спустился. \n                    Если верёвка (ребро v-u) оборвётся — напарник навсегда замурован. Это и есть мост. \n                    Если бы из пещеры u был чёрный ход наверх (обратное ребро) — напарник бы выбрался. И тогда это не мост.\n                </p>\n            </div>\n            \n            <div class=\"bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md\">\n                    🩸 Аналогия: Кровеносный сосуд\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    Граф — это кровеносная система. Ребро — сосуд. Если перерезать один сосуд, но кровь может пойти по другому пути (коллатерали) — это не мост, живём. \n                    Если же перерезать единственную артерию, ведущую к органу, и альтернатив нет — орган отмирает. Вот это мост. \n                    Алгоритм DFS ищет такие «критические артерии».\n                </p>\n            </div>\n        </div>\n\n        <details class=\"bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6\">\n            <summary class=\"p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50\">\n                🔍 Полный код на C++ (Скрыто)\n            </summary>\n            <div class=\"p-5 text-sm text-slate-300 space-y-4 cursor-default\" onClick=\"event.stopPropagation()\">\n                <p>Классическая реализация — <code class=\"text-emerald-400\">O(V + E)</code>. Каждая вершина и ребро — константное число проходов.</p>\n                \n                <div class=\"bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto\">\n                    <pre class=\"text-xs font-mono text-emerald-400 whitespace-pre\">\n#include &lt;vector&gt;\n#include &lt;algorithm&gt;\n\nusing namespace std;\n\nint n;                      // число вершин\nvector&lt;vector&lt;int&gt;&gt; adj;  // список смежности\nvector&lt;bool&gt; visited;\nvector&lt;int&gt; tin, low;\nint timer;\n\nvoid dfs(int v, int p = -1) {\n    visited[v] = true;\n    tin[v] = low[v] = timer++;        // устанавливаем время входа\n    \n    for (int to : adj[v]) {\n        if (to == p) continue;        // не идём назад к родителю\n        \n        if (visited[to]) {\n            // обратное ребро: обновляем low\n            low[v] = min(low[v], tin[to]);\n        } else {\n            // ребро дерева DFS\n            dfs(to, v);                // рекурсивный вызов\n            low[v] = min(low[v], low[to]);\n            \n            if (low[to] > tin[v]) {\n                // ЭТО МОСТ!\n                // bridge_list.push_back({v, to});\n            }\n        }\n    }\n}\n\nvoid find_bridges() {\n    timer = 0;\n    visited.assign(n, false);\n    tin.assign(n, -1);\n    low.assign(n, -1);\n    \n    for (int i = 0; i &lt; n; ++i) {\n        if (!visited[i]) dfs(i);\n    }\n}</pre>\n                </div>\n                <p class=\"text-xs text-slate-400\">Запусти визуализатор в симуляторе — там каждая строка кода подсвечивается по шагам!</p>\n            </div>\n        </details>\n    </div>\n</section>`,\n  },\n  {\n    id: \"planarity-euler-formula\",\n    title: \"Планарность: K5, K3,3 и формула Эйлера\",\n    type: \"html\",\n    content: `<section id=\"planarity-euler-formula\" class=\"mb-20 scroll-mt-10\">\n    <div class=\"flex items-center mb-6\">\n        <span class=\"bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4\">Глава 3</span>\n        <h2 class=\"text-3xl font-bold text-white\">Планарность и формула Эйлера</h2>\n    </div>\n    \n    <div class=\"space-y-8\">\n        <div class=\"bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10\">\n            <h3 class=\"text-xl font-bold text-blue-400 mb-4\">3.1 Формула Эйлера</h3>\n            \n            <div class=\"bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30\">\n                <p class=\"text-lg text-blue-300 italic mb-2\">Формула Эйлера:</p>\n                <p class=\"text-3xl font-mono text-white my-3\">V - E + F = 2</p>\n                <div class=\"text-sm text-slate-400 space-y-1\">\n                    <p><span class=\"text-blue-400 font-bold\">V</span> — вершины</p>\n                    <p><span class=\"text-emerald-400 font-bold\">E</span> — рёбра</p>\n                    <p><span class=\"text-rose-400 font-bold\">F</span> — грани (включая внешнюю)</p>\n                </div>\n            </div>\n            \n            <p class=\"text-slate-300 text-sm\">\n                <strong>Следствие:</strong> Для планарного графа с V ≥ 3: <code class=\"text-emerald-400 font-bold font-mono\">E ≤ 3V - 6</code>. \n                Если ребер больше — граф гарантированно непланарен. Ребра будут пересекаться.\n            </p>\n        </div>\n\n        <div class=\"grid grid-cols-1 xl:grid-cols-2 gap-6\">\n            <div class=\"bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-slate-700 text-green-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-green-500 shadow-md\">\n                    🤡 K5: Полный граф на 5 вершинах\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    У K5: <code class=\"text-white\">V=5, E=10</code>. Проверяем <code class=\"text-white\">E ≤ 3V-6</code>: <code class=\"text-white\">10 &gt; 9</code> — БАХ, непланарен! \n                    Все 5 вершин соединены со всеми. На плоскости это звезда с пересечениями. \n                    Теорема Куратовского: K5 — эталон непланарности. \n                    Если внутри графа спрятан K5 — забудь о плоской раскладке. \n                </p>\n            </div>\n            \n            <div class=\"bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8\">\n                <div class=\"absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md\">\n                    🏘️ K3,3: 3 дома и 3 колодца\n                </div>\n                <p class=\"text-slate-300 text-sm mb-4\">\n                    Три дома хотят соединиться с тремя колодцами (каждый дом — с каждым колодцем). \n                    Нарисовать без пересечений невозможно. Это <strong>K3,3</strong>. \n                    У него <code class=\"text-white\">V=6, E=9</code>. Формула <code class=\"text-white\">E ≤ 3V-6</code> даёт <code class=\"text-white\">9 ≤ 12</code> — проходит, но он всё равно непланарен! \n                    Почему? Потому что у двудольного графа минимальный цикл — 4, а не 3. \n                    Отсюда более строгое ограничение: <code class=\"text-white font-mono text-rose-400\">E ≤ 2V - 4</code>. \n                    <code class=\"text-white\">9 &gt; 8</code> — попался!\n                </p>\n            </div>\n        </div>\n\n        <details class=\"bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6\">\n            <summary class=\"p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50\">\n                🔍 Доказательство непланарности K5 (Скрыто)\n            </summary>\n            <div class=\"p-5 text-sm text-slate-300 space-y-4 cursor-default\" onClick=\"event.stopPropagation()\">\n                <p class=\"text-blue-400\">Доказательство через формулу Эйлера:</p>\n                <p>\n                    Пусть K5 планарен. V = 5, E = 10.\n                    <br>F = E - V + 2 = 10 - 5 + 2 = 7 граней.\n                    <br>Каждая грань ограничена минимум 3 ребрами (простых циклов длины 1-2 нет).\n                    <br>Сумма длин граней = 2E = 20.\n                    <br>Отсюда: 2E ≥ 3F ⇒ 20 ≥ 21 — <span class=\"text-rose-400\">ПРОТИВОРЕЧИЕ!</span>\n                    <br>Значит, K5 не может быть планарным. Теорема доказана.\n                </p>\n            </div>\n        </details>\n    </div>\n</section>`,\n  }\n];\n";
// Extract the new 3 chapters:
let match = newContent.match(/export const chapters: Chapter\[\] = \[(.*)\];/s);
let evalStr = "const c = [" + match[1] + "]; return c;";
let newChaps = new Function(evalStr)();

// Now add the lost chapters to 'add'
add.push(...t1.filter(c => !add.some(x => x.id === c.id)));
add.push(...t2.filter(c => !add.some(x => x.id === c.id)));

// Replace 7, 11, 13
let eulerId = "euler-path-vs-cycle";
let bridgesId = "bridges-code";
let planarId = "planarity-euler-formula";

let eulerChapter = newChaps.find(c => c.id === eulerId);
let bridgesChapter = newChaps.find(c => c.id === bridgesId);
let planarChapter = newChaps.find(c => c.id === planarId);

// override in add
for (let i=0; i<add.length; i++) {
  if (add[i].id === 'graph-euler') add[i] = eulerChapter;
  if (add[i].id === 'graph-bridges') add[i] = bridgesChapter;
  if (add[i].id === 'graph-planar-colors') add[i] = planarChapter;
}

// read backup content.ts
let backupContent = fs.readFileSync("backup/src/data/content.ts", "utf8");
let cParts = backupContent.split("export const chapters: Chapter[] = [");
let header = cParts[0];

let allContentStr = `${header}
export const chapters: Chapter[] = [
  ...gC,
  ...add
];
`;

fs.writeFileSync("src/data/content.ts.out", allContentStr);
