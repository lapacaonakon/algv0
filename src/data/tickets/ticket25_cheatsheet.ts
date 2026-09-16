import { Chapter } from "../types";

export const ticket25Cheatsheet: Chapter = {
  id: "graph-cheatsheet",
  title: "25. Быстрая шпаргалка: BFS — Прим — Дейкстра",
  type: "html",
  category: "Шпаргалки и карточки",
  description: "Единый формат списка смежности edges[x] = [(y, w), ...], сопоставление Декстера, Примы и BFS на одном шасси, и итоговая мнемокарточка всех графовых алгоритмов.",
  content: `
<section id="graph-cheatsheet" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 25 / Шпаргалка</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Быстрая шпаргалка: BFS — Прим — Дейкстра</h2>
    </div>

    <div class="space-y-8">
        <!-- Единый формат ввода -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-3">1. Единый формат списка смежности</h3>
            <p class="text-slate-300 text-sm mb-4">
                Фиксируем один формат, чтобы граф больше не переодевался посреди кода:
            </p>
            <div class="bg-slate-950 p-4 rounded-lg border border-indigo-500/30 text-center font-mono text-emerald-300 text-base sm:text-lg mb-4">
                edges[x] = [(y, w), ...]
            </div>
            <p class="text-slate-300 text-xs sm:text-sm">
                То есть <span class="font-mono text-emerald-300">edges</span> — уже готовый список смежности:
            </p>
            <ul class="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm mt-2 ml-2">
                <li><span class="font-mono text-emerald-300">x</span> — текущая вершина;</li>
                <li><span class="font-mono text-emerald-300">y[0]</span> — вершина-сосед;</li>
                <li><span class="font-mono text-emerald-300">y[1]</span> — вес дороги (длина ребра).</li>
            </ul>
        </div>

        <!-- Исправленный Декстер -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-3">2. Декстер (Дейкстра) — полный чек</h3>
            <p class="text-slate-300 text-sm mb-4">
                Убираем сортировку: <span class="font-mono text-emerald-300">min_way</span> меняется во время исполнения, поэтому заранее правильный порядок вершин неизвестен.
            </p>

            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-emerald-400 border border-slate-800 leading-relaxed mb-4">def dexter(edges, n, start):
    min_way = [float('inf')] * n
    min_way[start] = 0
    seen = set()

    for _ in range(n):
        x = -1

        # Ищем непосещённую вершину
        # с минимальной ПОЛНОЙ ценой от start
        for i in range(n):
            if i not in seen:
                if x == -1 or min_way[i] &lt; min_way[x]:
                    x = i

        # Оставшиеся вершины недостижимы
        if x == -1 or min_way[x] == float('inf'):
            break

        seen.add(x)

        # Проверяем дороги из выбранной вершины
        for y in edges[x]:
            if y[0] not in seen and min_way[x] + y[1] &lt; min_way[y[0]]:
                min_way[y[0]] = min_way[x] + y[1]

    return min_way</pre>

            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
                <p className="font-bold text-amber-300">Это именно твоя задумка:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><span className="font-mono text-emerald-300">min_way</span> — массив наименьших полных расстояний;</li>
                    <li><span className="font-mono text-emerald-300">seen</span> — множество зафиксированных вершин;</li>
                    <li><span className="font-mono text-emerald-300">edges[x]</span> — соседи вершины <span className="font-mono">x</span>;</li>
                    <li>просмотр вершин циклом и улучшение пути (релаксация) через текущую вершину.</li>
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                    Правило Дейкстры: путь до текущей вершины плюс вес ребра сравнивается со старым путём до соседа. Применимо при неотрицательных весах.
                </p>
            </div>
        </div>

        <!-- Рядом Прима -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-3">3. Прима — следующий укус плесени</h3>
            <p class="text-slate-300 text-sm mb-4">
                Здесь <span class="font-mono text-amber-300">min_way[y]</span> означает уже не весь путь от старта, а <b>самое дешёвое отдельное ребро</b>, которым вершину <span class="font-mono">y</span> можно присоединить к остову.
            </p>

            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-amber-300 border border-slate-800 leading-relaxed mb-4">def prima(edges, n, start=0):
    min_way = [float('inf')] * n
    min_way[start] = 0

    seen = set()
    pred = [-1] * n
    ostov = []

    for _ in range(n):
        x = -1

        # Выбираем вершину, которую дешевле всего
        # присоединить к остову
        for i in range(n):
            if i not in seen:
                if x == -1 or min_way[i] &lt; min_way[x]:
                    x = i

        if x == -1 or min_way[x] == float('inf'):
            break

        seen.add(x)

        if pred[x] != -1:
            ostov.append((pred[x], x, min_way[x]))

        for y in edges[x]:
            if y[0] not in seen and y[1] &lt; min_way[y[0]]:
                min_way[y[0]] = y[1]
                pred[y[0]] = x

    return ostov</pre>

            <p class="text-slate-300 text-xs sm:text-sm">
                В конспекте Прима именно так и определена: растёт одним связным куском и каждый раз присоединяет самое лёгкое ребро из посещённой части наружу.
            </p>
        </div>

        <!-- Код BFS на том же шасси -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-sky-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-sky-400 mb-3">4. BFS (Обход в ширину) на том же шасси</h3>
            <p class="text-slate-300 text-sm mb-4">
                В BFS каждое ребро имеет единичный вес (<span class="font-mono text-sky-300">w = 1</span>). Вместо поиска минимума циклом используется очередь FIFO (<span class="font-mono text-sky-300">collections.deque</span>).
            </p>

            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-sky-300 border border-slate-800 leading-relaxed mb-4">from collections import deque

def bfs(edges, n, start=0):
    min_way = [float('inf')] * n
    min_way[start] = 0

    seen = {start}
    queue = deque([start])

    while queue:
        x = queue.popleft()

        for y in edges[x]:
            neighbor = y[0]
            if neighbor not in seen:
                seen.add(neighbor)
                min_way[neighbor] = min_way[x] + 1
                queue.append(neighbor)

    return min_way</pre>
        </div>

        <!-- Вся разница в одной строке -->
        <div class="bg-slate-900/90 p-6 rounded-xl border-2 border-indigo-500 shadow-xl">
            <h3 class="text-xl font-bold text-white mb-4 text-center">⚡ Вся разница — в одной строке!</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div class="bg-slate-950 p-4 rounded-lg border border-emerald-500/50 text-center">
                    <p class="text-emerald-400 font-bold mb-2">💳 Декстер (Полный чек):</p>
                    <code class="text-emerald-300 font-mono font-bold text-base block bg-slate-900 p-2 rounded">min_way[x] + y[1]</code>
                    <p class="text-slate-400 text-xs mt-2">Помнит всю стоимость пути от стартовой вершины.</p>
                </div>

                <div class="bg-slate-950 p-4 rounded-lg border border-amber-500/50 text-center">
                    <p class="text-amber-400 font-bold mb-2">🥩 Прима (Следующий укус):</p>
                    <code class="text-amber-300 font-mono font-bold text-base block bg-slate-900 p-2 rounded">y[1]</code>
                    <p class="text-slate-400 text-xs mt-2">Смотрит только на стоимость отдельного ребра наружу.</p>
                </div>

                <div class="bg-slate-950 p-4 rounded-lg border border-sky-500/50 text-center">
                    <p class="text-sky-400 font-bold mb-2">🌊 BFS (Единичная шаг-цена):</p>
                    <code class="text-sky-300 font-mono font-bold text-base block bg-slate-900 p-2 rounded">min_way[x] + 1</code>
                    <p class="text-slate-400 text-xs mt-2">Каждое ребро стоит ровно 1 шаг.</p>
                </div>
            </div>

            <div class="mt-6 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-slate-300 text-xs sm:text-sm">
                <p className="font-bold text-indigo-300 mb-2">Итак, главный вывод:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><b>Декстер:</b> плесень, которая помнит <b>всю стоимость пути от старта</b>.</li>
                    <li><b>Прима:</b> плесень, которая смотрит только на <b>стоимость следующего ребра</b>.</li>
                    <li><b>BFS:</b> плесень, для которой каждое ребро стоит ровно <b>1</b>.</li>
                </ul>
            </div>
        </div>

        <!-- Мнемокарточка графовых алгоритмов -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
                <span>🗺️</span> Мнемокарточка графовых алгоритмов
            </h3>
            <p class="text-slate-300 text-xs sm:text-sm mb-4">Пусть <span class="font-mono">n</span> — вершины, <span class="font-mono">m</span> — рёбра.</p>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-xs sm:text-sm">
                    <thead>
                        <tr class="bg-slate-950 text-indigo-300 border-b border-slate-700">
                            <th class="p-3 font-bold">Алгоритм</th>
                            <th class="p-3 font-bold">Сортировка / формат входа</th>
                            <th class="p-3 font-bold text-right">Сложность</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 text-slate-300">
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">DFS — упрямый проход</td>
                            <td class="p-3">Набор рёбер ➔ <code class="text-emerald-300">adj</code>; сортировка не нужна</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">BFS — волна</td>
                            <td class="p-3">Набор рёбер ➔ <code class="text-emerald-300">adj</code>; обычная очередь</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">CC — отдельные острова</td>
                            <td class="p-3">Неориентированный <code class="text-emerald-300">adj</code>; внешний цикл + DFS</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Топсорт — из варяг в греки</td>
                            <td class="p-3">Ориентированный <code class="text-emerald-300">adj</code>; <b>не sort()</b>, а запись при выходе + разворот</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Косарайю — косые районы, кварталы, жилые массивы</td>
                            <td class="p-3"><code class="text-emerald-300">adj</code> + перевёрнутый <code class="text-emerald-300">adj_rev</code>; два DFS</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50 bg-indigo-950/30">
                            <td class="p-3 font-bold text-emerald-300">Декстер — полный чек</td>
                            <td class="p-3">Взвешенный <code class="text-emerald-300">adj</code>; заранее <b>не сортируем</b></td>
                            <td class="p-3 font-mono text-right text-amber-300">O(n² + m) <span class="text-slate-500 font-sans text-xs">(в нашем коде)</span></td>
                        </tr>
                        <tr class="hover:bg-slate-800/50 bg-indigo-950/30">
                            <td class="p-3 font-bold text-amber-300">Прима — следующий укус плесени</td>
                            <td class="p-3">Неориентированный взвешенный <code class="text-emerald-300">adj</code>; заранее <b>не сортируем</b></td>
                            <td class="p-3 font-mono text-right text-amber-300">O(n² + m) <span class="text-slate-500 font-sans text-xs">(в нашем коде)</span></td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Форд–Беллман — ночной объезд</td>
                            <td class="p-3">Удобен набор <code class="text-emerald-300">(x, y, w)</code>; сортировка не нужна</td>
                            <td class="p-3 font-mono text-right text-rose-400">O(n · m)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Флойд — посредник снаружи</td>
                            <td class="p-3">Матрица расстояний; никаких <code class="text-emerald-300">adj</code> и <code class="text-emerald-300">edges</code></td>
                            <td class="p-3 font-mono text-right text-rose-400">O(n³)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Краскал — раскраска империи</td>
                            <td class="p-3">Набор <code class="text-emerald-300">(x, y, w)</code>; <b>обязательно сортируем по w</b></td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(m log m) с DSU</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Краскал с твоим <code class="text-amber-300">color</code></td>
                            <td class="p-3">Та же сортировка, но перекраска циклом</td>
                            <td class="p-3 font-mono text-right text-amber-300">O(m log m + m · n)</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Борувка — коллективизация</td>
                            <td class="p-3">Все рёбра просматриваются в каждом раунде; сортировки нет</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(m log n) с DSU</td>
                        </tr>
                        <tr class="hover:bg-slate-800/50">
                            <td class="p-3 font-bold text-white">Эйлер — пройти каждое ребро</td>
                            <td class="p-3"><code class="text-emerald-300">adj</code>, желательно с номерами рёбер; сортировка не нужна</td>
                            <td class="p-3 font-mono text-right text-emerald-400">O(n + m)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Главное замечание: Особенно не перепутать -->
            <div class="mt-6 bg-slate-950 p-4 rounded-xl border border-rose-500/50 text-xs sm:text-sm">
                <p class="font-bold text-rose-400 mb-2">🚨 Особенно не перепутать:</p>
                <pre class="font-mono text-slate-200 leading-relaxed bg-slate-900 p-3 rounded">Краскал: sort всех рёбер.
Декстер: не sort; каждый раз ищет минимум min_way.
Прима: не sort; каждый раз ищет дешёвое присоединение.
Топсорт: вообще не сортирует через sort().</pre>
            </div>
        </div>
    </div>
</section>
  `,
};
