/**
 * Захардкоженная «карта синхронизации» компилятора с визуализациями.
 *
 * Для каждой страницы (главы) здесь вручную перечислены переменные,
 * по которым идёт пошаговая подсветка в её интерактивной демонстрации —
 * в первую очередь индексы циклов i, j, k и размеры n, m.
 *
 * Компилятор НЕ показывает код алгоритма — только комментарий с этими
 * переменными, чтобы студент повторял шаги руками, глядя на визуализацию.
 */

export interface SyncVariable {
  /** Имя переменной, как в коде визуализации: i, j, k, n, m, dist… */
  name: string;
  /** Роль в алгоритме (показывается во всплывающей подсказке). */
  role: string;
  /** Характерный диапазон/значение на демонстрации. */
  range?: string;
}

export interface PageSync {
  /** Заголовок демонстрации на странице (если интерактив есть). */
  vizTitle?: string;
  /** Чему соответствует один шаг визуализации (для тултипа). */
  stepNote?: string;
  /** Переменные синхронизации. Пусто — на странице нет визуализации. */
  variables: SyncVariable[];
  /**
   * Минимальный исполняемый скелет для редактора: строки идут
   * шаг-в-шаг с подсветкой визуализации (без словесных описаний).
   */
  code?: string;
  /**
   * Номера строк ВНУТРИ code (с 1), каждое выполнение которых = один
   * шаг визуализации: по ним отладчик точно переводит шаг трассы в
   * шаг демонстрации (иначе — грубо «строчный индекс = шаг»).
   */
  stepCodeLines?: number[];
}

