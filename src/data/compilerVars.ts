export interface CompilerVarInfo {
  /** Что означает переменная в контексте визуализации этой страницы */
  label: string;
  /** Текущее значение или пример (для подсказки) */
  example: string;
  /** Описание */
  desc: string;
}

export interface ChapterCompilerMeta {
  title: string;
  vizId?: string;
  /** Какие переменные есть у визуализации — только комментарии, кода нет */
  vars: Record<string, CompilerVarInfo>;
  /** Доп. пояснение что синхронизируется */
  note: string;
  /** Какой визуализатор связан */
  syncHint: string;
}

/**
 * Хардкод синхронизации i,k,j,n,m для каждой страницы.
 * Компилятор НЕ содержит исполняемого кода — только комментарии с описанием переменных
 * визуализации. Значения n,m,i,k,j — это то, что показывает интерактивная демо.
 *
 * Если добавится новая страница — добавь сюда запись, иначе будет fallback.
 */
export const CHAPTER_COMPILER_META: Record<string, ChapterCompilerMeta> = {
  // билет 1
  "segment-trees": {
    title: "Дерево отрезков",
    vizId: "segment-trees",
    vars: {
      n: { label: "n", example: "6", desc: "длина массива N (из инпута визуализатора)" },
      m: { label: "m", example: "8", desc: "размер дерева ~4*n, индекс 1 — корень, дети 2*v и 2*v+1" },
      i: { label: "i", example: "1", desc: "индекс вершины v в массиве дерева (корень=1)" },
      k: { label: "k", example: "0", desc: "левая граница отрезка L (в узле)" },
      j: { label: "j", example: "5", desc: "правая граница отрезка R (в узле)" },
    },
    note: "mid = (k+j)//2 — разбиение; запрос охватывает [k..mid] и [mid+1..j]",
    syncHint: "Визуализатор подсвечивает узлы v с отрезком [k..j] и текущий mid",
  },
  // билет 2
  "sparse-table": {
    title: "Разреженная таблица",
    vizId: "sparse-table",
    vars: {
      n: { label: "n", example: "8", desc: "длина массива N" },
      m: { label: "m", example: "4", desc: "LOG = floor(log2(n))+1, число столбцов таблицы" },
      i: { label: "i", example: "2", desc: "начало отрезка i (0-index)" },
      j: { label: "j", example: "2", desc: "степень j: отрезок длины 2^j" },
      k: { label: "k", example: "2", desc: "k = floor(log2(len)), для запроса L= i, R= j" },
    },
    note: "ST[i][j] = min(ST[i][j-1], ST[i+2^{j-1}][j-1]); запрос = min(ST[L][k], ST[R-2^k+1][k])",
    syncHint: "Визуализатор 1D/2D подсвечивает ячейки ST[i][j] и перекрытие двух блоков",
  },
  // билет 3
  treap: {
    title: "Декартово дерево (Treap)",
    vizId: "treap",
    vars: {
      n: { label: "n", example: "9", desc: "число ключей в дереве" },
      m: { label: "m", example: "-", desc: "— (резерв, у treap нет второго размера)" },
      i: { label: "i", example: "x", desc: "ключ X — разделяем по i: ≤ i влево" },
      k: { label: "k", example: "y", desc: "приоритет Y — куча по k, больше k всплывает" },
      j: { label: "j", example: "-", desc: "— (резерв)" },
    },
    note: "split(t,i) / merge(l,r): все ключи l < ключи r; приоритет решает корень",
    syncHint: "Демо split/merge показывает какие узлы попали налево/направо",
  },
  // билет 4
  "splay-tree": {
    title: "Splay-дерево",
    vizId: "splay-tree",
    vars: {
      n: { label: "n", example: "7", desc: "число узлов" },
      m: { label: "m", example: "-", desc: "—" },
      i: { label: "i", example: "v", desc: "вершина v, которую splay-им в корень" },
      k: { label: "k", example: "p", desc: "родитель p = parent(i)" },
      j: { label: "j", example: "g", desc: "дед g = parent(k) — определяет Zig/ZigZig/ZigZag" },
    },
    note: "Zig — g отсутствует; ZigZig — i и k с одной стороны; ZigZag — с разных",
    syncHint: "Визуализатор подсвечивает тройку i,k,j и последовательность поворотов",
  },
  "splay-rotations": {
    title: "Splay повороты",
    vizId: "splay-rotations",
    vars: {
      n: { label: "n", example: "7", desc: "число узлов" },
      i: { label: "i", example: "x", desc: "целевой узел x" },
      k: { label: "k", example: "p", desc: "родитель p" },
      j: { label: "j", example: "g", desc: "дед g" },
      m: { label: "m", example: "-", desc: "—" },
    },
    note: "rotate(p) затем rotate(x) vs rotate(x) дважды — ключевое различие",
    syncHint: "Покадровый разбор Zig/ZigZig/ZigZag",
  },
  // билет 5
  "prefix-sums-2d": {
    title: "Префиксные суммы 1D/2D",
    vizId: "prefix-sums-2d",
    vars: {
      n: { label: "n", example: "4", desc: "высота матрицы N (строки)" },
      m: { label: "m", example: "4", desc: "ширина матрицы M (столбцы)" },
      i: { label: "i", example: "2", desc: "индекс строки i (1..n в P, 0..n-1 в A)" },
      j: { label: "j", example: "2", desc: "индекс столбца j (1..m в P)" },
      k: { label: "k", example: "r2,c2", desc: "угол запроса (r2,c2) + угол (r1,c1) для A-B-C+D" },
    },
    note: "P[i][j]=A[i-1][j-1]+P[i-1][j]+P[i][j-1]-P[i-1][j-1]; sum = P[r2][c2]-...-...+P[r1-1][c1-1]",
    syncHint: "Демо 1D: P[i]=a[0..i-1]; 2D: подсвечивается прямоугольник от (0,0) до (i,j)",
  },
  // билет 6
  "graph-dfs-bfs": {
    title: "DFS / BFS на графе",
    vizId: "graph-dfs-bfs",
    vars: {
      n: { label: "n", example: "6", desc: "число вершин V" },
      m: { label: "m", example: "7", desc: "число рёбер E" },
      i: { label: "i", example: "u", desc: "текущая вершина u (из очереди/стека)" },
      j: { label: "j", example: "v", desc: "сосед v в adj[u]" },
      k: { label: "k", example: "lvl", desc: "уровень/глубина, очередь BFS идёт по k волнами" },
    },
    note: "DFS — стек (вглубь), BFS — очередь (вширь, lvl=k гарантирует кратчайшее по рёбрам)",
    syncHint: "Визуализация графа подсвечивает фронт волны k и стек вызовов",
  },
  // билет 7 — planarity (новый id)
  "planarity-euler-formula": {
    title: "Планарность: K5 и K3,3",
    vizId: "planarity-euler-formula",
    vars: {
      n: { label: "n", example: "5", desc: "V — вершины (K5: 5, K3,3: 6)" },
      m: { label: "m", example: "10", desc: "E — рёбра (K5:10, K3,3:9)" },
      i: { label: "i", example: "F", desc: "F — грани, Эйлер: V - E + F = 2" },
      j: { label: "j", example: "-", desc: "—" },
      k: { label: "k", example: "-", desc: "—" },
    },
    note: "Если планарный и связный, то E ≤ 3V-6 (и E ≤2V-4 для двудольного), нарушение ⇒ непланарен",
    syncHint: "Демо показывает пересечение рёбер, пересчёт V,E,F и проверку Куратовского",
  },
  // совместимость со старым id
  "graph-planar-colors": {
    title: "Планарные и раскраска",
    vizId: "planarity-euler-formula",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "10", desc: "E" },
      i: { label: "i", example: "F", desc: "F" },
      j: { label: "j", example: "-", desc: "—" },
      k: { label: "k", example: "-", desc: "—" },
    },
    note: "4 краски достаточно для планарного графа",
    syncHint: "Демо раскраски и проверки планарности",
  },
  // билет 8
  "graph-components": {
    title: "Компоненты связности",
    vizId: "graph-dfs-bfs",
    vars: {
      n: { label: "n", example: "6", desc: "V — вершины" },
      m: { label: "m", example: "4", desc: "E — рёбра" },
      i: { label: "i", example: "comp", desc: "индекс компоненты 1..cnt" },
      j: { label: "j", example: "v", desc: "очередная непосещённая вершина для DFS" },
      k: { label: "k", example: "-", desc: "—" },
    },
    note: "Пока есть непосещённая j — запускаем DFS/BFS и красим компоненту i",
    syncHint: "DFS раскрашивает каждую компоненту своим цветом, счётчик i растёт",
  },
  // билет 9
  "top-sort": {
    title: "Топологическая сортировка",
    vizId: "top-sort",
    vars: {
      n: { label: "n", example: "5", desc: "V — вершины DAG" },
      m: { label: "m", example: "6", desc: "E — дуги" },
      i: { label: "i", example: "u", desc: "текущая вершина u в DFS" },
      j: { label: "j", example: "v", desc: "сосед v (исходящее ребро u→v)" },
      k: { label: "k", example: "order", desc: "позиция в order: вершина с большим post-order раньше" },
    },
    note: "Kahn (indeg) или DFS-postorder + reverse: k — счётчик готовых вершин",
    syncHint: "Демо одежды: «трусы перед штанами»; подсветка indeg/k и стека DFS",
  },
  // билет 10
  "scc-kosaraju": {
    title: "SCC — Косарайю",
    vizId: "scc-kosaraju",
    vars: {
      n: { label: "n", example: "6", desc: "V — вершины орграфа" },
      m: { label: "m", example: "7", desc: "E — дуги" },
      i: { label: "i", example: "order", desc: "порядок выхода из DFS-1 (чем позже, тем выше в конденсации)" },
      j: { label: "j", example: "v", desc: "вершина v, обходимая во второй фазе на транспонированном графе" },
      k: { label: "k", example: "compId", desc: "номер SCC (индекс компоненты сильной связности)" },
    },
    note: "Фаза1: DFS и стек order; Фаза2: DFS на GT в порядке убывания order, k — цвет компоненты",
    syncHint: "Визуализатор показывает два прохода и раскраску k-компонент",
  },
  // билет 11 — мосты
  "bridges-code": {
    title: "Мосты (DFS + tin/low)",
    vizId: "bridges-code",
    vars: {
      n: { label: "n", example: "6", desc: "V — вершины" },
      m: { label: "m", example: "7", desc: "E — рёбра" },
      i: { label: "i", example: "v", desc: "текущая вершина v" },
      j: { label: "j", example: "to", desc: "сосед to" },
      k: { label: "k", example: "timer", desc: "tin[v]=k++, low[v]=min(tin/low потомков)" },
    },
    note: "мост ⇔ low[to] > tin[v]; точка сочленения ⇔ low[to] >= tin[v] (не корень)",
    syncHint: "Симулятор DFS подсвечивает tin/low и мост C—D, k растёт по времени входа",
  },
  // совместимость
  "graph-bridges": {
    title: "Мосты",
    vizId: "bridges-code",
    vars: {
      n: { label: "n", example: "6", desc: "V" },
      m: { label: "m", example: "7", desc: "E" },
      i: { label: "i", example: "v", desc: "v" },
      j: { label: "j", example: "to", desc: "to" },
      k: { label: "k", example: "timer", desc: "timer" },
    },
    note: "low[to] > tin[v] ⇒ мост",
    syncHint: "DFS дерево, подсвечен bridge",
  },
  // билет 12 — точки сочленения
  "graph-articulation": {
    title: "Точки сочленения",
    vizId: "graph-articulation",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "5", desc: "E" },
      i: { label: "i", example: "v", desc: "вершина v, проверяемая на cut" },
      j: { label: "j", example: "to", desc: "сын to в DFS-дереве" },
      k: { label: "k", example: "children", desc: "children — счётчик детей корня; для корня cut ⇔ children>1" },
    },
    note: "cut ⇔ (p!=-1 && low[to]>=tin[v]) || (p==-1 && children>1); k=timer/tin",
    syncHint: "Визуализация подсвечивает центральную C и её детей, low/to сравнение",
  },
  // билет 13 — эйлер
  "euler-path-vs-cycle": {
    title: "Эйлеров путь vs цикл",
    vizId: "euler-path-vs-cycle",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "7", desc: "E" },
      i: { label: "i", example: "v", desc: "текущая вершина v" },
      j: { label: "j", example: "deg(v)", desc: "степень j = deg(v) (чёт/нечёт)" },
      k: { label: "k", example: "cntOdd", desc: "k = число нечётных вершин (0 → цикл, 2 → путь)" },
    },
    note: "Эйлеров цикл ⇔ все j чётные; путь ⇔ k=2 (начало/конец нечётные); иерархия Гамильтона — NP",
    syncHint: "Симулятор подсвечивает нечётные вершины и обход по рёбрам ровно раз",
  },
  "graph-euler": {
    title: "Эйлеров граф",
    vizId: "euler-path-vs-cycle",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "7", desc: "E" },
      i: { label: "i", example: "v", desc: "v" },
      j: { label: "j", example: "deg", desc: "deg" },
      k: { label: "k", example: "odd", desc: "odd count" },
    },
    note: "same",
    syncHint: "Эйлеров обход",
  },
  // билет 14
  dijkstra: {
    title: "Дейкстра",
    vizId: "dijkstra",
    vars: {
      n: { label: "n", example: "6", desc: "V — число вершин" },
      m: { label: "m", example: "9", desc: "E — число рёбер" },
      i: { label: "i", example: "u", desc: "извлечённая вершина u = argmin dist (очередь)" },
      j: { label: "j", example: "v", desc: "сосед v: ребро u→v с весом w" },
      k: { label: "k", example: "w", desc: "w(u,v) ≥0; релаксация: если dist[j] > dist[i]+k то обновляем" },
    },
    note: "heap по dist; O((n+m) log n); не работает при k<0",
    syncHint: "Визуализатор показывает heap, dist[] и текущее ребро i→j с весом k",
  },
  // билет 15
  "bellman-ford": {
    title: "Форд—Беллман",
    vizId: "bellman-ford",
    vars: {
      n: { label: "n", example: "6", desc: "V — вершины" },
      m: { label: "m", example: "9", desc: "E — рёбра" },
      i: { label: "i", example: "iter", desc: "итерация i = 1..n-1 (по всем рёбрам)" },
      j: { label: "j", example: "v", desc: "вершина-конец ребра (to)" },
      k: { label: "k", example: "u", desc: "вершина-начало ребра (from/u), ребро k: u→j с весом w" },
    },
    note: "V-1 полных релаксаций; если на n-й итерации что-то улучшилось ⇒ отрицательный цикл",
    syncHint: "Подсветка ребра k→j и массива dist на каждой i-й волне",
  },
  // билет 16
  floyd: {
    title: "Флойд—Уоршелл",
    vizId: "floyd",
    vars: {
      n: { label: "n", example: "4", desc: "V — размер матрицы n×n" },
      m: { label: "m", example: "-", desc: "—" },
      i: { label: "i", example: "i", desc: "строка i: откуда" },
      j: { label: "j", example: "j", desc: "столбец j: куда" },
      k: { label: "k", example: "k", desc: "промежуточная вершина k (внешний цикл!): разрешаем пересадку через k" },
    },
    note: "dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j]); k снаружи! O(n³)",
    syncHint: "Матрица подсвечивает строку i, столбец j и промежуточную диагональ k",
  },
  // билет 17
  "johnson-algo": {
    title: "Джонсон",
    vizId: "johnson-algo",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "8", desc: "E" },
      i: { label: "i", example: "h", desc: "потенциал h[v] = dist от супер-истока s (Bellman)" },
      j: { label: "j", example: "v", desc: "вершина v, пересчёт w'(u,v)=w+h[u]-h[v] ≥0" },
      k: { label: "k", example: "u", desc: "ребро u→j; затем Дейкстра n раз из каждого k-источника" },
    },
    note: "Шаг1 Bellman из s → h; Шаг2 перевзвешивание; Шаг3 Дейкстра n раз; ответ = d'[k][j]-h[k]+h[j]",
    syncHint: "Визуализатор показывает h, перевзвешенную матрицу и Дейкстру из каждого k",
  },
  // билет 18
  "mst-kruskal": {
    title: "Краскал",
    vizId: "mst-kruskal",
    vars: {
      n: { label: "n", example: "5", desc: "V — вершины" },
      m: { label: "m", example: "7", desc: "E — рёбра (отсортированы по w)" },
      i: { label: "i", example: "idx", desc: "индекс текущего ребра в отсортированном списке (0..m-1)" },
      j: { label: "j", example: "v", desc: "конец ребра v" },
      k: { label: "k", example: "u", desc: "начало ребра u; DSU: find(k)!=find(j) ⇒ берём ребро" },
    },
    note: "сортировка O(m log m) + DSU; лес постепенно сливается",
    syncHint: "Подсвечивается очередное ребро i: k—j с весом w, компоненты DSU",
  },
  // билет 19
  "mst-prima": {
    title: "Прим",
    vizId: "mst-prima",
    vars: {
      n: { label: "n", example: "5", desc: "V" },
      m: { label: "m", example: "7", desc: "E" },
      i: { label: "i", example: "u", desc: "последняя взятая вершина u (фронт)" },
      j: { label: "j", example: "v", desc: "лучший кандидат v вне дерева (мини ключ)" },
      k: { label: "k", example: "w", desc: "w = min edge из дерева к j; heap по k" },
    },
    note: "дерево растёт как пятно: берём минимальное ребро на границе; O(m log n) с кучей",
    syncHint: "Граф: дерево подсвечено, heap показывает ключи j/k",
  },
  // билет 20
  "mst-boruvka": {
    title: "Борувка",
    vizId: "mst-boruvka",
    vars: {
      n: { label: "n", example: "9", desc: "V — деревни/компоненты" },
      m: { label: "m", example: "14", desc: "E" },
      i: { label: "i", example: "phase", desc: "фаза i: за фазу компонент становится минимум вдвое меньше" },
      j: { label: "j", example: "to", desc: "для компоненты cur выбираем мин исходящее ребро cur→j" },
      k: { label: "k", example: "from", desc: "from — представитель компоненты, cheapest[k]= (w, from→to)" },
    },
    note: "каждая компонента шлёт гонца по мин ребру; фазы ≤ log n; легко параллелится",
    syncHint: "Окраска компонент на карте, стрелки cheapest от k к j, счётчик фаз i",
  },
  // билет 21
  "string-kmp": {
    title: "КМП / префикс-функция",
    vizId: "string-kmp",
    vars: {
      n: { label: "n", example: "7", desc: "длина строки n" },
      m: { label: "m", example: "-", desc: "—" },
      i: { label: "i", example: "1", desc: "текущая позиция i = 1..n-1 (строим π[i])" },
      j: { label: "j", example: "2", desc: "длина текущего суффикс-совпадения π[i-1] / fallback π[j-1]" },
      k: { label: "k", example: "π", desc: "π[i] — длина longest border для префикса [0..i]" },
    },
    note: "while j>0 && s[i]!=s[j] → j=π[j-1]; если равно ⇒ ++j; π[i]=j; O(n)",
    syncHint: "Визуализация ленты с подсветкой сравниваемых s[i] vs s[j] и rollback по π",
  },
  // билет 22
  "string-z-func": {
    title: "Z-функция",
    vizId: "string-z-func",
    vars: {
      n: { label: "n", example: "11", desc: "длина строки n" },
      m: { label: "m", example: "-", desc: "—" },
      i: { label: "i", example: "4", desc: "позиция i — считаем Z[i]" },
      j: { label: "j", example: "r", desc: "правая граница Z-блока r = max r'" },
      k: { label: "k", example: "l", desc: "левая граница блока l; если i ≤ j то Z[i]= min(Z[i-k], j-i+1)" },
    },
    note: "окно [k,j] — самый правый блок; быстрый старт + сравнение посимвольно; O(n)",
    syncHint: "Лента подсвечивает окно [k..j] и сравнения для i, шкалы L/R",
  },
  // билет 23
  "aho-corasick": {
    title: "Ахо—Корасик",
    vizId: "aho-corasick",
    vars: {
      n: { label: "n", example: "4", desc: "число слов словаря (узлов бора N)" },
      m: { label: "m", example: "11", desc: "длина текста |T| (сколько шагов по автомату)" },
      i: { label: "i", example: "v", desc: "вершина бора v (текущее состояние автомата)" },
      j: { label: "j", example: "c", desc: "символ c → переход go(i, j)" },
      k: { label: "k", example: "link", desc: "суффиксная ссылка link[i]=k (корень BFS по уровням)" },
    },
    note: "строим бор, затем BFS: очереди по k; go по fail если нет ребра; выходы — термины",
    syncHint: "Бор + автомат + анимация водопада символов j по текcту",
  },
  // билет 24
  "complexity-classes": {
    title: "Классы сложности",
    vizId: undefined,
    vars: {
      n: { label: "n", example: "n", desc: "размер входа" },
      m: { label: "m", example: "p(n)", desc: "полином от n" },
      i: { label: "i", example: "A", desc: "задача A, которую сводим" },
      j: { label: "j", example: "B", desc: "задача B, к которой сводим A ≤p B" },
      k: { label: "k", example: "cert", desc: "сертификат / недетерминированная ветка" },
    },
    note: "P — детерминированно за poly; NP — проверка cert за poly; сводка poly-time",
    syncHint: "Нет граф-симуляции — показываем схему сведений и таймлайн",
  },
  // вводные
  intro: {
    title: "Введение",
    vizId: "intro",
    vars: {
      n: { label: "n", example: "6", desc: "V для превью кратчайших" },
      m: { label: "m", example: "9", desc: "E" },
      i: { label: "i", example: "s", desc: "исток s" },
      j: { label: "j", example: "t", desc: "сток t" },
      k: { label: "k", example: "dist", desc: "dist — расстояние" },
    },
    note: "Карточки-мнемоники на старте",
    syncHint: "Мнемокарточки и обзор",
  },
  "alg-map": {
    title: "Карта алгоритмов",
    vizId: "alg-map",
    vars: {
      n: { label: "n", example: "-", desc: "V (карта)" },
      m: { label: "m", example: "-", desc: "E (карта)" },
      i: { label: "i", example: "-", desc: "—" },
      j: { label: "j", example: "-", desc: "—" },
      k: { label: "k", example: "-", desc: "—" },
    },
    note: "Навигационная карта",
    syncHint: "Карта",
  },
  // дополнительные алиасы для устойчивости
  "heap-beam-search": {
    title: "Куча",
    vizId: "heap-beam-search",
    vars: {
      n: { label: "n", example: "heap size", desc: "размер кучи n" },
      m: { label: "m", example: "-", desc: "—" },
      i: { label: "i", example: "parent", desc: "i → дети 2i+1,2i+2; heapify" },
      j: { label: "j", example: "child", desc: "j — больший ребёнок" },
      k: { label: "k", example: "key", desc: "ключ/priority; просеивание пока k ребёнка > k родителя" },
    },
    note: "max-heap: k[i] ≥ k[children]; pop — меняем 0↔n-1 и siftDown",
    syncHint: "Куча гипотез — демонстрация просеивания",
  },
  "stack-dfs": {
    title: "Стек → DFS",
    vizId: "stack-dfs",
    vars: {
      n: { label: "n", example: "5", desc: "глубина стека / число вызовов" },
      i: { label: "i", example: "top", desc: "верх стека i = n-1" },
      j: { label: "j", example: "v", desc: "очередной вызов DFS(v)" },
      k: { label: "k", example: "-", desc: "—" },
      m: { label: "m", example: "-", desc: "—" },
    },
    note: "рекурсия DFS = стек вызовов",
    syncHint: "Тарелки-стек и рекурсия DFS",
  },
  "queue-bfs": {
    title: "Очередь → BFS",
    vizId: "queue-bfs",
    vars: {
      n: { label: "n", example: "6", desc: "размер очереди" },
      i: { label: "i", example: "head", desc: "голова очереди i" },
      j: { label: "j", example: "tail", desc: "хвост очереди j" },
      k: { label: "k", example: "v", desc: "вершина v = dequeue()" },
      m: { label: "m", example: "-", desc: "—" },
    },
    note: "BFS: enqueue(s) → пока очередь не пуста: k=dequeue; для каждого v в adj[k] если не посещён ⇒ enqueue(v)",
    syncHint: "Очередь в столовой и BFS волна",
  },
  "dynamic-programming": {
    title: "Динамика",
    vizId: "dynamic-programming",
    vars: {
      n: { label: "n", example: "10", desc: "размер DP-таблицы N" },
      m: { label: "m", example: "10", desc: "M — второй размер (2D DP)" },
      i: { label: "i", example: "i", desc: "итерация по i (строка)" },
      j: { label: "j", example: "j", desc: "итерация по j (столбец)" },
      k: { label: "k", example: "opt", desc: "k = argmin/argmax переход: dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + cost" },
    },
    note: "заполняем таблицу по i,j; k — выбор предшественника",
    syncHint: "Таблица DP построчно, подсветка переходов",
  },
};

export function getCompilerMeta(id: string): ChapterCompilerMeta | undefined {
  return CHAPTER_COMPILER_META[id];
}

export function getFallbackMeta(id: string): ChapterCompilerMeta {
  return (
    CHAPTER_COMPILER_META[id] ?? {
      title: id,
      vars: {
        n: { label: "n", example: "V", desc: "размер входа N (вершины/элементы)" },
        m: { label: "m", example: "E", desc: "размер второй оси M (рёбра/столбцы)" },
        i: { label: "i", example: "i", desc: "счётчик i (внешний цикл / текущая вершина)" },
        j: { label: "j", example: "j", desc: "счётчик j (внутренний цикл / сосед)" },
        k: { label: "k", example: "k", desc: "промежуточный/служебный индекс k" },
      },
      note: "Стандартная схема циклов: for k … for i … for j …",
      syncHint: "Визуализатор подсвечивает текущие i,j,k",
    }
  );
}
