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
            <h3 class="text-xl font-bold text-emerald-400 mb-4">14.1 Суть алгоритма</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула (релаксация ребра):</p>
                <p class="text-xl font-mono text-white">if d[v] &gt; d[u] + w(u,v) then d[v] = d[u] + w(u,v)</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Дейкстра решает задачу <b>SSSP</b> (single source shortest paths): из одной стартовой вершины <span class="font-mono text-emerald-300">s</span> считает кратчайшие расстояния <b>до всех</b> остальных. Единственное требование к графу — <b>неотрицательные веса рёбер</b>. Алгоритм растит «облако» вершин, расстояния до которых уже окончательные, и на каждом шаге забирает в него ту непосещённую вершину <span class="font-mono text-emerald-300">u</span>, у которой <span class="font-mono text-emerald-300">d[u]</span> минимально.</p>

            <p class="text-slate-300 text-sm mb-4">Почему минимум сразу окончательный? Любой конкурентный путь до <span class="font-mono text-emerald-300">u</span> обязан выйти из облака через какую-то непосещённую вершину <span class="font-mono text-emerald-300">x</span>, а у неё <span class="font-mono text-emerald-300">d[x] ≥ d[u]</span> (иначе выбрали бы её). Дальше путь только <b>прибавляет</b> неотрицательные веса, значит короче <span class="font-mono text-emerald-300">d[u]</span> уже не станет. Отсюда и вся механика: <b>извлечь минимум → зафиксировать → прорелаксировать все исходящие рёбра</b>. Полное доказательство — в спойлере ниже.</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Время (двоичная куча)</p>
                    <p class="font-mono text-emerald-300 text-sm">O((V + E) · log V)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Время (массив, плотный граф)</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V² + E)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V + E)</p>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Декстер Дуглас и Фриказоид
                    </div>
                    <div class="my-3 rounded-lg overflow-hidden border border-blue-500/40 shadow-lg">
                        <img src="assets/dijkstra-freakazoid.jpg" alt="Декстер Дуглас у CRT-монитора и вирус Фриказоид" class="w-full h-52 object-cover object-center" />
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Декстер Дуглас пристально смотрит в винтажный <b>CRT-монитор</b> (пузатый ЭЛТ-телевизор). Ярко-синий электрический вирус <b>Фриказоид</b> молниеносно растекается по узлам граф-сети. Волна энергии Фриказоида переходит от текущего узла к самым близким непосещенным соседям. Так как веса рёбер неотрицательны (<span class="font-mono text-emerald-300">w ≥ 0</span>), зафиксированные вершины никогда не пересматриваются — вирус накрывает сеть строго по возрастанию расстояния!</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Ограничения: минус ломает жадность
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Дейкстра <b>не пересматривает</b> зафиксированные вершины. Три вершины: <span class="font-mono text-emerald-300">s→a = 2</span>, <span class="font-mono text-emerald-300">s→b = 3</span>, <span class="font-mono text-emerald-300">b→a = −2</span>. Верно <span class="font-mono text-emerald-300">d[a] = 1</span> (через b), но алгоритм сначала вытащит <span class="font-mono text-emerald-300">a</span> с двойкой и зафиксирует её, а улучшение <span class="font-mono text-emerald-300">3 − 2 = 1</span> придёт слишком поздно. Есть отрицательные веса — идите в Форда—Беллмана (билет 15) или в Джонсона (билет 17).</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">14.2 Шаг за шагом на демо-графе</h3>

            <p class="text-slate-300 text-sm mb-4">Демонстрация справа — доставка пиццы: 7 точек (<b>Пиццерия A</b>, Дом 1 B, Парк C, Офис D, Дом 2 E, ТЦ F, Метро G) и 11 <b>односторонних</b> дорог. Старт — пиццерия A. В компиляторе шаг соответствует извлечению вершины <span class="font-mono text-emerald-300">u</span> из кучи или релаксации ребра <span class="font-mono text-emerald-300">(u → v)</span>: переменные <span class="font-mono text-emerald-300">u</span>, <span class="font-mono text-emerald-300">v</span>, <span class="font-mono text-emerald-300">w</span> и массив <span class="font-mono text-emerald-300">dist</span> перерисовывают картинку напрямую.</p>

            <ol class="list-decimal pl-5 space-y-2 text-sm text-slate-300 mb-6">
                <li><b>Инициализация.</b> <span class="font-mono text-emerald-300">dist[A] = 0</span>, у остальных <span class="font-mono text-emerald-300">∞</span>; в кучу кладём <span class="font-mono text-emerald-300">(0, A)</span>; <span class="font-mono text-emerald-300">prev</span> пуст.</li>
                <li><b>Извлечь минимум.</b> Достаём пару <span class="font-mono text-emerald-300">(du, u)</span> с наименьшим <span class="font-mono text-emerald-300">du</span>. Если <span class="font-mono text-emerald-300">u</span> уже в <span class="font-mono text-emerald-300">done</span> — пара устарела, пропускаем («ленивое удаление»).</li>
                <li><b>Зафиксировать.</b> <span class="font-mono text-emerald-300">done.add(u)</span>: расстояние окончательное, больше не меняется.</li>
                <li><b>Релаксировать рёбра.</b> Для каждого <span class="font-mono text-emerald-300">(v, w)</span> из <span class="font-mono text-emerald-300">u</span>: если <span class="font-mono text-emerald-300">du + w &lt; dist[v]</span>, обновляем <span class="font-mono text-emerald-300">dist[v]</span>, запоминаем <span class="font-mono text-emerald-300">prev[v] = u</span> и кладём <span class="font-mono text-emerald-300">(dist[v], v)</span> в кучу.</li>
                <li><b>Повторять,</b> пока куча не пуста. Недостижимые вершины так и останутся с <span class="font-mono text-emerald-300">∞</span>.</li>
            </ol>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Протокол работы (ровно то, что показывает демонстрация)</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Шаг</th>
                            <th class="py-1.5 pr-2 font-bold">Извлечена u (dist)</th>
                            <th class="py-1.5 font-bold">Что изменили релаксации</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">1</td><td class="py-2 pr-2 font-bold">Пиццерия A (0)</td><td class="py-2 font-mono">B ← 4, C ← 2</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">2</td><td class="py-2 pr-2 font-bold">Парк C (2)</td><td class="py-2 font-mono">B ← 3 (было 4), G ← 5, E ← 10</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">3</td><td class="py-2 pr-2 font-bold">Дом 1 B (3)</td><td class="py-2 font-mono">G — нет (3 + 4 = 7 &gt; 5), D ← 8</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">4</td><td class="py-2 pr-2 font-bold">Метро G (5)</td><td class="py-2 font-mono">D ← 6 (было 8), E ← 7 (было 10)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">5</td><td class="py-2 pr-2 font-bold">Офис D (6)</td><td class="py-2 font-mono">F ← 9</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono">6</td><td class="py-2 pr-2 font-bold">Дом 2 E (7)</td><td class="py-2 font-mono">F ← 8 (было 9)</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono">7</td><td class="py-2 pr-2 font-bold">ТЦ F (8)</td><td class="py-2 font-mono">исходящих рёбер нет</td></tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-3">Итог: <span class="font-mono text-emerald-300">dist = A 0, C 2, B 3, G 5, D 6, E 7, F 8</span>. Из 11 проверок рёбер 10 улучшили <span class="font-mono">dist</span>. Путь до ТЦ по <span class="font-mono">prev</span>: A → C → G → E → F = 2 + 3 + 2 + 1 = 8; до Офиса: A → C → G → D = 6.</p>
            </div>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Что именно хранит алгоритм</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Структура</th>
                            <th class="py-1.5 pr-2 font-bold">Содержимое</th>
                            <th class="py-1.5 font-bold">Зачем</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">dist[v]</td><td class="py-2 pr-2">лучший известный путь s → v</td><td class="py-2">верхняя оценка ответа; становится точной при фиксации v</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">prev[v]</td><td class="py-2 pr-2">предок v на текущем лучшем пути</td><td class="py-2">восстановление самого пути, а не только длины</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">done / visited</td><td class="py-2 pr-2">вершины с окончательным dist</td><td class="py-2">не обрабатываем повторно, отсекаем устаревшие пары из кучи</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono font-bold">pq (куча)</td><td class="py-2 pr-2">пары (расстояние, вершина)</td><td class="py-2">извлечение минимума за O(log V) вместо O(V) перебором</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">14.3 Корректность и сложность</h3>

            <p class="text-slate-300 text-sm mb-4"><b>Инвариант:</b> в момент, когда вершина <span class="font-mono text-emerald-300">u</span> извлекается из кучи, <span class="font-mono text-emerald-300">dist[u]</span> равно длине кратчайшего пути <span class="font-mono text-emerald-300">s → u</span>. Отсюда два следствия: после завершения алгоритма <span class="font-mono text-emerald-300">dist[v] = δ(s, v)</span> для всех достижимых <span class="font-mono text-emerald-300">v</span>, и <span class="font-mono text-emerald-300">dist[v] = ∞</span> для недостижимых.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Доказательство инварианта (от противного)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Пусть <span class="font-mono text-emerald-300">u</span> — <b>первая</b> вершина, извлечённая с неверным значением: <span class="font-mono text-emerald-300">dist[u] &gt; δ(s, u)</span>. Возьмём настоящий кратчайший путь <span class="font-mono text-emerald-300">s ⇝ u</span> и пусть <span class="font-mono text-emerald-300">y</span> — первая вершина на нём, которая ещё не извлечена, а <span class="font-mono text-emerald-300">x</span> — её предшественник (он уже извлечён, иначе <span class="font-mono text-emerald-300">y</span> не первая).</p>
                    <p>Так как <span class="font-mono text-emerald-300">x</span> извлечена раньше и для неё всё верно, релаксация ребра <span class="font-mono text-emerald-300">(x, y)</span> уже состоялась, значит <span class="font-mono text-emerald-300">dist[y] ≤ δ(s, x) + w(x, y) = δ(s, y)</span>. Путь до <span class="font-mono text-emerald-300">y</span> — префикс пути до <span class="font-mono text-emerald-300">u</span>, веса неотрицательны, поэтому <span class="font-mono text-emerald-300">δ(s, y) ≤ δ(s, u) &lt; dist[u]</span>.</p>
                    <p>Итого <span class="font-mono text-emerald-300">dist[y] &lt; dist[u]</span>, но куча вернула <span class="font-mono text-emerald-300">u</span> — противоречие с тем, что извлекается минимум. Значит, такой <span class="font-mono text-emerald-300">u</span> нет. ∎</p>
                    <p class="text-slate-400 text-xs">Где именно нужен неотрицательный вес: в шаге «<span class="font-mono">δ(s, y) ≤ δ(s, u)</span>». С отрицательным ребром хвост пути может оказаться <b>дешевле</b> префикса, и неравенство разваливается — это ровно контрпример из карточки «Ограничения».</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Откуда берётся сложность (и почему куча лучше массива)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <ul class="list-disc pl-5 space-y-2">
                        <li><b>Куча.</b> Каждая вершина извлекается один раз (<span class="font-mono text-emerald-300">V</span> операций <span class="font-mono">pop</span>), каждое ребро релаксируется один раз, и успешная релаксация добавляет <span class="font-mono">push</span>. Итого <span class="font-mono text-emerald-300">O((V + E) log V)</span> — с «ленивым удалением» в куче может лежать до E пар, но логарифм от этого не меняется по порядку.</li>
                        <li><b>Массив.</b> Поиск минимума линейным перебором — <span class="font-mono">O(V)</span>, и таких поисков <span class="font-mono">V</span>: итого <span class="font-mono text-emerald-300">O(V² + E)</span>. На плотных графах (<span class="font-mono">E ≈ V²</span>) это быстрее кучи и не требует памяти под очередь.</li>
                        <li><b>Куча Фибоначчи.</b> <span class="font-mono text-emerald-300">O(E + V log V)</span> теоретически, но большая константа: в олимпиадах почти не используется.</li>
                        <li><b>Специальные веса.</b> Веса 0/1 → 0-1 BFS на деке за <span class="font-mono text-emerald-300">O(V + E)</span>; малые целые веса → корзины Диала. Всё это — билет 17.</li>
                    </ul>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">14.4 Реализации</h3>

            <div class="overflow-x-auto my-4">
                <table class="w-full text-xs text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Вариант</th>
                            <th class="py-2 pr-3 font-bold">Сложность</th>
                            <th class="py-2 font-bold">Когда брать</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">heapq (Python) / priority_queue (C++)</td><td class="py-2 pr-3 font-mono">O((V + E) log V)</td><td class="py-2">разреженные графы, универсальный выбор</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">set / куча с decrease-key</td><td class="py-2 pr-3 font-mono">O((V + E) log V)</td><td class="py-2">нужно «честно» уменьшать ключ, без дублей в очереди</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">массив + линейный поиск минимума</td><td class="py-2 pr-3 font-mono">O(V² + E)</td><td class="py-2">V ≤ 5000 или плотная матрица смежности</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">0-1 BFS (дек)</td><td class="py-2 pr-3 font-mono">O(V + E)</td><td class="py-2">веса только 0 и 1</td></tr>
                        <tr class="align-top"><td class="py-2 pr-3 font-bold text-emerald-300">Диал (корзины)</td><td class="py-2 pr-3 font-mono">O(E + V · C)</td><td class="py-2">целые веса 0…C, C небольшое</td></tr>
                    </tbody>
                </table>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: Дейкстра на куче (Python) + восстановление пути</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>import heapq

