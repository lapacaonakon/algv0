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
    vizTitle: "Декартово дерево: build → split → merge → erase",
    stepNote: "Шаг = один спуск в split/merge/erase (переменная step) или новая пара (x; y) в наборе points — по нему дерево перестраивается целиком.",
    code: `points = [[45, 8], [3, 6], [6, 5], [2, 4], [9, 3], [7, 2], [12, 0], [1, -4]]
n = len(points)          # сколько пар (x; y) — столько и узлов дерева
mid = 7                  # разрез для split: x <= mid уходит в L, остальные в R
key = 9                  # какую точку удаляем в erase
step = 0                 # номер шага — листает кадры демонстрации
height = 0               # высота построенного дерева
root = None

# --- тело алгоритма ---
class Node:
    def __init__(s, x, y):
        s.x = x; s.y = y; s.l = None; s.r = None

def build(pts):
    """Декартово дерево из отсортированных по x точек: стеком за O(n)."""
    pts = sorted(pts, key=lambda p: p[0])
    stack = []
    for x, y in pts:
        cur = Node(x, y)
        last = None
        while stack and stack[-1].y < y:   # поднимаемся, пока приоритет больше
            last = stack.pop()
        cur.l = last
        if stack:
            stack[-1].r = cur
        stack.append(cur)
    return stack[0] if stack else None

def split(t, m):
    """(L, R): в L всё с x <= m, в R — с x > m."""
    global step
    if t is None:
        return (None, None)
    step += 1
    if t.x <= m:
        a, b = split(t.r, m)
        t.r = a
        return (t, b)
    a, b = split(t.l, m)
    t.l = b
    return (a, t)

def merge(a, b):
    """Слияние: все x в a меньше всех x в b."""
    global step
    if a is None: return b
    if b is None: return a
    step += 1
    if a.y > b.y:
        a.r = merge(a.r, b)
        return a
    b.l = merge(a, b.l)
    return b

def erase(t, k):
    """Удалить точку с x = k: два split и один merge."""
    a, b = split(t, k - 1)     # a: x <= k-1, b: x >= k
    mid_t, c = split(b, k)     # mid_t: ровно x = k
    return merge(a, c)

def inorder(t, acc):
    if t:
        inorder(t.l, acc); acc.append(t.x); inorder(t.r, acc)
    return acc

def h(t):
    return 0 if t is None else 1 + max(h(t.l), h(t.r))

root = build(points)
height = h(root)
print("обход по x:", inorder(root, []), "| высота:", height)

step = 0
L, R = split(root, mid)
print("split(", mid, ") -> L:", inorder(L, []), "R:", inorder(R, []), "| шагов:", step)

step = 0
back = merge(L, R)
print("merge(L, R) ->", inorder(back, []), "| шагов:", step, "| высота:", h(back))

step = 0
after = erase(build(points), key)
print("erase(", key, ") ->", inorder(after, []), "| высота:", h(after))`,
    variables: [
      { name: "points", role: "набор пар (x; y) — по нему ПЕРЕСТРАИВАЕТСЯ плоскость и само дерево на вкладке «Собрать»", range: "8 пар на демо" },
      { name: "n", role: "число узлов = число пар", range: "n = 8" },
      { name: "mid", role: "разрез для вкладки Split: всё с x ≤ mid уходит в L, остальные в R", range: "2, 3, 6, 7, 9, 12, 45" },
      { name: "key", role: "какую точку удаляет вкладка Erase", range: "x из набора" },
      { name: "step", role: "номер шага спуска/слияния — листает кадры Split, Merge и Erase", range: "0 … h" },
      { name: "height", role: "высота дерева: в среднем O(log n), у канонического демо-набора = 5", range: "1 … n" },
      { name: "root", role: "корень — узел с максимальным приоритетом y", range: "узел (x; y)" },
    ],
  },
  "splay-tree": {
    vizTitle: "Splay: Zig / Zig-Zig / Zig-Zag на узлах 20-40-60",
    stepNote: "Шаг = одно применение случая: переменная case переключает демонстрацию на Zig, Zig-Zig или Zig-Zag, step листает кадры поворота.",
    code: `# Splay-дерево: три случая поворота на узлах 20 / 40 / 60 — ровно как в демонстрации.
x, p, g = None, None, None     # узел, родитель, дед (объекты дерева)
xk, pk, gk = 0, 0, 0           # их ключи-числа: 20 / 40 / 60 — их и рисует демо
case = "zig"                   # какой случай сработал: zig / zig-zig / zig-zag
step = 0                       # номер поворота
root = None                    # корень текущего дерева

# --- тело алгоритма ---
class N:
    def __init__(s, k):
        s.k = k; s.l = None; s.r = None; s.p = None

def rot(x):                    # один поворот: поднять x над родителем p
    p = x.p
    g = p.p if p else None
    if p and p.l is x:
        p.l = x.r
        if x.r: x.r.p = p
        x.r = p
    elif p:
        p.r = x.l
        if x.l: x.l.p = p
        x.l = p
    if p: p.p = x
    x.p = g
    if g:
        if g.l is p: g.l = x
        else: g.r = x

def inorder(n, acc):           # обход слева направо — он НЕ меняется от поворотов
    if n:
        inorder(n.l, acc); acc.append(n.k); inorder(n.r, acc)
    return acc

def splay(x):
    global case, step, p, g, root, xk, pk, gk
    while x.p:
        p = x.p; g = p.p
        step += 1
        if g is None:
            case = "zig"                       # родитель уже корень
            rot(x)
        elif (g.l is p) == (p.l is x):
            case = "zig-zig"                   # x и p — дети с одной стороны
            rot(p); rot(x)
        else:
            case = "zig-zag"                   # змейка: дети с разных сторон
            rot(x); rot(x)
        xk, pk, gk = x.k, p.k, (g.k if g else 0)
        print("шаг", step, "->", case, "| x =", xk, "p =", pk, "g =", gk or None)
    root = x
    print("   корень теперь", x.k, "| обход:", inorder(x, []))
    return x

# 1) Zig: родитель x — уже корень (дерево 40 -> 20)
root = N(40); root.l = N(20); root.l.p = root
splay(root.l)

# 2) Zig-Zig: бамбук 60 -> 40 -> 20, оба сына левые
root = N(60); root.l = N(40); root.l.p = root; root.l.l = N(20); root.l.l.p = root.l
splay(root.l.l)

# 3) Zig-Zag: змейка 60 -> 20 -> 40 (40 — правый сын 20, а 20 — левый сын 60)
root = N(60); root.l = N(20); root.l.p = root; root.l.r = N(40); root.l.r.p = root.l
splay(root.l.r)`,
    variables: [
      { name: "case", role: "какой случай сработал: \"zig\" / \"zig-zig\" / \"zig-zag\" — переключает вкладку демонстрации", range: "строка" },
      { name: "step", role: "номер применения случая — листает кадры «прицел → поворот»", range: "1 … 3 на демо" },
      { name: "xk / x", role: "ключ узла, который поднимаем к корню (в демо это 20 или 40)", range: "20 / 40" },
      { name: "pk / p", role: "ключ родителя x перед поворотом", range: "20 / 40" },
      { name: "gk / g", role: "ключ деда — нужен в Zig-Zig и Zig-Zag; 0 (нет деда) означает Zig", range: "60 или 0" },
      { name: "root", role: "корень дерева после расшейвливания — всегда x", range: "узел" },
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
        st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])

