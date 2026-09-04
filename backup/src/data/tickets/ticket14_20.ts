import { Chapter } from '../types';

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
