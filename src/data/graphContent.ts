import { Chapter } from "../types";

export const graphChapters: Chapter[] = [
  {
    id: "intro",
    title: "Введение. Базовая база: куча, очередь, бинпоиск, AVL, DFS/BFS",
    type: "html",
    category: "Введение",
    content: `<section id="intro-content" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-2">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-2">Введение</span>
        <h2 class="text-3xl font-bold text-white">Базовая база</h2>
    </div>

    <div class="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 mb-8 text-center">
        <p class="text-slate-200 text-sm leading-relaxed max-w-[62ch] mx-auto">
          <b class="text-indigo-300">Базовая база</b> — шесть кирпичиков, без которых остальные билеты не читаются:
          дерево как массив, куча, очередь и стек, бинарный поиск, встроенная сортировка и AVL-дерево.
          Кодим по минимуму: там, где за нас уже написал Python, показываем одну строку и её сложность.
        </p>
    </div>

    <div class="space-y-8">

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-indigo-400 mb-4">1. Дерево как массив: дети 2n и 2n+1</h3>
        <p class="text-slate-300 text-sm mb-4">Дерево не обязано жить указателями. Если занумеровать вершины сверху вниз и слева направо с единицы, то родственников выдаёт простая арифметика: у вершины <span class="font-mono text-emerald-300">n</span> дети сидят в ячейках <span class="font-mono text-emerald-300">2n</span> и <span class="font-mono text-emerald-300">2n+1</span>, а родитель — в <span class="font-mono text-emerald-300">n // 2</span>. Никаких объектов и ссылок: один список, который дружит с кэшем процессора.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
tree = [None, 40, 20, 60, 10, 30, 50, 70]   # tree[0] не используем, нумерация с 1
#        корень n=1
#        дети 40:  2*1=2 → 20   и   2*1+1=3 → 60
#        дети 20:  2*2=4 → 10   и   2*2+1=5 → 30
#        родитель 30: 5 // 2 = 2 → 20</pre>
        <p class="text-slate-300 text-sm mb-4">Цена: пустые места в массиве, если дерево перекошено. Поэтому так хранят <b>почти полные</b> деревья — кучу (ниже) и дерево отрезков из билета 1. В нумерации с нуля формулы сдвигаются: дети <span class="font-mono text-emerald-300">2n+1</span> и <span class="font-mono text-emerald-300">2n+2</span>, родитель <span class="font-mono text-emerald-300">(n−1)//2</span>.</p>
        <details class="bg-slate-900 border border-slate-700 rounded-lg mb-4">
          <summary class="cursor-pointer px-4 py-2 text-sm font-bold text-indigo-300">Почему именно 2n и 2n+1 (спойлер)</summary>
          <div class="px-4 pb-4 text-slate-300 text-sm leading-relaxed">
            На уровне <span class="font-mono text-emerald-300">k</span> полного дерева ровно <span class="font-mono text-emerald-300">2^k</span> вершин, а перед ним суммарно <span class="font-mono text-emerald-300">2^k − 1</span>. Значит, первый номер уровня <span class="font-mono text-emerald-300">k</span> — это <span class="font-mono text-emerald-300">2^k</span>, и дети вершины <span class="font-mono text-emerald-300">n</span> уезжают ровно на длину своего уровня вперёд: <span class="font-mono text-emerald-300">2n</span> и <span class="font-mono text-emerald-300">2n+1</span>. Та же арифметика держит кучу и кучеобразные структуры везде, включая heapq.
          </div>
        </details>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-emerald-400 mb-4">2. Куча: минимум на вершине за O(1), всё остальное за O(log n)</h3>
        <p class="text-slate-300 text-sm mb-4"><b>Куча (min-heap)</b> — почти полное дерево в массиве из пункта 1, у которого каждый родитель ≤ своих детей. Отсюда магия: минимум всегда лежит в <span class="font-mono text-emerald-300">h[0]</span>, а вставка и снятие минимума стоят <span class="font-mono text-emerald-300">O(log n)</span> — элемент просачивается вверх или вниз по цепочке родителей/детей. Полностью сортировать кучу не нужно: ей достаточно держать кандидата на вершине.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
import heapq
h = []
heapq.heappush(h, 5); heapq.heappush(h, 1); heapq.heappush(h, 3)
h[0]                 # 1 — минимум виден без всякого обхода
heapq.heappop(h)     # 1, куча починилась за O(log n)</pre>
        <p class="text-slate-300 text-sm">Куча — двигатель Дейкстры (билет 14) и Прима (билет 19): «достань наименьший» там нужен миллионы раз, и список с <span class="font-mono text-rose-300">min()</span> за O(n) это бы утопил.</p>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-sky-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-sky-400 mb-4">3. Очередь и стек: FIFO и LIFO за O(1)</h3>
        <p class="text-slate-300 text-sm mb-4"><b>Очередь</b> (FIFO: первый вошёл — первый вышел) и <b>стек</b> (LIFO: последний вошёл — первый вышел) отличаются одной операцией снятия. В Python очередь — это <span class="font-mono text-emerald-300">collections.deque</span>: оба конца работают за O(1). Обычный список вместо очереди — мина: <span class="font-mono text-rose-300">lst.pop(0)</span> сдвигает весь хвост и стоит O(n).</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
from collections import deque
q = deque([1, 2])
q.append(3);  q.popleft()   # 1 — очередь (BFS)
s = [1, 2];   s.append(3); s.pop()   # 3 — стек (DFS)</pre>
        <p class="text-slate-300 text-sm">Вся разница обходов графа из билета 6 — какая из этих двух структур стоит в цикле: очередь даёт BFS (волнами), стек — DFS (вглубь).</p>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-amber-400 mb-4">4. Бинарный поиск: O(log n) по отсортированному</h3>
        <p class="text-slate-300 text-sm mb-4">Если массив отсортирован, элемент ищется не перебором, а отбрасыванием половин: сравнил с серединой — понял, в какой половине жить, — и так <span class="font-mono text-emerald-300">log₂ n</span> раз. Миллион элементов — это 20 сравнений. В Python за это отвечает модуль <span class="font-mono text-emerald-300">bisect</span>.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
from bisect import bisect_left
a = [10, 20, 30, 40, 50]
bisect_left(a, 30)   # 2 — индекс первого элемента, не меньшего 30</pre>
        <p class="text-slate-300 text-sm">Без сортировки бинпоиск не работает — поэтому следующий кирпичик про неё.</p>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-rose-400 mb-4">5. Сортировка по умолчанию: sorted() и .sort()</h3>
        <p class="text-slate-300 text-sm mb-4">Писать свой квиксорт на экзамене не нужно: в Python встроен Timsort — <span class="font-mono text-emerald-300">O(n log n)</span> в худшем случае и <span class="font-mono text-emerald-300">O(n)</span> на почти отсортированных данных. Внутри он ищет уже упорядоченные куски (раны) и аккуратно сливает их, как в сортировке слиянием, попутно пользуясь вставками на короткихранах. Сортировка <b>устойчивая</b>: равные элементы не перемешиваются.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
sorted([3, 1, 2])                 # [1, 2, 3] — новый список, O(n log n)
sorted([(1, "б"), (1, "а")], key=lambda t: t[0])   # равные по ключу сохранят порядок</pre>
        <p class="text-slate-300 text-sm">Что лежит внутри, одной строкой: <b>runs + merge + insertion</b>. На вопросах «почему не O(n²)» отвечают: слияние двух ранов длины k стоит O(k), а уровней слияния log n.</p>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-purple-400 mb-4">6. AVL: условие баланса и повороты стрелочками</h3>
        <p class="text-slate-300 text-sm mb-4"><b>AVL-дерево</b> — двоичное дерево поиска (слева меньше, справа больше), у которого для <b>каждой</b> вершины выполнено условие баланса: высоты левого и правого поддеревьев отличаются не больше чем на 1, то есть <span class="font-mono text-emerald-300">|h_L − h_R| ≤ 1</span>. Разность <span class="font-mono text-emerald-300">h_L − h_R</span> называют фактором баланса; из условия следует высота <span class="font-mono text-emerald-300">O(log n)</span>, а значит поиск, вставка и удаление за O(log n) даже в худшем случае.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
Малый поворот (цепочка вправо-вправо стрелочками):

  z                x
  └─&gt; x    ⇒      ↙ ↘
      └─&gt; y      z     y

Зигзаг (вправо-влево): сначала малый поворот нижнего изгиба,
потом малый поворот верхнего — две перерисовки стрелок:

  z                z              x
  └─&gt; x    ⇒       └─&gt; x   ⇒     ↙ ↘
      ↙ y              └─&gt; y     z     y</pre>
        <p class="text-slate-300 text-sm mb-4">Поворот — это не «взять сыновей и переставить», а <b>перерисовать три стрелки</b>: поменять родителя у среднего звена и перевесить одно внутреннее поддерево на бывшего верха. После вставки достаточно не более двух поворотов вдоль пути вставки, и условие <span class="font-mono text-emerald-300">|h_L − h_R| ≤ 1</span> снова везде верно.</p>
        <details class="bg-slate-900 border border-slate-700 rounded-lg mb-4">
          <summary class="cursor-pointer px-4 py-2 text-sm font-bold text-purple-300">Формулы малого поворота вокруг z (спойлер)</summary>
          <div class="px-4 pb-4 text-slate-300 text-sm leading-relaxed font-mono text-[12px]">
            x = right(z)<br/>
            right(z) = left(x)   # внутреннее поддерево уезжает к z<br/>
            left(x) = z          # z становится левым ребёнком x<br/>
            высоты пересчитываются только у z и x — остальные вершины стрелок не меняли
          </div>
        </details>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-teal-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-teal-400 mb-4">7. DFS и BFS: один цикл, две структуры</h3>
        <p class="text-slate-300 text-sm mb-4">Оба обхода графа — это «возьми вершину из тары, отметь посещённой, положи соседей обратно в тару». Вся разница в таре: стек уходит вглубь (DFS), очередь расходится волнами (BFS). Оба работают за <span class="font-mono text-emerald-300">O(V + E)</span>: каждая вершина и каждое ребро обрабатываются один раз.</p>
        <pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 text-[12px] leading-5 text-slate-300 mb-4">
def go(graph, start, tank):        # tank: список-стек или deque-очередь
    seen, tank = {start}, tank([start])
    while tank:
        v = tank.pop() if isinstance(tank, list) else tank.popleft()
        for to in graph[v]:
            if to not in seen:
                seen.add(to); tank.append(to)
    return seen</pre>
        <p class="text-slate-300 text-sm">Дальше эта пара расцветает в билеты 6–13: компоненты связности, мосты, топосортировка — всё это надстройки над этими восемью строками.</p>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-slate-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-slate-300 mb-4">Аналогии</h3>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-indigo-500 shadow-md">
                  Аналогия 1: Схема кинозала
                </div>
                <p class="text-slate-300 text-sm">Дерево как массив — схема мест кинозала: ряд и место считаются арифметикой, и никаких указателей-«usher'ов» не нужно. Место n, дети на 2n и 2n+1 — схема сама говорит, где родственники, потому что нумерация идёт сверху вниз и слева направо.</p>
            </div>
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                  Аналогия 2: Турнирная сетка
                </div>
                <p class="text-slate-300 text-sm">Куча — турнирная сетка на вылет: в финале (вершине) сидит победитель, и чтобы его назвать, не нужно переигрывать все матчи. Снял победителя — сетка чинится за log n перестановок, и на вершине снова сильнейший из оставшихся.</p>
            </div>
        </div>
    </div>

    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
        <h3 class="text-xl font-bold text-indigo-400 mb-4">Куда идти дальше</h3>
        <p class="text-slate-300 text-sm leading-relaxed">
          База закрыта — теперь ею пользуются остальные билеты.
          Кратчайшие пути живут в билетах 14–16 (<a data-goto="dijkstra" href="?topic=dijkstra" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Дейкстра</a>, <a data-goto="bellman-ford" href="?topic=bellman-ford" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Форд-Беллман</a>, <a data-goto="floyd" href="?topic=floyd" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Флойд</a>),
          остовные деревья — в билетах 18–20 (<a data-goto="mst" href="?topic=mst" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Краскал, Прим, Борувка</a>),
          обходы и связность — в билетах 6–13 (<a data-goto="graph-dfs-bfs" href="?topic=graph-dfs-bfs" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">DFS/BFS</a>, <a data-goto="scc-kosaraju" href="?topic=scc-kosaraju" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Косарайю</a>, <a data-goto="bridges-code" href="?topic=bridges-code" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Мосты</a>),
          строки — в билетах 21–23 (<a data-goto="string-kmp" href="?topic=string-kmp" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">КМП</a>, <a data-goto="string-z-func" href="?topic=string-z-func" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Z-функция</a>, <a data-goto="aho-corasick" href="?topic=aho-corasick" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer">Ахо-Корасик</a>).
          Начинать удобно с <a data-goto="graph-dfs-bfs" href="?topic=graph-dfs-bfs" class="text-indigo-300 hover:text-white underline font-semibold cursor-pointer font-bold">билета 6</a>: там DFS и BFS из пункта 7 работают на живом графе.
        </p>
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
