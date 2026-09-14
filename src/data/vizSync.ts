/**
 * Захардкоженная «карта синхронизации» компилятора с визуализациями.
 *
 * Для каждой страницы (главы) здесь вручную перечислены имена переменных,
 * которые понимает её визуализация: i, j, k, v, dist, P, st и т.д.
 * Компилятор выполняет любой Python-код и передаёт реальные значения этих
 * имён напрямую; привязки к номерам или тексту строк эталона больше нет.
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
  /** Полный референсный Python-код, который кнопка-глаз вставляет в редактор. */
  code?: string;
}

/** Справочные значения, указанные внутри самих симуляторов (демо-графы, строки и т.п.). */
export const PAGE_SYNC: Record<string, PageSync> = {
  "segment-trees": {
    vizTitle: "Дерево отрезков: build → query → массовое обновление (Lazy)",
    stepNote: "Шаг = спуск по вершине v: целиком внутри отрезка — пишем tree[v] и вешаем обещание lazy[v]; частичное пересечение — толкаем lazy детям 2·v и 2·v+1.",
    code: `n = 6                       # длина массива демо: [5, 8, 3, 12, 7, 2]
A = [5, 8, 3, 12, 7, 2]
tree = [0] * (4 * n)
lazy = [0] * (4 * n)        # lazy[v] — невыполненное «обещание» для детей
v, l, r = 1, 0, n - 1       # вершина и её отрезок
m = (l + r) // 2            # граница детей 2v, 2v+1
ul, ur, add = 1, 3, 10      # массовое обновление: A[ul..ur] += add (демо)

# --- тело алгоритма ---
def build(v, l, r):
    if l == r:
        tree[v] = A[l]
        return
    m = (l + r) // 2
    build(2 * v, l, m)
    build(2 * v + 1, m + 1, r)
    tree[v] = tree[2 * v] + tree[2 * v + 1]

build(1, 0, n - 1)
print("корень:", tree[1])`,
    variables: [
      { name: "n", role: "длина исходного массива; рекурсивное дерево хранится в tree[1 … 4·n)", range: "n = 6 на демо" },
      { name: "v", role: "текущая вершина дерева — подсвечивается во всех вкладках, включая Lazy", range: "1 … 4·n−1" },
      { name: "l, r", role: "границы отрезка, за который отвечает вершина v", range: "0 … n−1" },
      { name: "m", role: "середина отрезка m = (l + r) // 2 — граница детей", range: "l ≤ m < r" },
      { name: "ul, ur", role: "границы массового обновления (вкладка «Обновление на отрезке»)", range: "0 … n−1" },
      { name: "add", role: "добавка A[ul..ur] += add — питон рулит демонстрацией Lazy", range: "любое число" },
      { name: "lazy", role: "массив обещаний: lazy[v] ≠ 0 — детям ещё не отдано", range: "заполняется демо" },
    ],
  },
  treap: {
    vizTitle: "Treap: плоскость → дерево → Split/Merge/Erase",
    stepNote: "Шаг = вставка очередной пары (x; y) или один шаг спуска в split/erase; i двигает сортировку и соединение.",
    code: `pairs = [(45, 8), (3, 6), (6, 5), (2, 4), (9, 3), (7, 2), (12, 0), (1, -4)]
pairs.sort(key=lambda p: -p[1])      # сортируем по y — убывание приоритета
x, y = 6, 5                          # подсвеченная пара на плоскости
i = 0                                # индекс шага: сортировка / ребро / спуск

def insert(root, x, y):              # вставка спуском по ключу x
    ...                              # ключ <= узла — влево, иначе вправо
def split(t, x):                     # разрез по ключу: L (x <=) и R (x >)
    ...                              # узел целиком уходит в корзину — O(h)`,
    variables: [
      { name: "x", role: "ключ — координата точки по горизонтали; ключ разреза в split, ключ удаляемой вершины в erase", range: "ключи демо-набора: 1…45" },
      { name: "y", role: "приоритет — координата по вертикали (в куче больше = выше)", range: "приоритеты демо-набора: −4…8" },
      { name: "i", role: "индекс шага: сортировка (0…3), проведённое ребро, шаг спуска в split/erase/merge", range: "0 … число шагов − 1" },
    ],
  },
  "splay-tree": {
    vizTitle: "Splay-дерево: большое дерево",
    stepNote: "Шаг = один кадр splay(key): прицел ребра → отстёжка среднего поддерева → поворот.",
    code: `keys = [50, 40, 35, 32, 30, 28, 12, 60, 55, 70, 65, 80, 75, 90]
key = 32                    # какой ключ поднимаем в корень — питон запускает анимацию
i = 0                       # кадр анимации: 0 … (число шагов splay − 1)
case = "zig-zig"            # вкладка «Случаи поворота»: "zig" / "zig-zig" / "zig-zag"

print(f"splay({key}): подъём в корень")`,
    variables: [
      { name: "keys", role: "демо-дерево страницы (BST из 14 узлов)", range: "фиксировано" },
      { name: "key", role: "ключ, который splay поднимает в корень — число, питон запускает покадровую анимацию", range: "любой из keys" },
      { name: "i", role: "номер кадра анимации", range: "0 … шагов−1" },
      { name: "case", role: "случай поворота для вкладки «Случаи»", range: "zig / zig-zig / zig-zag" },
    ],
  },
  "splay-rotations": {
    vizTitle: "Splay: случаи поворота",
    stepNote: "Шаг = один кадр разбора случая: zig (1 поворот), zig-zig / zig-zag (по 2 поворота).",
    code: `case = "zig-zig"            # "zig" / "zig-zig" / "zig-zag"
i = 0                       # номер кадра внутри случая
x, p, g = 20, 40, 60        # узел, родитель, дед — как на схеме в главе

print(f"{case}: кадр {i}, крутим ребро {p}-{g if case == 'zig-zig' else x}")`,
    variables: [
      { name: "case", role: "какой случай крутить: zig / zig-zig / zig-zag", range: "3 значения" },
      { name: "i", role: "номер кадра в разборе случая", range: "0 … кадров−1" },
      { name: "x, p, g", role: "тройка узлов: поднимаемый, его родитель, его дед", range: "числа" },
    ],
  },
  "sparse-table": {
    vizTitle: "Разреженная таблица (1D и 2D)",
    stepNote: "Шаг = одна ячейка st[i][j] = min(st[i][j−1], st[i+2^(j−1)][j−1]) при построении таблицы — как в демонстрации слева.",
    code: `a = [2, 3, 5, 62, 3, 21, 1, 4]
n, LOG = 8, 4
i, j = 0, 0
st = []                       # сюда складываем строки таблицы: пустые клетки — None
for row in a:
    st.append([row] + [None] * (LOG - 1))

for j in range(1, LOG):
    for i in range(n - (1 << j) + 1):
        st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])`,
    variables: [
      { name: "a", role: "исходный массив демо (вкладка 1D)", range: "8 элементов" },
      { name: "n, LOG", role: "длина массива и число уровней таблицы", range: "n = 8, LOG = 4" },
      { name: "i", role: "начало блока: st[i][j] отвечает за отрезок [i, i + 2^j − 1]", range: "0 … n − 2^j" },
      { name: "j", role: "уровень таблицы: блок длины 2^j; st[i][j] = min(st[i][j−1], st[i+2^(j−1)][j−1])", range: "0 … log₂ n" },
      { name: "st", role: "таблица уровней — подсвечивается собираемая ячейка", range: "заполняется по шагам" },
    ],
  },
  "prefix-sums-2d": {
    vizTitle: "Префиксные суммы (1D и 2D)",
    stepNote: "Шаг = заполнение очередного P[i] = P[i−1] + a[i−1] в 1D-демонстрации слева.",
    code: `a = [3, 1, 4, 1, 5, 9, 2, 6]
i = 0

P = [0]
for i in range(1, len(a) + 1):
    P.append(P[i - 1] + a[i - 1])
print("P =", P)`,
    variables: [
      { name: "a", role: "исходный массив демо (вкладка 1D)", range: "8 элементов" },
      { name: "i", role: "индекс элемента, который сейчас прибавляем к префиксу", range: "1 … len(a)" },
      { name: "P", role: "префиксные суммы: P[i] = a[0] + … + a[i−1]; запрос = P[r+1] − P[l]", range: "заполняется по шагам" },
    ],
  },
  "dynamic-programming": {
    vizTitle: "Динамическое программирование (мемоизация)",
    stepNote: "Шаг = событие внутри fibMemo(k): вызов, кэш-хит, база, рекурсия или запись в memo — как в демонстрации слева.",
    code: `n = 5
memo = {}

def fib(k):
    if k in memo:
        return memo[k]
    if k <= 2:
        return 1
    print(f"считаем fib({k-1}) + fib({k-2})")
    r1 = fib(k - 1)
    r2 = fib(k - 2)
    memo[k] = r1 + r2
    return memo[k]

print("итог:", fib(n))`,
    variables: [
      { name: "n", role: "целевой номер числа Фибоначчи", range: "1 … targetN (по умолчанию 5)" },
      { name: "k", role: "аргумент текущего рекурсивного вызова fib(k) — подсвечиваемая ячейка", range: "1 … n" },
      { name: "memo", role: "кэш уже посчитанных значений — кэш-хит отдаёт ответ за O(1)", range: "заполняется снизу вверх" },
      { name: "r1, r2", role: "ответы двух рекурсивных вызовов fib(k−1) и fib(k−2)", range: "числа Фибоначчи" },
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
    stepNote: "Шаг = push новой тарелки на стек или pop — возврат рекурсии на уровень выше.",
    code: `st = []                     # стек = рекурсия DFS (LIFO)
st.append("A")              # push — зашли в вершину
st.append("B")
top = st.pop()              # pop — возврат на уровень выше
print("pop →", top, "стек:", st)`,
    variables: [
      { name: "st", role: "стек (массив): тарелки страницы / вызовы DFS", range: "LIFO" },
      { name: "top", role: "что сняли с вершины — текущий уровень рекурсии", range: "последний push" },
    ],
  },
  "queue-bfs": {
    vizTitle: "Очередь и обход в ширину",
    stepNote: "Шаг = dequeue вершины из головы очереди и enqueue всех её непосещённых соседей.",
    code: `from collections import deque

q = deque(["A"])            # очередь BFS (FIFO)
q.append("B")               # enqueue соседа в хвост
v = q.popleft()             # шаг: обрабатываем голову
print("v =", v, "очередь:", list(q))`,
    variables: [
      { name: "q", role: "очередь (массив): гости страницы / вершины BFS по слоям", range: "FIFO" },
      { name: "v", role: "вершина, извлечённая из головы — обрабатываем её соседей", range: "по слоям от старта" },
    ],
  },
  "graph-dfs-bfs": {
    vizTitle: "DFS и BFS на графе",
    stepNote: "Шаг = переход из текущей вершины v к непосещённому соседу (DFS — вглубь через стек, BFS — по слоям через очередь).",
    code: `adj = {"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "F", "G"], "D": ["B"], "E": ["B"], "F": ["C"], "G": ["C"]}
visited, order = set(), []   # порядок обхода
stack = ["A"]                # DFS: стек (рекурсия)
q = []                       # BFS: очередь (deque)
v = "A"                      # шаг: достали вершину из стека/очереди

# --- тело алгоритма ---
while stack:                 # ---- DFS ----
    v = stack.pop()
    if v in visited:
        continue
    visited.add(v)
    order.append(v)
    stack += [u for u in adj[v] if u not in visited]
print("DFS:", order)

visited, order, q = set(), [], ["A"]   # ---- BFS ----
while q:
    v = q.pop(0)
    if v in visited:
        continue
    visited.add(v)
    order.append(v)
    q += [u for u in adj[v] if u not in visited]
print("BFS:", order)`,
    variables: [
      { name: "adj", role: "список смежности демо-графа страницы (A…G)", range: "7 вершин" },
      { name: "v", role: "текущая вершина обхода — подсвечивается на графе", range: "A … G" },
      { name: "stack", role: "стек DFS: последний зашёл — первый вышел", range: "LIFO" },
      { name: "q", role: "очередь BFS: первый зашёл — первый вышел", range: "FIFO" },
      { name: "visited / order", role: "множество посещённых и порядок обхода", range: "растут по шагам" },
    ],
  },
  "graph-components": {
    vizTitle: "Компоненты связности: BFS-разметка",
    stepNote: "Шаг = вершина извлечена из очереди или сосед получил метку comp; каждый перезапуск BFS = новая компонента.",
    code: `from collections import deque

# демо-граф страницы: три «острова» A-D, E-G, H-J
adj = {"A": ["B", "C", "D"], "B": ["A", "C"], "C": ["A", "B", "D"], "D": ["A", "C"],
       "E": ["F", "G"], "F": ["E", "G"], "G": ["E", "F"], "H": ["I"], "I": ["H", "J"], "J": ["I"]}
comp = {}                    # comp[v] — номер компоненты
count = 0                    # сколько раз запускали обход
v, q = None, []              # текущая вершина и очередь BFS

# --- тело алгоритма ---
for s in adj:
    if s in comp:
        continue
    count += 1
    q = deque([s])
    comp[s] = count - 1
    while q:
        v = q.popleft()
        for to in adj[v]:
            if to not in comp:
                comp[to] = comp[v]
                q.append(to)
print(comp, "компонент:", count)`,
    variables: [
      { name: "v", role: "текущая вершина обхода — подсвечивается на графе", range: "A … J" },
      { name: "comp", role: "словарь меток: номер компоненты каждой вершины", range: "красится по ходу" },
      { name: "q", role: "текущая очередь BFS", range: "метки вершин" },
      { name: "count", role: "число запусков обхода = число компонент", range: "1 … 3 на демо" },
    ],
  },
  "top-sort": {
    vizTitle: "Топологическая сортировка",
    stepNote: "Шаг = выход рекурсии из вершины v: она дописывается в order, потом order разворачивается.",
    code: `adj = {0: [1, 2], 1: [3], 2: [3], 3: [4], 4: []}   # демо-граф страницы
used, order = set(), []

def dfs(v):
    used.add(v)
    for to in adj[v]:       # шаг: ребро v → to
        if to not in used:
            dfs(to)
    order.append(v)         # выход из v!

# --- тело алгоритма ---
for v in adj:
    if v not in used:
        dfs(v)
print(order[::-1])          # разворот — ответ`,
    variables: [
      { name: "v", role: "текущая вершина DFS — подсвечивается на графе", range: "0 … 4 на демо" },
      { name: "to", role: "вершина, куда ведёт ребро из v", range: "adj[v]" },
      { name: "order", role: "порядок выхода из рекурсии; после разворота — топологический порядок", range: "растёт по шагам" },
      { name: "used", role: "множество посещённых вершин", range: "пополняется" },
    ],
  },
  "scc-kosaraju": {
    vizTitle: "Компоненты сильной связности (Косарайю)",
    stepNote: "Шаг = вершина из order (в обратном порядке) запускает DFS по транспонированному графу и красит свою SCC.",
    code: `adj = {0: [1], 1: [2], 2: [0, 3], 3: [4], 4: [3]}   # демо-граф: SCC {0,1,2} и {3,4}
order, used = [], set()

def dfs1(v):                 # проход 1: порядок выхода
    used.add(v)
    for to in adj[v]:
        if to not in used:
            dfs1(to)
    order.append(v)

# --- тело алгоритма ---
for v in adj:
    if v not in used:
        dfs1(v)

adjT = {v: [] for v in adj}  # транспонированный граф
for v in adj:
    for to in adj[v]:
        adjT[to].append(v)

used = set()
comp = {}
num = 0
for v in reversed(order):    # проход 2: по order задом наперёд
    if v in used:
        continue
    num += 1
    stack = [v]
    used.add(v)
    while stack:
        u = stack.pop()
        comp[u] = num
        for to in adjT[u]:
            if to not in used:
                used.add(to)
                stack.append(to)
print("компонент:", num, comp)`,
    variables: [
      { name: "v", role: "текущая вершина DFS (проход 1 или 2)", range: "0 … 4 на демо" },
      { name: "order", role: "порядок выхода прохода 1 — по нему запускаем проход 2", range: "растёт" },
      { name: "adjT", role: "транспонированный граф: все рёбра развёрнуты", range: "те же вершины" },
      { name: "comp", role: "номер SCC каждой вершины", range: "{0,1,2} и {3,4} на демо" },
    ],
  },
  "graph-articulation": {
    vizTitle: "Точки сочленения",
    stepNote: "Шаг = обновление low[v] по ребру; вершина v — точка сочленения, когда low[to] ≥ tin[v] (v — не корень DFS).",
    code: `# демо-граф страницы: треугольник 0-1-2, мост 2-3, мост 3-4, треугольник 4-5-6
# DFS из 0: tin/low после полного обхода; точки сочленения — 2, 3 и 4
tin = {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7}
low = {0: 1, 1: 1, 2: 1, 3: 4, 4: 5, 5: 5, 6: 5}

v, to = 3, 4                # шаг: возврат из 4 в 3
is_cut = low[to] >= tin[v]          # 5 >= 4 → 3 — точка сочленения!
v2, to2 = 1, 2
is_cut2 = low[to2] >= tin[v2]       # 1 >= 2 → нет (1 спасает обратное ребро 2-0)
print(f"v={v}: точка сочленения? {is_cut}; v={v2}: {is_cut2}")`,
    variables: [
      { name: "tin", role: "время захода DFS в вершину", range: "1 … 7" },
      { name: "low", role: "минимальный tin, достижимый из поддерева", range: "≤ tin" },
      { name: "v, to", role: "ребро дерева DFS: проверяем, выживает ли поддерево to без v", range: "v — родитель" },
      { name: "is_cut", role: "low[to] ≥ tin[v] и v — не корень ⇒ v — точка сочленения", range: "True/False" },
    ],
  },
  "bridges-code": {
    vizTitle: "Мосты: DFS + tin/low",
    stepNote: "Шаг = строка псевдокода слева; ребро (v, to) — мост, когда low[to] > tin[v].",
    code: `# демо-граф страницы: A-B, B-C, A-C, C-D, D-E, E-F, F-D, B-G
# DFS из A: tin/low после полного обхода
tin = {"A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7}
low = {"A": 1, "B": 1, "C": 1, "D": 4, "E": 4, "F": 4, "G": 7}

v, to = "B", "G"            # шаг: возврат из G в B (G — лист)
is_bridge = low[to] > tin[v]        # 7 > 2 → мост!
v2, to2 = "C", "D"
is_bridge2 = low[to2] > tin[v2]     # 4 > 3 → C-D тоже мост
print(f"{v}-{to}: мост? {is_bridge}; {v2}-{to2}: мост? {is_bridge2}")`,
    variables: [
      { name: "tin", role: "время захода DFS в вершину", range: "1 … 7" },
      { name: "low", role: "минимальный tin, достижимый из поддерева обратными рёбрами", range: "≤ tin" },
      { name: "v, to", role: "ребро дерева DFS, для которого проверяем условие моста", range: "v — родитель, to — сын" },
      { name: "is_bridge", role: "low[to] > tin[v] ⇒ из поддерева to не добраться выше v без этого ребра", range: "True/False" },
    ],
  },
  "euler-path-vs-cycle": {
    vizTitle: "Эйлеров путь и цикл",
    stepNote: "Шаг = один клик по следующей вершине маршрута; ребро при этом «сгорает».",
    code: `edges = [("A","B"), ("A","C"), ("B","C"), ("B","D"), ("C","E"), ("D","E")]
path = ["A", "B", "C"]      # маршрут: рисуется на графе целиком
deg = {v: 0 for v in "ABCDE"}
for u, v in edges:          # степени вершин
    deg[u] = deg.get(u, 0) + 1
    deg[v] = deg.get(v, 0) + 1

odd = []
for v in deg:
    if deg[v] % 2:
        odd.append(v)
print(deg, "нечётных:", len(odd))
# 0 нечётных → цикл · 2 → путь · иначе — нельзя`,
    variables: [
      { name: "path", role: "маршрут списком меток вершин — рисуется на графе целиком", range: '["A", "B", …]' },
      { name: "deg", role: "степень вершины: чётная всюду → эйлеров цикл, ровно две нечётные → эйлеров путь", range: "считается по рёбрам" },
    ],
  },
  "planarity-euler-formula": {
    vizTitle: "Планарность: K5/K3,3 + раскраска",
    stepNote: "Шаг = проверка формулы Эйлера для K5/K3,3 или покраска очередной вершины v в цвет color[v].",
    code: `V, E = 5, 10                # K5   (K3,3: V=6, E=9)
F = 2 - V + E               # формула: V − E + F = 2
not_planar = E > 3 * V - 6  # 10 > 9 → K5 непланарен

# покраска (вторая демонстрация страницы):
# смежности демо-графа из 7 вершин A..G
adj = [[1, 4, 5], [0, 2, 5], [1, 3, 5, 6], [2, 4, 5, 6],
       [3, 0, 5], [0, 1, 2, 3, 4, 6], [2, 3, 5]]
color = [-1] * 7            # color[v] — цвет вершины (0=красный, 1=синий…)
k, v = 0, 0                 # сколько цветов использовано; красимая вершина
for v in range(7):          # жадная раскраска
    used = {color[u] for u in adj[v] if color[u] >= 0}
    c = 0
    while c in used: c += 1
    color[v] = c
    k = max(k, c + 1)`,
    variables: [
      { name: "V", role: "число вершин графа", range: "K5: 5 · K3,3: 6" },
      { name: "E", role: "число рёбер", range: "K5: 10 · K3,3: 9" },
      { name: "F", role: "число граней в плоской укладке", range: "V − E + F = 2" },
      { name: "v", role: "вершина, которую красят (метка A…G или номер 0…6)", range: "0 … 6" },
      { name: "color", role: "массив/словарь цветов вершин: −1 не покрашена, 0..3 — цвет", range: "−1 … 3" },
      { name: "k", role: "сколько цветов уже использовано; для планарного ≤ 4", range: "1 … 4" },
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
    code: `# рёбра демо-графа страницы (включая коварное обратное D→A = −2)
E = [("S", "A", 4), ("S", "B", 5), ("B", "C", -2), ("A", "C", 1),
     ("C", "D", 3), ("C", "E", 4), ("D", "F", 2), ("E", "F", 1), ("D", "A", -2)]
n = 7                        # вершин: S, A, B, C, D, E, F → ровно n−1 итераций
dist = {"S": 0}
u, v, w = E[0]               # шаг: очередное ребро (u → v, вес w)
i = 1                        # номер итерации

# --- тело алгоритма ---
for i in range(1, n):        # n−1 прохода по всем рёбрам
    for u, v, w in E:
        if dist.get(u, float("inf")) + w < dist.get(v, float("inf")):
            dist[v] = dist[u] + w   # релаксация
print(dist)
# n-й проход улучшил бы dist ⇒ отрицательный цикл (на этом графе его нет)`,
    variables: [
      { name: "E", role: "список рёбер (u, v, w) — демо-граф страницы", range: "9 рёбер" },
      { name: "n", role: "число вершин: после n−1 итераций все кратчайшие пути точны", range: "7" },
      { name: "i", role: "номер итерации: после i итераций точны пути из ≤ i рёбер", range: "1 … n−1" },
      { name: "u, v, w", role: "текущее ребро: откуда, куда и его вес", range: "перебор E" },
      { name: "dist", role: "расстояния от S; улучшение на n-й итерации = отрицательный цикл", range: "словарь" },
    ],
  },
  "floyd": {
    vizTitle: "Флойд на матрице аэропортов",
    stepNote: "Шаг = проверка пары (i, j) при посреднике k: клетка d[i][j] перекрашивается, если путь через k короче.",
    code: `INF = 999                   # «бесконечность»: 999 + 999 = 1998 всё равно > любой настоящей клетки,
                            # поэтому отдельные проверки «нет ребра» не нужны — if сам их отсеет
d = [[0, 4, INF, 2, INF, INF, INF], [INF, 0, 3, INF, INF, 3, INF], [INF, INF, 0, INF, 2, INF, INF], [INF, INF, INF, 0, 4, 2, INF], [INF, INF, INF, INF, 0, INF, 1], [INF, INF, INF, INF, INF, 0, 5], [INF, 1, INF, INF, INF, INF, 0]]
n = 7
k, i, j = 0, 0, 0            # шаг: посредник k, летим из i в j

# --- тело алгоритма ---
for k in range(n):           # посредник k
    for i in range(n):
        for j in range(n):
            if d[i][k] + d[k][j] < d[i][j]:   # через k короче — переприсваиваем
                d[i][j] = d[i][k] + d[k][j]
print("итог: все пары посчитаны")`,
    variables: [
      { name: "d", role: "матрица смежности → кратчайшие пути между всеми парами", range: "7×7, INF = 999" },
      { name: "n", role: "число вершин (аэропортов)", range: "7" },
      { name: "k", role: "посредник: разрешённые пути идут только через вершины ≤ k", range: "0 … 6" },
      { name: "i, j", role: "клетка d[i][j], которую проверяем — подсвечивается в матрице", range: "0 … 6" },
      { name: "d[i][j]", role: "текущая длина кратчайшего пути i → j", range: "уменьшается по шагам" },
    ],
  },
  "johnson-algo": {
    vizTitle: "Алгоритм Джонсона (перевзвешивание)",
    stepNote: "Шаг = Беллман-Форд из фиктивной вершины считает h[v], затем n запусков Дейкстры в новых весах.",
    code: `# демо-граф страницы: S→{A,B,C} (0), A→B=−2, B→C=1, C→A=2
# потенциалы — реальные расстояния от фиктивной S (Беллман-Форд):
h = {"A": 0, "B": -2, "C": -1}

u, v, w = "A", "B", -2       # ребро с отрицательным весом
w_new = w + h[u] - h[v]      # w′ = w + h[u] − h[v] = −2 + 0 + 2 = 0
print(f"w'({u}->{v}) = {w_new}")
# остальные: B->C: 1 + (-2) - (-1) = 0 · C->A: 2 + (-1) - 0 = 1 — все ≥ 0
# после Дейкстры ответ = d[v] − h[start] + h[v]`,
    variables: [
      { name: "h", role: "потенциалы: кратчайшие пути от фиктивной вершины S; убирают минусы", range: "h(A)=0, h(B)=−2, h(C)=−1" },
      { name: "u, v, w", role: "ребро (u, v) перевзвешивается: w′ = w + h[u] − h[v]", range: "все рёбра" },
      { name: "w_new", role: "новый вес — всегда ≥ 0, кратчайшие пути те же", range: "≥ 0" },
      { name: "d[v]", role: "расстояние Дейкстры в новых весах; истинный ответ: d[v] − h[start] + h[v]", range: "обратное перевзвешивание" },
    ],
  },
  "mst-kruskal": {
    vizTitle: "Краскал и DSU",
    stepNote: "Шаг = следующее ребро из отсортированных: если концы в разных компонентах — берём в остов.",
    code: `# демо-граф страницы: 9 вершин A..I, 12 рёбер
E = [(2, "A", "B"), (3, "D", "E"), (4, "B", "C"), (5, "A", "D"), (6, "B", "E"),
     (7, "E", "F"), (8, "D", "G"), (9, "C", "F"), (10, "G", "H"), (11, "E", "H"),
     (12, "H", "I"), (13, "F", "I")]
E.sort()                     # сортируем по весу
parent = {v: v for v in "ABCDEFGHI"}   # DSU: каждый сам себе корень
w, u, v = E[0]               # шаг: очередное ребро
i = 0

# --- тело алгоритма ---
def find(x):
    while parent[x] != x:
        parent[x] = parent[x]   # сжатие пути
        x = parent[x]
    return x

mst = []
for i, (w, u, v) in enumerate(E):
    if find(u) != find(v):  # разные компоненты → берём
        parent[find(u)] = find(v)
        mst.append((w, u, v))
print("остов:", mst, "вес:", sum(w for w, _, _ in mst))  # вес 51`,
    variables: [
      { name: "E", role: "рёбра демо-графа, отсортированные по весу", range: "12 рёбер, веса 2…13" },
      { name: "w, u, v", role: "текущее ребро: вес и концы — подсвечивается на графе", range: "перебор E" },
      { name: "i", role: "индекс текущего ребра в отсортированном списке", range: "0 … 11" },
      { name: "parent", role: "DSU: представитель компоненты вершины", range: "сжатие путей" },
      { name: "mst", role: "рёбра остова; в ответе ровно n−1 = 8 рёбер, вес 51", range: "8 рёбер" },
    ],
  },
  "mst-prima": {
    vizTitle: "Прим",
    stepNote: "Шаг = из кучи достаётся самое лёгкое ребро, ведущее из выращенного дерева наружу.",
    code: `import heapq

# смежность демо-графа страницы: 9 вершин A..I
adj = {"A": [(2, "B"), (5, "D")], "B": [(2, "A"), (4, "C"), (6, "E")],
       "C": [(4, "B"), (9, "F")], "D": [(5, "A"), (3, "E"), (8, "G")], "E": [(6, "B"), (3, "D"), (7, "F"), (11, "H")],
       "F": [(7, "E"), (9, "C"), (13, "I")], "G": [(8, "D"), (10, "H")], "H": [(10, "G"), (11, "E"), (12, "I")],
       "I": [(12, "H"), (13, "F")]}
heap = [(0, "A", "-")]       # (вес, вершина, откуда)
taken, mst = set(), []
w, v, parent = 2, "B", "A"   # шаг: ребро из кучи
i = 0

# --- тело алгоритма ---
while heap and len(taken) < len(adj):
    w, v, parent = heapq.heappop(heap)
    if v in taken:
        continue
    taken.add(v)
    if parent != "-":
        mst.append((w, parent, v))
    for w2, u in adj[v]:
        if u not in taken:
            heapq.heappush(heap, (w2, u, v))
print("остов:", mst, "вес:", sum(w for w, _, _ in mst))  # вес 51`,
    variables: [
      { name: "adj", role: "список смежности демо-графа: (вес, сосед)", range: "9 вершин" },
      { name: "w, v, parent", role: "ребро из кучи: вес, новая вершина, откуда — подсвечивается", range: "min кучи" },
      { name: "heap", role: "приоритетная очередь кандидатов наружу", range: "куча" },
      { name: "taken", role: "вершины уже в дереве — «заражено плесенью»", range: "растёт до 9" },
      { name: "mst", role: "рёбра остова, вес 51", range: "8 рёбер" },
    ],
  },
  "mst-boruvka": {
    vizTitle: "Борувка",
    stepNote: "Шаг = каждая компонента одновременно выбирает своё самое дешёвое исходящее ребро.",
    code: `# демо-граф страницы: 9 вершин A..I, 12 рёбер
E = [(2, "A", "B"), (3, "D", "E"), (4, "B", "C"), (5, "A", "D"), (6, "B", "E"),
     (7, "E", "F"), (8, "D", "G"), (9, "C", "F"), (10, "G", "H"), (11, "E", "H"),
     (12, "H", "I"), (13, "F", "I")]
comp = {v: v for v in "ABCDEFGHI"}   # каждая вершина — своё племя
cheapest = {}                # компонента → её самое дешёвое ребро наружу
u, v, w = "A", "B", 2        # шаг: ребро-кандидат
phase = 1

# --- тело алгоритма ---
def find(x):
    while comp[x] != x:
        comp[x] = comp[comp[x]]
        x = comp[x]
    return x

while len({find(v) for v in comp}) > 1:
    cheapest = {}
    for w, u, v in E:        # каждая компонента выбирает лучшее своё ребро
        ru, rv = find(u), find(v)
        if ru == rv:
            continue
        if ru not in cheapest or cheapest[ru][0] > w:
            cheapest[ru] = (w, u, v)
        if rv not in cheapest or cheapest[rv][0] > w:
            cheapest[rv] = (w, u, v)
    for ru, (w, u, v) in cheapest.items():   # все слияния — разом
        comp[find(u)] = find(v)
    print(f"фаза {phase}: осталось компонент", len({find(v) for v in comp}))
    phase += 1
print("готово за", phase - 1, "фазы (на демо — 2)")`,
    variables: [
      { name: "E", role: "рёбра демо-графа", range: "12 рёбер" },
      { name: "comp", role: "DSU: номер компоненты (племени) вершины", range: "сливается за фазы" },
      { name: "cheapest", role: "самое дешёвое исходящее ребро каждой компоненты", range: "обновляется за фазу" },
      { name: "u, v, w", role: "ребро-кандидат: концы и вес", range: "перебор E" },
      { name: "phase", role: "номер фазы параллельных слияний", range: "1 … log n (на демо 2)" },
    ],
  },
  "string-kmp": {
    vizTitle: "Префикс-функция (КМП)",
    stepNote: "Шаг = обработка символа s[i]: откаты по j = π[j−1], пока не совпадёт s[j] с s[i].",
    code: `pattern = "aba"
text = "abacaba"
s = pattern + "#" + text    # демо-страница ищет pattern в text
i, j = 1, 0
pi = [None] * len(s)        # пустые клетки: значения появятся по шагам
pi[0] = 0

# --- тело алгоритма ---
for i in range(1, len(s)):  # шаг: считаем pi[i]
    j = pi[i - 1]           # длина совпадения
    while j > 0 and s[i] != s[j]:
        j = pi[j - 1]       # откат назад
    if s[i] == s[j]:
        j += 1
    pi[i] = j
print(pi)`,
    variables: [
      { name: "pattern", role: "образец: питон подставляет его в симулятор страницы", range: "строка" },
      { name: "text", role: "текст, в котором ищем", range: "строка" },
      { name: "s", role: "склейка pattern + \"#\" + text — по ней строится таблица", range: "pattern#text" },
      { name: "i", role: "индекс текущего символа — считаем π[i]", range: "1 … len(s)−1" },
      { name: "j", role: "длина текущего совпавшего префикса", range: "0 … i" },
      { name: "pi", role: "префикс-функция: π[i] — наибольший префикс, он же суффикс s[0…i]", range: "заполняется по шагам" },
    ],
  },
  "string-z-func": {
    vizTitle: "Z-функция",
    stepNote: "Шаг = вычисление z[i]: внутри Z-блока [l, r] берём инициализацию из z[i−l], потом досчитаем в лоб.",
    code: `pattern = "aba"
text = "abacaba"
s = pattern + "#" + text    # демо-страница ищет pattern в text
i, l, r = 1, 0, 0           # правый Z-блок [l, r]
z = [None] * len(s)         # пустые клетки: значения появятся по шагам
z[0] = 0

# --- тело алгоритма ---
for i in range(1, len(s)):  # шаг: вычисляем z[i]
    if i <= r:
        z[i] = min(r - i + 1, z[i - l])   # из блока
    else:
        z[i] = 0            # свежая клетка: с нуля
    while i + z[i] < len(s) and s[z[i]] == s[i + z[i]]:
        z[i] += 1           # досчёт в лоб
    if i + z[i] - 1 > r:
        l, r = i, i + z[i] - 1
print(z)`,
    variables: [
      { name: "pattern", role: "образец: питон подставляет его в симулятор страницы", range: "строка" },
      { name: "text", role: "текст, в котором ищем", range: "строка" },
      { name: "s", role: "склейка pattern + \"#\" + text", range: "pattern#text" },
      { name: "i", role: "позиция, для которой считаем z[i]", range: "1 … len(s)−1" },
      { name: "l, r", role: "правый Z-блок: отрезок, совпадающий с префиксом, с максимальным r", range: "l ≤ i ≤ r" },
      { name: "z", role: "z[i] — длина общего префикса строки и суффикса с позиции i", range: "заполняется по шагам" },
    ],
  },
  "aho-corasick": {
    vizTitle: "Ахо—Корасик",
    stepNote: "Шаг = построение бора по образцам, затем BFS-обход, натягивающий суффиксные ссылки (водопад «лосося»).",
    code: `s = "USHERS"               # текст, в котором ищем образцы
i, v = 0, 0                 # позиция в тексте и вершина автомата
trie = {"": {}}             # бор: вершина → переходы
state, c = "", "u"          # шаг: автомат идёт по символу

nxt = trie.get(state, {}).get(c, "")   # go(state, c) с суф. ссылкой
print(f"шаг {i + 1}: v={v}, символ {c!r} → {nxt!r}")`,
    variables: [
      { name: "s", role: "текст для поиска (можно и text = ...) — подставляется в симулятор", range: "A-Z, демо: USHERS" },
      { name: "i", role: "текущая позиция в тексте — лосось стоит на этом символе", range: "0 … len(s)" },
      { name: "v", role: "номер текущей вершины автомата (можно node = ...)", range: "0 … число вершин" },
      { name: "c / state", role: "символ и состояние — как в эталонном коде ниже", range: "алфавит образцов" },
    ],
  },
  "complexity-classes": {
    vizTitle: "Классы сложности: матрёшка P ⊆ NP ⊆ PSPACE",
    stepNote: "Шаг = подсветка класса/задачи по имени или стрелки сведения между парой задач.",
    code: `cls = "NP"                  # класс: "P", "NP", "PSPACE", "EXPTIME"
task = "3-SAT"              # задача: "3-SAT", "Vertex Cover", …

# сведение A ≤p B: стрелка между задачами
reductions = [("3-SAT", "Vertex Cover")]
for a, b in reductions:
    print(f"{a} ≤p {b}")`,
    variables: [
      { name: "cls", role: "какой класс подсветить: P / NP / PSPACE / EXPTIME", range: "4 значения" },
      { name: "task", role: "какую задачу подсветить: 3-SAT, Vertex Cover, Рюкзак…", range: "задачи на диаграмме" },
      { name: "reductions", role: "список пар задач — подсвеченные стрелки сведения A ≤p B", range: "[(A, B), …]" },
    ],
  },
  intro: {
    // мнемокарточки без шагов алгоритма
    variables: [],
  },
  "alg-map": {
    variables: [],
  },

  /* ── Дополнительные демонстрации внутри страниц (вкладки) ─────────────── */

  "sparse-table#2d-build": {
    vizTitle: "Разреженная таблица 2D: построение",
    stepNote: "Шаг = новый уровень k: блоки 2^k×2^k дописываются из четырёх квадрантов предыдущего уровня.",
    code: `A = [[45, 12, 88, 34, 11, 76, 23, 90], [67, 19, 44, 55, 33, 21, 65, 87], [14, 51, 99, 13, 22, 64, 43, 76], [89, 32, 54, 71, 15, 88, 29, 60], [25, 41, 16, 92, 9, 17, 56, 31], [59, 18, 77, 24, 61, 82, 35, 12], [73, 8, 38, 85, 47, 95, 19, 58], [39, 81, 62, 28, 51, 42, 85, 14]]
r, c, k = 0, 0, 0
st2 = {}                       # пустой каркас виден до начала построения

# --- тело алгоритма ---
# База не отдельный уровень вычислений: блок 1×1 — это сама A[r][c].
# Записываем её одним шагом, а не проигрываем 64 однотипных присваивания.
# Генератор остаётся отдельным фреймом и не конфликтует с sys.settrace в Python 3.12.
st2.update(dict(((r, c, 0, 0), A[r][c]) for r in range(8) for c in range(8)))

for k in range(1, 4):
    print(f"уровень k={k}: блоки {1 << k}x{1 << k}")
    size = 9 - (1 << k)
    half = 1 << (k - 1)
    for r in range(size):
        for c in range(size):
            st2[(r, c, k, k)] = min(st2[(r, c, k - 1, k - 1)], st2[(r + half, c, k - 1, k - 1)], st2[(r, c + half, k - 1, k - 1)], st2[(r + half, c + half, k - 1, k - 1)])`,
    variables: [
      { name: "r, c", role: "левый верхний угол блока, для которого считаем минимум", range: "0 … 8−2^k" },
      { name: "k", role: "уровень: блоки 2^k × 2^k (шаг демонстрации)", range: "0 … 3" },
      { name: "st2[(r,c,k,k)]", role: "минимум квадратного блока — склеен из четырёх квадрантов уровня k−1", range: "4 ключа → значение" },
    ],
  },
  "sparse-table#2d-query": {
    vizTitle: "Разреженная таблица 2D: запрос",
    stepNote: "Демонстрация кликабельна вручную: выберите прямоугольник и смотрите разложение на блоки.",
    code: `# st2[(r, c, kx, ky)] из вкладки «построение» — min блока 2^kx × 2^ky
r1, c1, r2, c2 = 1, 1, 6, 6

h, w = r2 - r1 + 1, c2 - c1 + 1
kx, ky = h.bit_length() - 1, w.bit_length() - 1
print(f"прямоугольник {h}×{w} кроется блоками уровня ({kx},{ky})")`,
    variables: [
      { name: "r1, c1, r2, c2", role: "углы запрашиваемого прямоугольника", range: "индексы матрицы" },
      { name: "kx, ky", role: "уровень самого крупного блока, который влезает в высоту/ширину", range: "log₂ размеров" },
    ],
  },
  "prefix-sums-2d#2d": {
    vizTitle: "Префиксные суммы 2D (прямоугольники)",
    stepNote: "Демонстрация кликабельна вручную: наведите на ячейку — подсветятся её четыре угла формулы.",
    code: `A = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 1, 2, 3], [4, 5, 6, 7]]
n, m = 4, 4
i, j = 0, 0
S = []                        # строки таблицы: рамка из нулей, рабочие клетки пустые (None)
for rr in range(n + 1):
    S.append([0] + [None] * m)
S[0] = [0] * (m + 1)
for i in range(1, n + 1):
    for j in range(1, m + 1):
        S[i][j] = A[i - 1][j - 1] + S[i - 1][j] + S[i][j - 1] - S[i - 1][j - 1]

r1, c1, r2, c2 = 1, 1, 2, 2   # клетки 1-индексные, как в таблице S
ans = S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1]
print("итого:", ans)`,
    variables: [
      { name: "i, j", role: "текущая ячейка таблицы S (1-индексация)", range: "1 … n, 1 … m" },
      { name: "S[i][j]", role: "сумма прямоугольника (0,0)–(i−1,j−1) — по двум соседям минус перекрытие", range: "пересчёт на каждом шаге" },
      { name: "r1, c1, r2, c2", role: "углы запроса в 1-индексных клетках (как в таблице S); ответ = четыре угла формулы включений-исключений", range: "1 … n, 1 … m" },
    ],
  },
};

/** Безопасный доступ: страница без записи получает пустую синхронизацию. */
export const getPageSync = (chapterId?: string | null, demoId?: string | null): PageSync =>
  (demoId && chapterId && PAGE_SYNC[`${chapterId}#${demoId}`]) ||
  (chapterId && PAGE_SYNC[chapterId]) ||
  { variables: [] };

/**
 * Стартовое содержимое редактора для страницы.
 *
 * Формат: короткий комментарий-шапка + исполняемый референсный код.
 * Визуализация читает из его трассы знакомые имена (i, j, k, P, st…),
 * но точно так же примет пользовательский код с теми же именами.
 */
export function buildSyncTemplate(chapterId: string, chapterTitle: string, demoId?: string | null): string {
  const sync = getPageSync(chapterId, demoId);

  const head = sync.vizTitle
    ? `# «${chapterTitle}»\n# демо: ${sync.vizTitle} · связь по именам переменных\n`
    : `# «${chapterTitle}»\n# демо на странице нет — свободный Python\n`;

  if (!sync.code) return head;
  return `${head}\n${sync.code}\n`;
}

/**
 * Инициализация скелета: только объявление демо-данных, без тела алгоритма
 * (без for/while/def/if/print). Именно это показывается в редакторе по
 * умолчанию — дальше пользователь пишет свой вариант, а кнопка-«глаз»
 * заменяет редактор полным референсным кодом.
 */
function extractInit(code: string): string {
  const keep: string[] = [];
  for (const line of code.split("\n")) {
    const t = line.trim();
    if (t === "# --- тело алгоритма ---" || /^(for|while|def|class|if\s|elif\s|else|try|except|print\()/.test(t)) break;
    keep.push(line);
  }
  // убрать пустые строки с конца
  while (keep.length > 0 && keep[keep.length - 1].trim() === "") keep.pop();
  return keep.join("\n");
}

/**
 * Дефолтное содержимое редактора: шапка + ТОЛЬКО инициализированные
 * переменные демо (без всего кода алгоритма).
 */
export function buildInitTemplate(chapterId: string, chapterTitle: string, demoId?: string | null): string {
  const sync = getPageSync(chapterId, demoId);

  const head = sync.vizTitle
    ? `# «${chapterTitle}»\n# демо: ${sync.vizTitle}\n# ниже — инициализация; допишите свой код или вставьте референс кнопкой-глазом\n`
    : `# «${chapterTitle}»\n# демо на странице нет — свободный Python\n`;

  if (!sync.code) return head;
  const init = extractInit(sync.code);
  return `${head}\n${init}\n`;
}