INF = float("inf")

def dijkstra(graph, start):
    """graph[v] = [(сосед, вес), ...]; веса &gt;= 0."""
    dist = {v: INF for v in graph}
    prev = {v: None for v in graph}
    dist[start] = 0
    done = set()
    pq = [(0, start)]                    # (расстояние, вершина)

    while pq:
        du, u = heapq.heappop(pq)
        if u in done:                    # устаревшая пара — ленивое удаление
            continue
        done.add(u)                      # dist[u] окончателен
        for v, w in graph[u]:
            if du + w &lt; dist[v]:         # релаксация ребра (u, v)
                dist[v] = du + w
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))
    return dist, prev

def restore(prev, start, target):
    if prev[target] is None and target != start:
        return None                      # вершина недостижима
    path = [target]
    while path[-1] != start:
        path.append(prev[path[-1]])
    return path[::-1]

# демо-граф страницы (доставка пиццы, рёбра односторонние)
g = {
    "A": [("B", 4), ("C", 2)],
    "B": [("G", 4), ("D", 5)],
    "C": [("B", 1), ("G", 3), ("E", 8)],
    "D": [("F", 3)],
    "E": [("F", 1)],
    "F": [],
    "G": [("D", 1), ("E", 2)],
}
dist, prev = dijkstra(g, "A")
print(dist)                  # A 0, B 3, C 2, D 6, E 7, F 8, G 5
print(restore(prev, "A", "F"))   # ['A', 'C', 'G', 'E', 'F'] — сумма 8</code></pre>
                    <p class="text-slate-400 text-xs">Проверьте себя: запустите этот код в панели Python — демонстрация слева подсветит те же вершины, потому что читает ваши <span class="font-mono">dist</span>, <span class="font-mono">prev</span> и <span class="font-mono">done</span>.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: C++ (priority_queue, ленивое удаление)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>#include &lt;vector&gt;
#include &lt;queue&gt;
using namespace std;
const long long INF = 4e18;              // не INT_MAX: INF + w переполнится

int n;
vector&lt;vector&lt;pair&lt;int,int&gt;&gt;&gt; g;         // g[u] = {(v, w)}
vector&lt;long long&gt; d;
vector&lt;int&gt; p;

void dijkstra(int s) {
    d.assign(n, INF); p.assign(n, -1); d[s] = 0;
    priority_queue&lt;pair&lt;long long,int&gt;,
                   vector&lt;pair&lt;long long,int&gt;&gt;,
                   greater&lt;pair&lt;long long,int&gt;&gt;&gt; pq;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (du &gt; d[u]) continue;          // устаревшая запись
        for (auto [v, w] : g[u]) {
            if (du + w &lt; d[v]) {
                d[v] = du + w;
                p[v] = u;
                pq.push({d[v], v});
            }
        }
    }
}

vector&lt;int&gt; path(int s, int t) {         // восстановление s → t
    vector&lt;int&gt; res;
    if (d[t] == INF) return res;          // недостижим
    for (int v = t; v != -1; v = p[v]) res.push_back(v);
    reverse(res.begin(), res.end());
    return res;
}</code></pre>
                    <p class="text-slate-400 text-xs">Обратите внимание на тип: <span class="font-mono">long long</span> для расстояний. Путь из 10⁵ рёбер веса 10⁹ даёт 10¹⁴ — <span class="font-mono">int</span> переполняется.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: O(V²) без кучи (плотный граф)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code># w — матрица смежности n × n, w[i][j] = INF если ребра нет
d = [INF] * n
used = [False] * n
d[s] = 0

