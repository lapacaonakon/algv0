import { Chapter } from '../../types';

export const tickets14to20: Chapter[] = [
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
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Флойд-Уоршелл (Динамика на промежуточных вершинах)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Флойд не считает шаги — он считает разрешенные вершины</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Формула (выбей на лбу):</p>
                <p class="text-xl font-mono text-white">D[i][j] = min(D[i][j], D[i][k] + D[k][j])</p>
            </div>
            
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-6 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                    🎩 Суть фокуса (По шагам)
                </div>
                <p class="text-slate-300 text-sm mb-4 leading-relaxed">
                    Главный герой — <b>внешний цикл</b> <code class="bg-slate-900 px-1 rounded text-pink-400">for k from 1 to N</code>. На шаге <code class="bg-slate-900 text-pink-400 px-1">k</code> ты спрашиваешь: <i>«Станет ли путь от i до j короче, если я разрешу себе проходить через вершину k?»</i>
                </p>
                <ul class="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li><b>Шаг k=0:</b> Ты знаешь только прямые дороги между городами (нет пересадок).</li>
                    <li><b>Шаг k=1:</b> Разрешаем пересадку через город 1. Можно ли срезать путь <code class="text-indigo-300">i -> j</code> через путь <code class="text-indigo-300">i -> 1 -> j</code>?</li>
                    <li><b>Шаг k=2:</b> Разрешаем пересадки через 1 и 2. Срез <code class="text-indigo-300">i -> 2 -> j</code> (при этом внутри этих путей уже могут быть пересадки через 1).</li>
                    <li>...</li>
                    <li><b>Шаг k=N:</b> Ты проверил все возможные «крюки» через все вершины. Если путь через k короче, обновляем таблицу!</li>
                </ul>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "johnson-algo",
    title: "17. Графы. Алгоритм Джонсона (Фокус с перевзвешиванием)",
    type: "html",
    category: "Графы. Пути",
    content: `
<section id="johnson-algo" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 17</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Фокус с отрицательными ребрами (Джонсон)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">Как перестать бояться минусов и полюбить Дейкстру</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-amber-500/30">
                <p class="text-xl font-mono text-white">w'(u, v) = w(u, v) + h(u) - h(v)</p>
            </div>
            <div class="grid grid-cols-1 gap-6 mb-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-amber-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-amber-500 shadow-md">
                        ⚖️ Суть перевзвешивания
                    </div>
                    <p class="text-slate-300 text-sm mb-4 leading-relaxed">
                        Дейкстра (Билет 14) быстрая, но плачет от отрицательных весов. Форд-Беллман (Билет 15) минусов не боится, но работает очень медленно. Мы хотим сделать <b>Джонсона</b>: переделать веса всех ребер так, чтобы они стали <b>≥ 0</b>, но кратчайшие пути остались теми же.
                    </p>
                    <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside ml-2">
                        <li>Добавляем <b>фиктивную вершину</b>. Проводим от неё ребра нулевого веса до всех остальных вершин графа.</li>
                        <li>Запускаем от неё <b>медленного Форда-Беллмана</b> один раз. Он найдет кратчайшие расстояния — это будут наши <b>«потенциалы»</b> <code class="text-pink-400 bg-slate-900 px-1 rounded">h(v)</code>.</li>
                        <li>Меняем старые веса: новое ребро равно старый_вес плюс потенциал_начала минус потенциал_конца.</li>
                        <li><b>Магия!</b> Все веса теперь ≥ 0. Старые кратчайшие пути остались кратчайшими («телескопическая сумма» — внутренние потенциалы сокращаются).</li>
                        <li>Теперь смело запускаем <b>быструю Дейкстру</b> $N$ раз (от каждой вершины) и не боимся!</li>
                    </ol>
                </div>
            </div>
            <div id="slot-johnson-viz" class="mt-8"></div>
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