for row in st:
    print(row)                # готовая таблица: None там, где блок не влезает в массив

# запрос min на отрезке за O(1): отрезок накрывают ДВА перекрывающихся блока длины 2^K
L, R = 1, 6
K = (R - L + 1).bit_length() - 1
print("min на [" + str(L) + ", " + str(R) + "] =",
      min(st[L][K], st[R - (1 << K) + 1][K]),
      "| блоки длины", 1 << K)`,
    variables: [
      { name: "a", role: "исходный массив, из которого строится таблица", range: "8 чисел на демо" },
      { name: "n", role: "длина массива a", range: "n = 8 на демо" },
      { name: "LOG", role: "число уровней таблицы: log₂ n + 1", range: "LOG = 4 на демо" },
      { name: "st", role: "разреженная таблица: st[i][j] = min на блоке длины 2^j, начиная с i", range: "8 строк × 4 уровня" },
      { name: "i", role: "начало блока, за который отвечает ячейка st[i][j]", range: "0 … n − 2^j" },
      { name: "j", role: "уровень таблицы: ячейка хранит ответ на блоке длины 2^j", range: "0 … LOG − 1" },
      { name: "row", role: "очередной элемент a, из которого вырастает нулевой уровень st[i][0] = a[i]", range: "значение из a" },
      { name: "L / R", role: "границы отрезка запроса — на нём таблица отдаёт минимум за O(1)", range: "1 … 6 на демо" },
      { name: "K", role: "степень двойки: длина блока 2^K, которым накрывается половина отрезка", range: "0 … LOG − 1" },
    ],
  },
  "prefix-sums-2d": {
    vizTitle: "Префиксные суммы (1D и 2D)",
    stepNote: "Шаг = заполнение очередного P[i] = P[i−1] + a[i−1] в 1D-демонстрации слева.",
    code: `a = [3, 1, 4, 1, 5, 9, 2, 6]   # исходный массив
n = len(a)                     # длина: префиксов будет n + 1
i = 0                          # текущая граница префикса

P = [0]                        # P[0] = 0 — пустой префикс
for i in range(1, n + 1):
    P.append(P[i - 1] + a[i - 1])
print("n =", n, "| P =", P)`,
    variables: [
      { name: "a", role: "исходный массив 1D-демонстрации", range: "8 чисел на демо" },
      { name: "n", role: "длина массива a; префиксов будет n + 1", range: "n = 8 на демо" },
      { name: "P", role: "префиксные суммы: P[i] = a[0] + … + a[i−1], P[0] = 0", range: "n + 1 значение" },
      { name: "i", role: "граница префикса: на шаге считаем P[i] = P[i−1] + a[i−1]", range: "1 … n" },
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
    stepNote: "Шаг = push новой вершины на стек или pop — возврат рекурсии на уровень выше.",
    code: `st = []                     # стек = рекурсия DFS
st.append("A")              # push — зашли в вершину
st.append("B")
v = st[-1]                  # вершина на вершине стека: её обработаем следующей
top = st.pop()              # pop — сняли её со стека
print("v =", v, "| pop →", top, "| стек:", st)`,
    variables: [
      { name: "top", role: "вершина стека — то, откуда DFS пойдёт дальше", range: "последний добавленный" },
      { name: "v", role: "текущая вершина графа, которую обрабатываем", range: "0 … n−1" },
    ],
  },
  "queue-bfs": {
    vizTitle: "Очередь и обход в ширину",
    stepNote: "Шаг = dequeue вершины из головы очереди и enqueue всех её непосещённых соседей.",
    code: `from collections import deque