for _ in range(n):
    u = -1
    for v in range(n):                   # ищем минимум среди непосещённых
        if not used[v] and (u == -1 or d[v] &lt; d[u]):
            u = v
    if u == -1 or d[u] == INF:
        break                            # остались только недостижимые
    used[u] = True                       # фиксируем d[u]
    for v in range(n):                   # релаксируем строку u
        if d[u] + w[u][v] &lt; d[v]:
            d[v] = d[u] + w[u][v]</code></pre>
                    <p class="text-slate-400 text-xs">Та же логика, только минимум ищется перебором за <span class="font-mono">O(V)</span>. Память — матрица <span class="font-mono">O(V²)</span>, зато нет накладных расходов кучи.</p>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">14.5 Ловушки и границы применимости</h3>

            <div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40">
                <p class="text-sm font-bold text-rose-300 mb-3">Где обычно теряют баллы</p>
                <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                    <li><b>Отрицательные веса.</b> Алгоритм не просто «может ошибиться» — он <b>гарантированно</b> не рассчитан на них: фиксация вершины необратима. Нужен Форд—Беллман (билет 15) или перевзвешивание Джонсона (билет 17).</li>
                    <li><b>Отрицательные циклы.</b> При них кратчайшего пути вообще не существует — Дейкстра этого не заметит и выдаст конечное число. Сначала проверьте граф Фордом—Беллманом.</li>
                    <li><b>Ленивое удаление.</b> Без проверки <span class="font-mono text-emerald-300">if du &gt; dist[u]: continue</span> одна вершина обрабатывается несколько раз: сложность растёт, а на больших графах — TL.</li>
                    <li><b>Переполнение INF.</b> <span class="font-mono text-emerald-300">INF + w</span> с <span class="font-mono">INT_MAX</span> уходит в отрицательное число и «улучшает» всё подряд. Берите INF с запасом и/или пропускайте недостижимые <span class="font-mono">u</span>.</li>
                    <li><b>Ориентированность.</b> Демо-граф этой страницы односторонний: дорога A → B не означает B → A. В неориентированном графе каждое ребро добавляется в оба списка смежности.</li>
                    <li><b>Дейкстра ≠ BFS.</b> BFS — частный случай с единичными весами, где очередь FIFO уже даёт порядок по возрастанию. С разными весами FIFO ломается, нужна куча (или дек для 0/1).</li>
                    <li><b>«Одна пара».</b> Алгоритм считает расстояния до <b>всех</b> вершин. Если нужна только одна цель — добавьте ранний выход при извлечении цели (билет 17), но дешевле от этого он не станет асимптотически.</li>
                </ul>
            </div>

            <p class="text-slate-300 text-sm mt-4 mb-4"><b>Связь с другими билетами:</b> Форд—Беллман (15) снимает ограничение на знак весов ценой скорости <span class="font-mono text-emerald-300">O(V·E)</span>; Флойд—Уоршелл (16) считает все пары за <span class="font-mono text-emerald-300">O(V³)</span>; билет 17 собирает ускорения — 0-1 BFS, Диал, A*, встречный поиск и Джонсон (Дейкстра после перевзвешивания потенциалов). Представление графа списком смежности и обходы — билет 6.</p>
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
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Форд—Беллман</h2>
    </div>

    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">15.1 Жизнь с отрицательными весами</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Релаксировать ВСЕ рёбра ровно V − 1 раз; если V-й проход что-то улучшил — в графе есть отрицательный цикл.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Форд—Беллман решает ту же задачу SSSP, что и Дейкстра, но <b>без требования неотрицательных весов</b>. Плата — скорость: вместо <span class="font-mono text-emerald-300">O((V + E) log V)</span> получаем <span class="font-mono text-emerald-300">O(V · E)</span>. Никакой кучи и никакого порядка обхода: есть плоский список рёбер <span class="font-mono text-emerald-300">(u, v, w)</span>, и мы <span class="font-mono text-emerald-300">V − 1</span> раз проходим его целиком, релаксируя каждое ребро.</p>

            <p class="text-slate-300 text-sm mb-4">Логика такая: кратчайший путь в графе <b>без</b> отрицательных циклов всегда простой (без повторов вершин), значит в нём не больше <span class="font-mono text-emerald-300">V − 1</span> рёбер. После <span class="font-mono text-emerald-300">i</span>-й итерации точны все расстояния, достижимые путями из <span class="font-mono text-emerald-300">≤ i</span> рёбер. Поэтому <span class="font-mono text-emerald-300">V − 1</span> итераций хватает всегда, а <span class="font-mono text-emerald-300">V</span>-я — диагностическая: улучшение на ней означает, что путь «укорачивается бесконечно», то есть мы попали в отрицательный цикл.</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Время</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V · E)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V + E)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Итераций</p>
                    <p class="font-mono text-emerald-300 text-sm">V − 1 (+1 контроль)</p>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Патруль Бэтмена на машине Форда
                    </div>
                    <div class="my-3 rounded-lg overflow-hidden border border-rose-500/40 shadow-lg">
                        <img src="assets/bellman-ford-batman.jpg" alt="Бэтмен патрулирует Готэм в машине Генри Форда" class="w-full h-52 object-cover object-center" />
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Бэтмен патрулирует Готэм <span class="font-mono text-emerald-300">n − 1</span> ночей подряд, объезжая абсолютно <b>все улицы</b> (рёбра) в кабине старой машины Генри Форда (не бэтмобиля!). У Бэтмена есть ровно <b>1 выходной в году</b>, когда он отдыхает и не возит преступников. На <span class="font-mono text-emerald-300">n</span>-ю ночь Бэтмен делает контрольный проезд: если за <span class="font-mono text-emerald-300">n</span>-ю ночь расстояние до какого-то района снова уменьшилось — значит, Джокер устроил бесконечную кормушку (отрицательный цикл)!</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Отрицательный цикл: временная петля
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если на кольце сумма весов отрицательна, каждый проход делает «расстояние» всё меньше: <span class="font-mono text-emerald-300">−2, −4, −6, …</span> Кратчайшего пути не существует (можно крутиться вечно), и ответ «−∞». Контрольная итерация — это детектор: она ловит именно такую бесконечную убыль, а не обычную медленную сходимость.</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">15.2 Шаг за шагом на демо-графе</h3>

            <p class="text-slate-300 text-sm mb-4">Демонстрация — снабжение базы: 7 точек (<b>База S</b>, Застава A, Топь 1 B, Мост C, Топь 2 D, Лес E, Склад F) и <b>9 односторонних</b> дорог, из них одна с отрицательным весом <span class="font-mono text-emerald-300">B → C = −2</span> (сплав по течению — быстрее, чем пешком) и обратная <span class="font-mono text-emerald-300">D → A</span>, которая в обычном режиме весит <span class="font-mono text-emerald-300">−2</span>, а в режиме «цикл» — <span class="font-mono text-emerald-300">−6</span>. В компиляторе шаг = одна релаксация ребра <span class="font-mono text-emerald-300">(u, v, w)</span> внутри <span class="font-mono text-emerald-300">i</span>-й итерации.</p>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-2">
                <p class="text-sm font-bold text-white mb-2">Режим без отрицательного цикла (D → A = −2)</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Итерация</th>
                            <th class="py-1.5 pr-2 font-bold">Были изменения?</th>
                            <th class="py-1.5 font-bold">dist после прохода по 9 рёбрам</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">1</td><td class="py-2 pr-2 text-emerald-300">да</td><td class="py-2 font-mono">S 0, A 4, B 5, C 3, D 6, E 7, F 8</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">2</td><td class="py-2 pr-2">нет</td><td class="py-2">без изменений → можно выходить досрочно</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">3…6</td><td class="py-2 pr-2">нет</td><td class="py-2">гарантия V − 1 = 6 итераций уже избыточна</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono font-bold">контроль (7-я)</td><td class="py-2 pr-2">нет</td><td class="py-2 text-emerald-300">отрицательных циклов нет — ответ корректен</td></tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-3">Здесь всё сошлось за одну итерацию, потому что рёбра в списке случайно лежат в «удобном» порядке: <span class="font-mono">S→A, S→B, B→C, …</span> уже передаёт волну от базы до склада за один проход. Поменяйте порядок рёбер местами — и понадобится до шести проходов. Асимптотика от порядка не зависит, а реальное время очень даже.</p>
            </div>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Режим с отрицательным циклом (D → A = −6)</p>
                <p class="text-slate-300 text-sm mb-3">Кольцо <span class="font-mono text-emerald-300">Застава A → Мост C → Топь 2 D → Застава A</span> имеет суммарный вес <span class="font-mono text-emerald-300">1 + 3 + (−6) = −2</span>: каждый круг по нему «дешевеет» на 2.</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Итерация</th>
                            <th class="py-1.5 pr-2 font-bold">dist[A]</th>
                            <th class="py-1.5 pr-2 font-bold">dist[C]</th>
                            <th class="py-1.5 pr-2 font-bold">dist[D]</th>
                            <th class="py-1.5 font-bold">dist[F]</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">1</td><td class="py-2 pr-2 font-mono">0</td><td class="py-2 pr-2 font-mono">3</td><td class="py-2 pr-2 font-mono">6</td><td class="py-2 font-mono">8</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">2</td><td class="py-2 pr-2 font-mono">−2</td><td class="py-2 pr-2 font-mono">1</td><td class="py-2 pr-2 font-mono">4</td><td class="py-2 font-mono">6</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">4</td><td class="py-2 pr-2 font-mono">−6</td><td class="py-2 pr-2 font-mono">−3</td><td class="py-2 pr-2 font-mono">0</td><td class="py-2 font-mono">2</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">6 = V − 1</td><td class="py-2 pr-2 font-mono">−10</td><td class="py-2 pr-2 font-mono">−7</td><td class="py-2 pr-2 font-mono">−4</td><td class="py-2 font-mono">−2</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono font-bold">7 = контроль</td><td class="py-2 pr-2 font-mono">−12</td><td class="py-2 pr-2 font-mono">−9</td><td class="py-2 pr-2 font-mono">−6</td><td class="py-2 font-mono text-rose-300 font-bold">всё ещё уменьшается → отрицательный цикл</td></tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-3">Вершина B остаётся 5: из цикла A→C→D в неё рёбер нет, поэтому «заражаются» только достижимые из цикла вершины (A, C, D, E, F). Это важный нюанс: отрицательный цикл портит ответ не для всех пар, а только для тех, до которых из него есть путь.</p>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">15.3 Почему именно V − 1 итерация</h3>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-2">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Доказательство (индукция по длине пути)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p><b>Утверждение.</b> После <span class="font-mono text-emerald-300">i</span>-й итерации для каждой вершины <span class="font-mono text-emerald-300">v</span> значение <span class="font-mono text-emerald-300">dist[v]</span> не превосходит длины кратчайшего пути из <span class="font-mono">s</span> в <span class="font-mono">v</span>, содержащего не более <span class="font-mono text-emerald-300">i</span> рёбер.</p>
                    <p><b>База.</b> <span class="font-mono text-emerald-300">i = 0</span>: путь без рёбер существует только в <span class="font-mono">s</span>, и <span class="font-mono">dist[s] = 0</span> ✓.</p>
                    <p><b>Шаг.</b> Пусть утверждение верно для <span class="font-mono">i − 1</span>. Возьмём кратчайший путь <span class="font-mono">P</span> из ≤ <span class="font-mono">i</span> рёбер в вершину <span class="font-mono">v</span>; его последнее ребро — <span class="font-mono">(u, v)</span>, а префикс до <span class="font-mono">u</span> содержит ≤ <span class="font-mono">i − 1</span> рёбер и сам является кратчайшим (иначе заменили бы префикс и получили короче). По предположению после <span class="font-mono">i − 1</span> итераций <span class="font-mono">dist[u] ≤ d(P до u)</span>, а в течение <span class="font-mono">i</span>-й итерации ребро <span class="font-mono">(u, v)</span> обязательно будет обработано и даст <span class="font-mono">dist[v] ≤ dist[u] + w(u, v) ≤ |P|</span> ∎</p>
                    <p><b>Следствие 1.</b> Если отрицательных циклов, достижимых из <span class="font-mono">s</span>, нет, то кратчайший путь прост и содержит ≤ <span class="font-mono">V − 1</span> рёбер → после <span class="font-mono">V − 1</span> итераций все <span class="font-mono">dist</span> точны.</p>
                    <p><b>Следствие 2.</b> Если <span class="font-mono">V</span>-я итерация что-то улучшила, то существует путь из ≥ <span class="font-mono">V</span> рёбер, который короче любого простого пути. В нём повторяется вершина, значит есть цикл; будь его вес ≥ 0, выкидывание цикла не ухудшило бы путь — противоречие. Значит, цикл отрицательный. ∎</p>
                </div>
            </details>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Сравнение трёх алгоритмов кратчайших путей</p>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-700">
                                <th class="py-1.5 pr-2 font-bold">Критерий</th>
                                <th class="py-1.5 pr-2 font-bold">Дейкстра (14)</th>
                                <th class="py-1.5 pr-2 font-bold">Форд—Беллман (15)</th>
                                <th class="py-1.5 font-bold">Флойд—Уоршелл (16)</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-300">
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Задача</td><td class="py-2 pr-2">одна вершина → все</td><td class="py-2 pr-2">одна вершина → все</td><td class="py-2">все пары</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Время</td><td class="py-2 pr-2 font-mono">O((V+E) log V)</td><td class="py-2 pr-2 font-mono">O(V · E)</td><td class="py-2 font-mono">O(V³)</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Отрицательные рёбра</td><td class="py-2 pr-2 text-rose-300">нет</td><td class="py-2 pr-2 text-emerald-300">да</td><td class="py-2 text-emerald-300">да</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Отрицательные циклы</td><td class="py-2 pr-2 text-rose-300">молча ошибётся</td><td class="py-2 pr-2 text-emerald-300">обнаруживает</td><td class="py-2 text-emerald-300">обнаруживает (d[i][i] &lt; 0)</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Представление графа</td><td class="py-2 pr-2">список смежности</td><td class="py-2 pr-2">плоский список рёбер</td><td class="py-2">матрица</td></tr>
                            <tr class="align-top"><td class="py-2 pr-2 font-bold">Когда выбирать</td><td class="py-2 pr-2">разреженный граф, веса ≥ 0</td><td class="py-2 pr-2">минусы, нужен детектор циклов</td><td class="py-2">V ≤ 500, нужны все пары</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">15.4 Код</h3>

            <div class="bg-slate-900/60 p-4 rounded-lg border border-slate-700/80 mb-4">
                <p class="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Бэтмен-патруль (ford_batman) и проверка n-й ночи:</p>