/** Справочные значения, указанные внутри самих симуляторов (демо-графы, строки и т.п.). */
export const PAGE_SYNC: Record<string, PageSync> = {
  "segment-trees": {
    vizTitle: "Дерево отрезков",
    stepNote: "Шаг = спуск по вершине v: либо читаем tree[v], либо толкаем lazy к детям 2·v и 2·v+1.",
    code: `n = 8                       # длина массива (демо)
tree = [0] * (2 * n)
i = 0                       # лист: tree[n + i]

v, l, r = 1, 0, n - 1       # вершина и её отрезок
m = (l + r) // 2            # граница детей 2v, 2v+1
print(f"v={v} [{l}..{r}] mid={m}")`,
    variables: [
      { name: "n", role: "длина исходного массива; листья дерева лежат в tree[n … 2·n − 1]", range: "n = 8 на демо" },
      { name: "i", role: "индекс элемента массива; его лист — tree[n + i]", range: "0 … n−1" },
      { name: "v", role: "текущая вершина дерева отрезков", range: "1 … 2·n−1" },
      { name: "l, r", role: "границы отрезка, за который отвечает вершина v", range: "0 … n−1" },
      { name: "m", role: "середина отрезка m = (l + r) // 2 — граница между детьми", range: "l ≤ m < r" },
    ],
  },
  treap: {
    // у страницы нет интерактивного виджета
    variables: [],
  },
  "splay-tree": {
    vizTitle: "Splay-дерево (Zig / Zig-Zig / Zig-Zag)",
    stepNote: "Шаг = один поворот, поднимающий узел x над родителем p (а в Zig-Zig/Zig-Zag — ещё и над g).",
    code: `x = "x"                     # поднимаемый узел
p = "p"                     # родитель x
g = "g"                     # дед x

print("zig:     ", x, "↑", p)          # шаг 1
print("zig-zig: ", x, "↑", p, "↑", g)  # шаг 2
print("zig-zag: ", x, "↗", g)          # шаг 3`,
    variables: [
      { name: "x", role: "узел, который поднимаем к корню (расшейвливаем)", range: "выбранный узел" },
      { name: "p", role: "родитель узла x перед поворотом", range: "p = parent(x)" },
      { name: "g", role: "дедушка узла x — нужен в случаях Zig-Zig и Zig-Zag", range: "g = parent(p)" },
      { name: "zig / zag", role: "направление поворота: x — левый (zig) или правый (zag) ребёнок", range: "вправо / влево" },
    ],
  },
  "splay-rotations": {
    vizTitle: "Splay: Zig, Zig-Zig и Zig-Zag по шагам",
    stepNote: "Шаг = один кадр поворота из трёх классических случаев.",
    code: `x, p, g = "x", "p", "g"   # узел, родитель, дед

print("zig:     ", x, "↑", p)
print("zig-zig: ", x, "↑", p, "↑", g)
print("zig-zag: ", x, "↗", g)`,
    variables: [
      { name: "x", role: "узел, который поднимаем к корню (расшейвливаем)", range: "выбранный узел" },
      { name: "p", role: "родитель узла x перед поворотом", range: "p = parent(x)" },
      { name: "g", role: "дедушка узла x — нужен в случаях Zig-Zig и Zig-Zag", range: "g = parent(p)" },
    ],
  },
  "sparse-table": {
    vizTitle: "Разреженная таблица (1D и 2D)",
    stepNote: "Шаг построения = заполнение ячейки уровня k: склейка двух блоков длины 2^(k−1).",
    code: `n = 8                       # размер массива (демо)
log = 3                     # k ≤ log2(n)

# 1D: ячейка (i, j) — блок [i, i + 2^j)
i = 0
j = 0

# 2D: 4 ключа → одна ячейка
st2 = {}                    # (r, c, kx, ky) → ответ
r, c, kx, ky = 0, 0, 0, 0
st2[(r, c, kx, ky)] = 0

for j in range(1, log + 1):
    for i in range(n - 2 ** j + 1):
        print(f"1D: st[{i}][{j}]")`,
    variables: [
      { name: "n", role: "длина массива / сторона квадратной матрицы", range: "n = 8 на демо" },
      { name: "k", role: "уровень таблицы: ячейка хранит ответ на блоке длины 2^k", range: "0 … log₂ n" },
      { name: "i", role: "начало блока в строке уровня (1D), результата запроса справа", range: "0 … n − 2^k" },
      { name: "j", role: "номер уровня при построении (j = 1 … LOG) и индекс столбца", range: "1 … log₂ n" },
      { name: "r, c", role: "строка и столбец ячейки в 2D-таблице", range: "0 … 7 на демо" },
      { name: "kx, ky", role: "уровни по вертикали и горизонтали в 2D: блок 2^kx × 2^ky", range: "0 … 3 на демо" },
    ],
  },
  "prefix-sums-2d": {
    vizTitle: "Префиксные суммы (1D и 2D)",
    stepNote: "Шаг = вычисление S[i][j] по формуле включений-исключений из уже готовых соседей.",
    code: `n, m = 3, 4                 # строк, столбцов (демо)
S = [[0] * (m + 1) for _ in range(n + 1)]

for i in range(1, n + 1):       # строка
    for j in range(1, m + 1):   # столбец
        print(f"S[{i}][{j}] = A + ↑S[{i-1}][{j}] + ←S[{i}][{j-1}] − ↖S[{i-1}][{j-1}]")`,
    variables: [
      { name: "n", role: "число строк матрицы", range: "1 … n" },
      { name: "m", role: "число столбцов матрицы", range: "1 … m" },
      { name: "i", role: "индекс текущей строки (таблица 1-индексная, строка 0 — нули)", range: "1 … n" },
      { name: "j", role: "индекс текущего столбца (столбец 0 — нули)", range: "1 … m" },
      { name: "S[i][j]", role: "сумма прямоугольника (1,1)–(i,j): A[i][j] + S[i−1][j] + S[i][j−1] − S[i−1][j−1]", range: "пересчитывается на каждом шаге" },
    ],
  },
  "dynamic-programming": {
    vizTitle: "Динамическое программирование (мемоизация)",
    stepNote: "Шаг = вызов fibMemo(n): попадание в кэш memo или вычисление fib(n−1) + fib(n−2).",
    code: `n = 5                       # цель (демо)
memo = {}                   # кэш подзадач

# шаг: fib(n) → memo[n] или fib(n−1) + fib(n−2)
print("fib(", n, ") → memo", memo, "?")`,
    variables: [
      { name: "n", role: "номер числа Фибоначчи, которое сейчас считаем", range: "1 … targetN (по умолчанию 5)" },
      { name: "memo[n]", role: "кэш уже посчитанных значений — второй заход отдаёт ответ за O(1)", range: "заполняется снизу вверх" },
    ],
  },
  "heap-beam-search": {
    vizTitle: "Куча (priority queue)",
    stepNote: "Шаг = просеивание: вставленный элемент всплывает, пока не окажется ниже по приоритету, чем родитель — лучший всегда наверху.",
    code: `a = [7, 3, 5, 1]            # куча-массивом
n = len(a)
i = n - 1                   # всплываемый элемент

parent = (i - 1) // 2       # родитель
kids = (2 * i + 1, 2 * i + 2)   # дети
print(f"i={i} parent={parent} kids={kids}")`,
    variables: [
      { name: "n", role: "текущее число элементов в куче (n = len(a))", range: "растёт/падает при push/pop" },
      { name: "i", role: "индекс элемента, который сейчас просеиваем", range: "0 … n−1" },
      { name: "(i−1)//2", role: "индекс родителя вершины i в массиве кучи", range: "для i > 0" },
      { name: "2·i+1, 2·i+2", role: "индексы левого и правого ребёнка вершины i", range: "< n" },
    ],
  },
  "stack-dfs": {
    vizTitle: "Стек и обход в глубину",
    stepNote: "Шаг = push новой вершины на стек или pop — возврат рекурсии на уровень выше.",
    code: `st = []                     # стек = рекурсия DFS
st.append("A")              # push — зашли в вершину
st.append("B")
top = st.pop()              # pop — возврат на уровень выше
print("pop →", top, "стек:", st)`,
    variables: [
      { name: "top", role: "вершина стека — то, откуда DFS пойдёт дальше", range: "последний добавленный" },
      { name: "v", role: "текущая вершина графа, которую обрабатываем", range: "0 … n−1" },
    ],
  },
  "queue-bfs": {
    vizTitle: "Очередь и обход в ширину",
    stepNote: "Шаг = dequeue вершины из головы очереди и enqueue всех её непосещённых соседей.",
    code: `from collections import deque

q = deque(["A"])
q.append("B")               # enqueue соседа
v = q.popleft()             # шаг: обрабатываем голову
print("v =", v, "очередь:", list(q))`,
    variables: [
      { name: "front", role: "голова очереди — вершина, которую обрабатываем следующей", range: "первый в очереди" },
      { name: "v", role: "вершина, извлечённая из очереди на этом шаге", range: "по слоям от старта" },
      { name: "u", role: "сосед вершины v, которого кладём в очередь", range: "непосещённый" },
    ],
  },
  "everyday-basics": {
    vizTitle: "Бытовой тренажёр: стек, очередь, куча",
    stepNote: "Шаг = одна бытовая операция: тарелка на стопку, человек в очередь, гипотеза в кучу.",
    code: `from collections import deque

st, q = [], deque()         # тарелки и очередь
st.append("🍽️"); top = st.pop()
q.append("🧍"); q.append("🧍"); first = q.popleft()
print("тарелка:", top, "| первый из очереди:", first)`,
    variables: [
      { name: "top / front", role: "верх стопки (стек) и голова очереди — кого заберут первым", range: "LIFO и FIFO" },
      { name: "i", role: "индекс в массиве кучи; родитель (i−1)//2, дети 2·i+1 и 2·i+2", range: "0 … n−1" },
    ],
  },
  "graph-dfs-bfs": {
    vizTitle: "DFS и BFS на графе",
    stepNote: "Шаг = переход из текущей вершины v к непосещённому соседу to (DFS — вглубь, BFS — по слоям).",
    code: `adj = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
visited, order = set(), []

stack = ["A"]               # BFS: deque + popleft()
while stack:
    v = stack.pop()         # шаг: достали вершину
    if v in visited:
        continue
    visited.add(v); order.append(v)
    stack += adj[v]         # соседи v → на стек
print(order)`,
    variables: [
      { name: "v", role: "текущая вершина обхода", range: "вершины демо-графа" },
      { name: "to / u", role: "очередной сосед вершины v из списка смежности adj[v]", range: "adj[v]" },
      { name: "visited", role: "множество уже посещённых вершин — гарантия от циклов", range: "пополняется на каждом шаге" },
      { name: "order", role: "порядок, в котором обход дошёл до вершин", range: "строка под графом" },
    ],
  },
  "graph-components": {
    // отдельного виджета нет, тема опирается на DFS/BFS-обходы
    variables: [],
  },
  "top-sort": {
    vizTitle: "Топологическая сортировка",
    stepNote: "Шаг = выход рекурсии из вершины v: она дописывается в order, потом order разворачивается.",
    code: `adj = {0: [1, 4], 1: [2, 3], 2: [], 3: [2], 4: []}
used, order = set(), []

def dfs(v):
    used.add(v)
    for to in adj[v]:       # шаг: ребро v → to
        if to not in used:
            dfs(to)
    order.append(v)         # выход из v!

for v in adj:
    if v not in used:
        dfs(v)
print(order[::-1])          # разворот — ответ`,
    variables: [
      { name: "v", role: "текущая вершина DFS", range: "0 … 4 на демо" },
      { name: "to", role: "вершина, куда ведёт ребро из v", range: "adj[v]" },
      { name: "i", role: "перебор стартовых вершин во внешнем цикле (вдруг граф несвязен)", range: "0 … 4" },
      { name: "order", role: "список выхода из рекурсии; после разворота — топологический порядок", range: "растёт на каждом выходе" },
    ],
  },
  "scc-kosaraju": {
    vizTitle: "Компоненты сильной связности (Косарайю)",
    stepNote: "Шаг = вершина из order (в обратном порядке) запускает DFS по транспонированному графу и красит свою SCC.",
    code: `adj = {0: [1], 1: [2], 2: [0, 3], 3: [], 4: [3]}
adjT = {v: [] for v in adj}
for v in adj:
    for to in adj[v]:
        adjT[to].append(v)  # транспонирование

order = [3, 2, 1, 0, 4]     # фаза 1 уже дала порядок выхода
comp = {}                   # фаза 2: вершина → № SCC

for i in range(len(order) - 1, -1, -1):
    v = order[i]            # шаг: DFS по adjT из v красит comp[v]
    print(i, "старт из", v, comp)`,
    variables: [
      { name: "v", role: "текущая вершина DFS (первый проход — обычный граф)", range: "0 … 4" },
      { name: "to", role: "сосед по ребру (на 2-м проходе — по обратному ребру)", range: "adj / adjT" },
      { name: "i", role: "индекс прохода по order на втором этапе — идём с конца", range: "len(order)−1 … 0" },
      { name: "order", role: "порядок выхода из DFS первого прохода", range: "читается справа налево" },
      { name: "comp", role: "номер компоненты сильной связности, которой красим вершины", range: "0, 1, 2…" },
    ],
  },
  "graph-articulation": {
    vizTitle: "Точки сочленения",
    stepNote: "Шаг = обновление low[v] по ребру; вершина v — точка сочленения, когда low[to] ≥ tin[v].",
    code: `tin, low, timer = {}, {}, 0

v, to = 0, 1                # текущее ребро DFS
tin[v] = tin.get(v, timer); low[v] = tin[v]

# шаг: возврат из to
low[v] = min(low[v], low.get(to, tin[v]))
critical = low.get(to, 0) >= tin[v]   # → v — точка сочленения
print(f"v={v} to={to} critical={critical}")`,
    variables: [
      { name: "v", role: "текущая вершина DFS", range: "вершины демо-графа" },
      { name: "to", role: "сосед: либо ребёнок в DFS-дереве, либо обратное ребро", range: "adj[v]" },
      { name: "tin[v]", role: "время входа в вершину (порядок обхода)", range: "1, 2, 3…" },
      { name: "low[v]", role: "минимальный tin, достижимый из поддерева v одним обратным ребром", range: "≤ tin[v]" },
      { name: "i", role: "перебор стартовых вершин для случая несвязного графа", range: "0 … n−1" },
    ],
  },
  "bridges-code": {
    vizTitle: "Мосты: DFS + tin/low",
    stepNote: "Шаг = строка псевдокода слева; ребро (v, to) — мост, когда low[to] > tin[v].",
    code: `tin, low = {"A": 1, "B": 2, "G": 3}, {"A": 1, "B": 2, "G": 3}
timer = 3                   # как на демо

v, to = "B", "G"            # шаг: возврат из G
is_bridge = low[to] > tin[v]        # 3 > 2 → мост!
print(f"ребро {v}-{to}: мост? {is_bridge}")`,
    variables: [
      { name: "v", role: "текущая вершина DFS", range: "A…G на демо" },
      { name: "to", role: "сосед; ребро (v, to) проверяем на мост", range: "adj[v]" },
      { name: "tin[v]", role: "время входа в вершину — метка глубины обхода", range: "timer++" },
      { name: "low[v]", role: "минимум tin, куда можно добраться из поддерева v обратным ребром", range: "≤ tin[v]" },
      { name: "timer", role: "глобальный счётчик времени входа", range: "+1 на каждый вход" },
    ],
  },
  "euler-path-vs-cycle": {
    vizTitle: "Эйлеров путь и цикл",
    stepNote: "Шаг = один клик по следующей вершине маршрута; ребро при этом «сгорает».",
    code: `edges = [(0,1), (0,2), (1,3), (2,4), (1,2), (3,4)]
deg = {}
for u, v in edges:          # степени вершин
    deg[u] = deg.get(u, 0) + 1
    deg[v] = deg.get(v, 0) + 1

odd = [v for v in deg if deg[v] % 2]
print(deg, "нечётных:", len(odd))
# 0 → цикл · 2 → путь · иначе — нельзя`,
    variables: [
      { name: "path", role: "текущий маршрут — последовательность пройденных вершин", range: "растёт по кликам" },
      { name: "last", role: "последняя вершина пути — отсюда выбираем следующее ребро", range: "path[-1]" },
      { name: "deg(v)", role: "степень вершины: чётная всюду → цикл, ровно две нечётные → путь", range: "считается по рёбрам" },
    ],
  },
  "planarity-euler-formula": {
    vizTitle: "Планарность: K5 и K3,3",
    stepNote: "Шаг = попытка перетащить вершину так, чтобы рёбра перестали пересекаться.",
    code: `V, E = 5, 10                # K5   (K3,3: V=6, E=9)
F = 2 - V + E               # формула: V − E + F = 2

not_planar = E > 3 * V - 6  # 10 > 9 → K5 непланарен
print(f"V={V} E={E} F={F} непланарен={not_planar}")`,
    variables: [
      { name: "V", role: "число вершин графа", range: "K5: 5 · K3,3: 6" },
      { name: "E", role: "число рёбер", range: "K5: 10 · K3,3: 9" },
      { name: "F", role: "число граней в плоской укладке", range: "V − E + F = 2" },
    ],
  },
  dijkstra: {
    vizTitle: "Дейкстра",
    stepNote: "Шаг = старт, извлечение ближайшей вершины u из кучи или релаксация ребра (u → v) — как в демонстрации слева.",
    code: `import heapq

g = {"A": [("B", 4), ("C", 2)], "B": [("G", 4), ("D", 5)], "C": [("B", 1), ("G", 3), ("E", 8)], "G": [("D", 1), ("E", 2)], "D": [("F", 3)], "E": [("F", 1)], "F": []}
dist = {"A": 0}
prev = {}
done = set()
pq = [(0, "A")]
while pq:
    du, u = heapq.heappop(pq)
    if u in done:
        continue
    done.add(u)
    print(f"обрабатываем {u} (dist={du})")
    for v, w in g[u]:
        if v in done:
            continue
        print(f"смотрим ребро {u}→{v} (w={w})")
        if du + w < dist.get(v, float("inf")):
            dist[v] = du + w
            prev[v] = u
            heapq.heappush(pq, (dist[v], v))
print("итог:", dist)`,
    stepCodeLines: [4, 13, 17, 19, 22],
    variables: [
      { name: "u", role: "вершина с минимальным dist среди непосещённых — её обрабатываем", range: "argmin dist" },
      { name: "v", role: "сосед вершины u, до которого пробуем улучшить путь", range: "соседи u" },
      { name: "w", role: "вес ребра (u, v)", range: "подпись на ребре" },
      { name: "dist[v]", role: "лучшее известное расстояние от старта до v", range: "0 … ∞" },
    ],
  },
  "bellman-ford": {
    vizTitle: "Форд—Беллман",
    stepNote: "Шаг = одна релаксация ребра (u, v, w) внутри i-й итерации по всем рёбрам.",
    code: `n, m = 7, 10                # вершин, рёбер (демо)
dist = {"S": 0}

for i in range(1, n):       # итерация i = 1 … n−1
    u, v, w = "S", "A", 5   # шаг: очередное ребро
    if dist.get(u, float("inf")) + w < dist.get(v, float("inf")):
        dist[v] = dist[u] + w   # релаксация
    if i == 1:
        print(f"итерация {i}: {dist}")
        break`,
    variables: [
      { name: "n", role: "число вершин графа — ровно n−1 полных итераций", range: "7 на демо" },
      { name: "m", role: "число рёбер, по которым проходим на каждой итерации", range: "список E" },
      { name: "i", role: "номер итерации (после i итераций точны все пути из ≤ i рёбер)", range: "1 … n−1" },
      { name: "u, v, w", role: "текущее ребро: откуда, куда и его вес", range: "перебор E" },
      { name: "dist[v]", role: "расстояние; если обновилось на n-й итерации — отрицательный цикл", range: "0 … ∞" },
    ],
  },
  floyd: {
    vizTitle: "Флойд—Уоршелл",
    stepNote: "Шаг = инициализация матрицы, смена промежуточной вершины k или улучшение dist[i][j] — как в демонстрации слева.",
    code: `INF = 999

d = [[0, 4, INF, 2, INF, INF, INF], [INF, 0, 3, INF, INF, 3, INF], [INF, INF, 0, INF, 2, INF, INF], [INF, INF, INF, 0, 4, 2, INF], [INF, INF, INF, INF, 0, INF, 1], [INF, INF, INF, INF, INF, 0, 5], [INF, 1, INF, INF, INF, INF, 0]]
n = 7
for k in range(n):
    print(f"посредник k={k}")
    for i in range(n):
        for j in range(n):
            if i != j and i != k and j != k and d[i][k] != INF and d[k][j] != INF:
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
print("итог: все пары посчитаны")`,
    stepCodeLines: [3, 6, 11, 12],
    variables: [
      { name: "n", role: "число вершин — размер квадратной матрицы расстояний n × n", range: "7 на демо" },
      { name: "k", role: "промежуточная вершина — ВНЕШНИЙ цикл; на шаге k разрешено ходить через вершины 0 … k", range: "0 … n−1" },
      { name: "i", role: "начало пути — строка матрицы (средний цикл)", range: "0 … n−1" },
      { name: "j", role: "конец пути — столбец матрицы (внутренний цикл)", range: "0 … n−1" },
      { name: "dist[i][j]", role: "кратчайший путь i → j среди уже проверенных промежуточных вершин", range: "обновляется на каждом улучшении" },
    ],
  },
  "johnson-algo": {
    vizTitle: "Алгоритм Джонсона (перевзвешивание)",
    stepNote: "Шаг = Беллман-Форд из фиктивной вершины считает h[v], затем n запусков Дейкстры в новых весах.",
    code: `# потенциалы из Беллмана-Форда от фиктивной вершины S
h = {"A": 0, "B": -3, "C": -1, "D": 1, "E": 2, "F": 4}

u, v, w = "A", "B", -3      # ребро с отрицательным весом
w_new = w + h[u] - h[v]     # w′ = w + h[u] − h[v] ≥ 0
print(f"w′({u}→{v}) = {w_new}")
# после Дейкстры: ответ = d[v] − h[start] + h[v]`,
    variables: [
      { name: "h[v]", role: "потенциал вершины — кратчайший путь от фиктивной вершины; делает веса неотрицательными", range: "после Беллмана–Форда" },
      { name: "u, v", role: "ребро (u, v) перевзвешивается: w′(u,v) = w(u,v) + h[u] − h[v]", range: "все рёбра" },
      { name: "d[v]", role: "расстояние Дейкстры в новых весах; истинный ответ: d[v] − h[start] + h[v]", range: "обратное перевзвешивание" },
    ],
  },
  "mst-kruskal": {
    vizTitle: "Краскал и DSU",
    stepNote: "Шаг = следующее ребро из отсортированных: если концы в разных компонентах — берём в остов.",
    code: `edges = [(3, "B", "C"), (1, "A", "B"), (2, "A", "C")]
edges.sort()                # по весу

parent = {v: v for v in "ABC"}   # DSU
def find(x):
    while parent[x] != x:
        x = parent[x]
    return x

mst = []
for w, u, v in edges:       # шаг: очередное ребро
    if find(u) != find(v):  # разные компоненты → берём
        parent[find(u)] = find(v)
        mst.append((w, u, v))
print(mst)`,
    variables: [
      { name: "n", role: "число вершин; в остов войдёт ровно n−1 ребро", range: "вершины демо-графа" },
      { name: "m", role: "число рёбер, сортируем по весу в начале", range: "список E" },
      { name: "i", role: "ребро сортируем по весу w; parent[i] — представитель компоненты", range: "0 … m−1 / find(x)" },
      { name: "parent[v]", role: "DSU: кто представитель компоненты вершины v", range: "сжатие путей" },
      { name: "rank[v]", role: "высота дерева DSU — по ней решаем, кого к кому подвешивать", range: "≤ log n" },
    ],
  },
  "mst-prima": {
    vizTitle: "Прим",
    stepNote: "Шаг = из кучи достаётся самое лёгкое ребро, ведущее из выращенного дерева наружу.",
    code: `import heapq

start = "A"
heap = [(0, start, "start")]   # (вес, вершина, откуда)

w, v, parent = heapq.heappop(heap)  # шаг: берём минимум
taken = {start}             # дерево растёт от start
print(f"берём {v} за {w} (из {parent})")`,
    variables: [
      { name: "v", role: "вершина, которую только что добавили в остовное дерево", range: "из кучи" },
      { name: "u", role: "ещё не взятый сосед v — кандидат на добавление", range: "соседи v" },
      { name: "w", role: "вес ребра (v, u) — ключ в куче (w, u, parent)", range: "min на вершине кучи" },
      { name: "start", role: "стартовая вершина, из неё растим дерево", range: "1 вершина" },
    ],
  },
  "mst-boruvka": {
    vizTitle: "Борувка",
    stepNote: "Шаг = каждая компонента одновременно выбирает своё самое дешёвое исходящее ребро.",
    code: `comp = {v: v for v in "ABC"}   # корень компоненты
cheapest = {}               # comp → самое дешёвое ребро наружу

u, v, w = "A", "B", 1       # шаг: ребро-кандидат
if comp[u] != comp[v]:
    cheapest[comp[u]] = (w, u, v)
print(cheapest)             # за фазу компонент станет ÷2`,
    variables: [
      { name: "comp", role: "компонента связности текущего леса (DSU)", range: "число компонент ÷≥2 за фазу" },
      { name: "cheapest[comp]", role: "самое дешёвое ребро из компоненты наружу", range: "обновляется каждую фазу" },
      { name: "u, v, w", role: "ребро-кандидат: концы и вес", range: "все рёбра" },
    ],
  },
  "string-kmp": {
    vizTitle: "Префикс-функция (КМП)",
    stepNote: "Шаг = обработка символа s[i]: откаты по j = π[j−1], пока не совпадёт s[j] с s[i].",
    code: `s = "aabaabaaa"
n = len(s)
pi = [0] * n

for i in range(1, n):       # шаг: считаем pi[i]
    j = pi[i - 1]           # длина совпадения
    while j > 0 and s[i] != s[j]:
        j = pi[j - 1]       # откат назад
    if s[i] == s[j]:
        j += 1
    pi[i] = j
print(pi)`,
    variables: [
      { name: "n", role: "длина строки s, для которой строим префикс-функцию", range: "n = len(s)" },
      { name: "i", role: "индекс текущего символа — считаем π[i], идём слева направо", range: "1 … n−1" },
      { name: "j", role: "длина текущего наилучшего совпавшего префикса (начинаем с j = π[i−1])", range: "0 … i" },
      { name: "π[i]", role: "префикс-функция: длина наибольшего префикса, который одновременно и суффикс s[0…i]", range: "заполняется таблица" },
    ],
  },
  "string-z-func": {
    vizTitle: "Z-функция",
    stepNote: "Шаг = вычисление z[i]: внутри Z-блока [l, r] берём инициализацию из z[i−l], потом досчитаем в лоб.",
    code: `s = "abacaba"
n = len(s)
z = [0] * n
l = r = 0                   # правый Z-блок [l, r]

for i in range(1, n):       # шаг: вычисляем z[i]
    if i <= r:
        z[i] = min(r - i + 1, z[i - l])   # из блока
    while i + z[i] < n and s[z[i]] == s[i + z[i]]:
        z[i] += 1           # досчёт в лоб
    if i + z[i] - 1 > r:
        l, r = i, i + z[i] - 1
print(z)`,
    variables: [
      { name: "n", role: "длина строки s", range: "n = len(s)" },
      { name: "i", role: "позиция, для которой считаем z[i]", range: "1 … n−1" },
      { name: "l, r", role: "правый крайний Z-блок: отрезок, совпадающий с префиксом, с максимальным r", range: "l ≤ i ≤ r" },
      { name: "z[i]", role: "длина наибольшего общего префикса строки и суффикса с позиции i", range: "0 … n−i" },
    ],
  },
  "aho-corasick": {
    vizTitle: "Ахо—Корасик",
    stepNote: "Шаг = построение бора по образцам, затем BFS-обход, натягивающий суффиксные ссылки (водопад «лосося»).",
    code: `trie = {"": {}}             # бор: вершина → переходы
state, c = "", "a"          # шаг: автомат идёт по символу

nxt = trie.get(state, {}).get(c, "")   # go(state, c) с суф. ссылкой
print(f"δ({state!r}, {c!r}) → {nxt!r}")`,
    variables: [
      { name: "state", role: "текущее состояние автомата — вершина бора", range: "0 … число вершин" },
      { name: "c", role: "очередной символ текста — переход из state по c", range: "алфавит образцов" },
      { name: "go(v, c)", role: "функция перехода автомата с учётом суффиксных ссылок", range: "мемоизируется" },
    ],
  },
  "complexity-classes": {
    variables: [],
  },
  intro: {
    // мнемокарточки без шагов алгоритма
    variables: [],
  },
  "alg-map": {
    variables: [],
  },
};

/** Безопасный доступ: страница без записи получает пустую синхронизацию. */
export const getPageSync = (chapterId?: string | null): PageSync =>
  (chapterId && PAGE_SYNC[chapterId]) || { variables: [] };

/**
 * Стартовое содержимое редактора для страницы.
 *
 * Формат: короткий комментарий-шапка + МИНИМАЛЬНЫЙ исполняемый скелет,
 * строки которого идут шаг-в-шаг с подсветкой визуализации
 * (i = 0, j = 0…; структуры вида «4 ключа → значение» для 2D).
 * Никаких словесных описаний внутри — только код.
 */
export function buildSyncTemplate(chapterId: string, chapterTitle: string): string {
  const sync = getPageSync(chapterId);

  const head = sync.vizTitle
    ? `# «${chapterTitle}»\n# демо: ${sync.vizTitle} · строки ниже = шаги подсветки\n`
    : `# «${chapterTitle}»\n# демо на странице нет — свободный режим (стрелки ← → листают страницы)\n`;

  if (!sync.code) return head;
  return `${head}\n${sync.code}\n`;
}