q = deque(["A"])            # очередь BFS
u = "B"                     # сосед, найденный из текущей вершины
q.append(u)                 # enqueue соседа — в конец очереди
front = q[0]                # голова очереди: её обработаем следующей
v = q.popleft()             # шаг: достали голову и обрабатываем
print("front =", front, "| v =", v, "| очередь:", list(q))`,
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

st, q = [], deque()         # тарелки (стек) и очередь
st.append("🍽️"); top = st.pop()
q.append("🧍"); q.append("🧍"); first = q.popleft()

i = 0                       # счётчик выполненных операций
for op in ("push", "pop", "enqueue", "dequeue"):
    i += 1
print("тарелка:", top, "| первый из очереди:", first, "| операций:", i)`,
    variables: [
      { name: "top / front", role: "верх стопки (стек) и голова очереди — кого заберут первым", range: "LIFO и FIFO" },
      { name: "i", role: "индекс в массиве кучи; родитель (i−1)//2, дети 2·i+1 и 2·i+2", range: "0 … n−1" },
    ],
  },
  "graph-dfs-bfs": {
    vizTitle: "DFS и BFS на графе",
    stepNote: "Шаг = переход из текущей вершины v к непосещённому соседу to (DFS — вглубь, BFS — по слоям).",
    code: `from collections import deque

adj = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
visited, order = set(), []

stack = ["A"]               # DFS: свой стек вместо рекурсии
while stack:
    v = stack.pop()         # шаг: достали вершину с вершины стека
    if v in visited:
        continue
    visited.add(v); order.append(v)
    for u in adj[v]:        # соседи v → на стек
        stack.append(u)
print("DFS:", order)

visited, order = set(), []
q = deque(["A"])            # BFS: очередь, обход по слоям
while q:
    v = q.popleft()         # шаг: достали из начала очереди
    if v in visited:
        continue
    visited.add(v); order.append(v)
    for u in adj[v]:        # соседи v → в конец очереди
        q.append(u)
print("BFS:", order)`,
    variables: [
      { name: "v", role: "текущая вершина обхода", range: "вершины демо-графа" },
      { name: "to / u", role: "очередной сосед вершины v из списка смежности adj[v]", range: "adj[v]" },
      { name: "visited", role: "множество уже посещённых вершин — гарантия от циклов", range: "пополняется на каждом шаге" },
      { name: "order", role: "порядок, в котором обход дошёл до вершин", range: "строка под графом" },
    ],
  },
  "graph-components": {
    vizTitle: "Компоненты связности: DFS-покраска",
    stepNote: "Шаг = вершина v достаётся из стека/очереди; каждый новый запуск обхода из непокрашенной вершины даёт +1 к счётчику comps.",
    code: `n = 10                     # вершин в графе
adj = [[1, 3], [0, 2, 3], [1, 3], [0, 1, 2], [5, 6], [4, 6], [4, 5], [8], [7, 9], [8]]
comp = [-1] * n            # -1 = вершина ещё не покрашена
used = [False] * n         # то же самое булевым массивом (для BFS-варианта)
comps = 0                  # счётчик найденных компонент
c = 0                      # номер текущей компоненты
v = -1                     # вершина, в которой обход находится сейчас
stack = []                 # фронт обхода (стек для DFS, очередь для BFS)
i = 0                      # номер шага — двигает покадровую демонстрацию

# --- тело алгоритма ---
for start in range(n):
    if comp[start] != -1:
        continue
    comps += 1             # непокрашенная вершина => НОВАЯ компонента
    c = comps
    stack = [start]
    comp[start] = c
    used[start] = True
    v = start
    while stack:
        v = stack.pop()    # для BFS: v = stack.pop(0)
        i += 1
        for to in adj[v]:
            if comp[to] == -1:
                comp[to] = c
                used[to] = True
                stack.append(to)
print("компонент:", comps)
print("разметка comp:", comp)`,
    variables: [
      { name: "n", role: "число вершин; в демонстрации граф из 10 вершин и трёх компонент", range: "n = 10" },
      { name: "adj", role: "списки смежности — тот же граф, что нарисован слева", range: "10 списков" },
      { name: "comp", role: "разметка: номер компоненты вершины (-1 = ещё не покрашена). Визуализация красит вершины ПРЯМО по этому массиву", range: "-1 … comps" },
      { name: "used", role: "булев вариант разметки — для BFS и для проверки «уже посещена»", range: "True/False" },
      { name: "comps", role: "счётчик найденных компонент связности — большая цифра под графом", range: "0 … 3" },
      { name: "c", role: "номер компоненты, которую красим сейчас", range: "1 … comps" },
      { name: "v", role: "вершина, где обход находится сейчас — пульсирует", range: "0 … n−1" },
      { name: "stack", role: "фронт обхода: стек (DFS) или очередь (BFS); подсвечивается на графе", range: "≤ n вершин" },
      { name: "i / step", role: "номер шага — перематывает покадровую демонстрацию", range: "0 … 2n" },
    ],
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

answer = order[::-1]        # разворот — топологический порядок
for i, v in enumerate(answer):
    print(f"позиция {i}: вершина {v}")`,
    variables: [
      { name: "v", role: "текущая вершина DFS", range: "0 … 4 на демо" },
      { name: "to", role: "вершина, куда ведёт ребро из v", range: "adj[v]" },
      { name: "i", role: "перебор стартовых вершин во внешнем цикле (вдруг граф несвязен)", range: "0 … 4" },
      { name: "order", role: "список выхода из рекурсии; после разворота — топологический порядок", range: "растёт на каждом выходе" },
    ],
  },
  "scc-kosaraju": {
    vizTitle: "Компоненты сильной связности (Косарайю)",
    stepNote: "Шаг = строка алгоритма: в фазе 1 DFS кладёт вершину в order, в фазе 2 вершина из order (с конца) запускает DFS по транспонированному графу и красит свою SCC.",
    code: `adj = {0: [1], 1: [2], 2: [0, 3], 3: [4], 4: [3]}   # тот же граф, что нарисован на экране
n = 5

# фаза 1: DFS по обычному графу, запоминаем ПОРЯДОК ВЫХОДА из вершин
used = {}
for v in adj:
    used[v] = False
order = []

def dfs1(v):
    used[v] = True
    for to in adj[v]:
        if not used[to]:
            dfs1(to)
    order.append(v)          # выходим из вершины — она уходит в order

for v in adj:
    if not used[v]:
        dfs1(v)
        print("DFS из", v, "закончен | order:", order)

# транспонирование: каждое ребро разворачиваем
adjT = {}
for v in adj:
    adjT[v] = []
for v in adj:
    for to in adj[v]:
        adjT[to].append(v)
print("обратный граф:", adjT)

# фаза 2: идём по order С КОНЦА, DFS по adjT красит одну компоненту за раз
comp = {}
c = 0
for i in range(len(order) - 1, -1, -1):
    v = order[i]
    if v in comp:
        continue
    stack = [v]
    comp[v] = c
    while stack:
        u = stack.pop()
        for to in adjT[u]:
            if to not in comp:
                comp[to] = c
                stack.append(to)
    print("SCC", c, "собрана из", v, ":", comp)
    c += 1

print("порядок выхода:", order, "| компонент:", c, "| разметка:", comp)`,
    variables: [
      { name: "adj / adjT", role: "граф и его транспозиция: adjT[to] содержит всех, кто ведёт в to", range: "5 вершин, 6 рёбер" },
      { name: "v", role: "текущая вершина DFS (в фазе 1 — по графу, в фазе 2 — по обратному)", range: "0 … 4" },
      { name: "to", role: "сосед по ребру: в фазе 1 прямой, в фазе 2 — обратный", range: "0 … 4" },
      { name: "used", role: "помеченные первым проходом вершины", range: "true/false по каждой" },
      { name: "order", role: "порядок ВЫХОДА из DFS первого прохода — фаза 2 читает его с конца", range: "растёт до 5 вершин" },
      { name: "i", role: "индекс прохода по order на втором этапе — идём с конца", range: "len(order)−1 … 0" },
      { name: "stack", role: "стек DFS второго прохода: вершины текущей компоненты", range: "пустеет к концу SCC" },
      { name: "u", role: "вершина, снятая со стека во втором проходе", range: "0 … 4" },
      { name: "comp", role: "номер компоненты сильной связности каждой вершины — им красит демонстрация", range: "0, 1" },
      { name: "c", role: "счётчик компонент: каждая новая SCC получает свой номер", range: "0 … 1" },
      { name: "n", role: "число вершин", range: "5" },
    ],
  },
  "graph-articulation": {
    vizTitle: "Точки сочленения",
    stepNote: "Шаг = обновление low[v] по ребру; вершина v — точка сочленения, когда low[to] ≥ tin[v].",
    code: `tin, low, timer = {}, {}, 0

i = 0                       # номер шага DFS
v, to = 0, 1                # текущее ребро DFS: v → to
tin[v] = tin.get(v, timer); low[v] = tin[v]

# шаг: возврат из to в v
i += 1
low[v] = min(low[v], low.get(to, tin[v]))
critical = low.get(to, 0) >= tin[v]   # → v — точка сочленения
print(f"i={i} v={v} to={to} critical={critical}")`,
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
    vizTitle: "Эйлеров маршрут: алгоритм Иера",
    stepNote: "Шаг = переход по неиспользованному ребру: used[i] = True, вершина дописывается в path. Ребро «сгорает» — второй раз по нему идти нельзя.",
    code: `n = 5                      # вершин: 0…4 (на графе подписаны A…E)
edges = [(0, 1), (0, 2), (1, 3), (2, 4), (1, 2), (3, 4)]
adj = {v: [] for v in range(n)}
for i, (u, v) in enumerate(edges):
    adj[u].append((v, i))
    adj[v].append((u, i))
deg = {v: len(adj[v]) for v in range(n)}   # степени вершин
odd = [v for v in range(n) if deg[v] % 2 == 1]   # нечётные вершины
start = odd[0] if odd else 0             # путь начинаем в нечётной, цикл — в любой
used = [False] * len(edges)              # какие рёбра уже пройдены
path = [start]                           # маршрут: последовательность вершин
last = start                             # где мы сейчас
stack = [start]                          # стек для отката (алгоритм Иера)
v = start
step = 0

# --- тело алгоритма ---
while stack:
    v = stack[-1]
    moved = False
    for to, i in adj[v]:
        if not used[i]:
            used[i] = True
            stack.append(to)
            path.append(to)
            last = to
            step += 1
            moved = True
            break
    if not moved:
        stack.pop()                      # из v все рёбра использованы — откат
print("степени:", deg)
print("нечётных вершин:", len(odd), odd, "->", "цикл" if len(odd) == 0 else "путь" if len(odd) == 2 else "нельзя")
print("маршрут:", path, "| рёбер пройдено:", sum(used), "из", len(edges))`,
    variables: [
      { name: "path", role: "маршрут — последовательность вершин; рисуется поверх графа с номерами рёбер", range: "≤ E + 1 вершин" },
      { name: "last / v", role: "вершина, где обход находится сейчас", range: "0 … n−1" },
      { name: "used", role: "какие рёбра уже пройдены (по номеру в списке edges) — подсвечиваются", range: "True/False" },
      { name: "deg", role: "степени вершин: чётные всюду → цикл, ровно две нечётные → путь", range: "словарь v → deg(v)" },
      { name: "odd", role: "список нечётных вершин — по его длине работает критерий Эйлера", range: "0 или 2 вершины" },
      { name: "stack", role: "стек отката алгоритма Иера: из вершины без свободных рёбер возвращаемся назад", range: "≤ E" },
      { name: "step / i", role: "номер шага обхода", range: "0 … E" },
    ],
  },
  "planarity-euler-formula": {
    vizTitle: "Покраска вершин: χ ≤ Δ + 1",
    stepNote: "Шаг = одна вершина v: смотрим цвета её соседей и берём наименьший свободный — массив color сразу перекрашивает граф.",
    code: `n = 8                      # вершин в графе (0…7) — тот же, что нарисован слева
adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4, 5], [2, 3, 6], [3, 6, 7], [4, 5, 7], [5, 6]]
delta = max(len(a) for a in adj)   # максимальная степень Δ
color = [0] * n            # 0 = ещё не покрашена
chi = 0                    # сколько цветов понадобилось
v = -1                     # вершина, которую красим сейчас
i = 0                      # номер шага