<pre class="bg-slate-950 p-3 rounded text-xs font-mono text-emerald-300 border border-slate-800"><code>def ford_batman(edges, n, start=0):
    d = [float("inf")] * n
    d[start] = 0
    # Бэтмен патрулирует n - 1 ночей
    for _ in range(n - 1):
        for u, v, w in edges:
            if d[u] + w &lt; d[v]:
                d[v] = d[u] + w

    # На n-ю ночь проверяем отрицательный цикл ("бесконечная кормушка")
    for u, v, w in edges:
        if d[u] + w &lt; d[v]:
            return True # Бэтмен нашел бесконечную кормушку (отрицательный цикл)!
    return False # Всё тихо, отрицательных циклов нет</code></pre>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-2">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: Форд—Беллман + ранний выход + поиск отрицательного цикла (Python)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>INF = float("inf")

def bellman_ford(n, edges, s):
    """edges = [(u, v, w), ...] — ориентированные рёбра."""
    dist = [INF] * n
    prev = [-1] * n
    dist[s] = 0
    changed_vertex = -1

    for it in range(n):                  # n-1 рабочих + одна контрольная
        changed_vertex = -1
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w &lt; dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                changed_vertex = v
        if changed_vertex == -1:
            break                        # ничего не изменилось — сошлось досрочно

    if changed_vertex == -1:
        return dist, prev, None          # отрицательных циклов нет

    # changed_vertex улучшен на n-й итерации:
    # поднимаемся по prev на n шагов — гарантированно заходим внутрь цикла
    y = changed_vertex
    for _ in range(n):
        y = prev[y]

    cycle = [y]
    v = prev[y]
    while v != y:
        cycle.append(v)
        v = prev[v]
    cycle.append(y)
    cycle.reverse()
    return dist, prev, cycle

# демо-граф страницы (9 рёбер, режим с отрицательным циклом)
nodes = ["S", "A", "B", "C", "D", "E", "F"]
idx = {name: i for i, name in enumerate(nodes)}
E = [("S","A",4), ("S","B",5), ("B","C",-2), ("A","C",1),
     ("C","D",3), ("C","E",4), ("D","F",2), ("E","F",1)]
E = [(idx[u], idx[v], w) for u, v, w in E]

dist, prev, cyc = bellman_ford(len(nodes), E + [(idx["D"], idx["A"], -2)], 0)
print([dist[i] for i in range(len(nodes))])    # [0, 4, 5, 3, 6, 7, 8]
print(cyc)                                     # None — цикла нет

dist2, _, cyc2 = bellman_ford(len(nodes), E + [(idx["D"], idx["A"], -6)], 0)
print([nodes[i] for i in cyc2])                # ['D', 'A', 'C', 'D'] — вес −6+1+3 = −2
print([dist2[i] for i in range(len(nodes))])     # всё ещё уменьшается: цикла нет конца</code></pre>
                    <p class="text-slate-400 text-xs">Проверка <span class="font-mono">dist[u] != INF</span> обязательна: без неё недостижимая вершина с <span class="font-mono">INF</span> «улучшает» соседей (<span class="font-mono">INF + w &lt; INF</span> — ложь для <span class="font-mono">float('inf')</span>, но правда при целочисленном переполнении).</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: C++ (структура Edge, V − 1 итераций, детектор цикла)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>#include &lt;vector&gt;
#include &lt;iostream&gt;
using namespace std;
const long long INF = 4e18;

struct Edge { int u, v; long long w; };

int n;                    // число вершин
vector&lt;Edge&gt; edges;       // плоский список рёбер — порядок не важен
vector&lt;long long&gt; d;
vector&lt;int&gt; p;

// возвращает вершину, улучшенную на «лишней» итерации, или -1
int bellman_ford(int s) {
    d.assign(n, INF); p.assign(n, -1); d[s] = 0;
    int x = -1;
    for (int it = 0; it &lt; n; ++it) {          // n-1 рабочих + контроль
        x = -1;
        for (const auto &amp;e : edges) {
            if (d[e.u] != INF &amp;&amp; d[e.u] + e.w &lt; d[e.v]) {
                d[e.v] = d[e.u] + e.w;
                p[e.v] = e.u;
                x = e.v;
            }
        }
        if (x == -1) break;                   // ранний выход
    }
    return x;
}

vector&lt;int&gt; negative_cycle(int x) {
    int y = x;
    for (int i = 0; i &lt; n; ++i) y = p[y];     // заходим внутрь цикла
    vector&lt;int&gt; cycle;
    for (int v = y;; v = p[v]) {
        cycle.push_back(v);
        if (v == y &amp;&amp; cycle.size() &gt; 1) break;
    }
    reverse(cycle.begin(), cycle.end());
    return cycle;
}

int main() {
    int s = 0;
    int x = bellman_ford(s);
    if (x == -1) cout &lt;&lt; "отрицательных циклов нет\n";
    else {
        cout &lt;&lt; "цикл: ";
        for (int v : negative_cycle(x)) cout &lt;&lt; v &lt;&lt; " ";
        cout &lt;&lt; "\n";
    }
}</code></pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Оптимизации: ранний выход, SPFA (очередь), порядок рёбер</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>from collections import deque

def spfa(n, adj, s):
    """adj[u] = [(v, w), ...]. Релаксируем только «живые» вершины."""
    INF = float("inf")
    dist = [INF] * n
    in_queue = [False] * n
    counter = [0] * n              # сколько раз вершина попадала в очередь
    dist[s] = 0
    q = deque([s])
    in_queue[s] = True
    while q:
        u = q.popleft()
        in_queue[u] = False
        for v, w in adj[u]:
            if dist[u] + w &lt; dist[v]:
                dist[v] = dist[u] + w
                if not in_queue[v]:
                    q.append(v)
                    in_queue[v] = True
                    counter[v] += 1
                    if counter[v] &gt;= n:
                        return None    # отрицательный цикл
    return dist</code></pre>
                    <ul class="list-disc pl-5 space-y-2">
                        <li><b>Ранний выход.</b> Если за итерацию ничего не изменилось — distances уже финальные, выходим. На «коротких» графах экономит кратно.</li>
                        <li><b>SPFA</b> (Shortest Path Faster Algorithm) — Форд—Беллман на очереди: релаксируем рёбра только из тех вершин, у которых только что улучшился <span class="font-mono">dist</span>. На практике часто почти <span class="font-mono">O(E)</span>, но <b>худший случай остаётся <span class="font-mono">O(V · E)</span></b>, и на специально подобранных тестах (сетка, «каркас» из рёбер) SPFA ловит TL. Критерий цикла: вершина попала в очередь ≥ <span class="font-mono">V</span> раз.</li>
                        <li><b>Порядок рёбер.</b> Формально не важен, фактически решает: рёбра «по течению» обхода дают сходимость за 1–2 итерации, против течения — за <span class="font-mono">V − 1</span>. В демо-графе список рёбер удачный, поэтому первая же итерация даёт финальные <span class="font-mono">dist</span>.</li>
                        <li><b>DAG.</b> Если граф ациклический, релаксация в топологическом порядке (билет 9) даёт ответ за один проход — <span class="font-mono">O(V + E)</span>, и отрицательные веса не мешают.</li>
                    </ul>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">15.5 Ловушки</h3>

            <div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40">
                <p class="text-sm font-bold text-rose-300 mb-3">Где обычно теряют баллы</p>
                <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                    <li><b>V − 1, а не V.</b> Рабочих итераций ровно <span class="font-mono text-emerald-300">V − 1</span>; <span class="font-mono text-emerald-300">V</span>-я — только детектор. Если сделать <span class="font-mono">V</span> рабочих, то на графе с отрицательным циклом <span class="font-mono">dist</span> «уедет» ещё дальше, а вывод о корректности станет неверным.</li>
                    <li><b>Переполнение INF.</b> <span class="font-mono text-emerald-300">INF + w</span> при <span class="font-mono">INF = INT_MAX</span> превращается в отрицательное число и «улучшает» всё. Пропускайте рёбра из недостижимых вершин или берите INF с запасом и <span class="font-mono">long long</span>.</li>
                    <li><b>Неориентированный граф с минусом.</b> Ребро <span class="font-mono text-emerald-300">{u, v}</span> веса <span class="font-mono">−3</span> — это цикл длины 2 веса <span class="font-mono">−6</span>: Форд—Беллман <b>всегда</b> сообщит об отрицательном цикле. Минусы в неориентированном графе бессмысленны.</li>
                    <li><b>Цикл есть, но не от старта.</b> Детектор срабатывает только для циклов, достижимых из <span class="font-mono">s</span>. Нужна проверка всего графа — добавьте фиктивную вершину с нулевыми рёбрами во все вершины (приём из алгоритма Джонсона, билет 17) и запустите от неё.</li>
                    <li><b>«Ответ −∞».</b> Если отрицательный цикл лежит на пути к вершине <span class="font-mono">v</span>, то <span class="font-mono">dist[v] = −∞</span>: печатать конкретное число нельзя, нужен отдельный вывод. Достигается из цикла помечаются обходом в обратном графе.</li>
                    <li><b>SPFA как «быстрый Форд—Беллман».</b> На рандомных графах он быстрый, на adversarial-тестах — квадратичный. Если в условии <span class="font-mono">V, E ≤ 10⁵</span> и веса неотрицательны, берите Дейкстру.</li>
                </ul>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b>Связь с другими билетами:</b> один прогон Форда—Беллмана от фиктивной вершины даёт потенциалы <span class="font-mono text-emerald-300">h(v)</span> для алгоритма Джонсона (билет 17), после чего все пары считаются Дейкстрой. Флойд—Уоршелл (16) решает все пары без списка рёбер, но за <span class="font-mono">O(V³)</span>. Топологический порядок для DAG — билет 9.</p>
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
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Флойд—Уоршелл (динамика на промежуточных вершинах)</h2>
    </div>

    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">16.1 Флойд не считает шаги — он считает разрешённые вершины</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Формула (выбей на лбу):</p>
                <p class="text-xl font-mono text-white">d[i][j] = min(d[i][j], d[i][k] + d[k][j]), k — ВНЕШНИЙ цикл</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Флойд—Уоршелл считает <b>все пары</b> кратчайших расстояний за <span class="font-mono text-emerald-300">O(V³)</span> и <span class="font-mono text-emerald-300">O(V²)</span> памяти, работает с отрицательными весами (но не с отрицательными циклами) и пишется в <b>три строки</b>. Вход — матрица <span class="font-mono text-emerald-300">d</span> размера <span class="font-mono">V × V</span>: <span class="font-mono text-emerald-300">d[i][j] = w(i, j)</span> для существующих рёбер, <span class="font-mono text-emerald-300">0</span> на диагонали и <span class="font-mono text-emerald-300">∞</span> в остальных клетках.</p>

            <div class="my-5 p-5 rounded-xl bg-slate-900/90 border border-purple-500/50 flex items-center gap-4 shadow-lg">
                <div class="bg-black/60 p-3 rounded-lg border border-purple-500/70 shrink-0 text-center">
                    <svg class="w-14 h-10 fill-purple-400 mx-auto" viewBox="0 0 100 60">
                        <text x="50" y="42" font-family="sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="#c084fc">FN</text>
                    </svg>
                    <span class="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mt-1">Fortnite</span>
                </div>
                <div>
                    <h4 class="text-purple-300 font-bold text-base flex items-center gap-2">
                        🎮 «Фсе против Фсем» (Все против всех) — Fortnite Battle Royale
                    </h4>
                    <p class="text-slate-300 text-sm mt-1 leading-relaxed">
                        Флойд—Уоршелл — это «Королевская битва» Fortnite: все вершины высаживаются на одну карту, и каждая вершина ищет кратчайший путь к абсолютно КАЖДОЙ другой вершине за <span class="font-mono text-purple-300">O(V³)</span>!
                    </p>
                </div>
            </div>

            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-6 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                    Суть фокуса (по шагам)
                </div>
                <p class="text-slate-300 text-sm mb-4 leading-relaxed">
                    Главный герой — <b>внешний цикл</b> <span class="font-mono text-emerald-300">for k in 0 … V−1</span>. На шаге <span class="font-mono text-emerald-300">k</span> таблица хранит ответ на вопрос: «каков кратчайший путь <span class="font-mono">i → j</span>, если в качестве <b>промежуточных</b> разрешено использовать только вершины из множества <span class="font-mono">{0, 1, …, k}</span>?». Каждый шаг добавляет в разрешение одну новую вершину:
                </p>
                <ul class="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li><b>Шаг k = −1 (старт):</b> разрешены только прямые рёбра — пересадок нет вообще.</li>
                    <li><b>Шаг k = 0:</b> разрешаем пересадку через вершину 0: проверяем, не короче ли <span class="font-mono text-indigo-300">i → 0 → j</span>, чем текущий <span class="font-mono text-indigo-300">i → j</span>.</li>
                    <li><b>Шаг k = 1:</b> разрешены пересадки через {0, 1}; внутри путей <span class="font-mono">i → 1</span> и <span class="font-mono">1 → j</span> уже может стоять вершина 0.</li>
                    <li><b>Шаг k = V − 1:</b> разрешены все вершины — таблица содержит финальные расстояния для всех пар.</li>
                </ul>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Время</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V³)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память</p>
                    <p class="font-mono text-emerald-300 text-sm">O(V²)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Практический предел</p>
                    <p class="font-mono text-emerald-300 text-sm">V ≈ 500 (1.25·10⁸ операций)</p>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Таблица пересадок в метро
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Вы печатаете плакат «из любой станции в любую — сколько минут». Сначала в таблице только соседние станции. Затем говорите: «разрешаю пересадку на станции 1» — и пересчитываете весь плакат, подставляя <span class="font-mono">через 1</span> там, где это короче. Потом разрешаете станцию 2, 3, … После того как разрешены все станции, плакат окончательный. Порядок «разрешений» не случайный: он и есть внешний цикл <span class="font-mono text-emerald-300">k</span>.</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Аналогия 2: Почему k обязан быть внешним
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если перепутать циклы местами, вы разрешаете пересадку через станцию <span class="font-mono">k</span> <b>один раз</b> и больше к ней не возвращаетесь: путь «i → k → … → k → j» с двумя заходами в ту же пересадку не соберётся. На демо-графе этой страницы порядок <span class="font-mono">(i, j, k)</span> оставляет <span class="font-mono text-emerald-300">d[2][1] = ∞</span>, хотя верный ответ 4 (путь <span class="font-mono">2 → 4 → 6 → 1</span>: он дважды использует «поздние» посредники). Проверка перестановкой циклов — в спойлере с доказательством.</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">16.2 Шаг за шагом на демо-графе</h3>

            <p class="text-slate-300 text-sm mb-4">Демонстрация показывает матрицу <span class="font-mono text-emerald-300">7 × 7</span> (вершины 0…6, <span class="font-mono text-emerald-300">999</span> вместо ∞) и подсвечивает клетку <span class="font-mono text-emerald-300">(i, j)</span>, которая улучшается на текущем посреднике <span class="font-mono text-emerald-300">k</span>. В компиляторе переменные <span class="font-mono text-emerald-300">k</span>, <span class="font-mono text-emerald-300">i</span>, <span class="font-mono text-emerald-300">j</span> и матрица <span class="font-mono text-emerald-300">dist</span> управляют картинкой напрямую: измените <span class="font-mono">k</span> — демонстрация покажет другую «волну» разрешённых пересадок.</p>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-2">
                <p class="text-sm font-bold text-white mb-2">Сколько улучшений даёт каждый посредник k</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">k</th>
                            <th class="py-1.5 pr-2 font-bold">Улучшено клеток</th>
                            <th class="py-1.5 font-bold">Комментарий</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">0</td><td class="py-2 pr-2 font-mono">0</td><td class="py-2">в вершину 0 никто не входит — через неё не пройти</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">1</td><td class="py-2 pr-2 font-mono">4</td><td class="py-2">открывает пути «…→1→2» и «…→1→5»</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">2</td><td class="py-2 pr-2 font-mono">3</td><td class="py-2">2 — вход в подграф 4, 6</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">3</td><td class="py-2 pr-2 font-mono">2</td><td class="py-2">3 — вход в 4 и 5 «сверху»</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">4</td><td class="py-2 pr-2 font-mono">4</td><td class="py-2">через 4 достижима 6</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">5</td><td class="py-2 pr-2 font-mono">0</td><td class="py-2">из 5 выход только в 6, и тот уже учтён дешевле</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono font-bold">6</td><td class="py-2 pr-2 font-mono text-emerald-300">10</td><td class="py-2">ребро 6 → 1 замыкает граф в кольцо: открывается больше всего пар</td></tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-3">Всего 23 улучшения из 343 проверок (7³). Итоговая первая строка: <span class="font-mono text-emerald-300">0 → {0, 4, 7, 2, 6, 4, 7}</span>, то есть <span class="font-mono">d[0][6] = 7</span> путём <span class="font-mono">0 → 3 → 4 → 6</span> (2 + 4 + 1). Обратного пути нет: <span class="font-mono">d[6][0] = 999</span> (недостижимо), всего в финальной матрице 11 таких пар. Диагональ осталась нулевой — отрицательных циклов в графе нет.</p>
            </div>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Что читать в ответе</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Клетка</th>
                            <th class="py-1.5 pr-2 font-bold">Значение</th>
                            <th class="py-1.5 font-bold">Смысл</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">d[i][j]</td><td class="py-2 pr-2 font-mono">конечное</td><td class="py-2">длина кратчайшего пути i → j</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">d[i][j]</td><td class="py-2 pr-2 font-mono">INF</td><td class="py-2">j недостижима из i (в орграфе это нормально и несимметрично)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-mono font-bold">d[i][i]</td><td class="py-2 pr-2 font-mono">0</td><td class="py-2">отрицательных циклов через i нет</td></tr>
                        <tr class="align-top"><td class="py-2 pr-2 font-mono font-bold">d[i][i]</td><td class="py-2 pr-2 font-mono text-rose-300">&lt; 0</td><td class="py-2 text-rose-300">через i проходит отрицательный цикл — ответы для связанных с ней пар не определены</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">16.3 Динамика, доказательство и порядок циклов</h3>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-2">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Формальная динамика и почему пересчёт «на месте» корректен</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Обозначим <span class="font-mono text-emerald-300">d⁽ᵏ⁾[i][j]</span> — длину кратчайшего пути <span class="font-mono">i → j</span>, все промежуточные вершины которого лежат в <span class="font-mono">{0, …, k}</span> (концы пути <span class="font-mono">i</span> и <span class="font-mono">j</span> в это множество входить не обязаны).</p>
                    <p><b>База:</b> <span class="font-mono text-emerald-300">d⁽⁻¹⁾[i][j] = w(i, j)</span> (прямое ребро или ∞), на диагонали 0.</p>
                    <p><b>Переход:</b> путь из <span class="font-mono">i</span> в <span class="font-mono">j</span> с посредниками из <span class="font-mono">{0…k}</span> либо не использует <span class="font-mono">k</span> — тогда это <span class="font-mono">d⁽ᵏ⁻¹⁾[i][j]</span>, — либо использует <span class="font-mono">k</span> ровно один раз (без отрицательных циклов кратчайший путь прост), разбиваясь на два подпути с посредниками из <span class="font-mono">{0…k−1}</span>:</p>
                    <p class="text-center font-mono text-emerald-300">d⁽ᵏ⁾[i][j] = min( d⁽ᵏ⁻¹⁾[i][j], d⁽ᵏ⁻¹⁾[i][k] + d⁽ᵏ⁻¹⁾[k][j] )</p>
                    <p><b>Почему хватает одной матрицы.</b> На шаге <span class="font-mono">k</span> строка <span class="font-mono">k</span> и столбец <span class="font-mono">k</span> не меняются: <span class="font-mono">d⁽ᵏ⁾[i][k] = min(d⁽ᵏ⁻¹⁾[i][k], d⁽ᵏ⁻¹⁾[i][k] + d⁽ᵏ⁻¹⁾[k][k])</span>, а <span class="font-mono">d⁽ᵏ⁻¹⁾[k][k] = 0</span> при отсутствии отрицательных циклов — второе слагаемое не меньше первого. Значит, читая <span class="font-mono">d[i][k]</span> и <span class="font-mono">d[k][j]</span> во время <span class="font-mono">k</span>-й итерации, мы читаем именно значения слоя <span class="font-mono">k − 1</span>, и перезапись <span class="font-mono">d[i][j]</span> безопасна.</p>
                    <p><b>Следствие:</b> если в графе есть отрицательный цикл через <span class="font-mono">k</span>, то <span class="font-mono">d[k][k] &lt; 0</span> и рассуждение рассыпается — отсюда и детектор по диагонали. ∎</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Эксперимент: переставим циклы и сломаем ответ</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>INF = 999