V = n                              # вершин для формулы Эйлера
E = sum(len(a) for a in adj) // 2  # рёбер: в списке смежности каждое учтено дважды
F = 2 - V + E                      # граней: из V − E + F = 2 для связного планарного графа

# --- тело алгоритма ---
print("V =", V, "| E =", E, "| F =", F, "| V − E + F =", V - E + F)
for v in range(n):
    used = set()
    for u in adj[v]:
        if color[u] != 0:
            used.add(color[u])
    c = 1
    while c in used:       # наименьший свободный цвет
        c += 1
    color[v] = c
    chi = max(chi, c)
    i += 1
    print("v =", v, "занято:", sorted(used), "-> цвет", c)
print("chi =", chi, "| delta =", delta, "| chi <= delta+1:", chi <= delta + 1)`,
    variables: [
      { name: "n", role: "число вершин графа на демонстрации", range: "n = 8" },
      { name: "adj", role: "списки смежности — тот же граф, что нарисован слева", range: "8 списков" },
      { name: "color", role: "массив цветов вершин (0 = не покрашена). Визуализация красит кружки ПРЯМО по нему", range: "1 … Δ+1" },
      { name: "v", role: "вершина, которую красим сейчас — пульсирует жёлтым", range: "0 … n−1" },
      { name: "u", role: "сосед вершины v, чей цвет уже занят", range: "adj[v]" },
      { name: "delta", role: "максимальная степень Δ = max deg(v) — верхняя оценка χ ≤ Δ + 1", range: "Δ = 3" },
      { name: "chi", role: "сколько цветов реально понадобилось", range: "1 … Δ+1" },
      { name: "i / step", role: "номер шага — перематывает кадры демонстрации", range: "0 … n" },
      { name: "V, E, F", role: "для вкладки «Планарность»: вершины, рёбра, грани (V − E + F = 2, E ≤ 3V − 6)", range: "K5: 5/10 · K3,3: 6/9" },
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
    code: `INF = float("inf")

# демо-граф страницы: 7 вершин, 9 односторонних рёбер; B -> C имеет вес -2
E = [("S", "A", 4), ("S", "B", 5), ("B", "C", -2), ("A", "C", 1),
     ("C", "D", 3), ("C", "E", 4), ("D", "F", 2), ("E", "F", 1),
     ("D", "A", -2)]      # замените -2 на -6 — появится отрицательный цикл A->C->D

nodes = ["S", "A", "B", "C", "D", "E", "F"]
n = len(nodes)             # 7 вершин => n - 1 = 6 рабочих итераций
m = len(E)                 # 9 рёбер

dist = {v: INF for v in nodes}
dist["S"] = 0              # старт — База

# --- тело алгоритма ---
last_changed = ""
for i in range(1, n):      # итерация i = 1 … n-1
    last_changed = ""
    for u, v, w in E:      # шаг: релаксация ребра (u, v, w)
        if dist[u] != INF and dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            last_changed = v
    if last_changed == "":
        print(f"итерация {i}: изменений нет — сошлось досрочно")
        break
    print(f"итерация {i}: " + ", ".join(f"{k}={dist[k]:g}" for k in nodes))

# контрольный (n-й) проход: улучшение здесь означает отрицательный цикл
cycle_edge = None
for u, v, w in E:
    if dist[u] != INF and dist[u] + w < dist[v]:
        cycle_edge = (u, v, w)
        break

if cycle_edge:
    print("отрицательный цикл: улучшается ребро", cycle_edge[0], "->", cycle_edge[1])
else:
    print("отрицательных циклов нет:", {k: dist[k] for k in nodes})`,
    variables: [
      { name: "n", role: "число вершин графа — ровно n−1 полных итераций", range: "7 на демо" },
      { name: "m", role: "число рёбер, по которым проходим на каждой итерации", range: "9 на демо (список E)" },
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
  mst: {
    vizTitle: "Остовное дерево: Краскал и DSU",
    stepNote: "Шаг = следующее ребро из отсортированных: если find(u) ≠ find(v), ребро идёт в остов, иначе отбрасывается.",
    code: `n = 9                      # вершин: A…I — тот же граф, что нарисован слева
edges = [(2, "A", "B"), (3, "D", "E"), (4, "B", "C"), (5, "A", "D"), (6, "B", "E"),
         (7, "E", "F"), (8, "D", "G"), (9, "C", "F"), (10, "G", "H"), (11, "E", "H"),
         (12, "H", "I"), (13, "F", "I")]
edges.sort()               # Краскал: рёбра по возрастанию веса
parent = {v: v for v in "ABCDEFGHI"}   # DSU: представитель множества вершины
rank = {v: 0 for v in "ABCDEFGHI"}     # высота дерева DSU
mst = []                   # рёбра, взятые в остов
total = 0                  # вес остова (на этом графе = 51)
i = 0                      # номер текущего ребра
u, v, w = None, None, None # концы и вес ребра, которое рассматриваем сейчас

# --- тело алгоритма ---
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # сжатие путей
        x = parent[x]
    return x

for i, (w, a, b) in enumerate(edges):
    u, v = a, b
    ra, rb = find(a), find(b)
    if ra != rb:                        # разные компоненты => берём ребро
        parent[ra] = rb
        if rank[ra] == rank[rb]:
            rank[rb] += 1
        mst.append((w, a, b))
        total += w
print("вес остова:", total, "| рёбер:", len(mst))
print(mst)`,
    variables: [
      { name: "n", role: "число вершин (A…I); в остов войдёт ровно n−1 = 8 рёбер", range: "n = 9" },
      { name: "edges", role: "список рёбер (вес, u, v) — тот же граф из 9 вершин, что нарисован слева", range: "12 рёбер" },
      { name: "i", role: "номер текущего ребра в отсортированном списке", range: "0 … 11" },
      { name: "u, v, w", role: "концы и вес ребра, которое рассматривается сейчас — подсвечивается на графе", range: "A…I" },
      { name: "parent", role: "DSU: представитель множества вершины. Визуализация красит компоненты по корням find(v)", range: "A…I" },
      { name: "rank", role: "высота дерева DSU — union by rank", range: "≤ log n" },
      { name: "mst", role: "взятые рёбра остова — рисуются жирными", range: "≤ 8 рёбер" },
      { name: "total", role: "вес остова; на этом графе всегда 51 (веса различны => остов единственен)", range: "0 … 51" },
    ],
  },
  "string-kmp": {
    vizTitle: "Префикс-функция (КМП)",
    stepNote: "Шаг = обработка символа s[i]: откаты по j = π[j−1], пока не совпадёт s[j] с s[i].",
    code: `s = "aabaabaaa"