M = [[0,4,INF,2,INF,INF,INF],
     [INF,0,3,INF,INF,3,INF],
     [INF,INF,0,INF,2,INF,INF],
     [INF,INF,INF,0,4,2,INF],
     [INF,INF,INF,INF,0,INF,1],
     [INF,INF,INF,INF,INF,0,5],
     [INF,1,INF,INF,INF,INF,0]]

def floyd(M, order="kij"):
    n = len(M)
    d = [row[:] for row in M]
    for a in range(n):
        for b in range(n):
            for c in range(n):
                k, i, j = {"kij": (a, b, c),            # ВЕРНО
                           "ijk": (c, a, b),            # k внутренний
                           "ikj": (c, a, b)}[order]
                if d[i][k] + d[k][j] &lt; d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d

good = floyd(M, "kij")
bad  = floyd(M, "ijk")
print(good[2][1], bad[2][1])   # 4 и 999 — путь 2→4→6→1 потерян
print(sum(1 for i in range(7) for j in range(7) if good[i][j] != bad[i][j]))
# 4 клетки отличаются; при порядке (i,k,j) их 6</code></pre>
                    <p class="text-slate-400 text-xs">Вывод: порядок <span class="font-mono">(k, i, j)</span> — единственно верный. Два других «почти работают» (большинство клеток совпадает), и именно поэтому ошибка так легко проскакивает на маленьких тестах.</p>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">16.4 Код и варианты</h3>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-2">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: Флойд—Уоршелл + детектор отрицательных циклов + восстановление пути (Python)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>INF = float("inf")

def floyd_warshall(n, edges, directed=True):
    d = [[INF] * n for _ in range(n)]
    nxt = [[-1] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0                      # диагональ обязательно 0

    for u, v, w in edges:
        if w &lt; d[u][v]:                  # кратчайшее из параллельных рёбер
            d[u][v] = w
            nxt[u][v] = v
        if not directed and w &lt; d[v][u]:
            d[v][u] = w
            nxt[v][u] = u

    for k in range(n):                   # k — ВНЕШНИЙ цикл
        for i in range(n):
            if d[i][k] == INF:
                continue
            for j in range(n):
                if d[k][j] == INF:
                    continue
                if d[i][k] + d[k][j] &lt; d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
                    nxt[i][j] = nxt[i][k]

    negative = [i for i in range(n) if d[i][i] &lt; 0]
    return d, nxt, negative

def path(nxt, i, j):
    if nxt[i][j] == -1:
        return None                      # j недостижима из i
    p = [i]
    while p[-1] != j:
        p.append(nxt[p[-1]][j])
    return p

nodes = ["S", "A", "B", "C", "D", "E", "F"]
idx = {name: i for i, name in enumerate(nodes)}
E = [("S","A",4), ("S","B",5), ("B","C",-2), ("A","C",1),
     ("C","D",3), ("C","E",4), ("D","F",2), ("E","F",1), ("D","A",-2)]
E = [(idx[u], idx[v], w) for u, v, w in E]

d, nxt, neg = floyd_warshall(len(nodes), E)
print([d[0][j] for j in range(len(nodes))])   # [0, 4, 5, 3, 6, 7, 8]
print(path(nxt, idx["S"], idx["F"]))          # [0, 2, 3, 4, 6] → S B C D F = 5 − 2 + 3 + 2 = 8
print(neg)                                    # [] — отрицательных циклов нет</code></pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Код: C++ (матрица, защита от переполнения, диаметр и центр графа)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
<pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>#include &lt;vector&gt;
#include &lt;algorithm&gt;
using namespace std;
const long long INF = 4e18;

int n;
vector&lt;vector&lt;long long&gt;&gt; d(n, vector&lt;long long&gt;(n, INF));

void floyd() {
    for (int i = 0; i &lt; n; ++i) d[i][i] = 0;
    for (int k = 0; k &lt; n; ++k)                 // k — внешний
        for (int i = 0; i &lt; n; ++i) {
            if (d[i][k] == INF) continue;       // защита от INF + w
            for (int j = 0; j &lt; n; ++j) {
                if (d[k][j] == INF) continue;
                d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
            }
        }
}

bool has_negative_cycle() {
    for (int i = 0; i &lt; n; ++i) if (d[i][i] &lt; 0) return true;
    return false;
}

long long diameter() {                          // самая дальняя пара
    long long res = 0;
    for (int i = 0; i &lt; n; ++i)
        for (int j = 0; j &lt; n; ++j)
            if (d[i][j] &lt; INF) res = max(res, d[i][j]);
    return res;
}

int center() {                                  // вершина с минимальным эксцентриситетом
    int best = -1; long long bestEcc = INF;
    for (int i = 0; i &lt; n; ++i) {
        long long ecc = 0;
        for (int j = 0; j &lt; n; ++j) {
            if (d[i][j] == INF) { ecc = INF; break; }
            ecc = max(ecc, d[i][j]);
        }
        if (ecc &lt; bestEcc) { bestEcc = ecc; best = i; }
    }
    return best;
}</code></pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">▸ Та же динамика для других задач (замыкание, минимакс, число путей)</summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-700">
                                <th class="py-1.5 pr-2 font-bold">Задача</th>
                                <th class="py-1.5 pr-2 font-bold">Переход</th>
                                <th class="py-1.5 font-bold">Начальное значение</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-300">
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Транзитивное замыкание (достижимость)</td><td class="py-2 pr-2 font-mono">r[i][j] |= r[i][k] &amp;&amp; r[k][j]</td><td class="py-2 font-mono">r[i][j] = есть ребро; r[i][i] = true</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Минимакс (самое «узкое» место пути)</td><td class="py-2 pr-2 font-mono">d[i][j] = min(d[i][j], max(d[i][k], d[k][j]))</td><td class="py-2 font-mono">d[i][j] = w(i,j); d[i][i] = 0</td></tr>
                            <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-2 font-bold">Максимальный путь в DAG-подобной сети</td><td class="py-2 pr-2 font-mono">d[i][j] = max(d[i][j], d[i][k] + d[k][j])</td><td class="py-2 font-mono">только при отсутствии положительных циклов</td></tr>
                            <tr class="align-top"><td class="py-2 pr-2 font-bold">Число кратчайших путей</td><td class="py-2 pr-2 font-mono">if d[i][k]+d[k][j] == d[i][j]: cnt[i][j] += cnt[i][k]·cnt[k][j]</td><td class="py-2 font-mono">cnt = 1 на рёбрах; следите за переполнением</td></tr>
                        </tbody>
                    </table>
                    <p class="text-slate-400 text-xs mt-3">Замыкание удобно ускорять битсетами: <span class="font-mono">r[i] |= r[k]</span> при <span class="font-mono">r[i][k]</span> — это <span class="font-mono">O(V³ / 64)</span> вместо <span class="font-mono">O(V³)</span>.</p>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">16.5 Ловушки и границы применимости</h3>

            <div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40">
                <p class="text-sm font-bold text-rose-300 mb-3">Где обычно теряют баллы</p>
                <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                    <li><b>Порядок циклов.</b> <span class="font-mono text-emerald-300">k</span> — строго внешний. При <span class="font-mono">(i, j, k)</span> на демо-графе 4 клетки из 49 остаются ∞ вместо верных значений (например, <span class="font-mono">d[2][1] = 999</span> вместо 4).</li>
                    <li><b>Диагональ.</b> <span class="font-mono text-emerald-300">d[i][i] = 0</span> до начала. Если оставить ∞, алгоритм «починит» её только при наличии цикла, а пересчёт на месте станет некорректным.</li>
                    <li><b>Переполнение INF.</b> <span class="font-mono">INF + INF</span> при <span class="font-mono">INF = INT_MAX</span> уходит в минус и «улучшает» всё подряд. Пропускайте пары с ∞ (как в коде выше) или берите INF ≈ 4·10¹⁸ с <span class="font-mono">long long</span>.</li>
                    <li><b>Параллельные рёбра.</b> Во входной матрице нужно оставить <b>минимальное</b> из них, иначе <span class="font-mono">d[u][v]</span> стартует с худшего веса.</li>
                    <li><b>Отрицательные циклы.</b> Формула при <span class="font-mono">d[k][k] &lt; 0</span> расходится: для пар, связанных с циклом, ответ <span class="font-mono">−∞</span>. Сначала проверьте диагональ, затем пометьте такие пары: <span class="font-mono">d[i][j] = −∞</span>, если существует <span class="font-mono">k</span> с <span class="font-mono">d[k][k] &lt; 0</span>, <span class="font-mono">d[i][k] &lt; ∞</span>, <span class="font-mono">d[k][j] &lt; ∞</span>.</li>
                    <li><b>Недостижимость ≠ 0.</b> В орграфе <span class="font-mono">d[i][j] = ∞</span> — обычный ответ (на демо-графе 11 таких пар из 49). Выводить 999 или 0 как «расстояние» нельзя.</li>
                    <li><b>Память.</b> <span class="font-mono">V²</span> клеток: при <span class="font-mono">V = 5000</span> это 25·10⁶ значений (≈100 МБ на <span class="font-mono">int</span>) — обычно уже за пределами ограничения. Для разреженных графов и одного истока берите Дейкстру.</li>
                    <li><b>Сам путь.</b> Матрица <span class="font-mono">d</span> даёт только длины. Нужен маршрут — ведите параллельно <span class="font-mono">nxt[i][j]</span> (как в коде) или восстанавливайте рекурсивно через посредников.</li>
                </ul>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b>Связь с другими билетами:</b> Дейкстра (14) и Форд—Беллман (15) решают ту же задачу от одного истока и дешевле, если все пары не нужны; если все пары нужны, а граф разреженный и веса неотрицательны, запуск <span class="font-mono">V</span> Дейкстр быстрее (<span class="font-mono">O(V·E log V)</span> против <span class="font-mono">O(V³)</span>). Алгоритм Джонсона (билет 17) комбинирует оба подхода: один Форд—Беллман для потенциалов + <span class="font-mono">V</span> Дейкстр на перевзвешенном графе. Транзитивное замыкание связано с компонентами сильной связности (билет 10): в конденсации достижимость проверяется по DAG.</p>
        </div>
    </div>
</section>`
  },
  {
    id: "johnson-algo",
    title: "17. Графы. Поиск кратчайшего пути. Ускорения",
    type: "html",
    description:
      "Джонсон (перевзвешивание потенциалов), встречный Дейкстра, A*, 0-1 BFS, Dial, кучи, SPFA и иерархические ускорения для карт.",
    category: "Графы. Пути",
    content: `
<section id="johnson-algo" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 17</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Поиск кратчайшего пути: ускорения</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">Зачем ускорять то, что и так работает</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-amber-500/30">
                <p class="text-lg text-amber-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Ускорение = та же задача, меньше работы: меньше релаксаций (потенциалы, A*), меньше посещённых вершин (встречный поиск, ранний выход), меньше структур (0-1 BFS, Dial) или перенос работы в предобработку (ALT, contraction hierarchies).</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Дейкстра (билет 14), Форд—Беллман (билет 15) и Флойд (билет 16) решают задачу честно и в лоб. На экзамене спрашивают, <b>что сделать, чтобы то же самое посчиталось быстрее</b>. Ниже — весь набор приёмов: от «одной строчки перевзвешивания» до промышленных ускорителей для карт.</p>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 my-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Такси с навигатором (A*)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Дейкстра — это таксист без карты: он честно расширяет зону поиска во все стороны одинаково. A* — тот же таксист, но с навигатором: к уже накрученному счётчику <span class="font-mono text-emerald-300">g(v)</span> прибавляется оценка остатка пути по прямой <span class="font-mono text-emerald-300">h(v)</span>, и в первую очередь едут туда, где сумма меньше. Навигатор обязан <b>не завышать</b> остаток (<span class="font-mono text-emerald-300">h ≤ истинного</span>): занижать можно, завышать нельзя — иначе маршрут окажется не самым дешёвым. При <span class="font-mono text-emerald-300">h = 0</span> это снова Дейкстра.</p>
                </div>
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 2: Две бригады туннеля (встречный поиск)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Нужен путь из A в B. Вместо одной бригады, которая роет от A во все стороны, запускают две: от A и от B. Каждая зона роста вдвое меньше, поэтому работа заканчивается раньше. Важная тонкость: останавливаются <b>не в момент встречи</b>, а когда сумма лучших неподтверждённых гипотез с двух сторон уже не может улучшить найденный путь — иначе можно пропустить более дешёвый обход. В графе с отрицательными рёбрами приём ломается: там «встреча» ничего не гарантирует.</p>
                </div>
            </div>

            <div class="overflow-x-auto my-6">
                <table class="w-full text-xs text-left border-collapse min-w-[680px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Приём</th>
                            <th class="py-2 pr-3 font-bold">Что экономит</th>
                            <th class="py-2 pr-3 font-bold">Сложность</th>
                            <th class="py-2 font-bold">Условие применения</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">Джонсон (потенциалы)</td><td class="py-2 pr-3">разрешает Дейкстру при отрицательных рёбрах, все пары</td><td class="py-2 pr-3 font-mono">O(V·E·log V)</td><td class="py-2">нет отрицательных циклов</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">Ранний выход</td><td class="py-2 pr-3">не обходим весь граф ради одной пары</td><td class="py-2 pr-3 font-mono">та же, но меньше константа</td><td class="py-2">нужен путь до одной цели</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">Встречный Дейкстра</td><td class="py-2 pr-3">две маленькие волны вместо одной большой</td><td class="py-2 pr-3 font-mono">≈ O(E log V) на практике вдвое меньше раскрытий</td><td class="py-2">известны обе вершины, граф «широкий»</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">A*</td><td class="py-2 pr-3">раскрывает вершины в сторону цели</td><td class="py-2 pr-3 font-mono">O(E log V), раскрытий меньше</td><td class="py-2">есть допустимая эвристика h(v)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">0-1 BFS</td><td class="py-2 pr-3">убирает кучу целиком</td><td class="py-2 pr-3 font-mono text-emerald-300">O(V + E)</td><td class="py-2">веса только 0 и 1</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">Dial (корзины)</td><td class="py-2 pr-3">куча → массив корзин</td><td class="py-2 pr-3 font-mono">O(E + V·C)</td><td class="py-2">целые веса 0…C, C небольшое</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">Куча Фибоначчи</td><td class="py-2 pr-3">decrease-key за O(1) амортизированно</td><td class="py-2 pr-3 font-mono">O(E + V log V)</td><td class="py-2">теоретически; на практике двоичная/d-арная быстрее</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-amber-300">SPFA (очередь)</td><td class="py-2 pr-3">не релаксируем все рёбра V − 1 раз, а только «живые»</td><td class="py-2 pr-3 font-mono">O(V·E) в худшем, на практике быстро</td><td class="py-2">отрицательные веса, разреженные графы</td></tr>
                        <tr class="align-top"><td class="py-2 pr-3 font-bold text-amber-300">ALT / CH / hub labels</td><td class="py-2 pr-3">переносит работу в предобработку</td><td class="py-2 pr-3 font-mono">запрос ≪ O(E)</td><td class="py-2">статический граф, миллионы запросов (карты)</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">1. Джонсон: как перестать бояться минусов и полюбить Дейкстру</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-4 text-center border border-amber-500/30">
                <p class="text-xl font-mono text-white">w'(u, v) = w(u, v) + h(u) − h(v)</p>
            </div>
            <div class="grid grid-cols-1 gap-6 mb-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-amber-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-amber-500 shadow-md">
                        ⚖️ Суть перевзвешивания
                    </div>
                    <p class="text-slate-300 text-sm mb-4 leading-relaxed">
                        Дейкстра (билет 14) быстрая, но ломается на отрицательных весах. Форд—Беллман (билет 15) минусов не боится, но медленный. Алгоритм Джонсона делает финт: переделывает веса всех рёбер так, чтобы они стали <b>≥ 0</b>, а кратчайшие пути остались теми же.
                    </p>
                    <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside ml-2">
                        <li>Добавляем <b>фиктивную вершину</b> s и проводим от неё рёбра веса 0 во все остальные вершины.</li>
                        <li>Запускаем от s <b>Форда-Беллмана (ford_batman)</b>. Он даёт расстояния h(v) — это наши <b>потенциалы</b>. <i>Важный факт:</i> Джонсон НЕ «удаляет» отрицательные циклы — если Форд-Беллман находит отрицательный цикл, Джонсон падает с ошибкой и прекращает работу, так как при отрицательном цикле понятие кратчайшего пути математически перестаёт существовать!</li>
                        <li>Перевзвешиваем: <span class="font-mono text-emerald-300">w'(u, v) = w(u, v) + h(u) − h(v) ≥ 0</span> (неравенство следует из того, что h(v) ≤ h(u) + w(u, v) — это ровно релаксация, которая уже сошлась).</li>
                        <li><b>Магия:</b> для любого пути потенциалы внутри сокращаются телескопически — новый вес пути = старый + h(старт) − h(финиш), то есть <b>все пути между фиксированной парой сдвигаются на одну константу</b>. Значит порядок «кто короче» не меняется.</li>
                        <li>Запускаем <b>быструю Дейкстру V раз</b> (от каждой вершины) по новым весам и возвращаем ответ обратно: <span class="font-mono text-emerald-300">d(u, v) = d'(u, v) − h(u) + h(v)</span>.</li>
                    </ol>
                    <p class="text-slate-400 text-xs mt-4">Итого для всех пар: O(V·E) на Форд—Беллман + O(V·E·log V) на V Дейкстр. На разреженном графе (E ≈ V) это O(V² log V) против O(V³) у Флойда — вот почему Джонсон выбирают для больших разреженных графов, а Флойд — для маленьких или очень плотных.</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">2. Встречный (двунаправленный) Дейкстра</h3>
            <p class="text-slate-300 text-sm mb-3">Если известны обе вершины — старт и финиш, — одну волну заменяют двумя: вперёд из s и назад из t (по перевёрнутым рёбрам). Волны растут навстречу, и вместо круга радиуса R приходится рисовать два круга радиуса R/2: в «широком» графе (дорожная сеть) это экономия в разы. Ключевая деталь — <b>условие остановки</b>: нельзя останавливаться, когда волны «встретились» в одной вершине; надо хранить μ = лучший найденный путь (min по d_f[v] + d_b[v]) и останавливаться, когда <span class="font-mono text-emerald-300">min(куча_f) + min(куча_b) ≥ μ</span>. Иначе можно отрезать ещё не раскрытый, но более короткий путь.</p>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">3. A*: Дейкстра с компасом</h3>
            <p class="text-slate-300 text-sm mb-3">Дейкстра раскрывает вершины ровным кругом: ей всё равно, где цель. A* сортирует кучу не по <span class="font-mono">g(v)</span> (уже пройденное расстояние от старта), а по <span class="font-mono text-emerald-300">f(v) = g(v) + h(v)</span>, где h(v) — оценка остатка до цели. На карте h — евклидово расстояние по координатам, «по прямой». Два требования: <b>допустимость</b> (h(v) ≤ истинного остатка — никогда не переоцениваем) гарантирует оптимальность ответа; <b>монотонность/согласованность</b> (h(u) ≤ w(u, v) + h(v)) гарантирует, что вершину не придётся раскрывать повторно. При h ≡ 0 A* вырождается ровно в Дейкстру — это хороший способ запомнить, что A* не «другой алгоритм», а Дейкстра с приоритетом.</p>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">4. Когда куча не нужна: 0-1 BFS и Dial</h3>
            <p class="text-slate-300 text-sm mb-3">Если веса рёбер только <b>0 и 1</b> (например, «бесплатный переход» против «платного»), кучу заменяют <b>деком</b>: ребро веса 0 кладём в начало, веса 1 — в конец. Дека всегда отсортирована по расстоянию (в ней одновременно живут максимум два уровня), поэтому получаем честный BFS за <span class="font-mono text-emerald-300">O(V + E)</span>. Обобщение — <b>алгоритм Дила (корзины)</b> для целых весов 0…C: держим C + 1 корзину по модулю, идём по кругу, сложность O(E + V·C). Оба приёма — стандартный ответ на вопрос «как ускорить Дейкстру, если веса маленькие целые».</p>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">5. SPFA и выбор кучи</h3>
            <p class="text-slate-300 text-sm mb-3">Форд—Беллман можно не прогонять «все рёбра V − 1 раз», а держать <b>очередь вершин, у которых расстояние только что уменьшилось</b> — это SPFA (очередной Беллман—Форд). На реальных графах она в разы быстрее классического прогона, но асимптотика та же, O(V·E), и существуют графы, на которых SPFA деградирует (поэтому на соревнованиях её используют осторожно, с эвристиками SLF/LLL). Отдельная линия ускорения — сама куча: двоичная даёт O(E log V), d-арная (d = 4…16) уменьшает высоту и на практике быстрее, куча Фибоначчи даёт теоретические O(E + V log V), но константа убивает весь выигрыш.</p>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">6. Карты: сжатие координат, ALT, contraction hierarchies</h3>
            <p class="text-slate-300 text-sm mb-3">Навигатор считает миллионы запросов по одному и тому же графу, поэтому работу переносят в <b>предобработку</b>. Сначала — <b>сжатие координат</b>: долготы и широты это большие дробные числа, их заменяют плотными индексами 0…N, и уже по ним строят граф и сетки. Дальше — <b>ALT</b> (A*, Landmarks, Triangle inequality): заранее считают расстояния от нескольких «ориентиров» до всех вершин и из неравенства треугольника получают отличную допустимую эвристику без геометрии. <b>Contraction hierarchies</b> (так устроен OSRM): вершины по важности «сворачивают», добавляя короткие shortcut-рёбра, и запрос идёт двунаправленным поиском вверх по иерархии — микросекунды вместо секунд. <b>Hub labeling</b> идёт дальше: каждой вершине заранее приписывают «метки», и запрос сводится к пересечению двух списков.</p>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-6">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>A* с недопустимой эвристикой</b> (h больше истинного остатка) находит путь быстро, но не кратчайший. Переоценка = неверный ответ; недооценка = безопасно.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Джонсон не «ускоряет Дейкстру»</b> на графе без минусов: он делает Дейкстру применимой к отрицательным весам и даёт все пары. На неотрицательных весах h ≡ 0 и перевзвешивание ничего не меняет.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Встречный Дейкстра останавливается не «когда волны встретились»</b>, а когда min_f + min_b ≥ μ. Остановка по встрече даёт неверный ответ на графах с неравными весами.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>0-1 BFS не работает для весов 0, 1, 2</b>: в деке окажется три уровня, и порядок сломается. Там нужен Dial.</p>
                <p class="text-slate-400 text-sm">· <b>SPFA асимптотически не быстрее Форда—Беллмана</b> — это та же O(V·E), просто на практике меньше бесполезных релаксаций.</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> Джонсон <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V·E·log V)</code>, встречный Дейкстра и A* <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E log V)</code> с меньшим числом раскрытий, 0-1 BFS <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(V + E)</code>, Dial <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E + V·C)</code>, Дейкстра с кучей Фибоначчи <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(E + V log V)</code>, SPFA <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(V·E)</code> в худшем случае.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: Джонсон целиком (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">import heapq
INF = float("inf")

def johnson(n, edges):                 # edges: (u, v, w)
    # 1) потенциалы: Форд—Беллман от фиктивной вершины s = n
    h = [0] * (n + 1)                  # из s все рёбра веса 0 → h(s)=0, h(v)=0 старт
    for _ in range(n):                 # V итераций: V−1 на расстояния + 1 на проверку
        changed = False
        for u, v, w in edges:
            if h[u] + w &lt; h[v]:
                h[v] = h[u] + w
                changed = True
        if not changed:
            break
    else:
        return None                    # отрицательный цикл — Джонсон неприменим

    # 2) перевзвешивание: все w' ≥ 0
    g = [[] for _ in range(n)]
    for u, v, w in edges:
        g[u].append((v, w + h[u] - h[v]))

    # 3) Дейкстра от каждой вершины + обратный перевод
    d = [[INF] * n for _ in range(n)]
    for s in range(n):
        d[s][s] = 0
        heap = [(0, s)]
        while heap:
            dist, v = heapq.heappop(heap)
            if dist &gt; d[s][v]:
                continue
            for to, w in g[v]:
                if d[s][to] &gt; dist + w:
                    d[s][to] = dist + w
                    heapq.heappush(heap, (d[s][to], to))
        for v in range(n):
            if d[s][v] &lt; INF:
                d[s][v] = d[s][v] - h[s] + h[v]     # обратно к настоящим весам
    return d</pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: встречный Дейкстра, A*, 0-1 BFS (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"># --- Встречный Дейкстра: остановка по min_f + min_b >= mu ---
def bidirectional(g, rg, s, t):        # rg — граф с перевёрнутыми рёбрами
    INF = float("inf")
    df = {s: 0}; db = {t: 0}
    qf = [(0, s)]; qb = [(0, t)]
    mu = INF
    while qf and qb:
        if qf[0][0] + qb[0][0] &gt;= mu:      # вот правильное условие остановки
            return mu
        dist, v = heapq.heappop(qf)
        if dist &gt; df.get(v, INF): continue
        for to, w in g[v]:
            nd = dist + w
            if nd &lt; df.get(to, INF):
                df[to] = nd; heapq.heappush(qf, (nd, to))
            if to in db:
                mu = min(mu, nd + db[to])   # встреча: кандидат в ответ
        dist, v = heapq.heappop(qb)
        if dist &gt; db.get(v, INF): continue
        for to, w in rg[v]:
            nd = dist + w
            if nd &lt; db.get(to, INF):
                db[to] = nd; heapq.heappush(qb, (nd, to))
            if to in df:
                mu = min(mu, nd + df[to])
    return mu

# --- A*: приоритет f = g + h ---
def astar(g, s, t, h):                 # h(v) — допустимая эвристика, h(t) = 0
    INF = float("inf")
    gdist = {s: 0}
    heap = [(h(s), 0, s)]              # (f, g, v)
    closed = set()
    while heap:
        f, gv, v = heapq.heappop(heap)
        if v == t:
            return gv                  # ранний выход: цель раскрыта → ответ готов
        if v in closed:
            continue
        closed.add(v)
        for to, w in g[v]:
            nd = gv + w
            if nd &lt; gdist.get(to, INF):
                gdist[to] = nd
                heapq.heappush(heap, (nd + h(to), nd, to))
    return INF

# --- 0-1 BFS: веса 0 и 1, дека вместо кучи ---
from collections import deque
def bfs01(g, s, n):                    # g[v] = [(to, w)], w ∈ {0, 1}
    INF = float("inf")
    d = [INF] * n; d[s] = 0
    dq = deque([s])
    while dq:
        v = dq.popleft()
        for to, w in g[v]:
            if d[v] + w &lt; d[to]:
                d[to] = d[v] + w
                (dq.appendleft(to) if w == 0 else dq.append(to))
    return d</pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🎓 Вопросы, которые любят задавать (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>· Почему после перевзвешивания веса неотрицательны? — h(v) ≤ h(u) + w(u, v), потому что Форд—Беллман сошёлся: это и есть условие отсутствия улучшающей релаксации.</p>
                    <p>· Почему кратчайшие пути не меняются? — потенциалы на пути сокращаются телескопически: сдвиг равен h(старт) − h(финиш) и одинаков для всех путей между этой парой.</p>
                    <p>· Что лучше для всех пар: Флойд или Джонсон? — Флойд O(V³) хорош при плотных графах и маленьком V; Джонсон O(V·E·log V) выигрывает на разреженных.</p>
                    <p>· Какая эвристика A* допустима на карте? — евклидово расстояние по прямой (никогда не длинее дороги); при ограничении скорости можно делить на максимальную скорость.</p>
                    <p>· Зачем нужен ранний выход в Дейстре? — как только цель извлечена из кучи, её расстояние финализировано: продолжать смысла нет.</p>
                    <p>· Почему 0-1 BFS работает без кучи? — в деке лежат вершины максимум двух соседних уровней расстояния, то есть она уже отсортирована.</p>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
];