n = len(s)
i, j = 1, 0
pi = [None] * n             # пустые клетки: значения появятся по шагам
pi[0] = 0

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
i, l, r = 1, 0, 0           # правый Z-блок [l, r]
z = [None] * n              # пустые клетки: значения появятся по шагам
z[0] = 0

for i in range(1, n):       # шаг: вычисляем z[i]
    if i <= r:
        z[i] = min(r - i + 1, z[i - l])   # из блока
    else:
        z[i] = 0            # свежая клетка: с нуля
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
    vizTitle: "Ахо—Корасик: бор, fail-ссылки и автомат",
    stepNote: "Шаг = один символ текста: state = go(state, c), затем подъём по fail-ссылкам собирает все образцы-суффиксы. Номера вершин совпадают с картинкой «водопада».",
    code: `words = ["HERS", "HIS", "SHE", "HE"]   # образцы; бор строится в этом порядке — номера вершин совпадают с картинкой
text = "USHERS"                        # текст, в котором ищем все вхождения
n = len(text)                          # длина текста
state = 0                              # текущее состояние автомата = вершина бора
i = 0                                  # индекс текущего символа текста
c = ""                                 # сам символ
nodes = 1                              # сколько вершин в боре (корень = 0)
queue = []                             # очередь BFS, которой натягивают fail-ссылки
fail = {}                              # fail[v] = вершина наибольшего собственного суффикса
matches = []                           # найденные вхождения: (индекс конца, слово)

# --- тело алгоритма ---
nxt = {}          # nxt[(v, ch)] = u — переходы бора
term = {}         # term[v] = слово, которое заканчивается в вершине v

def add_word(w):
    """Добавить образец в бор: недостающие вершины получают новые номера."""
    global nodes
    v = 0
    for ch in w:
        if (v, ch) not in nxt:
            nxt[(v, ch)] = nodes
            nodes += 1
        v = nxt[(v, ch)]
    term[v] = w

for w in words:
    add_word(w)

# BFS по уровням: fail-ссылка ребенка = куда приведёт fail родителя по тому же символу
fail[0] = 0
queue = sorted(v for (p, ch), v in nxt.items() if p == 0)
for v in queue:
    fail[v] = 0
qi = 0
while qi < len(queue):
    v = queue[qi]
    qi += 1
    for (p, ch), u in sorted(nxt.items()):
        if p != v:
            continue
        f = fail[v]
        while f != 0 and (f, ch) not in nxt:
            f = fail[f]
        fail[u] = nxt.get((f, ch), 0)
        if fail[u] == u:
            fail[u] = 0
        queue.append(u)
print("вершин в боре:", nodes)
print("fail-ссылки:", fail)

def go(v, ch):
    """Переход автомата: сначала по бору, иначе спускаемся по fail-ссылкам."""
    while v != 0 and (v, ch) not in nxt:
        v = fail[v]
    return nxt.get((v, ch), 0)

for i, c in enumerate(text):
    state = go(state, c)
    v = state
    while v != 0:                 # собираем все образцы-суффиксы текущего состояния
        if v in term:
            matches.append((i, term[v]))
        v = fail[v]
    print(f"i={i} c='{c}' state={state} найдено={matches}")

print("всего вхождений:", len(matches), matches)`,
    variables: [
      { name: "words", role: "набор образцов — по нему ПЕРЕСТРАИВАЕТСЯ бор в виджете «Эхо-Лосось»", range: '["HERS", "HIS", "SHE", "HE"]' },
      { name: "text", role: "сканируемый текст — подставляется в режим поиска «водопада»", range: "USHERS на демо" },
      { name: "state", role: "текущее состояние автомата = вершина бора; подсвечивается на картинке", range: "0 … nodes−1" },
      { name: "i / c", role: "индекс и сам символ текста, который обрабатывается сейчас", range: "0 … n−1" },
      { name: "nxt", role: "переходы бора: nxt[(v, ch)] = u", range: "≤ Σ|words|" },
      { name: "fail", role: "fail[v] — вершина наибольшего собственного суффикса (её строит BFS)", range: "0 … nodes−1" },
      { name: "term", role: "в каких вершинах заканчиваются образцы", range: "вершина → слово" },
      { name: "queue", role: "очередь BFS, которой натягиваются fail-ссылки", range: "≤ nodes" },
      { name: "matches", role: "найденные вхождения: (индекс конца, слово)", range: "≤ n" },
      { name: "nodes", role: "сколько вершин в боре (корень = 0)", range: "10 на демо" },
    ],
  },
  "complexity-classes": {
    vizTitle: "Классы сложности: рост по n и ops",
    stepNote: "Шаг = одна точка (n, ops): визуализация копит их и оценивает наклон в лог-лог координатах — полином или экспонента.",
    code: `n = 1                      # размер входа
ops = 0                    # сколько операций насчитал алгоритм — по ним виден рост
cls = "P"                  # класс, к которому относим задачу по этому алгоритму
step = 0                   # кадр схемы: 0 вход → 1 алгоритм → 2 ответ → 3 сертификат
k = 0                      # длина сертификата: сколько значений проверяем
cert = []                  # сам сертификат — предполагаемое решение
ok = True                  # проверился ли сертификат за полиномиальное время

# --- тело алгоритма ---
# Полиномиальный алгоритм: перебор всех пар — Θ(n²).
# Точки (n, ops) сами ложатся на график вкладки «Рост».
for n in range(2, 11):
    step = 1               # запустили алгоритм на входе n
    ops = 0
    for i in range(n):
        for j in range(i, n):
            ops += 1
    step = 2               # ответ готов
    cls = "P"              # n²/2 операций — полином, значит класс P
    print("n =", n, "| ops =", ops, "|", cls)

# Сертификат NP-задачи (3-SAT): решение угадано, проверяется за O(n).
step = 3
cert = [1, 0, 1, 0]        # значения переменных x1…x4
k = len(cert)              # проверяем все k бит
ok = all(bit in (0, 1) for bit in cert)
cls = "NP"                 # угадать + быстро проверить — это NP
print("сертификат:", cert, "| k =", k, "| принят:", ok, "|", cls)`,
    variables: [
      { name: "n", role: "размер входа — горизонтальная ось графика роста", range: "2 … 10" },
      { name: "ops", role: "сколько операций выполнил алгоритм на входе размера n — вертикальная ось", range: "3 … 55 на демо (пары i ≤ j)" },
      { name: "cls", role: "имя класса (P / NP / PSPACE / EXP) — подсвечивает овал на схеме иерархии", range: "строка" },
      { name: "step / i", role: "кадр схемы (0 вход → 1 алгоритм → 2 ответ → 3 сертификат) и индекс внутреннего цикла", range: "step 0…3, i 0…9" },
      { name: "k", role: "размер сертификата: сколько значений проверяет верификатор", range: "4 на демо" },
      { name: "cert", role: "сертификат — назначение переменных, которое проверяет верификатор", range: "[1, 0, 1, 0]" },
      { name: "ok", role: "вердикт верификатора: принят ли сертификат", range: "True/False" },
    ],
  },
  intro: {
    // мнемокарточки без шагов алгоритма
    variables: [],
  },

  /* ── Дополнительные демонстрации внутри страниц (вкладки) ─────────────── */

  "planarity-euler-formula#greedy": {
    vizTitle: "Жадная покраска вершин (χ ≤ Δ + 1)",
    stepNote: "Шаг = вершина v получает наименьший цвет, не занятый соседями; массив color перекрашивает граф.",
    code: `n = 8                      # вершин в графе (0…7) — тот же, что нарисован слева
adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4, 5], [2, 3, 6], [3, 6, 7], [4, 5, 7], [5, 6]]
delta = max(len(a) for a in adj)   # максимальная степень Δ
color = [0] * n            # 0 = ещё не покрашена
chi = 0                    # сколько цветов понадобилось
v = -1                     # вершина, которую красим сейчас
i = 0                      # номер шага

# --- тело алгоритма ---
for v in range(n):
    used = set()
    for u in adj[v]:
        if color[u] != 0:
            used.add(color[u])
    c = 1
    while c in used:       # наименьший свободный цвет
        c += 1
    color[v] = c
    chi = max(chi, c)
    i += 1
    print("v =", v, "занято:", sorted(used), "-> цвет", c)
print("chi =", chi, "| delta =", delta, "| chi <= delta+1:", chi <= delta + 1)`,
    variables: [
      { name: "color", role: "цвета вершин (0 = не покрашена) — граф красится по этому массиву", range: "1 … 3" },
      { name: "v", role: "текущая вершина", range: "0 … 7" },
      { name: "delta / chi", role: "максимальная степень и число использованных цветов", range: "3 / 3" },
      { name: "i / step", role: "номер кадра", range: "0 … 8" },
    ],
  },
  "planarity-euler-formula#bipartite": {
    vizTitle: "Двудольность: BFS в 2 цвета",
    stepNote: "Шаг = сосед u получает цвет 3 − color[v]; совпадение цветов на ребре означает нечётный цикл.",
    code: `n = 8
adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4, 5], [2, 3, 6], [3, 6, 7], [4, 5, 7], [5, 6]]
color = [0] * n            # 0 = не покрашена, иначе 1 или 2 (доля)
queue = []                 # очередь BFS
v = -1                     # вершина, из которой смотрим соседей
u = -1                     # сосед, которого красим сейчас
ok = True                  # двудольный ли граф
i = 0

# --- тело алгоритма ---
for start in range(n):
    if color[start] != 0:
        continue
    color[start] = 1
    queue = [start]
    while queue and ok:
        v = queue.pop(0)
        for u in adj[v]:
            if color[u] == 0:
                color[u] = 3 - color[v]      # противоположный цвет
                queue.append(u)
                i += 1
            elif color[u] == color[v]:
                ok = False                   # нечётный цикл!
                print("конфликт на ребре", (v, u))
print("двудольный:", ok, "| разметка:", color)`,
    variables: [
      { name: "color", role: "разметка на две доли: 1 и 2 (0 = не покрашена) — красит граф", range: "{1, 2}" },
      { name: "v", role: "вершина, из которой BFS смотрит на соседей", range: "0 … n−1" },
      { name: "u", role: "сосед, которого красим (или с которым случился конфликт)", range: "adj[v]" },
      { name: "queue", role: "очередь BFS", range: "≤ n" },
      { name: "ok", role: "вердикт: граф двудольный (нет нечётного цикла) или нет", range: "True/False" },
      { name: "i / step", role: "номер кадра", range: "0 …" },
    ],
  },
  "planarity-euler-formula#edges": {
    vizTitle: "Покраска рёбер (Визинг: Δ ≤ χ′ ≤ Δ + 1)",
    stepNote: "Шаг = ребро e получает наименьший цвет, свободный одновременно в обеих его вершинах.",
    code: `n = 8
edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 4), (3, 4), (3, 5), (4, 6), (5, 6), (5, 7), (6, 7)]
adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4, 5], [2, 3, 6], [3, 6, 7], [4, 5, 7], [5, 6]]
delta = max(len(a) for a in adj)
ecolor = [0] * len(edges)  # цвет каждого ребра
inc = [dict() for _ in range(n)]   # inc[v][цвет] = ребро: что уже занято в вершине
e = -1                     # номер текущего ребра
v = u = -1                 # его концы
chi_e = 0

# --- тело алгоритма ---
for e, (a, b) in enumerate(edges):
    v, u = a, b
    used = set(inc[a].values()) | set(inc[b].values())
    c = 1
    while c in used:
        c += 1
    ecolor[e] = c
    inc[a][e] = c
    inc[b][e] = c
    chi_e = max(chi_e, c)
    print("ребро", (a, b), "занято:", sorted(used), "-> цвет", c)
print("chi' =", chi_e, "| delta =", delta, "| delta <= chi' <= delta+1:", delta <= chi_e <= delta + 1)`,
    variables: [
      { name: "ecolor", role: "цвета рёбер — рёбра на графе красятся по этому массиву", range: "1 … Δ+1" },
      { name: "e", role: "номер текущего ребра", range: "0 … m−1" },
      { name: "v, u", role: "концы текущего ребра — подсвечиваются", range: "0 … n−1" },
      { name: "inc", role: "для каждой вершины: какие цвета рёбер уже заняты", range: "≤ deg(v)" },
      { name: "chi_e / delta", role: "χ′ — сколько цветов понадобилось рёбрам, и максимальная степень", range: "3 / 3" },
    ],
  },
  "graph-components#dfs": {
    vizTitle: "Компоненты связности: DFS-покраска",
    stepNote: "Шаг = вершина v достаётся из стека; соседи из adj[v] красятся в цвет текущей компоненты c.",
    code: `n = 10                     # вершин в графе
adj = [[1, 3], [0, 2, 3], [1, 3], [0, 1, 2], [5, 6], [4, 6], [4, 5], [8], [7, 9], [8]]
comp = [-1] * n            # -1 = вершина ещё не покрашена
used = [False] * n         # то же самое булевым массивом (для BFS-варианта)
comps = 0                  # счётчик найденных компонент
c = 0                      # номер текущей компоненты
v = -1                     # вершина, в которой обход находится сейчас
stack = []                 # фронт обхода (стек для DFS, очередь для BFS)
i = 0                      # номер шага — двигает покадровую демонстрацию

# --- тело алгоритма ---
for start in range(n):
    if comp[start] != -1:
        continue
    comps += 1             # непокрашенная вершина => НОВАЯ компонента
    c = comps
    stack = [start]
    comp[start] = c
    used[start] = True
    v = start
    while stack:
        v = stack.pop()    # для BFS: v = stack.pop(0)
        i += 1
        for to in adj[v]:
            if comp[to] == -1:
                comp[to] = c
                used[to] = True
                stack.append(to)
print("компонент:", comps)
print("разметка comp:", comp)`,
    variables: [
      { name: "comp", role: "номер компоненты каждой вершины (-1 = не покрашена) — по нему красится граф", range: "-1 … 3" },
      { name: "v", role: "текущая вершина обхода", range: "0 … 9" },
      { name: "stack", role: "стек обхода (для BFS замените pop() на pop(0))", range: "≤ 10" },
      { name: "comps / c", role: "счётчик компонент и номер текущей", range: "1 … 3" },
      { name: "i", role: "номер шага — перематывает кадры демонстрации", range: "0 …" },
    ],
  },
  "graph-components#dsu": {
    vizTitle: "Компоненты связности: DSU по рёбрам",
    stepNote: "Шаг = одно ребро (u, v): union склеивает множества, если find(u) ≠ find(v), и уменьшает comps.",
    code: `n = 10                     # вершин в графе
edges = [(0, 1), (1, 2), (2, 3), (0, 3), (1, 3), (4, 5), (5, 6), (4, 6), (7, 8), (8, 9)]
parent = list(range(n))    # DSU: parent[v] = представитель множества вершины v
rank = [0] * n             # высота дерева — по ней решаем, кого к кому подвешивать
comps = n                  # сначала каждая вершина — отдельная компонента
e = -1                     # номер обрабатываемого ребра
u, v = -1, -1              # концы текущего ребра
step = 0                   # номер шага — двигает покадровую демонстрацию

# --- тело алгоритма ---
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # сжатие путей
        x = parent[x]
    return x

def union(a, b):
    global comps
    ra, rb = find(a), find(b)
    if ra == rb:
        return False                    # ребро внутри одной компоненты
    if rank[ra] < rank[rb]:
        ra, rb = rb, ra
    parent[rb] = ra
    if rank[ra] == rank[rb]:
        rank[ra] += 1
    comps -= 1
    return True

for e, (a, b) in enumerate(edges):
    u, v = a, b
    step = e + 1
    union(a, b)
print("компонент:", comps)
print("корни:", [find(x) for x in range(n)])`,
    variables: [
      { name: "parent", role: "DSU-массив: parent[v] = представитель множества. Визуализация рисует множества по корням find(v)", range: "0 … n−1" },
      { name: "rank", role: "высота дерева DSU — union by rank не даёт дереву выродиться в бамбук", range: "≤ log n" },
      { name: "e / step", role: "номер обрабатываемого ребра — перематывает кадры", range: "0 … m−1" },
      { name: "u, v", role: "концы текущего ребра — подсвечиваются на графе", range: "0 … n−1" },
      { name: "comps", role: "сколько множеств осталось: стартуем с n, каждое слияние уменьшает на 1", range: "n → 3" },
    ],
  },
  "complexity-classes#hierarchy": {
    vizTitle: "Иерархия классов P ⊆ NP ⊆ PSPACE ⊆ EXP",
    stepNote: "Шаг не нужен: схема подсвечивает тот овал, имя которого лежит в переменной cls.",
    code: `cls = "NP"                 # имя класса: P, NP, PSPACE, EXP — подсветит овал на схеме
n = 10                     # размер входа
ops = 0                    # счётчик операций (нужен вкладке «Рост»)

# --- тело алгоритма ---
# P: решается за полином — сортировка
a = [5, 2, 8, 1, 9, 3]
for i in range(len(a)):
    for j in range(len(a) - 1):
        ops += 1
        if a[j] > a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]
print(cls, "отсортировано за", ops, "операций:", a)`,
    variables: [
      { name: "cls", role: "имя класса — P, NP, PSPACE или EXP; соответствующий овал подсвечивается", range: "строка" },
      { name: "n", role: "размер входа задачи, про которую идёт речь", range: "≥ 1" },
      { name: "ops", role: "сколько операций потребовалось решить её на входе n", range: "≥ 0" },
    ],
  },
  "complexity-classes#reduce": {
    vizTitle: "Сведение A ≤p B (3-SAT → КЛИКА)",
    stepNote: "Шаг = один кадр схемы сведения: вход x → полиномиальное преобразование f → вход y → решатель B → ответ.",
    code: `cls = "NP"                 # класс задачи A, которую сводим
step = 0                   # кадр сведения A ≤p B: 0…6
n = 9                      # размер входа x (литералов в формуле)
k = 3                      # размер клики, которую ищем в задаче B

# --- тело алгоритма ---
# Сведение 3-SAT <=p КЛИКА: вершина = (номер дизъюнкта, литерал),
# ребро = два литерала из РАЗНЫХ дизъюнктов, не противоречащих друг другу.
clauses = [(1, 2, -3), (-1, 3, 4), (2, -3, -4)]
V = [(i, l) for i, cl in enumerate(clauses) for l in cl]
E = [(a, b) for a in V for b in V if a[0] < b[0] and a[1] != -b[1]]
for step in range(7):
    print("кадр", step, "| вершин:", len(V), "| рёбер:", len(E), "| клика размера", k)
print("формула выполнима <=> в графе есть клика размера", k)`,
    variables: [
      { name: "step", role: "номер кадра сведения (0…6) — двигает схему", range: "0 … 6" },
      { name: "cls", role: "класс задачи A, которую сводим", range: "NP" },
      { name: "n", role: "размер входа x; после сведения |y| = poly(n)", range: "≥ 1" },
      { name: "k", role: "размер клики, которую ищет решатель B", range: "= число дизъюнктов" },
    ],
  },
  "complexity-classes#verify": {
    vizTitle: "Верификатор 3-SAT: проверка сертификата",
    stepNote: "Шаг = один дизъюнкт: верификатор подставляет сертификат и проверяет, истинен ли хотя бы один литерал.",
    code: `clauses = [(1, 2, -3), (-1, 3, 4), (2, -3, -4), (-2, 1, 3)]
cert = [1, 0, 1, 0]        # сертификат: x1=1, x2=0, x3=1, x4=0
k = 0                      # номер проверяемого дизъюнкта
ok = True                  # вердикт верификатора

# --- тело алгоритма ---
for k, cl in enumerate(clauses):
    hit = False
    for l in cl:
        val = cert[l - 1] if l > 0 else 1 - cert[-l - 1]
        if val == 1:
            hit = True
    ok = ok and hit
    print("дизъюнкт", k + 1, cl, "выполнен" if hit else "НЕ выполнен")
print("сертификат", "принят" if ok else "отвергнут")`,
    variables: [
      { name: "cert", role: "сертификат — назначение переменных x1…x4; подставляется в каждый дизъюнкт", range: "[1, 0, 1, 0]" },
      { name: "k", role: "номер дизъюнкта, который проверяется сейчас", range: "0 … 3" },
      { name: "ok", role: "итоговый вердикт: сертификат принят или отвергнут", range: "True/False" },
      { name: "clauses", role: "сама формула 3-SAT — 4 дизъюнкта по 3 литерала", range: "список кортежей" },
    ],
  },
  "complexity-classes#growth": {
    vizTitle: "Рост числа операций: полином или экспонента",
    stepNote: "Шаг = одна точка (n, ops). Чем больше точек, тем точнее оценка наклона в лог-лог координатах.",
    code: `n = 1                      # размер входа
ops = 0                    # сколько операций насчитал алгоритм — по ним виден рост

# --- тело алгоритма ---
# Полиномиальный алгоритм: перебор всех пар — Θ(n²).
# Точки (n, ops) сами ложатся на график вкладки «Рост».
for n in range(2, 11):
    ops = 0
    for i in range(n):
        for j in range(i, n):
            ops += 1
    print("n =", n, "ops =", ops)

# Экспоненциальный (полный перебор подмножеств) — раскомментируй и сравни:
# for n in range(1, 15):
#     ops = 2 ** n
#     print("n =", n, "ops =", ops)`,
    variables: [
      { name: "n", role: "размер входа — по нему строится точка на графике", range: "2 … 10" },
      { name: "ops", role: "число операций алгоритма на входе размера n", range: "1 … 10⁵" },
      { name: "i", role: "внутренний счётчик цикла — тоже принимается как номер шага", range: "0 …" },
    ],
  },
  "mst#kruskal": {
    vizTitle: "Остовное дерево: Краскал и DSU",
    stepNote: "Шаг = следующее ребро из отсортированных: find(u) ≠ find(v) => берём в остов.",
    code: `n = 9                      # вершин: A…I — тот же граф, что нарисован слева
edges = [(2, "A", "B"), (3, "D", "E"), (4, "B", "C"), (5, "A", "D"), (6, "B", "E"),
         (7, "E", "F"), (8, "D", "G"), (9, "C", "F"), (10, "G", "H"), (11, "E", "H"),
         (12, "H", "I"), (13, "F", "I")]
edges.sort()               # Краскал: рёбра по возрастанию веса
parent = {v: v for v in "ABCDEFGHI"}   # DSU: представитель множества вершины
rank = {v: 0 for v in "ABCDEFGHI"}     # высота дерева DSU
mst = []                   # рёбра, взятые в остов
total = 0                  # вес остова (на этом графе = 51)
i = 0                      # номер текущего ребра
u, v, w = None, None, None # концы и вес ребра, которое рассматриваем сейчас

# --- тело алгоритма ---
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # сжатие путей
        x = parent[x]
    return x

for i, (w, a, b) in enumerate(edges):
    u, v = a, b
    ra, rb = find(a), find(b)
    if ra != rb:                        # разные компоненты => берём ребро
        parent[ra] = rb
        if rank[ra] == rank[rb]:
            rank[rb] += 1
        mst.append((w, a, b))
        total += w
print("вес остова:", total, "| рёбер:", len(mst))
print(mst)`,
    variables: [
      { name: "i", role: "номер текущего ребра — перематывает кадры демонстрации", range: "0 … 11" },
      { name: "u, v, w", role: "концы и вес рассматриваемого ребра — жёлтая подсветка", range: "A…I" },
      { name: "parent", role: "DSU-массив: цвета компонент на графе берутся из find(v)", range: "A…I" },
      { name: "mst", role: "рёбра, уже взятые в остов", range: "≤ 8" },
      { name: "total", role: "вес остова (51 на этом графе)", range: "0 … 51" },
    ],
  },
  "mst#prim": {
    vizTitle: "Остовное дерево: Прим (рост из вершины E)",
    stepNote: "Шаг = из кучи достаётся самое лёгкое ребро, ведущее из выращенного дерева наружу.",
    code: `import heapq

n = 9                      # вершин: A…I
adj = {"A": [("B", 2), ("D", 5)], "B": [("A", 2), ("C", 4), ("E", 6)],
       "C": [("B", 4), ("F", 9)], "D": [("A", 5), ("E", 3), ("G", 8)],
       "E": [("D", 3), ("B", 6), ("F", 7), ("H", 11)], "F": [("E", 7), ("C", 9), ("I", 13)],
       "G": [("D", 8), ("H", 10)], "H": [("G", 10), ("E", 11), ("I", 12)],
       "I": [("H", 12), ("F", 13)]}
start = "E"                # из какой вершины растим дерево (в демо — «Центр Токио» E)
heap = [(0, start, start)] # (вес, вершина, откуда пришли)
taken = []                 # вершины уже в остове — красятся «плесенью»
mst = []                   # рёбра остова
total = 0                  # вес остова (= 51)
u, v, w = None, None, None # текущее ребро

# --- тело алгоритма ---
while heap:
    w, x, frm = heapq.heappop(heap)     # самое лёгкое ребро наружу
    if x in taken:
        continue                        # устаревшая запись в куче
    taken.append(x)
    u, v = frm, x
    if frm != x:
        mst.append((w, frm, x))
        total += w
    for to, wt in adj[x]:
        if to not in taken:
            heapq.heappush(heap, (wt, to, x))
print("вес остова:", total, "| вершин захвачено:", len(taken))
print(mst)`,
    variables: [
      { name: "start", role: "вершина, из которой растим дерево (в демо — E, «Центр Токио»)", range: "A…I" },
      { name: "heap", role: "куча рёбер-кандидатов (вес, куда, откуда) — рисуются голубым", range: "≤ m" },
      { name: "taken", role: "вершины, уже вошедшие в остов, — красятся «плесенью»", range: "≤ 9" },
      { name: "u, v, w", role: "ребро, которое только что взяли: v добавлена в дерево из u", range: "A…I" },
      { name: "mst / total", role: "рёбра остова и его вес (51)", range: "8 рёбер" },
    ],
  },
  "mst#boruvka": {
    vizTitle: "Остовное дерево: Борувка (фазы-«пятилетки»)",
    stepNote: "Шаг = одна фаза: каждая компонента ОДНОВРЕМЕННО выбирает своё самое дешёвое исходящее ребро.",
    code: `n = 9                      # вершин: A…I
edges = [(2, "A", "B"), (3, "D", "E"), (4, "B", "C"), (5, "A", "D"), (6, "B", "E"),
         (7, "E", "F"), (8, "D", "G"), (9, "C", "F"), (10, "G", "H"), (11, "E", "H"),
         (12, "H", "I"), (13, "F", "I")]
comp = {v: v for v in "ABCDEFGHI"}     # DSU: корень компоненты вершины
cheapest = {}              # корень компоненты -> самое дешёвое ребро наружу
mst = []                   # рёбра остова
total = 0                  # вес остова (= 51)
phase = 0                  # номер фазы («пятилетки») — на этом графе их 2
u, v, w = None, None, None # ребро-кандидат

# --- тело алгоритма ---
def find(x):
    while comp[x] != x:
        comp[x] = comp[comp[x]]
        x = comp[x]
    return x

while len(mst) < n - 1:
    phase += 1
    cheapest = {}
    for (w, a, b) in edges:            # КАЖДАЯ компонента ищет своё ребро одновременно
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        u, v = a, b
        if ra not in cheapest or w < cheapest[ra][0]:
            cheapest[ra] = (w, a, b)
        if rb not in cheapest or w < cheapest[rb][0]:
            cheapest[rb] = (w, a, b)
    if not cheapest:
        break                          # граф несвязен
    for (w, a, b) in cheapest.values():
        ra, rb = find(a), find(b)
        if ra == rb:
            continue                   # две компоненты выбрали одно и то же ребро
        comp[ra] = rb
        mst.append((w, a, b))
        total += w
print("фаз:", phase, "| вес остова:", total)
print(mst)`,
    variables: [
      { name: "comp", role: "DSU: корень компоненты вершины — по нему красятся вершины", range: "A…I" },
      { name: "cheapest", role: "корень компоненты -> самое дешёвое ребро наружу (выбор этой фазы)", range: "≤ число компонент" },
      { name: "phase", role: "номер фазы; на этом графе остов собирается за 2 фазы", range: "1 … ⌈log n⌉" },
      { name: "u, v, w", role: "ребро-кандидат, которое компонента рассматривает сейчас", range: "A…I" },
      { name: "mst / total", role: "взятые рёбра и вес остова (51)", range: "8 рёбер" },
    ],
  },
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

r1, c1, r2, c2 = 1, 1, 2, 2
ans = S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1]
print("итого:", ans)`,
    variables: [
      { name: "i, j", role: "текущая ячейка таблицы S (1-индексация)", range: "1 … n, 1 … m" },
      { name: "S[i][j]", role: "сумма прямоугольника (0,0)–(i−1,j−1) — по двум соседям минус перекрытие", range: "пересчёт на каждом шаге" },
      { name: "r1, c1, r2, c2", role: "углы запроса; ответ = четыре угла формулы включений-исключений", range: "индексы матрицы" },
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
